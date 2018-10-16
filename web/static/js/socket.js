import { Socket } from 'phoenix';
let socket = new Socket('/socket', { params: { token: window.userToken } });

socket.connect();

const createSocket = budgetId => {
  let channel = socket.channel(`transactions:${budgetId}`, {});
  channel
    .join()
    .receive('ok', resp => {
      console.log(resp);
      renderComments(resp.comments);
    })
    .receive('error', resp => {
      console.log('Unable to join', resp);
    });

  channel.on(`transactions:${budgetId}:new`, renderComment);

  document.querySelector('button').addEventListener('click', () => {
    const type = document.getElementById('transaction_type').value;
    const cat= document.getElementById('transaction_category').value;
    const amount = document.getElementById('transaction_amount').value;
    const desc= document.getElementById('transaction_description').value;

    channel.push('transaction:add', { type: type, cat: cat, amount: amount, desc: desc });
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

function transactionTemplate(transaction) {
  let email = 'Anonymous';
  if (transaction.user) {
    email = transaction.user.username;
  }

  return `
    <li class="collection-item">
      ${transaction.content}
      <div class="secondary-content">
        ${email}
      </div>
    </li>
  `;
}

window.createSocket = createSocket;
