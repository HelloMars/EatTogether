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

exports.TuanHistory = AV.Object.extend("TuanHistory");

exports.Account = AV.Object.extend("Account");

exports.Init = function() {
    console.log("Init");
    //API.createMenu(MENU, function (err, res) {
    //    console.log("createMenu" + JSON.stringify(res));
    //});
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
    user.set('username', username);
    user.set('nickname', username.substring(username.length-4));
    user.set('password', password);
    user.set('state', 0);

    user.signUp().then(function (user) {
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

/** 获取用户对应的团信息 */
exports.GetTuanList = function(user) {
    var promise = new AV.Promise();

    var query = new AV.Query(exports.Account);
    query.equalTo('user', user);
    query.include('tuan');
    query.find().then(function(results) {
        var tuans = [];
        for (var i = 0; i < results.length; i++) {
            var tuan = formatTuan(results[i].get('tuan'));
            tuans.push(tuan);
        }
        promise.resolve(tuans);
    });

    return promise;
};

function formatTuan(tuanobj) {
    var tuan = {};
    tuan.id = tuanobj.get('tuanid');
    tuan.name = tuanobj.get('name');
    tuan.members = tuanobj.get('members');
    tuan.news = tuanobj.get('news');
    return tuan;
}

// attrs = {name, tuanid, count}
exports.CreateTuan = function(attrs, options) {
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

    var tuan = new exports.Tuan();
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
                    promise.reject("出现重复团");
                }
            });
        } else {
            promise.resolve();
        }
        return promise;
    }).then(function() {
        tuan.set('name', attrs.name);
        tuan.set('news', 0);
        tuan.set('members', (attrs.count || 0));
        tuan.set('slogan', 'xxx');
        return tuan.save();
    }).then(function(tuan) {
        // 需要重新query以获得tuanid
        var query = new AV.Query(exports.Tuan);
        return query.get(tuan.id);
    }).then(function(tuan) {
        console.log("建团成功: " + JSON.stringify(tuan));
        if (options.success) {
            options.success(tuan);
        }
        promise.resolve(tuan);
    }, function(error) {
        console.log("建团失败: " + JSON.stringify(error));
        if (options.error) {
            options.error(error);
        }
        promise.reject(error);
    });

    return promise;
};

// 创建一条Account
exports.CreateAccount = function(user, tuan) {
    // 先查询避免重复
    var promise = new AV.Promise();

    var query = new AV.Query(exports.Account);
    query.equalTo('user', user);
    query.equalTo('tuan', tuan);
    query.find().then(function(results) {
        if (results.length == 0) {
            var account = new exports.Account();
            tuan.increment('members');
            account.set('user', user);
            account.set('tuan', tuan);
            account.set('money', 0);
            // TODO: 应该会同时save tuan
            return account.save();
        } else {
            console.log('已经有Account了');
            // 直接resolve会出错？
            return AV.Promise.as(results[0]);
        }
    }).then(function(account) {
        promise.resolve(account);
    }, function(error) {
        promise.reject(error);
    });

    return promise;
};

exports.ModifyTuan = function(tuanid, infoJson) {
    var promise = new AV.Promise();

    var query = new AV.Query(exports.Tuan);
    query.equalTo('tuanid', tuanid);
    query.find().then(function(tuans) {
        if (tuans.length == 0) {
            console.log("团不存在");
            promise.reject("团不存在");
        } else if (tuans.length == 1) {
            if (infoJson.name) {
                tuans[0].set('name', infoJson.name);
            }
            if (infoJson.slogan) {
                tuans[0].set('slogan', infoJson.slogan);
            }
            return tuans[0].save(null)
        } else {
            console.log("出现重复团");
            promise.reject("出现重复团");
        }
    }).then(function() {
        console.log("修改团信息成功");
        promise.resolve();
    }, function(error) {
        console.log("修改团信息失败");
        promise.reject(error);
    });
    return promise;
};

exports.FormatTuanDetail = function (tuanobj) {
    var promise = new AV.Promise();
    var tuan = {};
    tuan.id = tuanobj.get('tuanid');
    tuan.name = tuanobj.get('name');
    tuan.news = tuanobj.get('news');
    tuan.slogan = tuanobj.get('slogan');

    var query = new AV.Query(exports.Account);
    query.equalTo('tuan', tuanobj);
    query.include('user');
    query.find().then(function(results) {
        var members = [];
        for (var i = 0; i < results.length; i++) {
            var user = results[i].get('user');
            members.push({
                'uid': user.id,
                'name': user.get('nickname'),
                'money': formatFloat(results[i].get('money'))
            });
        }
        tuan.members = members;
        promise.resolve(tuan);
    });

    return promise;
};

exports.Bill = function(user, tuanid, members, othersnum, price) {
    var promise = new AV.Promise();

    if (members.length > 0 && othersnum >= 0 && price >= 0) {
        var avg = Math.ceil(price * 100 / (members.length + othersnum)) / 100;

        var query = new AV.Query(exports.Tuan);
        query.equalTo('tuanid', tuanid);
        query.find().then(function(tuans) {
            if (tuans.length == 1) {
                return AV.Promise.as(tuans[0]);
            } else {
                return AV.Promise.error('Not Found Tuan');
            }
        }).then(function(tuan) {
            // 嵌套查询
            var userQuery = new AV.Query(AV.User);
            userQuery.containedIn("objectId", members);
            var accountQuery = new AV.Query(exports.Account);
            // 不知道为啥matchesKeyInQuery发生错误
            accountQuery.equalTo('tuan', tuan);
            accountQuery.matchesQuery('user', userQuery);
            accountQuery.find().then(function(results) {
                // 给团成员记账
                var promises = [];
                for (var i = 0; i < results.length; i++) {
                    var money = results[i].get('money');
                    results[i].set('money', money - avg);
                    promises.push(results[i].save());
                }
                return AV.Promise.when(promises);
            }).then(function() {
                // query买单者
                var query2 = new AV.Query(exports.Account);
                query2.equalTo('user', user);
                query2.equalTo('tuan', tuan);
                return query2.find();
            }).then(function(accounts) {
                // 给买单者记账
                if (accounts.length == 1) {
                    var money = accounts[0].get('money');
                    accounts[0].set('money', money + avg * members.length);
                    return accounts[0].save();
                } else {
                    return AV.Promise.error('Not Found Account');
                }
            }).then(function() {
                // 生成消费记录
                var tuanHistory = new exports.TuanHistory();
                tuanHistory.set('payer', user);
                tuanHistory.set('tuan', tuan);
                // TODO: 可能是个relation
                tuanHistory.set('members', members);
                tuanHistory.set('othersnum', othersnum);
                tuanHistory.set('price', price);
                return tuanHistory.save();
            }).then(function() {
                console.log("结账成功");
                promise.resolve();
            }, function(error) {
                // TODO: 这里可能还需要处理失败时退还其他成员扣款的逻辑
                console.log("结账错误: " + JSON.stringify(error));
                promise.reject(error);
            });
        });
    } else {
        console.log('Invalid Parameters');
        promise.reject('Invalid Parameters');
    }
    return promise;
};

exports.GetTuanHistory = function(tuanid, start, length) {
    var promise = new AV.Promise();

    var tuanHistory = [];
    var innerQuery = new AV.Query(exports.Tuan);
    innerQuery.equalTo('tuanid', tuanid);
    var query = new AV.Query(exports.TuanHistory);
    query.matchesQuery('tuan', innerQuery);
    query.descending("createdAt");
    query.skip(start);
    query.limit(length);
    query.include(['tuan.name']);
    query.find().then(function(results) {
        console.log('Query: ' + JSON.stringify(results));
        for (var i = 0; i < results.length; i++) {
            var history = formatTuanHistory(results[i]);
            tuanHistory.push(history);
        }
        promise.resolve(tuanHistory);
    }, function (error) {
        console.log('Query Error: ' + JSON.stringify(error));
        promise.reject(error);
    });

    return promise;
};

function formatTuanHistory(history) {
    return history.createdAt.toISOString().replace(/T.+/, '') + '，'
        + history.get('tuan').get('name') + '团' + history.get('members').length
        + '人消费' + formatFloat(history.get('price'));
}

function formatFloat(float) {
    return Math.round(float*100)/100;
}
