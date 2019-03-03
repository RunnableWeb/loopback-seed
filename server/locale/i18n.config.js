const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['ar', 'iw'],
  defaultLocale: 'iw',
  queryParameter: 'lang',
  directory: __dirname + '/locales',
  objectNotation: true
});


module.exports = i18n;