import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'remote-redux-devtools';
import app from './reducers';
import thunk from 'redux-thunk';

export default function configureStore() {
	// Change this to true to enable AWESOME redux remote devtools (http://remotedev.io/local/)
	const composeEnhancers = composeWithDevTools({ realtime: false });
  const store = createStore(app, composeEnhancers(applyMiddleware(thunk)));
  return store;
};
