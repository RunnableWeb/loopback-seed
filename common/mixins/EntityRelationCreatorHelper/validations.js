'use strict';
const Promise = require('bluebird');
const _ = require('lodash');
const parseRelations = require('./shared').parseRelations;
const isEmptyValues = require('./common').isEmptyValues;

exports.createValidationContext = (ctx, instance, Model, options) => {
  const body = ctx.req.body;
  const relations = parseRelations(Model, options.exclude);

  function validate() {
    return Promise.all([
      validateRootModel(),
      validateBelongsTo(),
      validateHasMany(),
    ]).then(result => {
      const errors = Object.assign({}, result[0], result[1]);
      if (isEmptyValues(errors)) {
        return undefined;
      }
      return errors;
    });
  }

  function validateRootModel() {
    return  new Promise((resolve, reject) => {
      instance.isValid((valid) => {
        if (!valid) resolve(instance.errors);
        else resolve(undefined);
      });
    });
  }

  function validateBelongsTo() {
    relations.belongsTo.forEach(relation => {
      const fk = relation.foreignKey || `${relation.name}Id`;
      if (body[fk]) {
        instance[fk] = body[fk];
      }
    });
  }

  function validateHasMany() {
    const props = relations.hasMany.reduce((prev, relation) => {
      prev[relation.name] = processHasManyRelation(relation);
      return prev;
    }, {});
    return Promise.props(props);
  }

  function processHasManyRelation(relation) {
    if (body[relation.name]) {
      const props = body[relation.name].reduce((prev, model, index) => {
        prev[index] = validateModel(model, relation.RelModel);
        return prev;
      }, {});
      return Promise.props(props).then(res => isEmptyValues(res) ? undefined : res);
    }
    return undefined;
  }

  function validateModel(relatedModel, RelModel) {
    return new Promise((resolve, reject) => {
      const createdModel = RelModel(relatedModel);
      createdModel.isValid((valid) => {
        if (!valid) resolve(createdModel.errors);
        else resolve(undefined);
      });
    });
  }
  return {validate: validate};
};

exports.customValidation = (Model, validator) => {
  // get full context from request
  Model.createOptionsFromRemotingContext = function(ctx) {
    var base = this.base.createOptionsFromRemotingContext(ctx);
    return Object.assign(base, {fullCtx: ctx});
  };
  Model.observe('before save', function filterProperties(ctx, next) {
    const instance = ctx.instance ? ctx.instance : ctx.data;
    // check request body
    if (!_.get(ctx, 'options.fullCtx.req.body')) return next();
    new Promise((resolve, reject) => {
      validator(ctx.options.fullCtx.req.body, resolve);
    }).then(errors => {
      instance.isValid((valid) => {
        errors = Object.assign({}, errors, instance.errors);
        if (isEmptyValues(errors)) return next();
        ctx.options.fullCtx.res.statusCode = 422;
        next({
          name: 'ValidationError',
          message: `The \`${Model.definition.name}\` instance is not valid`,
          details: {messages: errors},
        });
      });
    });
  });
};
