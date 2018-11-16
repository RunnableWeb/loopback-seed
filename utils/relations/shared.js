'use strict';
const Propmise = require('bluebird');
const _ = require('lodash');
const isEmptyValues = require('../common').isEmptyValues;

function parseRelations(Model, exclude) {
  const relations = Model.settings.relations;
  const relationsNames = Object.keys(relations);
  return relationsNames.reduce((rels, name) => {
    if (!exclude || (exclude && exclude.indexOf(relations[name]) !== -1)) {
      const rel =  _.cloneDeep(relations[name]);
      switch (rel.type) {
        case 'hasMany': rels.hasMany.push(
          _.assign(rel, {
            RelModel: Model.app.models[rel.model],
            name: name,
          }));
          break;
        case 'belongsTo': rels.belongsTo.push(
          _.assign(rel, {
            RelModel: Model.app.models[rel.model],
            name: name,
          }));
          break;
        case 'hasAndBelongsToMany': rels.hasAndBelongsToMany.push(
          _.assign(rel, {
            RelModel: Model.app.models[rel.model],
            name: name,
          }));
          break;
      }
    }
    return rels;
  }, {hasMany: [], hasAndBelongsToMany: [], belongsTo: []});
}

exports.parseRelations = parseRelations;
