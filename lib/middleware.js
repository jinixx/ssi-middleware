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
  const { filenameRewrite, shouldApply } = opts;
  const _shouldApply =
    shouldApply ||
    function() {
      return true;
    };
  const _filenameRewrite =
    filenameRewrite ||
    function(url) {
      return url;
    };

  // handlers for file/virtual includes:
  const handlers = {
    file: promisify(fs.readFile),
    virtual: url =>
      fetch(_filenameRewrite(url), { agent })
        .then(res => res.text())
        .then(body => Promise.resolve(body))
  };

  // processor to perferm the replacements:
  const ssi = processor(handlers, opts);

  return tamper((req, res) => _shouldApply(req.url) && isPlainHtml(res) && ssi);
};
