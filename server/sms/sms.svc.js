const { stringsUtils :{ replaceAt } } = require('rw-js-utils');
const localeSvc = require('./../locale');
const appConfig = require('./../app-config');
const logger = require('./../logger');

const FILE_NAME = 'sms.svc.js';

let smsProvider;
function init(provider) {
    smsProvider = provider;
}

/**
 * 
 * @param {string[]} phoneNumbers 
 * @param {string} message 
 */
async function sendSMS(phoneNumbers, message, locale = undefined, useDefaultLocale = false) {
    phoneNumbers = phoneNumbers.map(phNumber => {
        if(!phNumber.includes('+')) {
            return replaceAt(phNumber, 0, '+972');        
        }
        return phNumber;
    });
    
    const msgFormatted = _formatMessage(message, locale, useDefaultLocale);

    if (appConfig.SMS.enabled) {
        return await smsProvider.sendSMS(phoneNumbers, msgFormatted);
    } else {
        logger.info(FILE_NAME, `SMS - Message that could be sent - "${msgFormatted}"`);
    }
    return;
}

function _formatMessage(message, locale, useDefaultLang) {
    let appName = '';

    if(useDefaultLang) {
        appName = localeSvc.translateDefault('APP.NAME');
    } else {
        appName = localeSvc.translate('APP.NAME', locale);
    }
    
    const messageFormatted = `${appName} - ${message}`;
    
    return messageFormatted;
}

module.exports = {
    init,
    sendSMS,
}