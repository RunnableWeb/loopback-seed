'use strict';
const nanoid = require('nanoid');
const moment = require('moment');

module.exports = function(MobileUserAccessToken) {

    MobileUserAccessToken.assignToken = async function (mUserId) {
        const token = nanoid();
        const dbToken = await MobileUserAccessToken.create({
            id: token,
            mobileUserId: mUserId,
            ttl: moment().add(15, 'days').unix(),
        });
        
        return dbToken;
    }
};
