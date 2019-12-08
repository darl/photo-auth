import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MinimalRouter from './MinimalRouter/MinimalRouter';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<MinimalRouter />, document.getElementById('root'));
serviceWorker.unregister();
