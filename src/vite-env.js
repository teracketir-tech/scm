// src/vite-env.js
// این فایل فقط برای سازگاری کد فعلی با Vite است.
// بعداً می‌توانی این فایل را حذف کنی و کدها را به import.meta.env تغییر بدهی.

const env = import.meta.env;

window.process = window.process || {};
window.process.env = {
  ...window.process.env,
  NODE_ENV: env.MODE,
  REACT_APP_BE_URL: env.VITE_BE_URL,
  REACT_APP_BE_CURRENCY: env.VITE_BE_CURRENCY,
  REACT_APP_VERSION: env.VITE_VERSION,
};