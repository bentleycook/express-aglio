const fs = require('fs');

const generateFileList = (originalOptions, callback) => {
  const sourceIsDir = fs.lstatSync(originalOptions.source).isDirectory();
  const outputIsDir = fs.lstatSync(originalOptions.output).isDirectory();

  const options = originalOptions;

  options.serveDir = options.output;
  if (!outputIsDir) {
    options.serveDir = options.serveDir.split('/');
    options.serveDir.pop();
    options.serveDir = `${options.serveDir.join('/')}/`;
  }

  if (sourceIsDir && outputIsDir) {
    fs.readdir(options.source, (err, files) => {
      if (err) {
        options.log('express-aglio: error reading source directory.');
      } else {
        const fileList = [];
        files.forEach((file) => {
          if (file.slice((file.source.lastIndexOf('.') - 1 >>> 0) + 2) === 'apib') { // eslint-disable-line no-bitwise
            fileList.push({
              source: `${options.source}${file}`,
              output: `${options.output}${file.replace('.apib', '.html')}`,
            });
          }
        });
        callback(fileList);
      }
    });
  } else if (!sourceIsDir && !outputIsDir) {
    const fileList = [{
      source: options.source,
      output: options.output,
    }];
    callback(fileList);
  } else {
    throw new Error('express-aglio: output and source must both be either directories or single files.');
  }
};

// const validateEach = (files) => {
//   files.forEach((file) => {
//     if (!file.source.slice((file.source.lastIndexOf('.') - 1 >>> 0) + 2) === 'apib') {
//       return;
//     }
//     if (!file.output.slice((file.output.lastIndexOf('.') - 1 >>> 0) + 2) === 'html') {
//       return true;
//     }
//   });
// };

export {
  generateFileList as default,
  // validateEach,
};
