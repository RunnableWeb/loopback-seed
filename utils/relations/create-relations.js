'use strict';
const Promise = require('bluebird');
const _ = require('lodash');
const parseRelations = require('./shared').parseRelations;
const isEmptyValues = require('../common').isEmptyValues;

exports.createRelationsContext = (ctx, instance, Model, options) => {
  const body = _.cloneDeep(ctx.req.body);
  const relations = parseRelations(Model, options.exclude);

  function createRelations() {
    return Promise.all([createHasMany(), createHasAndBelongsToMany()]).then(() => getRelationsObject());
  }

  function createHasMany() {
    const promises = relations.hasMany.map((relation) => processHasManyRelation(relation));
    return Promise.all(promises);
  }

  function createHasAndBelongsToMany() {
    const promises = relations.hasAndBelongsToMany.map((relation) => processHasAndBelongsToManyRelation(relation));
    return Promise.all(promises);
  }

  function processHasAndBelongsToManyRelation(relation) {
    let promises = [];
    if (body[relation.name]) {
      promises.push(removePartials(relation).then(() => createPartials(body[relation.name], relation)));
    }
    return Promise.all(promises);
  }

  function getPartials(relation) {
    return new Promise((resolve, reject) => {
      Model.findById(instance.id, (err, result) => {
        if (err) reject(err);
        result[relation.name]((innerErr, partials) => {
          if (innerErr) reject(innerErr);
          else resolve(partials);
        });
      });
    });
  }

  function removePartials(relation) {
    return getPartials(relation).then(partials => {
      return Promise.all(partials.map(partial => removePartial(partial, relation)));
    });
  }

  function removePartial(partial, relation) {
    return new Promise((resolve, reject) => {
      instance[relation.name].remove(partial.id, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  function createPartials(models, relation) {
    return Promise.all(models.map(model => createPartial(model, relation)));
  }

  function createPartial(model, relation) {
    return new Promise((resolve, reject) => {
      instance[relation.name].add(model.id, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  function getRelationsObject() {
    return [].concat(relations.hasMany).concat(relations.hasAndBelongsToMany).reduce((prev, relation) => {
      prev[relation.name] = body[relation.name];
      return prev;
    }, {});
  }

  function processHasManyRelation(relation) {
    let promises = [];
    if (body[relation.name]) {
      promises.push(removeHasManyRelatedModels(relation).then(() => createHasManyModels(body[relation.name], relation.name)));
    }
    return Promise.all(promises);
  }

  function removeHasManyRelatedModels(relation) {
    return new Promise((resolve, reject) => {
      if (options[relation.name] && options[relation.name].remove) {
        instance[relation.name].destroyAll((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        let fk = relation.foreignKey || `${Model.definition.name}Id`;
        fk = _.camelCase(fk);
        const query = {};
        query[fk] = instance.id;
        const updateQ = {};
        updateQ[fk] = null;
        relation.RelModel.updateAll(query, updateQ, (err) => {
          if (err) reject(err);
          else resolve();
        });
      }
    });
  }

  function createHasManyModels(relatedModels, relName) {
    return new Promise((resolve, reject) => {
      instance[relName].create(relatedModels.map((model) => Object.assign(model, {id: undefined})), (err, order) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  return {createRelations: createRelations};
};
