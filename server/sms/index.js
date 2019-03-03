const app = require('./../server');

module.exports = () => {
    const karixProvider = require('./karixProvider');
    karixProvider.init();
    
    require('./sms.svc').init(karixProvider);
}