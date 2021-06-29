import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import './index.css';
import App from './App';
import 'fontsource-roboto';
import { Provider } from "react-redux";
import store from "./redux/store";
import Amplify, { API, Interactions } from "aws-amplify";
import { IAwsConfig } from './types/awsconfig'
import awsConfig from './aws_config'
//declare var awsConfig: IAwsConfig;
Amplify.configure(awsConfig);
API.configure(awsConfig)
Interactions.configure(awsConfig)
//Amplify.Logger.LOG_LEVEL = 'DEBUG'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(//console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
