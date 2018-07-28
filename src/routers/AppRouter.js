import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import App from '../containers/App';
import HomePage from '../pages/HomePage';
import MapContainer from '../components/MapContainer';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter = () => (
  <Router>
    <App>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route exact path="/map" component={MapContainer} />
        <Route component={NotFoundPage} />
      </Switch>
    </App>
  </Router>
);

export default AppRouter;
