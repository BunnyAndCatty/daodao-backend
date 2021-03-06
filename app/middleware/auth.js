module.exports = oprtions => async function(ctx, next) {
  const token = ctx.get('token');

  if(ctx.app.config.auth.whiteList.indexOf(ctx.request.path) > -1) return next();

  if(!token || token === '') throw new ctx.Error(401);
  const authEntity = await ctx.service.account.verify(token);
  if(!authEntity) throw new ctx.Error(401);

  ctx.auth = authEntity;

  return next();
}