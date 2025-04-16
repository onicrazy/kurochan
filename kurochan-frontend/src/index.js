import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { I18nextProvider } from 'react-i18next';
import i18n from './locales/i18n';
import './assets/styles/global.css';

// Inicializar o i18n com o idioma salvo no localStorage ou o idioma do navegador
const savedLanguage = localStorage.getItem('language');
if (savedLanguage) {
  i18n.changeLanguage(savedLanguage);
} else {
  const browserLanguage = navigator.language.startsWith('ja') ? 'ja' : 'pt-BR';
  i18n.changeLanguage(browserLanguage);
  localStorage.setItem('language', browserLanguage);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();