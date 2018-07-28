import React, { Component } from 'react';
import '../assets/styles/main.scss';

class App extends Component {
  render() {
    return <main id="app">{this.props.children}</main>;
  }
}

export default App;
