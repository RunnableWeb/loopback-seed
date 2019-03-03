const axios = require('axios');
const logger = require('./../../server/logger');
const appConfig =  require('./../app-config');

const LOG_NAME = 'karixProvider.js';

let providerConfig;

let AUTH_ID,
 AUTH_TOKEN,
 API_URL,
 PHONE_NUMBER_SENDER,
 axiosInstance;

function init() {
    providerConfig = appConfig.SMS.provider['karix'];
    if(!providerConfig) {
        logger.error(LOG_NAME, `provider config obj can't be found`);
    }

    AUTH_ID = providerConfig.AUTH_ID;
    AUTH_TOKEN = providerConfig.AUTH_TOKEN;
    API_URL = providerConfig.API_URL;
    PHONE_NUMBER_SENDER = providerConfig.PHONE_NUMBER_SENDER;

    axiosInstance = axios.create({
        baseURL: API_URL,
        auth: {
            username: AUTH_ID,
            password: AUTH_TOKEN
        }
    });
}

async function sendSMS(phoneNumbers, message) {
    const METHOD_NAME = 'sendSMS';
    try {
        const response = await axiosInstance.post(`/message`, {
            source: PHONE_NUMBER_SENDER,
            destination: phoneNumbers,
            text: message
        });
        
        const error = response.data.objects[0].error;
        if(error) {
            throw error;
        } else {
            logger.info(LOG_NAME, `${METHOD_NAME}: response ${JSON.stringify(response.data)}`);
            return response.data;
        }
    } catch (error) {
        logger.error(LOG_NAME, `${METHOD_NAME}:error sending SMS messags: message: ${error.message}, phoneNumbers:${phoneNumbers.join(';')}`, error);
        throw error;
    }
}

module.exports = {
    init,
    sendSMS
}