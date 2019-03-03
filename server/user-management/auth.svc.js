const { ObjectId } = require('mongodb');
const moment = require('moment')

const smsSvc = require('./../sms/sms.svc');
const app = require('./../../server/server');
const localeSvc = require('./../locale');


/**
 * 
 * @param {string} phoneNumber 
 * @param {string} code 
 */
async function sendVerifyCode(phoneNumber, code) {
    const message = localeSvc.translate('AUTH.MSGS.PHONE_NUMBER_AUTH', undefined, {verifyCode: code});

    const response = await smsSvc.sendSMS([phoneNumber], message);
    return response;
}


/**
 * 
 * @param {*} code 
 * @param {*} mUserId 
 */
async function verifyRegisterCode(code, mUserId) {
    const mUser = await app.models.MobileUser.findOne(
        {
            where: {
                and:
                    [
                        { id: ObjectId(mUserId) },
                        { "sms.code": code }
                    ]
            }
        }
    );

     if(mUser) {
        const { sms }  = mUser;
        sms.verfiedCode = true;
        sms.verfiedDate = moment.utc();

        await mUser.save();

        return true;
     }
     return false;
}

/**
 * 
 */
function getVerifyCode() {
    // get reandom number with 5 digits 
    const code = Math.floor(Math.random()*90000) + 10000;
    return code;
}

module.exports = {
    sendVerifyCode,
    verifyRegisterCode,
    getVerifyCode,
}