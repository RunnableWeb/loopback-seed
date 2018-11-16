/**
 * This filter is intended to to be used to query filter by related model property, e.g. appusers/filter={"role.id"="admin"}.
 */


'use strict';
var lf = require('my-loopback-filter');

module.exports = function (Model, options) {

  Model.beforeRemote('find', function (ctx, piu, next) {
    if (ctx.req.query.deepFilter || options.enabled) {
      delete ctx.args.filter;
    }
    next();
  });

  Model.afterRemote('find', function (ctx, items, next) {
    if (ctx.req.query.deepFilter || options.enabled) {
      ctx.result = nestFilter(ctx, items);
    }
    next();
  });

  Model.beforeRemote('count', function (ctx, piu, next) {
    if (ctx.req.query.deepFilter || options.enabled) {
      delete ctx.args.filter;
    }
    next();
  });

  Model.afterRemote('count', function (ctx, count, next) {
    if (ctx.req.query.deepFilter || options.enabled) {
      Model.find((err, items) => {
        if (err) return next(err);
        ctx.result = { count: nestFilter(ctx, items).length };
        next();
      });
    } else {
      next();
    }
  });

  function nestFilter(ctx, items) {
    const result = items.map(item => item.toObject());
    const filter = ctx.req.query.filter ? JSON.parse(ctx.req.query.filter) :
      ctx.req.query.where ? { where: JSON.parse(ctx.req.query.where) } : undefined;
    const filtered = lf.applyLoopbackFilter(result, filter);
    return filtered;
  }
};
