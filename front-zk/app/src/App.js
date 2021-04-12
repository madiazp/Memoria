import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Vote from './components/Vote';
import Root from './components/Root';
import Register from './components/Register';
import Setup from './components/Setup';
import Navbar from './components/Navbar';

const App = () => {
  // load the zokrates compiled function file (out) needed for the proof generation
  return (
      <Router>
        <div>
            <Navbar />
        <div>
        <Switch>
          <Route exact path="/register"> <Register /> </Route>
          <Route exact path="/vote"> <Vote /> </Route>
          <Route exact path="/admin"> <Setup /> </Route>
        </Switch>
      </div>
      </div>
      </Router>
  );
};
export default App;
