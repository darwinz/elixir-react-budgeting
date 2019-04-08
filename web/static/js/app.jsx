// import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
// import "phoenix_html"
// import { Socket } from 'phoenix';
// import CommentsList from './CommentsList';
// import CommentBox from './CommentBox';
//
// class App extends Component {
//   constructor(props) {
//     super(props);
//
//     this.state = { budgets: [] };
//   }
//
//   budgetWillMount() {
//     const socket = new Socket('/socket', {params: {auth_token: window.userToken}})
//     socket.connect()
//
//     this.channel = socket.channel(`budgets:${this.props.postId}`, {})
//     this.channel.join()
//       .receive('ok', resp => { this.setState({budgets: resp.budgets}); })
//       .receive('error', resp => { console.log('Unable to join', resp) })
//
//     this.channel.on(`budgets:${this.props.id}:new`, (data) => {
//       const newComments = data.budgets;
//       this.setState({ budgets: [...this.state.budgets, ...newBudgets] });
//     });
//   }
//
//   onBudgetCreate(text) {
//     this.channel.push('budget:add', { content: text });
//   }
//
//   render() {
//     return (
//       <div>
//         <BudgetBox onBudgetCreate={this.onBudgetCreate.bind(this)} />
//         <BudgetsList budgets={this.state.budgets} />
//       </div>
//     );
//   }
// }
//
// window.renderBudgetingApp = (target, id) => {
//   ReactDOM.render(<App id={id} />, document.getElementById(target));
// };
