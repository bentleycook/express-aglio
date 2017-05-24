const _ = require('lodash');
const awaitCallable = require('async-await-callables'); // see https://www.npmjs.com/package/async-await-callables for api
const aglio = require('aglio');
const watch = require('node-watch');
const express = require('express');

const validateOptions = require('./lib/validateOptions');
const generateListOptions = require('./lib/generateFileList');

const defaultOptions = {
  source: '', // input path/file eg /docs/source/index.apib OR /docs/source
  output: '', // output path/file eg /docs/html/index.html OR /docs/html
  watch: true,
  expose: true,
  uri: '/docs',
  debug: true,
  log: () => {
    this.debug && console.log.apply(console, arguments); // eslint-disable-line
  },
  aglioOptions: {}, // options to pass specifically to aglio
};


module.exports = (originalApp, originalOptions) => {
  // first step: parse and validate options.
  const options = _.extend({}, defaultOptions, originalOptions);
  const app = originalApp;

  const appListen = app.listen;
  let appListenArguments = [];

  app.listen = () => {
    options.log('app.listen (deferred)');
    appListenArguments = arguments;
  };
  validateOptions(options);

  // second step: generate the file list
  generateListOptions(options, (fileList) => {
    // third step: generate the build step
    const build = [];
    fileList.forEach((fStruct) => {
      build.push((next) => {
        aglio.renderFile(fStruct.source, fStruct.output, options.aglioOptions, (err) => {
          if (err) {
            options.log(err);
            next(err);
          } else {
            next();
          }
        });
      });
    });

    // fourth step: run first build
    const buildFn = (next) => {
      awaitCallable(build, (errors) => {
        if (errors) {
          options.log('express-aglio: error building docs; some docs did not compile successfully.');
        } else {
          options.log('express-aglio: docs built successfully');
        }
        if (typeof next === 'function') next(); // closes #1
      });
    };

    // fifth step: make first build
    awaitCallable([buildFn], () => {
      // sixth and final step: setup watch and routes
      if (options.watch) {
        // build docs on every change.
        watch(options.source, buildFn);
        options.log('express-aglio: watching filesystem for changes');
      }
      if (options.expose) {
        // options.log(options);
        app.use(options.uri, express.static(options.serveDir));
      }

      // options.log(app._router.stack); // eslint-disable-line no-underscore-dangle
      app.listen = appListen;
      options.log('app.listen (real)');
      app.listen.spread(app, appListenArguments);
    });
  });
};
