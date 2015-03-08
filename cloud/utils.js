/**
 * Created by Meng on 2015/2/2.
 */
var WechatAPI = require('wechat-api');
var WechatOAuth = require('wechat-oauth');

var APPID = 'wx215f75c4627af14a';
var APPSECRET = 'c4dfb380644d4fb5266468da939935d5';
var TEMPID_BILL = 'yqYazavKFfpXfbSOLkObhsA5u3hMRukHm41Diy3YL8o';
var TEMPID_JOIN = '6ADofGKCi-z1R1iE_Q0fkPxLEXmYFdh4Q-pMFfdChbc';
var TEMPID_QUIT = '32wmlUVHgjnaWJU0K1Rucc4_STGmw8gnGwJo6fUZ1iQ';

var APPID_JS = 'wx5296f7011ca92045';
var APPSECRET_JS = 'de3f486b57ab015946eb8d4c473db192 ';

var API = new WechatAPI(APPID, APPSECRET);
var API_JS = new WechatAPI(APPID_JS, APPSECRET_JS);
var OAUTH = new WechatOAuth(APPID, APPSECRET);
var MENU = {
    "button":[
        {
            "type":"view",
            "name":"我的饭团",
            "url": OAUTH.getAuthorizeURL('http://eat.avosapps.com/' + 'myet', '0', 'snsapi_userinfo')
        },
        {
            "name":"菜单",
            "sub_button":[
                {
                    "type":"click",
                    "name":"赞一下我们",
                    "key":"V001_UP"
                },
                {
                    "type":"view",
                    "name":"体验链接",
                    "url": OAUTH.getAuthorizeURL('http://eat.avosapps.com/' + 'myet', '0', 'snsapi_base')
                }
            ]
        }]
};

var JSAPILIST = [
    'checkJsApi',
    'onMenuShareTimeline',
    'onMenuShareAppMessage',
    'onMenuShareQQ',
    'onMenuShareWeibo',
    'hideMenuItems',
    'showMenuItems',
    'hideAllNonBaseMenuItem',
    'showAllNonBaseMenuItem',
    'translateVoice',
    'startRecord',
    'stopRecord',
    'onRecordEnd',
    'playVoice',
    'pauseVoice',
    'stopVoice',
    'uploadVoice',
    'downloadVoice',
    'chooseImage',
    'previewImage',
    'uploadImage',
    'downloadImage',
    'getNetworkType',
    'openLocation',
    'getLocation',
    'hideOptionMenu',
    'showOptionMenu',
    'closeWindow',
    'scanQRCode',
    'chooseWXPay',
    'openProductSpecificView',
    'addCard',
    'chooseCard',
    'openCard'
];

var HISTORY_TYPE = {
    'CREATE': 1,            // 建团记录。date, username 创建 tuanname 团
    'JOIN': 2,              // 入团记录。date, username 加入 tuanname 团
    'QUIT': 3,              // 退团记录。date, username 退出 tuanname 团
    'MODIFY_NAME': 5,       // 修改团名记录。date, fromname 团的团名被 username 修改为 toname
    'BILL': 10,             // 消费记录。date, username 请大家(members.length 人)消费了 money
    'REVERT_BILL': 11       // 已经撤销的消费记录。date, xxx 请大家消费了 xxx (已撤销)
};

if (__local) {
    // 当前环境为「开发环境」，是由命令行工具启动的
    console.log('「开发环境」');
    exports.SERVER = 'http://127.0.0.1:3000/';
} else if(__production) {
    // 当前环境为「生产环境」，是线上正式运行的环境
    console.log('「生产环境」');
    exports.SERVER = 'http://eat.avosapps.com/';
} else {
    // 当前环境为「测试环境」，云代码方法通过 HTTP 头部 X-AVOSCloud-Application-Production:0 来访问；webHosting 通过 dev.xxx.avosapps.com 域名来访问
    console.log('「测试环境」');
    exports.SERVER = 'http://dev.eat.avosapps.com/';
}

exports.CREAT_TUAN = {'id':1, 'name': '建团'};

exports.JOIN_TUAN = {'id':2, 'name': '入团'};

exports.Tuan = AV.Object.extend("Tuan");

exports.TuanHistory = AV.Object.extend("TuanHistory");

exports.Account = AV.Object.extend("Account");

exports.Config = AV.Object.extend("Config");

exports.Init = function() {
    console.log("Init");
    //API.createMenu(MENU, function (err, res) {
    //    console.log("createMenu" + JSON.stringify(res));
    //});
    //addConfig('TuanNameList', {'TuanNameList':['创业','前端','后端','运营','全栈','编辑','西游记','八戒','悟空','沙僧','唐僧']});
};

function addConfig(key, value) {
    var query = new AV.Query(exports.Config);
    query.equalTo('key', key);
    query.first().then(function(config) {
        if (config) {
            return AV.Promise.error(key + ' Exists');
        } else {
            config = new exports.Config();
            config.set('key', key);
            config.set('value', value);
            return config.save()
        }
    }).then(function() {
        console.log('Add Config [' + key + ', ' + JSON.stringify(value) + ']');
    }, function(error) {
        console.log('Add Config Error' + JSON.stringify(error));
    });
}

exports.getJsConfig = function(url) {
    var promise = new AV.Promise();
    var param = {
        debug: false,
        jsApiList: JSAPILIST,
        url: url
    };
    API_JS.getJsConfig(param, function(err, result) {
        if (err) {
            promise.reject('getJsConfig Error');
        } else {
            //console.log('getJsConfig Success: %j', result);
            promise.resolve(result);
        }
    });
    return promise;
};

exports.getUserInfo = function(code) {
    var promise = new AV.Promise();
    OAUTH.getAccessToken(code, function(err, result) {
        if (err) {
            promise.reject(result);
        } else {
            var openid = result.data.openid;
            OAUTH.getUser(openid, function (err, result) {
                if (err) {
                    console.log('getOpenId: ' + openid);
                    promise.resolve({'openid':openid});
                } else {
                    console.log('getUserInfo: ' + JSON.stringify(result));
                    promise.resolve({'openid':openid, 'userinfo':result});
                }
            });
        }
    });
    return promise;
};

exports.getTuanObj = function(tuanid) {
    var promise = new AV.Promise();

    var id = Number(tuanid);
    if (id >= 10) {
        var query = new AV.Query(exports.Tuan);
        query.equalTo('tuanid', id);
        query.find().then(function(tuans) {
            if (tuans.length == 0) {
                promise.resolve(null);
            } else if (tuans.length == 1) {
                promise.resolve(tuans[0]);
            } else {
                promise.reject('Tuan Results Error');
            }
        });
    } else {
        promise.reject('Invalid Parameters');
    }
    return promise;
};

exports.getUserTuanObj = function(requser, tuanid) {
    var promise = new AV.Promise();

    requser.fetch().then(function(user) {
        exports.getTuanObj(tuanid).then(function(tuan) {
            var query = new AV.Query(exports.Account);
            query.equalTo('user', user);
            query.equalTo('tuan', tuan);
            query.find().then(function(accounts) {
                if (accounts.length == 0) {
                    promise.resolve({
                        'user':user, 'tuan':tuan,
                        'isin': false
                    });
                } else if (accounts.length == 1) {
                    promise.resolve({
                        'user':user, 'tuan':tuan,
                        'account':accounts[0],
                        'isin':(accounts[0].get('state') != -1)
                    });
                } else {
                    promise.reject('Account Results Error');
                }
            });
        })
    });
    return promise;
};

// 订阅公众号
exports.Subscribe = function(openid) {
    return Signup(openid, 'pwd:'+openid, 1).then(function(user) {
        console.log("注册成功: %j", user);
        return AV.Promise.as(user);
    }, function(error) {
        if (error.code == 202) {
            console.log("用户已存在: %s", openid);
            return modifyUserInfo(openid, {'state':1});
        } else {
            // 非正常状态
            console.log("注册失败: " + JSON.stringify(error));
            promise.reject(error);
        }
    });
};

// 取消订阅
exports.UnSubscribe = function(openid) {
    return modifyUserInfo(openid, {'state':-1});
};

function modifyUserInfo(openid, userinfo) {
    var query = new AV.Query(AV.User);
    query.equalTo('username', openid);
    return query.first().then(function(user) {
        if (userinfo.state) user.set('state', userinfo.state);
        if (userinfo.nickname) user.set('nickname', userinfo.nickname);
        if (userinfo.headimgurl) user.set('headimgurl', userinfo.headimgurl);
        if (userinfo.sex) user.set('sex', userinfo.sex);
        if (userinfo.location) user.set('location', userinfo.location);
        return user.save().then(function(user) {
            console.log('Modify User Success: ' + openid + ', ' + JSON.stringify(userinfo));
            return AV.Promise.as(user);
        }, function(error) {
            console.log('Modify User Failed: ' + JSON.stringify(error));
            return AV.Promise.error(error);
        });
    });
}

function Signup(username, password, flag) {
    if (username === undefined || password === undefined) {
        var error = new AV.Error(
            AV.Error.OTHER_CAUSE,
            "无效参数");
        return AV.Promise.error(error);
    }

    var user = new AV.User();
    user.set('username', username);
    user.set('nickname', username.substring(username.length-4));
    user.set('password', password);
    user.set('state', flag);
    user.set('money', 0);
    user.set('sex', 0);

    return user.signUp();
}

exports.Login = function(username, password, userinfo) {
    var promise = new AV.Promise();
    AV.User.logIn(username, password, {
        success: function(user) {
            // 登录成功，avosExpressCookieSession会自动将登录用户信息存储到cookie
            console.log('登录成功: %j', user);
            if (userinfo) {
                // 修改用户信息
                userinfo.location = {
                    'country': userinfo.country,
                    'province': userinfo.province,
                    'city': userinfo.city
                };
                modifyUserInfo(username, userinfo);
            }
            promise.resolve(user);
        },
        error: function(user, error) {
            // 登录失败，非正常状态
            console.log("登录失败: " + JSON.stringify(error));
            promise.reject(user);
        }
    });

    return promise;
};

/** 获取用户对应的团信息已经用户信息 */
exports.GetTuanList = function(user) {
    var promise = new AV.Promise();

    var ret = {};
    ret.user = formatUser(user);
    var query = new AV.Query(exports.Account);
    query.equalTo('user', user);
    query.notEqualTo('state', -1);
    query.include('tuan');
    query.find().then(function(results) {
        var tuans = [];
        for (var i = 0; i < results.length; i++) {
            var tuan = formatTuan(results[i].get('tuan'));
            tuans.push(tuan);
        }
        ret.tuans = tuans;
        promise.resolve(ret);
    });

    return promise;
};

function formatUser(userobj) {
    var user = {};
    user.id = userobj.id;
    user.nickname = userobj.get('nickname');
    user.location = userobj.get('location');
    user.sex = userobj.get('sex');
    user.money = userobj.get('money');
    user.headimgurl = formatHeadImgUrl(userobj, 64);
    return user;
}

function formatTuan(tuanobj) {
    var tuan = {};
    tuan.id = tuanobj.get('tuanid');
    tuan.name = tuanobj.get('name');
    tuan.members = tuanobj.get('members');
    tuan.news = tuanobj.get('news');
    return tuan;
}

exports.CreateTuan = function(user) {
    var query = new AV.Query(exports.Config);
    query.equalTo('key', 'TuanNameList');
    return query.first().then(function(result) {
        var value = result.get('value');
        var idx = Math.floor(Math.random() * value.TuanNameList.length);
        return AV.Promise.as(value.TuanNameList[idx]);
    }).then(function(name) {
        var tuan = new exports.Tuan();
        tuan.set('name', name);
        tuan.set('creater', user);
        tuan.set('money', 0);
        tuan.set('news', 0);
        tuan.set('members', 0);
        tuan.set('slogan', '给一个响亮的团口号吧！');
        return tuan.save();
    }).then(function(tuan) {
        // 生成建团记录
        var tuanHistory = new exports.TuanHistory();
        tuanHistory.set('creater', user);
        tuanHistory.set('tuan', tuan);
        tuanHistory.set('type', HISTORY_TYPE.CREATE);
        tuanHistory.set('data', {
            'username': user.get('nickname'),
            'tuanname': tuan.get('name')
        });
        tuanHistory.save();
        // 需要重新query以获得tuanid
        var query = new AV.Query(exports.Tuan);
        return query.get(tuan.id);
    });
};

// 创建一条Account或激活原来的Account
exports.JoinTuan = function(user, tuan, account) {
    var query = new AV.Query(exports.Account);
    query.equalTo('tuan', tuan);
    query.notEqualTo('state', -1);
    query.include('user');
    return query.find().then(function(results) {
        var record = false;
        if (account) {
            if (account.get('state') == -1) {
                // 以前加入过该团
                record = true;
                tuan.increment('members');
                account.set('tuan', tuan);
                account.set('state', 0);
            }
        } else {
            // 第一次加入该团
            record = true;
            account = new exports.Account();
            tuan.increment('members');
            account.set('user', user);
            account.set('tuan', tuan);
            account.set('money', 0);
            account.set('state', 0);
        }
        if (record) {
            // 给所有团员发消息
            for (var i = 0; i < results.length; i++) {
                sendTemplate(TEMPID_JOIN, user, results[i].get('user'), tuan);
            }
            // 生成入团记录
            var tuanHistory = new exports.TuanHistory();
            tuanHistory.set('creater', user);
            tuanHistory.set('tuan', tuan);
            tuanHistory.set('type', HISTORY_TYPE.JOIN);
            tuanHistory.set('data', {
                'username': user.get('nickname'),
                'tuanname': tuan.get('name')
            });
            tuanHistory.save();
        }
        return account.save();
    });
};

// 关闭一条Account
exports.DisableAccount = function(user, tuan, account) {
    var query = new AV.Query(exports.Account);
    query.equalTo('tuan', tuan);
    query.notEqualTo('state', -1);
    query.include('user');
    return query.find().then(function(results) {
        if (account) {
            var ret = {};
            ret.code = -1;
            var money = formatFloat(account.get('money'));
            if (money > 10) {
                // 清除账户余额再退团
                ret.message = '您在该团还有较多结余(' + money + ')，请销账后再退团';
                return AV.Promise.as(ret);
            } else if (money < -10) {
                // 清除账户余额再退团
                ret.message = '您在该团还有较多欠款(' + money + ')，请销账后再退团';
                return AV.Promise.as(ret);
            } else {
                // 直接退团，生成退团记录
                var tuanHistory = new exports.TuanHistory();
                tuanHistory.set('creater', user);
                tuanHistory.set('tuan', tuan);
                tuanHistory.set('type', HISTORY_TYPE.QUIT);
                tuanHistory.set('data', {
                    'username': user.get('nickname'),
                    'tuanname': tuan.get('name')
                });
                tuanHistory.save();
                // 给所有团员发消息
                for (var i = 0; i < results.length; i++) {
                    if (results[i].get('user').id != user.id) {
                        // 给其他成员发送模板消息
                        sendTemplate(TEMPID_QUIT, user, results[i].get('user'), tuan);
                    }
                }
                ret.code = 0;
                ret.message = '您在该团只有(' + money + ')团币，系统已经直接退团';
                tuan.increment('members', -1);
                // 只标记不删除
                account.set('state', -1);
                account.set('tuan', tuan);
                return account.save().then(function() {
                    return AV.Promise.as(ret);
                });
            }
        } else {
            return AV.Promise.error('Invalid Parameters');
        }
    });
};

exports.ModifyTuan = function(user, tuan, infoJson) {
    if (infoJson && infoJson.name) {
        // 生成修改记录
        var tuanHistory = new exports.TuanHistory();
        tuanHistory.set('creater', user);
        tuanHistory.set('tuan', tuan);
        tuanHistory.set('type', HISTORY_TYPE.MODIFY_NAME);
        tuanHistory.set('data', {
            'username': user.get('nickname'),
            'fromname': tuan.get('name'),
            'toname': infoJson.name
        });
        tuanHistory.save();
        tuan.set('name', infoJson.name);
    }
    if (infoJson && infoJson.slogan) {
        tuan.set('slogan', infoJson.slogan);
    }
    return tuan.save()
};

exports.FormatTuanDetail = function (tuanobj) {
    var tuan = {};
    tuan.id = tuanobj.get('tuanid');
    tuan.name = tuanobj.get('name');
    tuan.news = tuanobj.get('news');
    tuan.slogan = tuanobj.get('slogan');

    var query = new AV.Query(exports.Account);
    query.equalTo('tuan', tuanobj);
    query.notEqualTo('state', -1);
    query.include('user');
    return AV.Promise.when(query.find(), getQRCode(tuan.id)).then(function(results, qrcode) {
        var members = [];
        for (var i = 0; i < results.length; i++) {
            var user = results[i].get('user');
            members.push({
                'uid': user.id,
                'name': user.get('nickname'),
                'sex': user.get('sex'),
                'headimgurl': formatHeadImgUrl(user, 64),
                'money': formatFloat(results[i].get('money'))
            });
        }
        tuan.members = members;
        tuan.qrcode = qrcode[0];
        tuan.shareUrl = qrcode[1];
        return AV.Promise.as(tuan);
    });
};

function getQRCode(tuanid) {
    var promise = new AV.Promise();
    API.createTmpQRCode(Number(tuanid), 1800, function(err, result) {
        if (err) {
            promise.reject('getQRCode Error');
        } else {
            console.log('getQRCode Success: %j', result);
            promise.resolve([API.showQRCodeURL(result.ticket), result.url]);
        }
    });
    return promise;
}

/** 买单
 * 1. 给买单者记账(验证买单者是否属于该团)
 * 2. 给被买单者记账(一般包含买单者)，并群发消费信息(不给买单者发)
 */
exports.Bill = function(user, tuan, account, members, othersnum, price) {
    if (members && members.length > 0 && othersnum >= 0 && price >= 0) {
        var avg = Math.ceil(price * 100 / (members.length + othersnum)) / 100;

        // 嵌套查询
        var userQuery = new AV.Query(AV.User);
        userQuery.containedIn("objectId", members);
        var query = new AV.Query(exports.Account);
        query.equalTo('tuan', tuan);
        query.notEqualTo('state', -1);
        query.include('user');
        query.matchesQuery('user', userQuery);
        return query.find().then(function(results) {
            // 给团成员记账
            var promises = [];
            for (var i = 0; i < results.length; i++) {
                results[i].increment('money', -avg);
                if (results[i].get('user').id != user.id) {
                    // 给其他成员发送模板消息
                    sendTempBill(user, results[i].get('user'), tuan, price, members.length + othersnum, avg, results[i].get('money'));
                }
                promises.push(results[i].save());
            }
            // 给买单者记账
            account.increment('money', avg * members.length);
            promises.push(account.save());
            // 给买单者记总账
            user.increment('money', avg * members.length);
            promises.push(user.save());
            // 给该团记总账
            tuan.increment('money', avg * members.length);
            promises.push(tuan.save());
            return AV.Promise.when(promises);
        }).then(function() {
            // 生成消费记录
            var tuanHistory = new exports.TuanHistory();
            tuanHistory.set('creater', user);
            tuanHistory.set('tuan', tuan);
            tuanHistory.set('type', HISTORY_TYPE.BILL);
            tuanHistory.set('data', {
                'username': user.get('nickname'),
                'tuanname': tuan.get('name'),
                'othersnum': othersnum,
                'money': price,
                'members': members
            });
            return tuanHistory.save();
        });
    } else {
        return AV.Promise.error('Invalid Parameters');
    }
};

exports.RevertHistory = function(user, tuan, historyId) {
    var query = new AV.Query(exports.TuanHistory);
    query.equalTo('tuan', tuan);
    query.equalTo('type', HISTORY_TYPE.BILL);
    query.descending("createdAt");
    query.limit(1);
    return query.first().then(function(history) {
        if (history && history.id == historyId && history.get('type') == HISTORY_TYPE.BILL) {
            // 只能修改最近一次消费的记录
            var data = history.get('data');
            var othersnum = data.othersnum;
            var price = data.money;
            var members = data.members;

            var avg = Math.ceil(price * 100 / (members.length + othersnum)) / 100;

            // 嵌套查询
            var userQuery = new AV.Query(AV.User);
            userQuery.containedIn("objectId", members);
            var query = new AV.Query(exports.Account);
            query.equalTo('tuan', tuan);
            // 撤销时候依旧返还已经离开团的成员，所以不约束state!=-1
            query.include('user');
            query.matchesQuery('user', userQuery);
            return query.find().then(function(results) {
                // 撤销团员扣款
                var promises = [];
                for (var i = 0; i < results.length; i++) {
                    results[i].increment('money', avg);
                    if (results[i].get('user').id != user.id) {
                        // 给其他成员发送模板消息
                        //sendTempBill(user, results[i].get('user'), tuan, price, members.length + othersnum, avg, results[i].get('money'));
                    }
                    promises.push(results[i].save());
                }
                // 撤销买单者账单(注意这里的买单者不是user，而是history里的creater)
                var accountQuery = new AV.Query(exports.Account);
                accountQuery.equalTo('tuan', tuan);
                accountQuery.equalTo('user', history.get('creater'));
                // 撤销时候买单者可能已经离开该团，所以不约束state!=-1
                return accountQuery.first().then(function(account) {
                    if (account) {
                        account.increment('money', -avg * members.length);
                        promises.push(account.save());
                        return AV.Promise.when(promises);
                    } else {
                        return AV.Promise.error('Can\'t find payer');
                    }
                });
            }).then(function() {
                // 修改消费记录
                history.set('type', HISTORY_TYPE.REVERT_BILL);
                return history.save();
            });
        } else {
            console.log('history: %j', history);
            return AV.Promise.error('Invalid Parameters');
        }
    });
};

exports.GetTuanHistory = function(user, tuan, start, length) {
    var tuanHistory = [];
    var query = new AV.Query(exports.TuanHistory);
    query.equalTo('tuan', tuan);
    query.descending("createdAt");
    query.skip(start);
    query.limit(length);
    return query.find().then(function(results) {
        var found = false;
        for (var i = 0; i < results.length; i++) {
            if (!found && results[i].get('type') == HISTORY_TYPE.BILL) {
                tuanHistory.push(formatTuanHistory(user, results[i], true));
                found = true;
            } else {
                tuanHistory.push(formatTuanHistory(user, results[i], false));
            }
        }
        return AV.Promise.as(tuanHistory);
    });
};

function formatTuanHistory(user, history, enableRevert) {
    var type = history.get('type');
    var data = history.get('data');
    var ret = {
        'id': history.id,
        'type': type,
        'enableRevert': enableRevert,
        'data': data,
        'date': history.createdAt.toISOString().replace(/T.+/, '')
    };
    if (type == HISTORY_TYPE.BILL || type == HISTORY_TYPE.REVERT_BILL) {
        // 消费历史
        var included = false;
        var members = data.members;
        for (var i = 0; i < members.length; i++) {
            if (members[i] == user.id) {
                // 用户参了与本次消费
                included = true;
                break;
            }
        }
        ret.included = included;
    }
    return ret;
}

function formatFloat(float) {
    return float.toFixed(2);
}

// size = {0, 46, 64, 96, 132}
function formatHeadImgUrl(user, size) {
    var headimgurl = user.get('headimgurl');
    if (headimgurl) {
        var idx = headimgurl.lastIndexOf('/');
        if (idx == -1 || headimgurl.length - idx > 4) {
            // 非法
            return headimgurl;
        } else {
            return headimgurl.substring(0, idx+1) + size;
        }
    } else {
        return headimgurl;
    }
}

function sendTempBill(fromUser, toUser, tuan, money, number, avg, remain) {
    var data = {
        fromName: {
            "value": fromUser.get('nickname'),
            "color": "#173177"
        },
        toName: {
            "value": toUser.get('nickname'),
            "color": "#173177"
        },
        tuanName: {
            "value": tuan.get('name'),
            "color": "#173177"
        },
        money: {
            "value": formatFloat(money),
            "color": "#173177"
        },
        number: {
            "value": number,
            "color": "#173177"
        },
        avg: {
            "value": formatFloat(avg),
            "color": "#173177"
        },
        remain: {
            "value": formatFloat(remain),
            "color": "#173177"
        },
        message: {
            "value": remain > 10 ? '，可以坐等大家请吃饭咯' : '，快去请大家吃饭吧',
            "color": "#000000"
        }
    };
    var username = toUser.get('username');
    var openid = username.length < 10 ? 'oUgQgt29VhAPB59qvib78KMFZw1I' : username;
    var topcolor = '#FF0000'; // 顶部颜色
    API.sendTemplate(openid, TEMPID_BILL, null, topcolor, data, function(err, data, res) {
        if (err) {
            console.log('SendTemplate Error %j', err);
        } else {
            console.log('SendTemplate Success: %j, %j', data, res);
        }
    });
}

function sendTemplate(tempId, fromUser, toUser, tuan) {
    var data = {
        fromName: {
            "value": fromUser.get('nickname'),
            "color": "#173177"
        },
        toName: {
            "value": toUser.get('nickname'),
            "color": "#173177"
        },
        tuanName: {
            "value": tuan.get('name'),
            "color": "#173177"
        }
    };
    var username = toUser.get('username');
    var openid = username.length < 10 ? 'oUgQgt29VhAPB59qvib78KMFZw1I' : username;
    var topcolor = '#FF0000'; // 顶部颜色
    API.sendTemplate(openid, tempId, null, topcolor, data, function(err, data, res) {
        if (err) {
            console.log('SendTemplate Error %j', err);
        } else {
            console.log('SendTemplate Success: %j, %j', data, res);
        }
    });
}