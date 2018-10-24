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
|code|String|前端通过wx.login()拿到的临时登录凭票|

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

### GET /cashbook/record/list

用于获取账户下的所有账单

响应参数

Array of: 

|参数名|数据类型|说明|
|---|---|---|
|id|Number|账单id|
|name|String|账单名字|
|avatar|String|头像图片URL|
|type|Number|账单类型 0-私人账单 1-共享账单|

### GET /cashbook/record/member

用于获取共享账单中的成员

请求参数

|参数名|数据类型|说明|
|---|---|---|
|billingId|number|账单ID|

响应参数

Array of: 

|参数名|数据类型|说明|
|---|---|---|
|userId|Number|用户id|
|name|String|用户名|
|avatar|String|头像图片URL|
|identity|Number|用户身份 0-管理员 1-成员|

### POST /cashbook/record/action

记账

请求参数

|参数名|数据类型|说明|
|---|---|---|
|action|number|动作 0-支出 1-收入|
|balance|number|金额|
|tagId|number|标签|
|billingId|number|账单ID|
|imageUrl|String|照片url|
|comment|String|备注|
|date|String|所属日期 YYYYMMDD格式|

