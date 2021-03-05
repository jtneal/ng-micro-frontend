const config = require('./protractor.conf').config;

config.capabilities = {
  browserName: 'chrome',
  chromeOptions: {
    args: ['--headless', '--no-sandbox', '--disable-gpu', '--window-size=1920,1080']
  }
};

// chromedriver location on circleci/node:14-browsers
const chromeDriver = '/usr/local/bin/chromedriver';

if (require('fs').existsSync(chromeDriver)) {
  config.chromeDriver = chromeDriver;
}

exports.config = config;
