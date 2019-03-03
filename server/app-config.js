const app = require('./server');

const config = {
    SMS: app.get('SMS')
};

module.exports = config;