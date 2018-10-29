const errorMap = {
  1840029: {
    message: 'code无效',
    code: 400
  },
  1845011: {
    message: '登录过于频繁',
    code: 400
  }
};

module.exports = options => async function (ctx, next) {
  ctx.Error = class CustomError extends Error {
    constructor(code, message) {
      super(message || '');
      this.code = code || 0;
      this.message = message || '';
    }
  };

  try {
    await next();
  }
  catch(error) {
    const errorDesc = errorMap[error.code];
    if(!errorDesc) {
      ctx.status = 500;
      ctx.body = {
        code: -1,
        message: '未知错误',
        traceId: ctx.traceId
      }
      return;
    }
    ctx.status = errorDesc.code || 500;
    ctx.body = {
      code: error.code || -2,
      message: errorDesc.message || null,
      traceId: ctx.traceId
    };
  }
}