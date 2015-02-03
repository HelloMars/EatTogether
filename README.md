# Eat Together

使用 [LeanCloud](http://leancloud.cn) [云代码](https://leancloud.cn/docs/cloud_code_guide.html) 做后端
使用 [Webot](https://github.com/node-webot) 做微信接口中间件

参考 [微信开发者中心](http://mp.weixin.qq.com/wiki/17/2d4265491f12608cd170a95559800f2d.html)

## 安装

### 下载代码：

```
git clone git@github.com:zhumeng1989/EatTogether.git
```

### 修改微信相关的配置 `cloud/config/weixin.js`

```
module.exports = {
  token: '<your_token>'
}
```
* token: 微信开发者中心填写的 Token(令牌)。

### 部署

配置 LeanCloud appId 和 appKey
```
avoscloud app add <projectName> <appId>
```

切换目标应用

```
avoscloud checkout <projectName>
```

部署应用到测试环境和生产环境

```
avoscloud deploy && avoslcoud publish
```

**提示**: 过程中可能会提示输入 masterKey。

如果没有错误，请打开浏览器，根据自己的二级域名键入网址： `http://<yourPath>.avosapps.com`

如果看到页面显示「微信接入示例应用」，恭喜你，部署成功！

### 微信开发者平台配置

登录 微信开发者平台 -> 配置项 -> 填写服务器配置，将其中的：

* URL：填写 `http://<yourPath>.avosapps.com/weixin`
* Token：填写 `cloud/config/weixin.js` 中 `token` 配置的内容
* 其他选项根据需要填写

然后提交。正常情况，你应该看到服务器状态变为 `已启用`。如果验证出错，会提示 `token验证失败`，请确认 url 是否填写正确。

## 感受一下

关注你的微信公众号，然后发送消息给他。如果没有问题，你会看到公众号自动回复。

## 开发相关

Sigle Page App 依附于微信公众号的主要入口为菜单栏的"我的饭团"链接

### API接口



### 文件说明

* `cloud/app.js`: 微信相关请求路由。
  * `GET /`: 静态首页 `public/index.html`。
  * `GET /weixin`: 提供微信服务的 path。
* `cloud/weixin.js`: 微信相关签名验证等逻辑。
  * `checkSignature`: 验证签名。
  * `receiveMessage`: 接受普通消息，并回复。
* `cloud/utils.js`: 通过wechat中间件与微信接口对接。
    * `Init`: 创建公众号菜单
    * `getOpenId`: 获得用户唯一openId
    * `SignUp`: 在LeanCloud注册用户

