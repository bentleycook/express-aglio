const fs = require('fs');

const validateOptions = (options) => {
  const sourceStat = fs.statSync(options.source);

  if (!sourceStat.isDirectory() && !sourceStat.isFile()) {
    throw new Error('express-aglio: options.source is not a file or directory. check path and try again.');
  }

  const outputStat = fs.statSync(options.output);

  if (!outputStat.isDirectory() && !outputStat.isFile()) {
    throw new Error('express-aglio: options.output is not a file or directory. check path and try again.');
  }

  ['watch', 'debug', 'expose'].forEach((prop) => {
    if (typeof options[prop] !== 'boolean') {
      throw new Error('express-aglio: options.%s must be a boolean value (true/false).'.replace('%s', prop));
    }
  });

  if (typeof options.log !== 'function') {
    throw new Error('express-aglio: options.log must be a function. to disable built in logger use options.debug = false.');
  }
};

export default validateOptions;
