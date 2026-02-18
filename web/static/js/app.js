import "phoenix_html"
import React from 'react';
import ReactDOM from 'react-dom';
import TransactionsApp from './components/TransactionsApp';

window.renderTransactionsApp = (elementId, budgetId, budgetName, startingBalance, categories, transactionTypes) => {
  const target = document.getElementById(elementId);
  if (target) {
    ReactDOM.render(
      <TransactionsApp
        budgetId={budgetId}
        budgetName={budgetName}
        startingBalance={startingBalance}
        categories={categories}
        transactionTypes={transactionTypes}
      />,
      target
    );
  }
};
