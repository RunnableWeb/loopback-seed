const app = require('../server');
const authSvc = require('./auth.svc');



const ERRORS_TYPES = {
    NotActive: "NOT_ACTIVE",
    NotFound: "NOT_FOUND"
}

/**
 * 
 * @param {*} loginModel 
 */
async function register(loginModel) {
    const verifyCode = authSvc.getVerifyCode();
    const { MobileUser } = app.models;
    const user = {
        ...loginModel,
        sms: {
            code: verifyCode,
            verfiedCode: false,
            verfiedDate: undefined
        }
    };

    // send verify code after
    await authSvc.sendVerifyCode(loginModel.phoneNumber, verifyCode);

    // try finiding one with the same login details, and if it exist we'll be updating it
    // e.x usage when moving between phones, or when loosing local data on client side. 
    const dbUser = await MobileUser.findOne({ where: { and: [{ phoneNumber: loginModel.phoneNumber, email: loginModel.email }] } })
    if (dbUser) {
        user.id = dbUser.id;
    }

    // save user to db with the verify code
    const dbMobileUser = await MobileUser.upsert(user);
    return dbMobileUser;
}

/**
 * 
 * @param {string} phoneNumber 
 */
async function loginViaPhoneNumber(phoneNumber) {
    try {
        const { MobileUser } = app.models;
        let user = await MobileUser.findOne({ where: { phoneNumber: phoneNumber } });
        if (!user) {
            throw ERRORS_TYPES.NotFound;
        } else {
            // user exist

            //check user Activation
            if (!user.isActive) {
                throw ERRORS_TYPES.NotActive;
            }

            // send verify code after
            const verifyCode = authSvc.getVerifyCode();

            user.resetSMSCode(verifyCode);

            await user.save();

            await authSvc.sendVerifyCode(phoneNumber, verifyCode);

            return {
                id: user.id.toString(),
                email: user.email,
                phoneNumber: user.phoneNumber
            }
        }
    } catch (error) {
        throw error;
    }
}


/**
 * 
 * @param {*} mUserId 
 * @param {*} basicUserDetailsModel 
 */
async function createOrUpdateBasicDetails(mUserId, basicUserDetailsModel) {
    let mUser = await app.models.MobileUser.findById(mUserId);
    if (!mUser) {
        return null;
    }

    mUser = await mUser.updateAttributes({ basicDetails: basicUserDetailsModel });

    return mUser;
}

module.exports = {
    createOrUpdateBasicDetails,
    register,
    loginViaPhoneNumber,
    ERRORS_TYPES
}