const uuidv1 = require('uuid/v1');

module.exports = options => function(ctx, next) {
  ctx.traceId = uuidv1();
  ctx.set('traceId', ctx.traceId);
  return next();
}