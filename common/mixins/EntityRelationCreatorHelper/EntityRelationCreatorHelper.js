/**
 * Used to create/update many-to-many relations along with Entity creation/update HTTP CALLS
 * As options we can pass: EntityRelationCreatorHelper: {"<relation-name>": {remove: true }} to remove and readd relation entities => example  passing "categories": { "remove": false} in options will exclude categories relation from the flow
 */

'use strict';
const createValidationContext = require('./validations').createValidationContext;
const createRelationsContext = require('./create-relations').createRelationsContext;
/**
 * @param {Object} Model 
 * @param {Object} options 
 */
//options are the excluded relations
//example  passing "categories": { "remove": false} in options will exclude categories relation from the flow
module.exports = function (Model, options) {
    Model.createOptionsFromRemotingContext = function (ctx) {
        var base = this.base.createOptionsFromRemotingContext(ctx);
        return Object.assign(base, { fullCtx: ctx });
    };

    // VALIDATION
    Model.observe('before save', function (ctx, next) {
        const instance = ctx.instance ? ctx.instance : ctx.data;
        if (!ctx.options.fullCtx || ctx.options.fullCtx.req.method == "PATCH") return next();
        createValidationContext(ctx.options.fullCtx, instance, Model, options)
            .validate()
            .then(errors => {
                if (!errors) return next();
                ctx.options.fullCtx.res.statusCode = 422;
                next({
                    name: 'ValidationError',
                    message: `The \`${Model.definition.name}\` instance is not valid`,
                    details: { messages: errors },
                });
            });
    });

    Model.observe('after save', function (ctx, next) {
        const instance = ctx.instance ? ctx.instance : ctx.data;
        if (!ctx.options.fullCtx || ctx.options.fullCtx.req.method == "PATCH") return next();
        createRelationsContext(ctx.options.fullCtx, instance, Model, options)
            .createRelations()
            .then(() => {
                next();
            })
            .catch(next);
    });
};
