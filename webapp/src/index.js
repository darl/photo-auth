import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import VideoFrame from './VideoFrame/VideoFrame';
import * as serviceWorker from './serviceWorker';
import Onboarding from "./Onboarding/Onboarding";
import AwaitDecision from "./AwaitDecision/AwaitDecision";
import Success from "./Success/Success";

ReactDOM.render(<Onboarding />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
