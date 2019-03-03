const app = require('./../server');
const localSvc = require('./../locale');

module.exports = (options) => {
    return async (req,res, next) => {
        const lang = req.headers['accept-language'];
        if(lang) {
            localSvc.setLocale(req, lang);
        }

        next();
    }
};