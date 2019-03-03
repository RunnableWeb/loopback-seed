/**
 * Used to add remote method to support update multiple models at once using bulkupdate
 */

const logger = require('./../../server/logger')
module.exports = function (Model, options) {

    Model.bulkUpdate = async (models) => {
        try {
            if (models && models.length) {
                const modelsUpdatePromises = [];
                models.forEach(model => {
                    modelsUpdatePromises.push(Model.upsert(model));
                });

                const modelUpdated = await Promise.all(modelsUpdatePromises)

                return modelUpdated;
            }
        } catch (err) {
            throw err;
        }
    }

    Model.remoteMethod('bulkUpdate', {
        accepts: { arg: 'models', type: 'array', http: { source:'body' } },
        returns: { arg: 'models', type: 'array', root: true },
        http: { verb: 'PUT' }
    });
}
