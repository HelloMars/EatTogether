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

exports.InitDB = function() {
    AV.User.logIn('888', 'pwd:888', {
        success: function(user) {
            exports.CreateTuan(user, {
                'name': exports.CREAT_TUAN.name,
                'tuanid': exports.CREAT_TUAN.id,
                'count': 10
            });
            exports.CreateTuan(user, {
                'name': exports.JOIN_TUAN.name,
                'tuanid': exports.JOIN_TUAN.id,
                'count': 10
            });
        }
    });
};

exports.getOpenId = function(code) {
    var promise = new AV.Promise();
    OAUTH.getAccessToken(code, function (err, result) {
        console.log("getOpenId result: " + JSON.stringify(result));
        if (result.errcode) {
            promise.reject(result);
        } else {
            var accessToken = result.data.access_token;
            var openid = result.data.openid;
            promise.resolve(openid, accessToken);
        }
    });
    return promise;
};

exports.SignupLogin = function(username, password) {
    if (username === undefined || password === undefined) {
        var error = new AV.Error(
            AV.Error.OTHER_CAUSE,
            "无效参数");
        return AV.Promise.error(error);;
    }

    var promise = new AV.Promise();
    var user = new AV.User();
    var relation = user.relation("tuans");
    user.set('username', username);
    user.set('password', password);
    user.set('money', 0.0);
    user.set('state', 0);

    var query = new AV.Query(this.Tuan);
    query.containedIn("tuanid", [this.CREAT_TUAN.id, this.JOIN_TUAN.id]);
    query.find().then(function(results) {
        for (var i = 0; i < results.length; i++) {
            relation.add(results[i]);
        }
        return user.signUp(null);
    }).then(function (user) {
        console.log("注册成功: %j", user);
        promise.resolve(user);
    }, function (error) {
        if (error.code == 202) {
            // 如果用户名已经存在，则直接登陆
            console.log("直接登陆: " + JSON.stringify(user));
            AV.User.logIn(username, password, {
                success: function(user) {
                    // 登录成功，avosExpressCookieSession会自动将登录用户信息存储到cookie
                    console.log('登录成功: %j', user);
                    promise.resolve(user);
                },
                error: function(user, error) {
                    // 登录失败，非正常状态
                    console.log("登录失败: " + JSON.stringify(error));
                    promise.reject(user);
                }
            });
        } else {
            // 非正常状态
            console.log("注册失败: " + JSON.stringify(error));
            promise.reject(error);
        }
    });
    return promise;
};

exports.GetTuanList = function(user, functions) {
    var relation = user.relation("tuans");
    relation.targetClassName = 'Tuan';
    var tuans = [];
    relation.query().find().then(function(results){
        for (var i = 0; i < results.length; i++) {
            var tuan = formatTuan(results[i]);
            tuans.push(tuan);
            console.log("Get tuan: " + JSON.stringify(tuan));
        }
        functions.success(tuans);
    }, function (error) {
        console.log('Query Error: ' + JSON.stringify(error));
        functions.error(error);
    });
};

// attrs = {name, tuanid, count}
exports.CreateTuan = function(userid, attrs, options) {
    var error;
    options = options || {};

    // 参数检查
    if (!(attrs && attrs.name)) {
        error = new AV.Error(
            AV.Error.OTHER_CAUSE,
            "无效参数");
        if (options.error) {
            options.error(error);
        }
        return AV.Promise.error(error);
    }

    var promise = new AV.Promise();

    var tuan = new this.Tuan();
    AV.Promise.as().then(function() {
        var promise = new AV.Promise();
        if (attrs.tuanid) {
            var query = new AV.Query(exports.Tuan);
            query.equalTo('tuanid', attrs.tuanid);
            query.find().then(function(tuans) {
                if (tuans.length == 0) {
                    tuan.set('tuanid', attrs.tuanid);
                    promise.resolve();
                } else if (tuans.length == 1) {
                    console.log("团已存在");
                    promise.reject("团已存在");
                } else {
                    console.log("出现重复团");
                }
            }, function() {
                tuan.set('tuanid', attrs.tuanid);
                promise.resolve();
            });
        } else {
            promise.resolve();
        }
        return promise;
    }).then(function() {
        tuan.set('name', attrs.name);
        tuan.set('news', 0);
        var members = [];
        for (var i = 0; i < (attrs.count || 1); i++) {
            members.push(userid);
        }
        tuan.set('members', members);

        tuan.save(null, {
            success: function (tuan) {
                console.log("建团成功: " + JSON.stringify(tuan));
                if (options.success) {
                    options.success(tuan);
                }
                promise.resolve(tuan);
            },
            error: function (tuan, error) {
                console.log("建团失败: " + JSON.stringify(error));
                if (options.error) {
                    options.error(error);
                }
                promise.reject(error);
            }
        });
    });

    return promise;
};

function formatTuan(tuanobj) {
    var tuan = {};
    tuan.id = tuanobj.get('tuanid');
    tuan.name = tuanobj.get('name');
    tuan.members = tuanobj.get('members').length;
    tuan.news = tuanobj.get('news');
    return tuan;
}

exports.FormatTuanDetail = function (tuanobj) {
    var promise = new AV.Promise();
    var tuan = {};
    tuan.id = tuanobj.get('tuanid');
    tuan.name = tuanobj.get('name');
    tuan.news = tuanobj.get('news');

    var query = new AV.Query(AV.User);
    query.containedIn("objectId", tuanobj.get('members'));
    query.find().then(function(users) {
        var members = [];
        for (var i = 0; i < users.length; i++) {
            members.push({
                'name': users[i].getUsername(),
                'money': users[i].get('money')
            });
        }
        console.log("user: ", members);
        tuan.members = members;
        promise.resolve(tuan);
    });

    return promise;
};