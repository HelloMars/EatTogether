/**
 * Created by Meng on 2015/2/2.
 */
var WechatAPI = require('wechat-api');
var WechatOAuth = require('wechat-oauth');

var APPID = 'wx215f75c4627af14a';
var APPSECRET = 'c4dfb380644d4fb5266468da939935d5';

var API = new WechatAPI(APPID, APPSECRET);
var OAUTH = new WechatOAuth(APPID, APPSECRET);
var MENU = {
    "button":[
        {
            "type":"view",
            "name":"我的饭团",
            "url": OAUTH.getAuthorizeURL('http://eat.avosapps.com/auth', '0', 'snsapi_base')
        },
        {
            "name":"菜单",
            "sub_button":[
                {
                    "type":"click",
                    "name":"赞一下我们",
                    "key":"V001_UP"
                }
            ]
        }]
};

exports.Init = function() {
    API.createMenu(MENU, function (err, res) {
        console.log("createMenu" + JSON.stringify(res));
    });
};

exports.getOpenId = function(code, callback) {
    OAUTH.getAccessToken(code, function (err, result) {
        console.log("getOpenId code: " + code);
        var accessToken = result.data.access_token;
        var openid = result.data.openid;
        callback(openid, accessToken);
    });
};

exports.SignUp = function(username, password) {
    if (username === undefined || password === undefined) {
        console.log("Error");
        return;
    }
    var user = new AV.User();
    user.set('username', username);
    user.set('password', password);
    user.signUp(null, {
        success: function(user) {
            console.log("注册成功");
        },
        error: function(user, error) {
            console.log("注册失败");
        }
    });
};