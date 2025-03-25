import React from 'react';
import ReactDOM from 'react-dom/client'; // 注意：我們從 'react-dom/client' 引入
import './index.css';
import './styles/output.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';

// 使用 createRoot 替代 render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <App />
  </Router>
);
