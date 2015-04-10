/**
 * Created by Meng on 2015/2/2.
 */
var WechatAPI = require('wechat-api');
var WechatOAuth = require('wechat-oauth');

exports.TOKEN = 'EatTogether';
var APPID, APPSECRET, API, OAUTH, TEMPID_BILL, TEMPID_JOIN,
    TEMPID_QUIT, TEMPID_ABUP, TEMPID_MODAB, USER_STATE, ACCESS_TOKEN_ID;

var QRCODE_EXP = 1800;

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
    'BILL': 10,             // 消费记录。date, username 请大家(members.length+othersnum 人)消费了 money
    'REVERT_BILL': 11,      // 已经撤销的消费记录。date, xxx 请大家消费了 xxx (已撤销)
    'ABUP_BILL': 12,        // 正在进行的ABUp消费。date, username 发起了一次(members.length 人)筹款消费
    'FINISH_ABUP': 13,      // 结束的ABUp消费。date, username 发起的筹款消费已结束
    'REVERT_ABUP': 14,      // 撤销的ABUp消费。date, username 发起了筹款消费 (已撤销)
    'ABDOWN_BILL': 16,      // 正在进行的ABDown消费
    'FINISH_ABDOWN': 17,    // 结束的ABDown消费
    'REVERT_ABDOWN': 18     // 撤销的ABDown消费
};

exports.Config = AV.Object.extend("Config");

if (__local) {
    // 当前环境为「开发环境」，是由命令行工具启动的
    console.log('「开发环境」');

    setTest();

    exports.SERVER = 'http://127.0.0.1:3000/';
} else if(__production) {
    // 当前环境为「生产环境」，是线上正式运行的环境
    console.log('「生产环境」');

    setOnline();

    exports.SERVER = 'http://eat.avosapps.com/';
} else {
    // 当前环境为「测试环境」，云代码方法通过 HTTP 头部 X-AVOSCloud-Application-Production:0 来访问；webHosting 通过 dev.xxx.avosapps.com 域名来访问
    console.log('「测试环境」');

    setTest();

    exports.SERVER = 'http://dev.eat.avosapps.com/';
}

var MENU_DEV = {
    "button":[
        {
            "type":"view",
            "name":"我的饭团",
            "url": OAUTH.getAuthorizeURL('http://dev.eat.avosapps.com/' + 'myet', '0', 'snsapi_userinfo')
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
                    "name":"快速进团",
                    "url": OAUTH.getAuthorizeURL('http://dev.eat.avosapps.com/' + 'myet', '0', 'snsapi_userinfo')
                }
            ]
        }]
};

function setOnline() {
    APPID = 'wx215f75c4627af14a';
    APPSECRET = 'c4dfb380644d4fb5266468da939935d5';

    ACCESS_TOKEN_ID = '55275526e4b00e097d5ec2de';

    TEMPID_BILL = 'yqYazavKFfpXfbSOLkObhsA5u3hMRukHm41Diy3YL8o';
    TEMPID_JOIN = '6ADofGKCi-z1R1iE_Q0fkPxLEXmYFdh4Q-pMFfdChbc';
    TEMPID_QUIT = '32wmlUVHgjnaWJU0K1Rucc4_STGmw8gnGwJo6fUZ1iQ';
    TEMPID_ABUP = '0f28QRi1lt9X7NS0pw5-6pe-ZBWi3_q0osuBLjffYwM';
    TEMPID_MODAB = 'khgx9Oh_d_r6QnskoI7jWBtTF61KJHJ4LmuHaoHxLXg';

    USER_STATE = 1;

    API = newWechatAPI(APPID, APPSECRET, ACCESS_TOKEN_ID);
    OAUTH = new WechatOAuth(APPID, APPSECRET);

    exports.Tuan = AV.Object.extend("Tuan");
    exports.TuanHistory = AV.Object.extend("TuanHistory");
    exports.Account = AV.Object.extend("Account");
}

function setTest() {
    APPID = 'wxdb12e53d561de28e';
    APPSECRET = '2d36952cf863088f293d57f0d99449eb';

    ACCESS_TOKEN_ID = '552764f4e4b0b40da3507573';

    TEMPID_BILL = 'g02ufxkZ4S3BhaSIMPCbWWyw_PypuYqcWqgLtAEI5MY';
    TEMPID_JOIN = 'G5nuBGoANZi9WZgR6tR7zM0WuRdDSv_epAVrQDT9zqY';
    TEMPID_QUIT = 's73IbvdYJ0pqx2-466UbxWBqFoE6b2DoUl1FE1SPtuE';
    TEMPID_ABUP = 'ew85SpSTqeFex47QTrX4jOnYZA_tI5GtJwvPoQZldyA';
    TEMPID_MODAB = 'T5kKx_gE4Y4xfk2WSdYhsMSa2OxeVpHsGcEYJbMuvCY';

    USER_STATE = 2;

    API = newWechatAPI(APPID, APPSECRET, ACCESS_TOKEN_ID);

    OAUTH = new WechatOAuth(APPID, APPSECRET);

    exports.Tuan = AV.Object.extend("DEVTuan");
    exports.TuanHistory = AV.Object.extend("DEVTuanHistory");
    exports.Account = AV.Object.extend("DEVAccount");
}

function newWechatAPI(appid, appsecret, acess_token_id) {
    return new WechatAPI(appid, appsecret, function (callback) {
        // 传入一个获取全局token的方法
        var query = new AV.Query(exports.Config);
        query.get(acess_token_id).then(function (config) {
            if (config) {
                console.log("Get: %j", config.get('value'));
                callback(null, config.get('value'));
            } else {
                callback('Get Access Token Config Error');
            }
        });
    }, function (token, callback) {
        // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
        // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
        var query = new AV.Query(exports.Config);
        query.get(acess_token_id).then(function (config) {
            if (config) {
                console.log("Save: %j", token);
                config.set('value', token);
                config.save();
                callback(null);
            } else {
                callback('Get Access Token Config Error');
            }
        });
    });
}


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

exports.Init = function() {
    console.log("Init");
    //API.createMenu(MENU_DEV, function (err, res) {
    //    console.log("createMenu" + JSON.stringify(res));
    //});
    //addConfig('TuanNameList', {'TuanNameList':['创业','前端','后端','运营','全栈','编辑','西游记','八戒','悟空','沙僧','唐僧']});
};

exports.getJsConfig = wrapper(function(url) {
    var promise = new AV.Promise();
    var param = {
        debug: false,
        jsApiList: JSAPILIST,
        url: url
    };
    API.getJsConfig(param, function(err, result) {
        if (err) {
            promise.reject('getJsConfig Error');
        } else {
            //console.log('getJsConfig Success: %j', result);
            promise.resolve(result);
        }
    });
    return promise;
}, 'getJsConfig');

exports.getUserInfo = wrapper(function(code) {
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
}, 'getUserInfo');

exports.getTuanObj = wrapper(function(tuanid) {
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
}, 'getTuanObj');

exports.getUserTuanObj = wrapper(function(requser, tuanid) {
    var promise = new AV.Promise();
    if (requser) {
        requser.fetch().then(function (user) {
            exports.getTuanObj(tuanid).then(function (tuan) {
                var query = new AV.Query(exports.Account);
                query.equalTo('user', user);
                query.equalTo('tuan', tuan);
                query.find().then(function (accounts) {
                    if (accounts.length == 0) {
                        promise.resolve({
                            'user': user, 'tuan': tuan,
                            'isin': false
                        });
                    } else if (accounts.length == 1) {
                        promise.resolve({
                            'user': user, 'tuan': tuan,
                            'account': accounts[0],
                            'isin': (accounts[0].get('state') != -1)
                        });
                    } else {
                        promise.reject('Account Results Error');
                    }
                });
            })
        });
    } else {
        promise.reject('Please ReLogin');
    }
    return promise;
}, 'getUserTuanObj');

// 订阅公众号
exports.Subscribe = wrapper(function(openid) {
    return Signup(openid, 'pwd:'+openid, USER_STATE).then(function(user) {
        console.log("注册成功: %j", user);
        return AV.Promise.as(user);
    }, function(error) {
        if (error.code == 202) {
            console.log("用户已存在: %s", openid);
            var query = new AV.Query(AV.User);
            query.equalTo('username', openid);
            return query.first().then(function(user) {
                enableUser(user);
                return AV.Promise.as(user);
            });
        } else {
            // 非正常状态
            console.log("注册失败: " + JSON.stringify(error));
            return AV.Promise.error(error);
        }
    });
}, 'Subscribe');

// 取消订阅
exports.UnSubscribe = wrapper(function(openid) {
    var query = new AV.Query(AV.User);
    query.equalTo('username', openid);
    return query.first().then(function(user) {
        return disableUser(user);
    });
}, 'UnSubscribe');

function Signup(username, password, flag) {
    if (username === undefined || password === undefined) {
        var error = new AV.Error(
            AV.Error.OTHER_CAUSE,
            "无效参数");
        return AV.Promise.error(error);
    }

    var user = new AV.User();
    user.set('username', username);
    user.set('nickname', '__null__');
    user.set('wxname', username.substring(username.length-4));
    user.set('password', password);
    user.set('state', flag);
    user.set('money', 0);
    user.set('sex', -1);

    return user.signUp();
}

exports.Login = wrapper(function(username, password, userinfo) {
    var promise = new AV.Promise();
    AV.User.logIn(username, password, {
        success: function(user) {
            // 登录成功，avosExpressCookieSession会自动将登录用户信息存储到cookie
            console.log('登录成功: %j', user);
            if (userinfo) {
                var tuanid = user.get('sex');
                // 修改用户信息
                userinfo.location = {
                    'country': userinfo.country,
                    'province': userinfo.province,
                    'city': userinfo.city
                };
                // 如果没有sex，需要赋值为0来重写sex，防止用户一直加团
                if (!userinfo.sex) userinfo.sex = 0;
                modifyUserInfo(user, userinfo);
                // 加入用户准备加入的团
                if (tuanid >= 10) {
                    exports.getTuanObj(tuanid).then(function(tuan) {
                        return exports.JoinTuan(user, tuan, null);
                    }).then(function() {
                        // 成功加入以后才能返回
                        promise.resolve(user);
                    }, function(error) {
                        promise.resolve(error);
                    });
                } else {
                    promise.resolve(user);
                }
            } else {
                promise.resolve(user);
            }
        },
        error: function(user, error) {
            // 登录失败，非正常状态
            console.log("登录失败: " + JSON.stringify(error));
            promise.reject(user);
        }
    });
    return promise;
}, 'Login');

/** 获取用户对应的团信息以及用户信息 */
exports.GetTuanList = wrapper(function(user) {
    var promise = new AV.Promise();
    var ret = {};
    ret.user = formatUser(user);
    var query = new AV.Query(exports.Account);
    query.equalTo('user', user);
    query.notEqualTo('state', -1);
    query.descending("updatedAt");
    query.include('tuan');
    query.find().then(function(results) {
        var tuans = [];
        for (var i = 0; i < results.length; i++) {
            var tuan = formatTuan(results[i].get('tuan'), results[i].get('news'));
            tuans.push(tuan);
        }
        ret.tuans = tuans;
        promise.resolve(ret);
    });
    return promise;
}, 'GetTuanList');

exports.CreateTuan = wrapper(function(user) {
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
        // 需要重新query以获得tuanid(TODO: 使用fetchWhenSave)
        var query = new AV.Query(exports.Tuan);
        return query.get(tuan.id);
    });
}, 'CreateTuan');

// 创建一条Account或激活原来的Account
exports.JoinTuan = wrapper(function(user, tuan, account) {
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
            account.set('news', 0);
        }
        if (record) {
            // 给所有团员发消息
            for (var i = 0; i < results.length; i++) {
                // 给其他成员发送模板消息和抖动消息
                sendTemplate(TEMPID_JOIN, user, results[i].get('user'), tuan);
                results[i].increment('news');
                results[i].save();
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
}, 'JoinTuan');

// 关闭一条Account
exports.DisableAccount = wrapper(function(user, tuan, account) {
    var query = new AV.Query(exports.Account);
    query.equalTo('tuan', tuan);
    query.notEqualTo('state', -1);
    query.include('user');
    return query.find().then(function(results) {
        var ret = {};
        ret.code = -1;
        if (results.length == 1 && results[0].get('user').id == user.id) {
            ret.code = 0;
            ret.message = '您是最后一个退出该团的人，团信息将被全部清理';
            deleteTuan(tuan);
            return AV.Promise.as(ret);
        } else {
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
                        // 给其他成员发送模板消息和抖动消息
                        sendTemplate(TEMPID_QUIT, user, results[i].get('user'), tuan);
                        results[i].increment('news');
                        results[i].save();
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
        }
    });
}, 'DisableAccount');

exports.ModifyTuan = wrapper(function(user, tuan, infoJson) {
    var modified = false;
    if (infoJson && infoJson.name) {
        if (infoJson.name.length > 10) {
            infoJson.name = infoJson.name.substring(10);
        }
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
        modified = true;
    }
    if (infoJson && infoJson.slogan) {
        if (infoJson.slogan.length > 100) {
            infoJson.slogan = infoJson.slogan.substring(100);
        }
        tuan.set('slogan', infoJson.slogan);
        modified = true;
    }
    if (modified) {
        //TODO: 生成消息抖动 tuan.increment('news');
        return tuan.save();
    } else {
        return AV.Promise.as(tuan);
    }
}, 'ModifyTuan');

exports.FormatTuanDetail = wrapper(function (tuanobj) {
    var tuan = {};
    tuan.id = tuanobj.get('tuanid');
    tuan.name = tuanobj.get('name');
    tuan.news = tuanobj.get('news');
    tuan.slogan = tuanobj.get('slogan');
    tuan.money = formatFloat(tuanobj.get('money'));

    var query = new AV.Query(exports.Account);
    query.equalTo('tuan', tuanobj);
    query.notEqualTo('state', -1);
    query.include('user');
    return AV.Promise.when(query.find(), getQRCode(tuanobj)).then(function(results, qrcode) {
        var members = [];
        results.sort(function(a, b) {
            return a.get('money') - b.get('money');
        });
        for (var i = 0; i < results.length; i++) {
            var user = results[i].get('user');
            members.push({
                'uid': user.id,
                'name': user.get('nickname'),
                'sex': user.get('sex'),
                'headimgurl': formatHeadImgUrl(user, 132),
                'money': formatFloat(results[i].get('money')),
                'history': results[i].get('history'),
                'subscribed': user.get('state') > 0
            });
        }
        tuan.members = members;
        tuan.qrcode = qrcode.url;
        return AV.Promise.as(tuan);
    });
}, 'FormatTuanDetail');

exports.FormatHistoryDetail = wrapper(function (historyId) {
    var query = new AV.Query(exports.TuanHistory);
    return query.get(historyId).then(function(history) {
        var ret = {
            'id': history.id,
            'type': history.get('type'),
            'date': history.createdAt.toISOString().replace(/T.+/, '')
        };
        switch (history.get('type')) {
            case HISTORY_TYPE.BILL:
            case HISTORY_TYPE.REVERT_BILL:
                return formatAAHistory(history, ret);
            case HISTORY_TYPE.ABUP_BILL:
            case HISTORY_TYPE.FINISH_ABUP:
            case HISTORY_TYPE.REVERT_ABUP:
                return formatABUpHistory(history, ret);
            default :
                return AV.Promise.error('Unknown Type');
        }
    });
}, 'FormatHistoryDetail');

// 验证访问用户是否为history创建者
exports.VerifyCreater = wrapper(function (requser, historyId) {
    var query = new AV.Query(exports.TuanHistory);
    return query.get(historyId).then(function(history) {
        if (history.get('creater').id == requser.id) {
            return AV.Promise.as(history);
        } else {
            return AV.Promise.as(null);
        }
    });
}, 'VerifyCreater');

/** AA 买单
 * 1. 给买单者记账(验证买单者是否属于该团)
 * 2. 给被买单者记账(一般包含买单者)，并群发消费信息(不给买单者发)
 */
exports.Bill = wrapper(function(user, tuan, account, members, othersnum, price) {
    if (members && members.length > 0 && othersnum >= 0 && othersnum < 100 && price >= 0 && price < 5000) {
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
            // 给买单者记账
            recordAccount(account, avg * members.length, true);
            // 给团成员记账(注意团成员中包含买单者的情况)
            var promises = [];
            for (var i = 0; i < results.length; i++) {
                if (results[i].get('user').id == user.id) {
                    recordAccount(account, -avg, true);
                } else {
                    recordAccount(results[i], -avg, true);
                }
                // 发送模板消息和抖动消息
                sendTempBill(user, results[i].get('user'), tuan, price, members.length + othersnum, avg, results[i].get('money'));
                results[i].increment('news');
                promises.push(results[i].save());
            }
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
}, 'Bill');

/** ABUp 买单 */
exports.ABUpBill = wrapper(function(user, tuan, account, members, prices, money) {
    if (members && prices && members.length > 0 && members.length == prices.length) {
        // 一个团中只允许有一个正在进行的ABUpBill
        var historyQuery = new AV.Query(exports.TuanHistory);
        historyQuery.equalTo('tuan', tuan);
        historyQuery.equalTo('type', HISTORY_TYPE.ABUP_BILL);
        return historyQuery.find().then(function(results) {
            var ret = {};
            ret.code = -1;
            if (results.length == 0) {
                // 嵌套查询
                var userQuery = new AV.Query(AV.User);
                userQuery.containedIn("objectId", members);
                var query = new AV.Query(exports.Account);
                query.equalTo('tuan', tuan);
                query.notEqualTo('state', -1);
                query.include('user');
                query.matchesQuery('user', userQuery);
                return query.find().then(function(results) {
                    var sum = 0;
                    var usermap = {};
                    for (i = 0; i < members.length; i++) {
                        prices[i] = Number(prices[i].toFixed(2));
                        usermap[members[i]] = prices[i];
                        sum += prices[i];
                    }
                    // 生成消费记录
                    var tuanHistory = new exports.TuanHistory();
                    tuanHistory.fetchWhenSave(true);
                    tuanHistory.set('creater', user);
                    tuanHistory.set('tuan', tuan);
                    tuanHistory.set('type', HISTORY_TYPE.ABUP_BILL);
                    tuanHistory.set('data', {
                        'username': user.get('nickname'),
                        'tuanname': tuan.get('name'),
                        'money': money,
                        // 成员列表及其付款列表
                        'members': members,
                        'prices': prices
                    });
                    // 给参与者发交款通知
                    var promises = [];
                    var needFinish = true;
                    for (var i = 0; i < results.length; i++) {
                        var toUser = results[i].get('user');
                        if (usermap[toUser.id] <= 0) {
                            // 需要发筹款信息
                            sendTempABUp(user, toUser, tuan, members.length);
                            results[i].set('abbill', tuanHistory);
                            needFinish = false;
                        } else {
                            // 记账并发消费提醒(注意团成员中包含买单者的情况)
                            if (results[i].get('user').id == user.id) {
                                sum -= usermap[toUser.id];
                            } else {
                                recordAccount(results[i], -usermap[toUser.id], true);
                            }
                            sendTempModABUp(user, toUser, tuan, usermap[toUser.id]);
                        }
                        results[i].increment('news');
                        promises.push(results[i].save());
                    }
                    // 给买单者记账
                    recordAccount(account, sum, true);
                    promises.push(account.save());
                    // 给买单者记总账
                    user.increment('money', sum);
                    promises.push(user.save());
                    // 给该团记总账
                    tuan.increment('money', sum);
                    promises.push(tuan.save());
                    if (needFinish) {
                        ret.message = '所有成员均已付款，本次筹款自动结束';
                        tuanHistory.set('type', HISTORY_TYPE.FINISH_ABUP);
                    } else {
                        ret.message = '已成功向团员发送筹款通知，请及时关注筹款进度';
                    }
                    promises.push(tuanHistory.save());
                    return AV.Promise.when(promises).then(function() {
                        ret.code = 0;
                        ret.historyId = tuanHistory.id;
                        return AV.Promise.as(ret);
                    });
                });
            } else if (results.length == 1) {
                ret.message = '该团还有尚未完成的筹款消费';
                return AV.Promise.as(ret);
            } else {
                return AV.Promise.error('TuanHistory Results Error');
            }
        });
    } else {
        return AV.Promise.error('Invalid Parameters');
    }
}, 'ABUpBill');

/** 修改 ABUp Bill 的成员金额 */
exports.ModifyABUpBill = wrapper(function(user, tuan, account, history, userid, newmoney, oldmoney) {
    var modified = new AV.User();
    modified.id = userid;
    var query = new AV.Query(exports.Account);
    query.equalTo('user', modified);
    query.equalTo('tuan', tuan);
    query.include('user');
    return query.find().then(function(accounts) {
        if (accounts.length == 1) {
            return modifyABUpBill(user, account, accounts[0].get('user'), accounts[0],
                tuan, history, newmoney-oldmoney, Math.abs(oldmoney) < 0.001);
        } else {
            return AV.Promise.error('Account Results Error');
        }
    });
}, 'ModifyABUpBill');

// 如果是提前完成，则需要清除所有人的abbill状态
exports.FinishABup = wrapper(function (history) {
    history.set('type', HISTORY_TYPE.FINISH_ABUP);
    // 清除所有人的abbill状态
    var userlist = [];
    var data = history.get('data');
    for (var i = 0; i < data.members.length; i++) {
        if (data.prices[i] == 0) {
            userlist.push(data.members[i]);
        }
    }
    if (userlist.length > 0) {
        // 嵌套查询
        var userQuery = new AV.Query(AV.User);
        userQuery.containedIn("objectId", userlist);
        var query = new AV.Query(exports.Account);
        query.equalTo('tuan', history.get('tuan'));
        // 不约束state!=-1
        query.matchesQuery('user', userQuery);
        query.find().then(function(accounts) {
            for (var i = 0; i < accounts.length; i++) {
                accounts[i].set('abbill', null);
                accounts[i].save();
            }
        });
    }
    return history.save();
}, 'FinishABup');

exports.RevertHistory = wrapper(function(user, tuan, historyId) {
    var query = new AV.Query(exports.TuanHistory);
    query.equalTo('tuan', tuan);
    query.containedIn('type', [HISTORY_TYPE.BILL, HISTORY_TYPE.ABUP_BILL, HISTORY_TYPE.FINISH_ABUP]);
    query.descending("createdAt");
    query.limit(1);
    return query.first().then(function(history) {
        // 只能修改最近一次消费的记录
        if (history && history.id == historyId) {
            var data, usermap, i;
            if (history.get('type') == HISTORY_TYPE.BILL) {
                // 撤销 AA Bill
                data = history.get('data');
                var avg = Math.ceil(data.money * 100 / (data.members.length + data.othersnum)) / 100;
                usermap = {};
                for (i = 0; i < data.members.length; i++) {
                    usermap[data.members[i]] = avg;
                }
                return revert(history.get('creater'), tuan, usermap).then(function() {
                    // 修改消费记录类型
                    history.set('type', HISTORY_TYPE.REVERT_BILL);
                    return history.save();
                });
            } else if (history.get('type') == HISTORY_TYPE.ABUP_BILL || history.get('type') == HISTORY_TYPE.FINISH_ABUP) {
                // 撤销 ABUp
                data = history.get('data');
                usermap = {};
                for (i = 0; i < data.members.length; i++) {
                    usermap[data.members[i]] = data.prices[i];
                }
                return revert(history.get('creater'), tuan, usermap).then(function() {
                    // 修改消费记录类型
                    history.set('type', HISTORY_TYPE.REVERT_ABUP);
                    return history.save();
                });
            }
        } else {
            console.log('history: %j', history);
            return AV.Promise.error('Invalid Parameters');
        }
    });
}, 'RevertHistory');

// 撤销消费记录(注意这里的user是history里的creater)
function revert(user, tuan, usermap) {
    // 嵌套查询
    var userQuery = new AV.Query(AV.User);
    userQuery.containedIn("objectId", Object.keys(usermap));
    var query = new AV.Query(exports.Account);
    query.equalTo('tuan', tuan);
    // 撤销时候依旧返还已经离开团的成员，所以不约束state!=-1
    query.include('user');
    query.matchesQuery('user', userQuery);
    return query.find().then(function (results) {
        // 撤销团员扣款
        var sum = 0;
        var promises = [];
        for (var i = 0; i < results.length; i++) {
            var uid = results[i].get('user').id;
            results[i].increment('money', usermap[uid]);
            sum += usermap[uid];
            if (uid != user.id) {
                // 给其他成员发送模板消息
                //sendTempBill(user, results[i].get('user'), tuan, price, members.length + othersnum, avg, results[i].get('money'));
            }
            promises.push(results[i].save());
        }
        // 撤销买单者账单(注意这里的买单者是history里的creater)
        var accountQuery = new AV.Query(exports.Account);
        accountQuery.equalTo('tuan', tuan);
        accountQuery.equalTo('user', user);
        // 撤销时候买单者可能已经离开该团，所以不约束state!=-1
        return accountQuery.first().then(function (account) {
            if (account) {
                account.increment('money', -sum);
                promises.push(account.save());
                return AV.Promise.when(promises);
            } else {
                return AV.Promise.error('Can\'t find payer');
            }
        });
    });
}

exports.GetTuanHistory = wrapper(function(user, tuan, start, length) {
    var tuanHistory = [];
    var query = new AV.Query(exports.TuanHistory);
    query.equalTo('tuan', tuan);
    query.descending("createdAt");
    query.skip(start);
    query.limit(length);
    query.include('creater');
    return query.find().then(function(results) {
        var found = false;
        for (var i = 0; i < results.length; i++) {
            if (!found && isRevertable(results[i].get('type'))) {
                tuanHistory.push(formatTuanHistory(user, results[i], true));
                found = true;
            } else {
                tuanHistory.push(formatTuanHistory(user, results[i], false));
            }
        }
        return AV.Promise.as(tuanHistory);
    });
}, 'GetTuanHistory');

// 获取用户正在进行ABUp Bill的Accounts
exports.GetABUpAccounts = wrapper(function(username) {
    // 嵌套查询
    var userQuery = new AV.Query(AV.User);
    userQuery.equalTo("username", username);
    var query = new AV.Query(exports.Account);
    query.notEqualTo('state', -1);
    query.descending("createdAt");
    query.matchesQuery('user', userQuery);
    return query.find().then(function(results) {
        var accounts = [];
        for (var i = 0; i < results.length; i++) {
            if (results[i].get('abbill')) {
                accounts.push(results[i]);
            }
        }
        return AV.Promise.as(accounts);
    });
}, 'GetABUpAccounts');

// 清算用户正在进行的ABUp Bill
exports.ClearABUpBill = wrapper(function(account, money) {
    return AV.Promise.when(
        account.get('abbill').fetch(), account.get('user').fetch(), account.get('tuan').fetch()
    ).then(function (history, user, tuan) {
            var query = new AV.Query(exports.Account);
            query.equalTo('user', history.get('creater'));
            query.equalTo('tuan', tuan);
            query.include('user');
            return query.find().then(function(accounts) {
                if (accounts.length == 1) {
                    return modifyABUpBill(accounts[0].get('user'), accounts[0], user, account, tuan, history, money, true);
                } else {
                    return AV.Promise.error('Account Results Error');
                }
            });
        });

    return account.get('abbill').fetch().then(function(history) {
        var query = new AV.Query(exports.Account);
        var creater = history.get('creater');
        var user= account.get('user');
        var tuan = account.get('tuan');
        query.equalTo('user', creater);
        query.equalTo('tuan', tuan);
        query.include('user');
        query.include('tuan');
        return query.find().then(function(accounts) {
            if (accounts.length == 1) {
                return modifyABUpBill(creater, accounts[0], user, account, tuan, history, money, true);
            } else {
                return AV.Promise.error('Account Results Error');
            }
        });
    });
}, 'ClearABUpBill');

// createrAccount是买单人在该团的账户
// modifiedAccount是将被修改的交款人在该团的账户
// 给createrAccount加钱，给modifiedAccount扣款清状态，并修改history状态
// 给买单人记总账，给该团记总帐
function modifyABUpBill(creater, createrAccount, modified, modifiedAccount, tuan, history, diff, isnew) {
    // 如果是同一个用户则不做任何操作
    if (creater.id != modified.id) {
        recordAccount(modifiedAccount, -diff, isnew);
        recordAccount(createrAccount, diff, false);
    }
    modifiedAccount.set('abbill', null);
    var data = history.get('data');
    var sum = 0;
    var everyone = true;
    var money = 0;
    for (var i = 0; i < data.members.length; i++) {
        if (data.members[i] == modifiedAccount.get('user').id) {
            // 在历史中记录扣款人的付款
            data.prices[i] += diff;
            money = data.prices[i];
        }
        if (data.prices[i] == 0) {
            everyone = false;
        } else {
            sum += data.prices[i];
        }
    }
    // 如果已经收齐款(总价格达到或没有总价格但每个人都已交款)，则自动finish
    if (data.money) {
        if (sum >= data.money) {
            history.set('type', HISTORY_TYPE.FINISH_ABUP);
        }
    } else if (everyone) {
        history.set('type', HISTORY_TYPE.FINISH_ABUP);
    }
    // 给买单者记总账
    creater.increment('money', diff);
    createrAccount.set('user', creater);
    // 给该团记总账
    tuan.increment('money', diff);
    createrAccount.set('tuan', tuan);
    history.set('data', data);
    if (!isnew) {
        sendTempModABUp(creater, modified, tuan, money);
    }
    return AV.Promise.when(
        createrAccount.save(),
        modifiedAccount.save(),
        history.save());
}

// 记录一笔消费
function recordAccount(account, money, isnew) {
    var history = account.get('history'); // 个人近期消费历史，记录时间和金额
    if (isnew && (money >= 0 || !history)) {
        // 正向消费或尚未有历史记录(抹除之前记录，写入当前余额和本次消费金额)
        history = [];
        history.push({
            'money' : formatFloat(account.get('money'))
        });
        history.push({
            'money' : formatFloat(money),
            'time': new Date().getTime()
        });
    } else {
        if (isnew) {
            // 新的负向消费(加入一笔记录)
            history.push({
                'money' : formatFloat(money),
                'time': new Date().getTime()
            });
        } else {
            // 修改消费(修改最后一个消费记录)
            history[history.length-1].money = formatFloat(money + Number(history[history.length-1].money));
            history[history.length-1].time = new Date().getTime();
        }
    }

    account.set('history', history);
    account.increment('money', money);
}

// 删除团，该团成员的账户，所有团历史
function deleteTuan(tuan) {
    var accountQuery = new AV.Query(exports.Account);
    accountQuery.equalTo('tuan', tuan);
    accountQuery.destroyAll();
    var historyQuery = new AV.Query(exports.TuanHistory);
    historyQuery.equalTo('tuan', tuan);
    historyQuery.destroyAll();
    tuan.destroy();
}

// 带缓存的QRCode
function getQRCode(tuan) {
    var promise = new AV.Promise();
    var qrcode = tuan.get('qrcode');
    if (qrcode && qrcode.createdTime + QRCODE_EXP*1000/2 > new Date().getTime()) {
        // 缓存有效(留一半的余量)
        promise.resolve(qrcode);
    } else {
        // 更新缓存
        API.createTmpQRCode(tuan.get('tuanid'), QRCODE_EXP, function(err, result) {
            if (err) {
                promise.reject('getQRCode Error');
            } else {
                console.log('getQRCode Success: %j', result);
                qrcode = {
                    'url': API.showQRCodeURL(result.ticket),
                    'sharedUrl': result.url,
                    'createdTime': new Date().getTime()
                };
                tuan.set('qrcode', qrcode);
                tuan.save();
                promise.resolve(qrcode);
            }
        });
    }
    return promise;
}

function enableUser(user) {
    user.set('state', Math.abs(user.get('state')));
    return user.save();
}

function disableUser(user) {
    user.set('state', -Math.abs(user.get('state')));
    return user.save();
}

function modifyUserInfo(user, userinfo) {
    if (userinfo.state) user.set('state', userinfo.state);
    if (userinfo.nickname) {
        user.set('wxname', userinfo.nickname);
        if (user.get('nickname') == '__null__') {
            user.set('nickname', userinfo.nickname);
        }
    }
    if (userinfo.headimgurl) user.set('headimgurl', userinfo.headimgurl);
    if (userinfo.sex) user.set('sex', userinfo.sex);
    if (userinfo.location) user.set('location', userinfo.location);
    return user.save().then(function(user) {
        console.log('Modify User Success: ' + JSON.stringify(userinfo));
        return AV.Promise.as(user);
    }, function(error) {
        console.log('Modify User Failed: ' + JSON.stringify(error));
        return AV.Promise.error(error);
    });
}

function formatTuanHistory(user, history, revertable) {
    var creater = history.get('creater');
    var type = history.get('type');
    var data = history.get('data');
    var datestr = history.createdAt.toISOString();
    var ret = {
        'id': history.id,
        'type': type,
        'revertable': revertable,
        'creater': formatUser(creater),
        'data': data,
        'date': datestr.replace(/T.+/, ''),
        'time': datestr.substring(0, datestr.lastIndexOf(':')).replace(/.+T/, '')
    };
    if (isBill(type)) {
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

function formatUser(userobj) {
    var user = {};
    if (userobj) {
        user.id = userobj.id;
        user.nickname = userobj.get('nickname');
        user.location = userobj.get('location');
        user.sex = userobj.get('sex');
        user.money = formatFloat(userobj.get('money'));
        user.headimgurl = formatHeadImgUrl(userobj, 132);
    }
    return user;
}

function formatTuan(tuanobj, news) {
    var tuan = {};
    tuan.id = tuanobj.get('tuanid');
    tuan.name = tuanobj.get('name');
    tuan.members = tuanobj.get('members');
    tuan.news = news;
    return tuan;
}

function formatAAHistory(history, ret) {
    var data = history.get('data');
    ret.money = data.money;
    ret.othersnum = data.othersnum;

    var userQuery = new AV.Query(AV.User);
    userQuery.containedIn("objectId", data.members);
    return userQuery.find().then(function(users) {
        var members = [];
        for (var i = 0; i < users.length; i++) {
            members.push({
                'uid': users[i].id,
                'name': users[i].get('nickname'),
                'sex': users[i].get('sex'),
                'headimgurl': formatHeadImgUrl(users[i], 132)
            });
        }
        ret.members = members;
        return AV.Promise.as(ret);
    });
}

function formatABUpHistory(history, ret) {
    var data = history.get('data');
    ret.money = data.money;

    var sum = 0;
    var zeronum = 0;
    var usermap = {};
    for (var i = 0; i < data.members.length; i++) {
        usermap[data.members[i]] = data.prices[i];
        if (data.prices[i] == 0) zeronum++;
        else sum += data.prices[i];
    }
    if (data.money) {
        ret.percent = Math.min(sum/data.money, 1);
    } else {
        ret.percent = 1-zeronum/data.members.length;
    }
    ret.percent = formatFloat(ret.percent);
    ret.sum = sum;

    var userQuery = new AV.Query(AV.User);
    userQuery.containedIn("objectId", data.members);
    return userQuery.find().then(function(users) {
        var members = [];
        for (var i = 0; i < users.length; i++) {
            members.push({
                'uid': users[i].id,
                'name': users[i].get('nickname'),
                'sex': users[i].get('sex'),
                'headimgurl': formatHeadImgUrl(users[i], 132),
                'money': formatFloat(usermap[users[i].id])
            });
        }
        ret.members = members;
        return AV.Promise.as(ret);
    });
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

function isRevertable(type) {
    return type == HISTORY_TYPE.BILL || type == HISTORY_TYPE.ABUP_BILL || type == HISTORY_TYPE.FINISH_ABUP;
}

function isBill(type) {
    return type == HISTORY_TYPE.BILL || type == HISTORY_TYPE.REVERT_BILL ||
        type == HISTORY_TYPE.ABUP_BILL || type == HISTORY_TYPE.FINISH_ABUP || type == HISTORY_TYPE.REVERT_ABUP;
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
    var openid = toUser.get('username');
    var topcolor = '#FF0000'; // 顶部颜色
    API.sendTemplate(openid, TEMPID_BILL, null, topcolor, data, function(err, data, res) {
        if (err) {
            console.log('SendTemplate Error %j', err);
        } else {
            console.log('SendTemplate Success: %j, %j', data, res);
        }
    });
}

function sendTempABUp(fromUser, toUser, tuan, number) {
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
        number: {
            "value": number,
            "color": "#173177"
        }
    };
    var openid = toUser.get('username');
    var topcolor = '#FF0000'; // 顶部颜色
    API.sendTemplate(openid, TEMPID_ABUP, null, topcolor, data, function(err, data, res) {
        if (err) {
            console.log('SendTemplate Error %j', err);
        } else {
            console.log('SendTemplate Success: %j, %j', data, res);
        }
    });
}

function sendTempModABUp(fromUser, toUser, tuan, money) {
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
        }
    };
    var openid = toUser.get('username');
    var topcolor = '#FF0000'; // 顶部颜色
    API.sendTemplate(openid, TEMPID_MODAB, null, topcolor, data, function(err, data, res) {
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
    var openid = toUser.get('username');
    var topcolor = '#FF0000'; // 顶部颜色
    API.sendTemplate(openid, tempId, null, topcolor, data, function(err, data, res) {
        if (err) {
            console.log('SendTemplate Error %j', err);
        } else {
            console.log('SendTemplate Success: %j, %j', data, res);
        }
    });
}

function wrapper(callback, name) {
    return function() {
        console.time(name);
        return callback.apply(null, arguments).then(function(res) {
            console.timeEnd(name);
            return AV.Promise.as(res);
        });
    };
}