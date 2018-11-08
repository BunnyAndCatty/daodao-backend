const errorMap = {
  1840029: {
    message: 'code无效',
    code: 400
  },
  1845011: {
    message: '登录过于频繁',
    code: 400
  },
  401: {
    message: '鉴权失败或缺少鉴权字段',
    code: 401
  },
  404: {
    message: '未知资源',
    code: 404
  }
};

module.exports = options => async function (ctx, next) {
  ctx.Error = class CustomError extends Error {
    constructor(code = -1, message = '') {
      super(message);
      this.code = code;
      this.message = message;
    }
  };

  ctx.success = () => {
    ctx.body = {
      code: 0
    };
  };

  try {
    await next();

    if (ctx.status === 404 && !ctx.body) {
      throw new ctx.Error(404);
    }
  }
  catch(error) {
    const errorDesc = errorMap[error.code] || {
      code: 500,
      message: '未知错误'
    }
    ctx.status = errorDesc.code || 500;
    ctx.body = {
      code: error.code || -2,
      message: errorDesc.message || null,
      error: {
        message: error.message,
        stack: error.stack
      },
      traceId: ctx.traceId
    };
  }
}