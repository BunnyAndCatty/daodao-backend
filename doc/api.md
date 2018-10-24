# 前端接口部分

> 鉴权说明： 凡是没有标明```无需鉴权```的接口，均需在header中带有token来进行访问

> 返回格式： 如无特殊说明，所有返回值为```application/json```格式

> 返回内容： 约定code为0表示接口执行正常，不为0时，message为具体的错误原因
```
  {
    "code": 0,
    "message": "错误原因",
    "data": BuisnessData
  }
```

---

## 账户部分

微信登录

### GET /cashbook/account/login

> 无需鉴权

用于账户登录，登录后获得的Token请携带

请求参数

|参数名|数据类型|说明|
|---|---|---|
|code|String|前端通过wx.login()拿到的临时登录凭票

响应参数

|参数名|数据类型|说明|
|---|---|---|
|token|String|业务Token|

错误列表

|code|message|
|---|---|
|-1|服务器繁忙|
|-40029|临时凭票code无效|
|-45011|登录过于频繁|

## 记账部分