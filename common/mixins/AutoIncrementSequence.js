/**
 * used to add a sequenceNumber field as entity counter on collection
 */

const logger = require('./../../server/logger')
/**
 * @param {Object} Model 
 * @param {Object} options 
 * @param {string} options.CounterModelName 
 */
module.exports = function (Model, options) {
    Model.defineProperty('sequenceNumber', { type: Number });

    Model.observe('before save', function (ctx, next) {
        const app = ctx.Model.app;

        const mongoConnector = app.dataSources.mongoDs.connector;
        const instance = ctx.instance ? ctx.instance : ctx.data;

        if (!ctx.isNewInstance) return next();

        mongoConnector.collection(options.CounterModelName).findAndModify(
            { collection: Model.name },
            [['_id', 'asc']],
            { $inc: { value: 1 } },
            { new: true },
            function (err, sequence) {
                if (err) {
                    next(err);
                } else {
                    ctx.instance.sequenceNumber = sequence.value.value;
                    next();
                }
            })
    })
}
