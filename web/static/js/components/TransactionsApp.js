import React, { Component } from 'react';
import { Socket } from 'phoenix';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';

const TOAST_DURATION_MS = 6000;

function parseAmount(value) {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isIncomeType(type) {
  const normalized = (type || '').toLowerCase();
  return normalized.indexOf('income') !== -1 || normalized === 'credit' || normalized === 'deposit';
}

function signedAmount(transaction) {
  const amount = parseAmount(transaction.amount);
  return isIncomeType(transaction.type) ? amount : -amount;
}

function transactionDate(transaction) {
  const dateValue = transaction.inserted_at || transaction.insertedAt || transaction.created_at || transaction.createdAt;
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(parseAmount(value));
}

function formatDate(date) {
  if (!date) return 'No activity yet';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function isSameMonth(date, now) {
  return date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

class TransactionsApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      loading: true,
      error: null,
      toast: null,
      filters: {
        search: '',
        type: 'all',
        category: 'all',
        dateFrom: '',
        dateTo: ''
      },
      sortBy: 'date',
      sortDir: 'desc',
      deletingGuid: null,
      recentlyDeleted: null,
      undoTimerId: null,
      balancePulse: false
    };

    this.socket = null;
    this.channel = null;
    this.balancePulseTimerId = null;

    this.handleTransactionSubmit = this.handleTransactionSubmit.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleDeleteTransaction = this.handleDeleteTransaction.bind(this);
    this.handleUndoDelete = this.handleUndoDelete.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.scrollToTransactionForm = this.scrollToTransactionForm.bind(this);
  }

  componentDidMount() {
    this.socket = new Socket('/socket', { params: { token: window.userToken } });
    this.socket.connect();

    this.channel = this.socket.channel(`transactions:${this.props.budgetId}`, {});

    this.channel
      .join()
      .receive('ok', resp => {
        this.setState({
          transactions: resp.transactions || [],
          loading: false,
          error: null
        });
      })
      .receive('error', () => {
        this.setState({
          loading: false,
          error: 'Unable to load transactions. Try refreshing the page.'
        });
      });

    this.channel.on(`transactions:${this.props.budgetId}:new`, data => {
      const incoming = data.transaction;
      this.setState(prevState => {
        const alreadyPresent = prevState.transactions.some(tx => tx.guid === incoming.guid);
        if (alreadyPresent) return null;
        return { transactions: [...prevState.transactions, incoming] };
      }, this.triggerBalancePulse.bind(this));
    });

    this.channel.on(`transactions:${this.props.budgetId}:deleted`, data => {
      this.setState(prevState => ({
        transactions: prevState.transactions.filter(tx => tx.guid !== data.guid),
        deletingGuid: prevState.deletingGuid === data.guid ? null : prevState.deletingGuid
      }), this.triggerBalancePulse.bind(this));
    });
  }

  componentWillUnmount() {
    if (this.channel) this.channel.leave();
    if (this.socket) this.socket.disconnect();
    if (this.state.undoTimerId) window.clearTimeout(this.state.undoTimerId);
    if (this.balancePulseTimerId) window.clearTimeout(this.balancePulseTimerId);
  }

  triggerBalancePulse() {
    if (this.balancePulseTimerId) window.clearTimeout(this.balancePulseTimerId);
    this.setState({ balancePulse: true });
    this.balancePulseTimerId = window.setTimeout(() => {
      this.setState({ balancePulse: false });
    }, 550);
  }

  showToast(kind, message, action) {
    this.setState({ toast: { kind, message, action } });
  }

  clearUndoTimer() {
    if (this.state.undoTimerId) {
      window.clearTimeout(this.state.undoTimerId);
      this.setState({ undoTimerId: null });
    }
  }

  scheduleUndoExpiry() {
    this.clearUndoTimer();
    const timer = window.setTimeout(() => {
      this.setState(prevState => {
        if (!prevState.toast || prevState.toast.action !== 'undo') return { recentlyDeleted: null, undoTimerId: null };
        return { toast: null, recentlyDeleted: null, undoTimerId: null };
      });
    }, TOAST_DURATION_MS);

    this.setState({ undoTimerId: timer });
  }

  handleTransactionSubmit(payload) {
    if (!this.channel) {
      return Promise.resolve({ ok: false, message: 'Connection is not ready.' });
    }

    return new Promise(resolve => {
      this.channel
        .push('transaction:add', payload)
        .receive('ok', () => {
          this.showToast('success', 'Transaction saved.', null);
          resolve({ ok: true });
        })
        .receive('error', () => {
          this.showToast('error', 'Could not save transaction.', null);
          resolve({ ok: false, message: 'Could not save transaction. Please try again.' });
        })
        .receive('timeout', () => {
          this.showToast('error', 'Request timed out.', null);
          resolve({ ok: false, message: 'Request timed out. Please try again.' });
        });
    });
  }

  handleDeleteTransaction(transaction) {
    if (!this.channel) return;
    if (!window.confirm('Delete this transaction? You can undo for a few seconds.')) return;

    this.setState({ deletingGuid: transaction.guid });

    this.channel
      .push('transaction:delete', { guid: transaction.guid })
      .receive('ok', resp => {
        const deleted = resp.transaction || transaction;
        this.setState({
          deletingGuid: null,
          recentlyDeleted: {
            guid: deleted.guid,
            type: deleted.type,
            category: deleted.category,
            amount: deleted.amount,
            description: deleted.description || ''
          }
        });

        this.showToast('warning', 'Transaction deleted.', 'undo');
        this.scheduleUndoExpiry();
      })
      .receive('error', () => {
        this.setState({ deletingGuid: null });
        this.showToast('error', 'Could not delete transaction.', null);
      })
      .receive('timeout', () => {
        this.setState({ deletingGuid: null });
        this.showToast('error', 'Delete request timed out.', null);
      });
  }

  handleUndoDelete() {
    const deleted = this.state.recentlyDeleted;
    if (!deleted || !this.channel) return;

    this.channel
      .push('transaction:restore', deleted)
      .receive('ok', () => {
        this.clearUndoTimer();
        this.setState({ recentlyDeleted: null, toast: { kind: 'success', message: 'Transaction restored.', action: null } });
      })
      .receive('error', () => {
        this.showToast('error', 'Could not restore transaction.', null);
      })
      .receive('timeout', () => {
        this.showToast('error', 'Restore request timed out.', null);
      });
  }

  handleFilterChange(event) {
    const { name, value } = event.target;
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        [name]: value
      }
    }));
  }

  handleSortChange(event) {
    const [sortBy, sortDir] = event.target.value.split(':');
    this.setState({ sortBy, sortDir });
  }

  scrollToTransactionForm() {
    const form = document.getElementById('transaction-form-card');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  getFilteredTransactions() {
    const { transactions, filters, sortBy, sortDir } = this.state;

    const fromDate = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : null;
    const toDate = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`) : null;

    const filtered = transactions.filter(transaction => {
      if (filters.type !== 'all' && transaction.type !== filters.type) return false;
      if (filters.category !== 'all' && transaction.category !== filters.category) return false;

      const date = transactionDate(transaction);
      if (fromDate && (!date || date < fromDate)) return false;
      if (toDate && (!date || date > toDate)) return false;

      const search = filters.search.trim().toLowerCase();
      if (!search) return true;

      const haystack = `${transaction.category || ''} ${transaction.description || ''} ${transaction.type || ''}`.toLowerCase();
      return haystack.indexOf(search) !== -1;
    });

    const sorted = filtered.slice().sort((left, right) => {
      let compare = 0;

      if (sortBy === 'amount') {
        compare = parseAmount(left.amount) - parseAmount(right.amount);
      } else if (sortBy === 'type') {
        compare = (left.type || '').localeCompare(right.type || '');
      } else if (sortBy === 'category') {
        compare = (left.category || '').localeCompare(right.category || '');
      } else {
        const leftTime = transactionDate(left) ? transactionDate(left).getTime() : 0;
        const rightTime = transactionDate(right) ? transactionDate(right).getTime() : 0;
        compare = leftTime - rightTime;
      }

      return sortDir === 'asc' ? compare : compare * -1;
    });

    return sorted;
  }

  getSummary() {
    const now = new Date();
    const { transactions } = this.state;

    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let signedTotal = 0;
    let lastUpdated = null;

    transactions.forEach(transaction => {
      const signed = signedAmount(transaction);
      signedTotal += signed;

      const date = transactionDate(transaction);
      if (date && (!lastUpdated || date > lastUpdated)) lastUpdated = date;

      if (isSameMonth(date, now)) {
        if (signed >= 0) {
          monthlyIncome += signed;
        } else {
          monthlyExpense += Math.abs(signed);
        }
      }
    });

    return {
      currentBalance: parseAmount(this.props.startingBalance) + signedTotal,
      monthlyIncome,
      monthlyExpense,
      lastUpdated
    };
  }

  renderSummaryCards(summary, visibleCount) {
    const cardClass = this.state.balancePulse ? 'summary-card summary-card-balance pulse' : 'summary-card summary-card-balance';

    return (
      <div className="summary-grid" role="status" aria-live="polite">
        <div className={cardClass}>
          <p className="summary-label">Current Balance</p>
          <p className="summary-value">{formatCurrency(summary.currentBalance)}</p>
        </div>
        <div className="summary-card summary-card-income">
          <p className="summary-label">This Month Income</p>
          <p className="summary-value">{formatCurrency(summary.monthlyIncome)}</p>
        </div>
        <div className="summary-card summary-card-expense">
          <p className="summary-label">This Month Expenses</p>
          <p className="summary-value">{formatCurrency(summary.monthlyExpense)}</p>
        </div>
        <div className="summary-card summary-card-meta">
          <p className="summary-label">Last Updated</p>
          <p className="summary-value summary-value-meta">{formatDate(summary.lastUpdated)}</p>
          <p className="summary-subtext">Showing {visibleCount} transactions</p>
        </div>
      </div>
    );
  }

  renderFilters() {
    const { categories, transactionTypes } = this.props;
    const { filters, sortBy, sortDir } = this.state;

    return (
      <section className="transactions-panel filters-panel" aria-label="Transaction filters">
        <div className="panel-header-row">
          <h3>Filter & Sort</h3>
          <button
            type="button"
            className="link-button"
            onClick={() => {
              this.setState({
                filters: {
                  search: '',
                  type: 'all',
                  category: 'all',
                  dateFrom: '',
                  dateTo: ''
                },
                sortBy: 'date',
                sortDir: 'desc'
              });
            }}
          >
            Reset
          </button>
        </div>
        <div className="filters-grid">
          <label className="field-label" htmlFor="search-filter">
            Search
            <input
              id="search-filter"
              className="form-control"
              type="text"
              name="search"
              value={filters.search}
              onChange={this.handleFilterChange}
              placeholder="Category, type, or description"
              aria-label="Search transactions"
            />
          </label>
          <label className="field-label" htmlFor="type-filter">
            Type
            <select
              id="type-filter"
              className="form-control"
              name="type"
              value={filters.type}
              onChange={this.handleFilterChange}
              aria-label="Filter by type"
            >
              <option value="all">All types</option>
              {transactionTypes.map(option => (
                <option key={`type-${option[1]}`} value={option[1]}>{option[0]}</option>
              ))}
            </select>
          </label>
          <label className="field-label" htmlFor="category-filter">
            Category
            <select
              id="category-filter"
              className="form-control"
              name="category"
              value={filters.category}
              onChange={this.handleFilterChange}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map(option => (
                <option key={`cat-${option[1]}`} value={option[1]}>{option[0]}</option>
              ))}
            </select>
          </label>
          <label className="field-label" htmlFor="date-from-filter">
            Date from
            <input
              id="date-from-filter"
              className="form-control"
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={this.handleFilterChange}
            />
          </label>
          <label className="field-label" htmlFor="date-to-filter">
            Date to
            <input
              id="date-to-filter"
              className="form-control"
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={this.handleFilterChange}
            />
          </label>
          <label className="field-label" htmlFor="sort-order">
            Sort
            <select
              id="sort-order"
              className="form-control"
              value={`${sortBy}:${sortDir}`}
              onChange={this.handleSortChange}
              aria-label="Sort transactions"
            >
              <option value="date:desc">Newest first</option>
              <option value="date:asc">Oldest first</option>
              <option value="amount:desc">Amount high to low</option>
              <option value="amount:asc">Amount low to high</option>
              <option value="category:asc">Category A to Z</option>
              <option value="type:asc">Type A to Z</option>
            </select>
          </label>
        </div>
      </section>
    );
  }

  renderContent(transactions) {
    const { loading, error, deletingGuid } = this.state;

    if (loading) {
      return (
        <section className="transactions-panel">
          <h3>Transactions</h3>
          <div className="skeleton-list" aria-hidden="true">
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        </section>
      );
    }

    if (error) {
      return (
        <section className="transactions-panel error-panel" role="alert">
          <h3>Couldn’t load transactions</h3>
          <p>{error}</p>
        </section>
      );
    }

    return (
      <section className="transactions-panel">
        <h3>Transactions</h3>
        <TransactionList
          transactions={transactions}
          onDelete={this.handleDeleteTransaction}
          deletingGuid={deletingGuid}
        />
      </section>
    );
  }

  renderToast() {
    const { toast } = this.state;
    if (!toast) return null;

    const className = `toast toast-${toast.kind}`;

    return (
      <div className={className} role="status" aria-live="polite">
        <span>{toast.message}</span>
        {toast.action === 'undo' ? (
          <button type="button" className="toast-action" onClick={this.handleUndoDelete}>
            Undo
          </button>
        ) : null}
      </div>
    );
  }

  render() {
    const filteredTransactions = this.getFilteredTransactions();
    const summary = this.getSummary();

    return (
      <div className="budget-shell">
        <header className="budget-header-card">
          <div>
            <p className="eyebrow">Budget Dashboard</p>
            <h2>{this.props.budgetName}</h2>
            <p className="subhead">Track cash flow, find trends, and keep your plan in sync.</p>
          </div>
          <button type="button" className="btn btn-primary desktop-only" onClick={this.scrollToTransactionForm}>
            Add Transaction
          </button>
        </header>

        {this.renderSummaryCards(summary, filteredTransactions.length)}

        <div className="budget-grid">
          <aside id="transaction-form-card" className="transactions-panel transaction-form-panel">
            <h3>New Transaction</h3>
            <p className="panel-copy">All fields are validated before submit. Amount must be greater than zero.</p>
            <TransactionForm
              categories={this.props.categories}
              transactionTypes={this.props.transactionTypes}
              onSubmit={this.handleTransactionSubmit}
            />
          </aside>

          <section>
            {this.renderFilters()}
            {this.renderContent(filteredTransactions)}
          </section>
        </div>

        <button
          type="button"
          className="btn btn-primary mobile-add-btn"
          onClick={this.scrollToTransactionForm}
          aria-label="Jump to add transaction form"
        >
          Add Transaction
        </button>

        {this.renderToast()}
      </div>
    );
  }
}

export default TransactionsApp;
