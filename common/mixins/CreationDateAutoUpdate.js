
/**
 * @param {Object} Model 
 * @param {Object} options 
 */
module.exports = function (Model, options) {
    Model.observe('before save', function (ctx, next) {
        if (!ctx.isNewInstance) return next();
        const instance = ctx.instance ? ctx.instance : ctx.data;
        instance.creationDate = new Date();
        next();
    });
};
