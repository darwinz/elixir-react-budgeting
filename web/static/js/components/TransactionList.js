import React from 'react';

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
  return isIncomeType(transaction.type) ? amount : amount * -1;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(parseAmount(value));
}

function formatDate(transaction) {
  const value = transaction.inserted_at || transaction.insertedAt || transaction.created_at || transaction.createdAt;
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(parsed);
}

function TransactionRow({ transaction, onDelete, deleting }) {
  const amount = signedAmount(transaction);
  const amountClass = amount >= 0 ? 'amount-positive' : 'amount-negative';

  return (
    <tr>
      <td>{formatDate(transaction)}</td>
      <td>{transaction.category}</td>
      <td>{transaction.type}</td>
      <td className="description-cell">{transaction.description || 'No description'}</td>
      <td className={`amount-cell ${amountClass}`}>{formatCurrency(Math.abs(amount))}</td>
      <td className="right-align action-cell">
        <button
          type="button"
          className="btn-link-danger"
          onClick={() => onDelete(transaction)}
          disabled={deleting}
          aria-label={`Delete ${transaction.category} transaction`}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </td>
    </tr>
  );
}

function TransactionCard({ transaction, onDelete, deleting }) {
  const amount = signedAmount(transaction);
  const amountClass = amount >= 0 ? 'amount-positive' : 'amount-negative';

  return (
    <article className="transaction-card" aria-label={`${transaction.category} transaction`}>
      <div className="transaction-card-head">
        <p className="transaction-card-title">{transaction.category}</p>
        <p className={`transaction-card-amount ${amountClass}`}>{formatCurrency(Math.abs(amount))}</p>
      </div>
      <p className="transaction-card-meta">{transaction.type} • {formatDate(transaction)}</p>
      <p className="transaction-card-description">{transaction.description || 'No description'}</p>
      <button
        type="button"
        className="btn-link-danger"
        onClick={() => onDelete(transaction)}
        disabled={deleting}
        aria-label={`Delete ${transaction.category} transaction`}
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </article>
  );
}

function TransactionList({ transactions, onDelete, deletingGuid }) {
  if (!transactions.length) {
    return (
      <div className="empty-state" role="status">
        <h4>No transactions yet</h4>
        <p>Add your first transaction to start tracking this budget.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="transaction-table-wrap desktop-only">
        <table className="transaction-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Type</th>
              <th>Description</th>
              <th className="right-align">Amount</th>
              <th className="right-align">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(transaction => (
              <TransactionRow
                key={transaction.guid || transaction.id}
                transaction={transaction}
                onDelete={onDelete}
                deleting={deletingGuid === transaction.guid}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mobile-only transaction-cards-list">
        {transactions.map(transaction => (
          <TransactionCard
            key={`card-${transaction.guid || transaction.id}`}
            transaction={transaction}
            onDelete={onDelete}
            deleting={deletingGuid === transaction.guid}
          />
        ))}
      </div>
    </div>
  );
}

export default TransactionList;
