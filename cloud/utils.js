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
            "url": OAUTH.getAuthorizeURL('http://eat.avosapps.com/myet', '0', 'snsapi_base')
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

exports.CREAT_TUAN = {'id':1, 'name': '建团'};

exports.JOIN_TUAN = {'id':2, 'name': '入团'};

exports.Tuan = AV.Object.extend("Tuan");

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

exports.SignupLogin = function(username, password, functions) {
    if (username === undefined || password === undefined) {
        console.log("Error");
        functions.error(undefined, {code: -1, message: 'undefined'});
        return;
    }

    var user = new AV.User();
    var relation = user.relation("tuans");
    user.set('username', username);
    user.set('password', password);

    var query = new AV.Query(this.Tuan);
    query.containedIn("tuanid", [this.CREAT_TUAN.id, this.JOIN_TUAN.id]);
    query.find().then(function(results) {
        for (var i = 0; i < results.length; i++) {
            relation.add(results[i]);
            console.log("Add tuan: " + results[i].get('tuanid'));
        }
        user.signUp(null, {
            success: function(user) {
                console.log("注册成功: %j", user);
                functions.success(user);
            },
            error: function(user, error) {
                if (error.code == 202) {
                    // 如果用户名已经存在，则直接登陆
                    console.log("直接登陆: " + JSON.stringify(user));
                    AV.User.logIn(user.getUsername(), 'pwd:'+user.getUsername(), {
                        success: function(user) {
                            // 登录成功，avosExpressCookieSession会自动将登录用户信息存储到cookie
                            console.log('登录成功: %j', user);
                            functions.success(user);
                        },
                        error: function(user, error) {
                            // 登录失败，非正常状态
                            console.log("登录失败: " + JSON.stringify(error));
                            functions.error(user, error);
                        }
                    });
                } else {
                    // 非正常状态
                    console.log("注册失败: " + JSON.stringify(error));
                    functions.error(user, error);
                }
            }
        });
    });
};

exports.GetTuanList = function(user, functions) {
    var relation = user.relation("tuans");
    relation.targetClassName = 'Tuan';
    var tuans = [];
    relation.query().find().then(function(results){
        for (var i = 0; i < results.length; i++) {
            var tuan = formatTuan(results[i]);
            tuans.push(tuan);
            console.log("Add tuan: " + JSON.stringify(tuan));
        }
        functions.success(tuans);
    }, function (error) {
        console.log('Query Error: ' + JSON.stringify(error));
        functions.error(error);
    });
};

function formatTuan(tuanobj) {
    var tuan = {};
    tuan.id = tuanobj.get('tuanid');
    tuan.name = tuanobj.get('name');
    tuan.members = tuanobj.get('memberids').length;
    tuan.news = tuanobj.get('news');
    return tuan;
}