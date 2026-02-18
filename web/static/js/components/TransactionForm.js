import React, { Component } from 'react';

function parseAmount(value) {
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

class TransactionForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      type: props.transactionTypes[0] ? props.transactionTypes[0][1] : '',
      category: props.categories[0] ? props.categories[0][1] : '',
      amount: '',
      description: '',
      touched: {},
      errors: {},
      submitting: false,
      submitError: '',
      submitSuccess: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (!this.state.type && prevProps.transactionTypes.length === 0 && this.props.transactionTypes.length > 0) {
      this.setState({ type: this.props.transactionTypes[0][1] });
    }

    if (!this.state.category && prevProps.categories.length === 0 && this.props.categories.length > 0) {
      this.setState({ category: this.props.categories[0][1] });
    }
  }

  validate(nextState) {
    const errors = {};

    if (!nextState.type) errors.type = 'Choose a transaction type.';
    if (!nextState.category) errors.category = 'Choose a category.';

    if (!nextState.amount || parseAmount(nextState.amount) <= 0) {
      errors.amount = 'Amount must be greater than zero.';
    }

    if (nextState.description && nextState.description.trim().length > 120) {
      errors.description = 'Description must be 120 characters or fewer.';
    }

    return errors;
  }

  handleBlur(event) {
    const { name } = event.target;
    this.setState(prevState => {
      const touched = { ...prevState.touched, [name]: true };
      const errors = this.validate({ ...prevState, touched });
      return { touched, errors };
    });
  }

  handleChange(event) {
    const { name, value } = event.target;

    this.setState(prevState => {
      const nextState = {
        ...prevState,
        [name]: value,
        submitError: '',
        submitSuccess: ''
      };

      return {
        [name]: value,
        submitError: '',
        submitSuccess: '',
        errors: this.validate(nextState)
      };
    });
  }

  async handleSubmit(event) {
    event.preventDefault();

    const touched = {
      type: true,
      category: true,
      amount: true,
      description: true
    };

    const errors = this.validate({ ...this.state, touched });
    if (Object.keys(errors).length > 0) {
      this.setState({ touched, errors, submitError: 'Please correct the highlighted fields.' });
      return;
    }

    this.setState({ submitting: true, submitError: '', submitSuccess: '' });

    const result = await this.props.onSubmit({
      type: this.state.type,
      cat: this.state.category,
      amt: this.state.amount,
      desc: this.state.description
    });

    if (result && result.ok) {
      this.setState({
        amount: '',
        description: '',
        touched: {},
        errors: {},
        submitting: false,
        submitError: '',
        submitSuccess: 'Transaction added.'
      });
      return;
    }

    this.setState({
      submitting: false,
      submitSuccess: '',
      submitError: (result && result.message) || 'Could not add transaction.'
    });
  }

  renderError(name) {
    const { touched, errors } = this.state;
    if (!touched[name] || !errors[name]) return null;
    return <p className="field-error" role="alert">{errors[name]}</p>;
  }

  render() {
    const { transactionTypes, categories } = this.props;
    const {
      type,
      category,
      amount,
      description,
      submitting,
      submitError,
      submitSuccess
    } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className="transaction-form" noValidate>
        <label className="field-label" htmlFor="transaction-type">
          Type
          <select
            id="transaction-type"
            className="form-control"
            name="type"
            value={type}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            disabled={submitting}
            aria-required="true"
          >
            {transactionTypes.map(option => (
              <option key={`type-${option[1]}`} value={option[1]}>{option[0]}</option>
            ))}
          </select>
          {this.renderError('type')}
        </label>

        <label className="field-label" htmlFor="transaction-category">
          Category
          <select
            id="transaction-category"
            className="form-control"
            name="category"
            value={category}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            disabled={submitting}
            aria-required="true"
          >
            {categories.map(option => (
              <option key={`category-${option[1]}`} value={option[1]}>{option[0]}</option>
            ))}
          </select>
          {this.renderError('category')}
        </label>

        <label className="field-label" htmlFor="transaction-amount">
          Amount
          <input
            id="transaction-amount"
            className="form-control"
            type="number"
            name="amount"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            disabled={submitting}
            inputMode="decimal"
            aria-required="true"
          />
          {this.renderError('amount')}
        </label>

        <label className="field-label" htmlFor="transaction-description">
          Description (optional)
          <input
            id="transaction-description"
            className="form-control"
            type="text"
            name="description"
            placeholder="Note about this transaction"
            value={description}
            onChange={this.handleChange}
            onBlur={this.handleBlur}
            disabled={submitting}
            maxLength="120"
          />
          <p className="field-hint">{description.length}/120</p>
          {this.renderError('description')}
        </label>

        {submitError ? <p className="form-message form-message-error" role="alert">{submitError}</p> : null}
        {submitSuccess ? <p className="form-message form-message-success" role="status">{submitSuccess}</p> : null}

        <button
          type="submit"
          className="btn btn-primary btn-submit"
          disabled={submitting}
          aria-busy={submitting ? 'true' : 'false'}
        >
          {submitting ? 'Saving...' : 'Save Transaction'}
        </button>
      </form>
    );
  }
}

export default TransactionForm;
