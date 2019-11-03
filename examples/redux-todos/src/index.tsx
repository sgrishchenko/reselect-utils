import React from 'react';
import { render } from 'react-dom';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import { rootReducer } from './rootReducer';
import { createLocalStorageMiddleware } from './localStorage/localStorage.middleware';
import { State } from './app.interface';
import { App } from './app';

const STATE_LOCAL_STORAGE_KEY = 'APP_STATE';

const localStorageMiddleware = createLocalStorageMiddleware(
  STATE_LOCAL_STORAGE_KEY,
  (state: State) => state,
);

const store = createStore(
  rootReducer,
  localStorageMiddleware.getSavedState(),
  applyMiddleware(localStorageMiddleware),
);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
