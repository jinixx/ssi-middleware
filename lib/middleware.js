const fs = require('fs');
const promisify = require('util.promisify');
const fetch = require('node-fetch');
const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false
});
const tamper = require('tamper');
const processor = require('./processor');

/**
 * Check if a request is txt/html and not compressed.
 */
const isPlainHtml = res =>
  /text\/html/.test(res.getHeader('Content-Type')) &&
  !res.getHeader('Content-Encoding');

module.exports = (opts = {}) => {
  // handlers for file/virtual includes:
  const handlers = {
    file: promisify(fs.readFile),
    virtual: url =>
      fetch(url, { agent })
        .then(res => res.text())
        .then(body => Promise.resolve(body))
  };

  // processor to perferm the replacements:
  const ssi = processor(handlers, opts);

  return tamper((req, res) => isPlainHtml(res) && ssi);
};
