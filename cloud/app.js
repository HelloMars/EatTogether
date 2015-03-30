var express = require('express');
var xml2js = require('xml2js');
var weixin = require('cloud/weixin.js');
var exputils = require('express/node_modules/connect/lib/utils');
var avosExpressCookieSession = require('avos-express-cookie-session');
var utils = require('cloud/utils');

// 解析微信的 xml 数据
var xmlBodyParser = function (req, res, next) {
    if (req._body) return next();
    req.body = req.body || {};

    // ignore GET
    if ('GET' == req.method || 'HEAD' == req.method) return next();

    // check Content-Type
    if ('text/xml' != exputils.mime(req)) return next();

    // flag as parsed
    req._body = true;

    // parse
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ buf += chunk });
    req.on('end', function(){
        xml2js.parseString(buf, function(err, json) {
            if (err) {
                err.status = 400;
                next(err);
            } else {
                req.body = json;
                next();
            }
        });
    });
};

var app = express();
app.set('views', 'cloud/views');
app.set('view engine', 'ejs'); // 设置 template 引擎
app.engine('html', require('ejs').renderFile);
app.use(express.bodyParser()); // 读取请求 body 的中间件
app.use(xmlBodyParser);
// 启用 cookieParser
app.use(express.cookieParser('__eat_together__'));
// 使用 avos-express-cookie-session 记录登录信息到 cookie
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 }}));

utils.Init();

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
    res.render('hello', { message: 'Congrats, you just set up your app!' });
});

app.get('/myet', function(req, res) {
    var code = req.query.code;
    if (!code) {
        res.render('hello', { message: 'Error!' });
    } else if (code.indexOf('test_') == 0) {
        // 使用测试用户
        var openid = code.substring(5);
        utils.Subscribe(openid).then(function() {
            return utils.Login(openid, 'pwd:'+openid);
        }).then(function() {
            res.render('myet.html');
        }, function (error) {
            console.log('myet error: ' + JSON.stringify(error));
            res.render('hello', {message: JSON.stringify(error)})
        });
    } else {
        // 正常流程登陆用户
        utils.getUserInfo(code).then(function(result) {
            return utils.Login(result.openid, 'pwd:'+result.openid, result.userinfo);
        }).then(function () {
            res.render('myet.html');
        }, function (error) {
            console.log('myet error: ' + JSON.stringify(error));
            res.render('hello', {message: JSON.stringify(error)})
        });
    }
});

app.get('/tuanlist', function(req, res) {
    //console.log('cookies: ' + req.headers.cookie);
    console.log('user: %j', req.AV.user);
    req.AV.user.fetch().then(function(user){
        return utils.GetTuanList(user);
    }).then(function(ret) {
        res.jsonp(ret);
    }, function(error) {
        console.log('TuanList Error: ' + JSON.stringify(error));
        res.send('TuanList Error');
    });
});

app.get('/tuanhistory', function(req, res) {
    var start = Number(req.query.start);
    var length = Number(req.query.length);
    utils.getUserTuanObj(req.AV.user, req.query.id).then(function(result) {
        if (result.tuan && result.isin) {
            result.account.set('news', 0);
            result.account.save();
            return utils.GetTuanHistory(result.user, result.tuan, start, length);
        } else {
            return AV.Promise.error('Illegal');
        }
    }).then(function(history) {
        res.jsonp(history);
    }, function(error) {
        console.log('Tuan History Error: ' + JSON.stringify(error));
        res.send('Tuan History Error');
    });
});

// 建团并入团
app.get('/createtuan', function(req, res) {
    req.AV.user.fetch().then(function(user) {
        return utils.CreateTuan(user).then(function(tuan) {
            return utils.JoinTuan(user, tuan, null).then(function() {
                return utils.FormatTuanDetail(tuan);
            });
        });
    }).then(function(tuan) {
        res.jsonp(tuan);
    }, function (error) {
        console.log('CreatTuan Error: ' + JSON.stringify(error));
        res.send('CreatTuan Error');
    });
});

// 入团
app.get('/jointuan', function(req, res) {
    utils.getUserTuanObj(req.AV.user, req.query.id).then(function(result) {
        if (result.tuan && !result.isin) {
            return utils.JoinTuan(result.user, result.tuan, result.account).then(function() {
                return utils.FormatTuanDetail(result.tuan);
            });
        } else {
            return AV.Promise.error('Illegal');
        }
    }).then(function(tuan) {
        res.jsonp(tuan);
    }, function(error) {
        console.log('JoinTuan Error: ' + JSON.stringify(error));
        res.send('JoinTuan Error');
    });
});

// 退团
app.get('/quittuan', function(req, res) {
    utils.getUserTuanObj(req.AV.user, req.query.id).then(function(result) {
        if (result.tuan && result.isin && result.account) {
            return utils.DisableAccount(result.user, result.tuan, result.account);
        } else {
            return AV.Promise.error('Illegal');
        }
    }).then(function(ret) {
        res.jsonp(ret);
    }, function(error) {
        console.log('QuitTuan Error: ' + JSON.stringify(error));
        res.send('QuitTuan Error');
    });
});

app.get('/tuandetail', function(req, res) {
    utils.getUserTuanObj(req.AV.user, req.query.id).then(function(result) {
        if (result.tuan && result.isin) {
            return utils.FormatTuanDetail(result.tuan);
        } else {
            return AV.Promise.error('Illegal');
        }
    }).then(function(tuan) {
        res.jsonp(tuan);
    }, function(error) {
        console.log('TuanDetail Error: ' + JSON.stringify(error));
        res.send('TuanDetail Error');
    });
});

app.post('/modtuaninfo', function(req, res) {
    utils.getUserTuanObj(req.AV.user, req.body.id).then(function(result) {
        if (result.tuan && result.isin) {
            return utils.ModifyTuan(result.user, result.tuan, req.body.info);
        } else {
            return AV.Promise.error('Illegal');
        }
    }).then(function() {
        res.send('Modify Tuaninfo Success');
    }, function(error) {
        console.log('Modify Tuaninfo Error: ' + JSON.stringify(error));
        res.send('Modify Tuaninfo Error');
    });
});

app.get('/userhistory', function(req, res) {
    utils.getUserTuanObj(req.AV.user, req.query.id).then(function(result) {
        if (result.tuan && result.isin) {
            return result.account.get('history');
        } else {
            return AV.Promise.error('Illegal');
        }
    }).then(function(ret) {
        res.jsonp(ret);
    }, function(error) {
        console.log('UserHistory Error: ' + JSON.stringify(error));
        res.send('UserHistory Error');
    });
});

app.post('/setusername', function(req, res) {
    var nickname = req.body.nickname;
    if (nickname && nickname.length > 0 && nickname.length < 10) {
        req.AV.user.fetch().then(function (user) {
            user.set('nickname', req.body.nickname);
            return user.save();
        }).then(function() {
            res.send('Set User Name Success');
        }, function(error) {
            console.log('Set User Name Error: ' + JSON.stringify(error));
            res.send('Set User Name Error');
        });
    } else {
        res.send('Set User Name Error');
    }
});

/**
 * AABill 是通常意义的AA制付款模式
 */
app.post('/bill', function(req, res) {
    var othersnum = Number(req.body.othersnum);
    var price = Number(req.body.price);
    utils.getUserTuanObj(req.AV.user, req.body.id).then(function(result) {
        if (result.tuan && result.isin) {
            return utils.Bill(result.user, result.tuan, result.account, req.body.members, othersnum, price);
        } else {
            return AV.Promise.error('Illegal');
        }
    }).then(function() {
        res.send('Bill Success');
    }, function(error) {
        console.log('Bill Error: ' + JSON.stringify(error));
        res.send('Bill Error');
    });
});

/**
 * ABUp Bill 是一种自下而上的筹款模式
 * 收到消息的团员需要回复金额来确定本次扣款额度(重复回复则修改为最新回复的金额)
 * 买单者则可以在筹款界面看到筹款的进度，如果筹满则可以Finish该Bill(可以提前输入筹款目标或不输入)
 */
app.post('/abup', function(req, res) {
    // 给选定成员发消息
    // 生成一条ABUp Bill记录(是一条History记录，该记录还要维护整个ABUp Bill的进展情况)
    var price = Number(req.body.price);
    utils.getUserTuanObj(req.AV.user, req.body.id).then(function(result) {
        if (result.tuan && result.isin) {
            return utils.ABUpBill(result.user, result.tuan, result.account,
                req.body.members, req.body.prices, price);
        } else {
            return AV.Promise.error('Illegal');
        }
    }).then(function(ret) {
        res.jsonp(ret);
    }, function(error) {
        console.log('ABUp Bill Error: ' + JSON.stringify(error));
        res.send('ABUp Bill Error');
    });
});

app.post('/modabup', function(req, res) {
    // price 是修改的差值，即newprice-oldprice
    var diff = Number(Number(req.body.diff).toFixed(2));
    utils.VerifyCreater(req.AV.user, req.body.historyId).then(function(history) {
        var ret = {};
        if (history) {
            return utils.getUserTuanObj(req.AV.user, req.body.id).then(function(result) {
                if (result.tuan && result.isin) {
                    return utils.ModifyABUpBill(result.user, result.tuan, result.account,
                        history, req.body.userid, diff);
                } else {
                    return AV.Promise.error('Illegal');
                }
            }).then(function() {
                ret.code = 0;
                ret.message = '修改成功';
                return AV.Promise.as(ret);
            });
        } else {
            ret.code = -1;
            ret.message = '您不是创建者，无权修改';
            return AV.Promise.as(ret);
        }
    }).then(function(ret){
        res.jsonp(ret);
    }, function(error) {
        console.log('Modify ABUp Error: ' + JSON.stringify(error));
        res.send('Modify ABUp Error');
    });
});

app.post('/finishabup', function(req, res) {
    utils.VerifyCreater(req.AV.user, req.body.historyId).then(function(history) {
        var ret = {};
        if (history) {
            utils.FinishABup(history);
            ret.code = 0;
            ret.message = '关闭成功';
        } else {
            ret.code = -1;
            ret.message = '您不是创建者，无权关闭';
        }
        return AV.Promise.as(ret);
    }).then(function(ret){
        res.jsonp(ret);
    }, function(error) {
        console.log('Finish ABUp Error: ' + JSON.stringify(error));
        res.send('Finish ABUp Error');
    });
});

/**
 * ABDown Bill 是一种自上而下的筹款模式
 * 买单者直接输入每个团员应该支付的额度，直接结账，参团团员根据通知校验金额
 */
app.post('/abdown', function(req, res) {
    // 主要是前端交互，收到信息包括团员分配的金额即可结账
});

app.post('/revertHistory', function(req, res) {
    utils.getUserTuanObj(req.AV.user, req.body.tuanId).then(function(result) {
        if (result.tuan && result.isin) {
            return utils.RevertHistory(result.user, result.tuan, req.body.historyId);
        } else {
            return AV.Promise.error('Illegal');
        }
    }).then(function() {
        res.send('RevertHistory Success');
    }, function(error) {
        console.log('RevertHistory Error: ' + JSON.stringify(error));
        res.send('RevertHistory Error');
    });
});

app.get('/historyDetail', function(req, res) {
    utils.getUserTuanObj(req.AV.user, req.query.id).then(function(result) {
        if (result.tuan && result.isin) {
            return utils.FormatHistoryDetail(req.query.historyId);
        } else {
            return AV.Promise.error('Illegal');
        }
    }).then(function(hist) {
        res.jsonp(hist);
    }, function(error) {
        console.log('TuanDetail Error: ' + JSON.stringify(error));
        res.send('TuanDetail Error');
    });
});

app.get('/jsconfig', function(req, res) {
    utils.getJsConfig(req.headers.referer).then(function(config) {
        res.jsonp(config);
    }, function(error) {
        console.log('JsConfig Error: ' + JSON.stringify(error));
        res.send('JsConfig Error');
    });
});

app.get('/weixin', function(req, res) {
    console.log('weixin req:', req.query);
    weixin.exec(req.query, function(err, data) {
        if (err) {
            return res.send(err.code || 500, err.message);
        }
        return res.send(data);
    });
});

app.post('/weixin', function(req, res) {
    console.log('weixin req:', req.body);
    weixin.exec(req.body, function(err, data) {
        if (err) {
            return res.send(err.code || 500, err.message);
        }
        var builder = new xml2js.Builder();
        var xml = builder.buildObject(data);
        console.log('res:', data);
        res.set('Content-Type', 'text/xml');
        return res.send(xml);
    });
});

// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
