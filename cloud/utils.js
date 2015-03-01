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

exports.Init = function() {
    console.log("Init");
    //API.createMenu(MENU, function (err, res) {
    //    console.log("createMenu" + JSON.stringify(res));
    //});
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
    tuan.members = tuanobj.get('members').length;
    tuan.news = tuanobj.get('news');
    return tuan;
}

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
                    promise.reject("出现重复团");
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

    var query = new AV.Query(AV.User);
    query.containedIn("objectId", tuanobj.get('members'));
    query.find().then(function(users) {
        var members = [];
        for (var i = 0; i < users.length; i++) {
            members.push({
                'uid': users[i].id,
                'name': users[i].getUsername(),
                'money': formatFloat(users[i].get('money'))
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
        var query = new AV.Query(AV.User);
        query.containedIn("objectId", members);
        query.find().then(function(users) {
            // TODO: 可能需要判断成员是否属于tuanid
            var promises = [];
            users.forEach(function(user) {
                var money = user.get('money');
                user.set('money', money - avg);
                promises.push(user.save());
            });
            return AV.Promise.when(promises);
        }).then(function() {
            // 给买单者记账
            var money = user.get('money');
            user.set('money', money + avg * members.length);
            return user.save();
        }).then(function() {
            // 生成消费记录
            var tuanHistory = new exports.TuanHistory();
            tuanHistory.set('payer', user);
            tuanHistory.set('members', members);
            tuanHistory.set('othersnum', othersnum);
            tuanHistory.set('price', price);

            var query = new AV.Query(exports.Tuan);
            query.equalTo('tuanid', tuanid);
            return query.first().then(function(tuan) {
                tuanHistory.set('tuan', tuan);
                return tuanHistory.save();
            });
        }).then(function() {
            console.log("结账成功");
            promise.resolve();
        }, function(error) {
            console.log("结账错误: " + JSON.stringify(error));
            promise.reject(error);
        });
    } else {
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
