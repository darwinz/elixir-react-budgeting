import { Socket } from 'phoenix';
let socket = new Socket('/socket', { params: { token: window.userToken } });

socket.connect();

const createSocket = budgetId => {
  let channel = socket.channel(`transactions:${budgetId}`, {});
  channel
    .join()
    .receive('ok', resp => {
      console.log(resp);
      renderTransactions(resp.transactions);
    })
    .receive('error', resp => {
      console.log('Unable to join', resp);
    });

  channel.on(`transactions:${budgetId}:new`, renderTransactions);

  document.querySelector('#btn_budget_id').addEventListener('click', (event) => {
    event.preventDefault();

    const type = document.getElementById('transaction_type').value;
    const cat= document.getElementById('transaction_category').value;
    const amt = document.getElementById('transaction_amount').value;
    const desc= document.getElementById('transaction_desc').value;

    channel.push('transaction:add', { type: type, cat: cat, amt: amt, desc: desc });
  });
};

function renderTransactions(transactions) {
  const renderedTransactions = transactions.map(transaction => {
    return transactionTemplate(transaction);
  });

  document.querySelector('.collection').innerHTML = renderedTransactions.join('');
}

function renderTransaction(event) {
  const renderedTransaction = transactionTemplate(event.transaction);

  document.querySelector('.collection').innerHTML += renderedTransaction;
}

function renderBalance(event) {
  const renderedBalance = balanceTemplate(event.budget);

  document.querySelector('.balance').innerHTML += renderedBalance;
}

function transactionTemplate(transaction) {
  let income_amount = transaction.type == 'income' ? transaction.amount : "&nbsp;&nbsp;&nbsp;";
  let expense_amount = transaction.type == 'expense' ? transaction.amount : "&nbsp;&nbsp;&nbsp;";
  let desc = transaction.description == null ? "&nbsp" : transaction.description;

  return `
    <tr class="collection-item">
      <td class="collection-item-col">
        <span class="collection-item-col">${transaction.category}</span>
      </td>
      <td colspan=""2">
        <span class="collection-item-col description">${desc}</span>
      </td>
      <td class="collection-item-col">&nbsp;</td>
      <td class="collection-item-col">
        <span class="collection-item-col">${income_amount}</span>
      </td>
      <td class="collection-item-col right-align">
        <span class="collection-item-col">${expense_amount}</span>
      </td>
    </tr>
  `;
}

function balanceTemplate(budget) {
  let current_balance = budget.current_balance;

  return current_balance;
}

window.createSocket = createSocket;
