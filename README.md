
# Express middleware to render Server Side Includes (forked)

[![Build Status](https://travis-ci.org/fgnass/ssi-middleware.svg?branch=master)](https://travis-ci.org/fgnass/ssi-middleware)

Express-style middleware to process SSI directives.

The only command currentl implemented is `#include` which supports both static files and _virtual_ paths which are fetched via HTTP(S).

This is forked from [fgnass/ssi-middleware](https://github.com/fgnass/ssi-middleware) to replace 'request-promise-native' (issue with Content-Length and Transfer-Encoding both present in response header) and added some features I needed to use.

```html
<html>
  <!--#include file="/static.txt"-->
  <!--#include virtual="/dynamic"-->
</html>
```

## Usage

See the basic usage example below. In order to resolve static files the `baseDir` option has to be provided, respectively `baseUrl` to resolve virtual paths.

## New

**shouldApply** - Whether to apply middleware on this path, takes a boolean.
```javascript
// Example to skip '/' and path ends with '/index.html'
path => /^(?!\/$)(.*(?<!\/index\.html))$/.test(path);
```

**filenameRewrite** - Whether to rewrite the ssi include file/path
```javascript
file => `new/path/to/${file}`;
```

```js
  const express = require('express');
  const ssi = require('ssi-middleware');

  const app = express();
  const port = 3000;

  // look for /config.js or /config.min.js or /config.dev.js
  const localConfigRegex = /^(.*\/config\.((min|dev)\.)?js)$/;

  app.use(ssi({
    baseDir: `${__dirname}/public`,
    baseUrl: `http://localhost:${port}`,
    filenameRewrite: file => {
      if (localConfigRegex.test(file)) {
        // replace matches with xxx.dev.js

        const pathArr = file.split('.');

        if (pathArr[pathArr.length - 2] === 'dev') {
            return file;
        }

        if (pathArr[pathArr.length - 2] === 'min') {
            pathArr.splice(pathArr.length - 2, 1);
        }
        pathArr[pathArr.length - 1] = `dev.${pathArr[pathArr.length - 1]}`;

        return pathArr.join('.');
      }

      return file;
    },
    shouldApply: path => /^(?!\/$)(.*(?<!\/index\.html))$/.test(path),
  }));

  app.listen(port);
```

# License

MIT
