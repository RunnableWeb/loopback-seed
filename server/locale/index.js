const app = require('./../server');
const LocaleService = require('./locale.svc');
const i18n = require('./i18n.config');

app.use(i18n.init);
    // init and set provider
const localSvc = new LocaleService(i18n);

module.exports = localSvc;


