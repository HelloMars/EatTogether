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

// App 全局配置
app.set('views','cloud/views'); // 设置模板目录
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
        utils.SignupLogin(openid, 'pwd:'+openid).then(function () {
            res.render('myet.html');
        }, function (error) {
            res.render('hello', {message: error.message})
        });
    } else {
        // 正常流程先注册用户
        utils.getOpenId(code).then(function (openid) {
            return utils.SignupLogin(openid, 'pwd:'+openid);
        }).then(function () {
            res.render('myet.html');
        }, function (error) {
            res.render('hello', {message: error.message})
        });
    }
});

app.get('/tuanlist', function(req, res) {
    //console.log('cookies: ' + req.headers.cookie);
    res.setHeader('Content-Type', 'application/json');
    req.AV.user.fetch().then(function(user){
        return utils.GetTuanList(user);
    }).then(function(tuans) {
        tuans.push({
            'id': 1,
            'name': '建团',
            'members': 10,
            'news': 0
        });
        tuans.push({
            'id': 2,
            'name': '入团',
            'members': 10,
            'news': 0
        });
        res.jsonp(tuans);
    }, function(error) {
        console.log('TuanList Error: ' + JSON.stringify(error));
        res.send('TuanList Error');
    });
});

app.get('/createtuan', function(req, res) {
    // 建团，并创建一条Account
    req.AV.user.fetch().then(function(user) {
        return utils.CreateTuan({'name': '新团'}).then(function(tuan) {
            return utils.CreateAccount(user, tuan).then(function() {
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

app.get('/jointuan', function(req, res) {
    if (req.query.id >= 10) {
        // 入团(生成一条Account)，并更新Tuan.members数
        var query = new AV.Query(utils.Tuan);
        query.equalTo('tuanid', Number(req.query.id));
        query.find().then(function (tuans) {
            if (tuans.length == 1) {
                return req.AV.user.fetch().then(function (user) {
                    return utils.CreateAccount(user, tuans[0]).then(function () {
                        return utils.FormatTuanDetail(tuans[0]);
                    });
                });
            } else {
                return AV.Promise.error('Tuan Results Error');
            }
        }).then(function(tuan) {
            res.jsonp(tuan);
        }, function (error) {
            console.log('JoinTuan Error: ' + JSON.stringify(error));
            res.send('JoinTuan Error');
        });
    } else {
        res.send('Invalid Parameters');
    }
});

app.get('/quittuan', function(req, res) {
    if (req.query.id >= 10) {
        // 退团(删除Account)，并更新Tuan.members数
        var query = new AV.Query(utils.Tuan);
        query.equalTo('tuanid', Number(req.query.id));
        query.find().then(function (tuans) {
            if (tuans.length == 1) {
                return req.AV.user.fetch().then(function(user) {
                    return utils.DeleteAccount(user, tuans[0]);
                });
            } else {
                return AV.Promise.error('Tuan Results Error');
            }
        }).then(function(ret) {
            console.log(req.query.id + ': ' + ret.message);
            res.jsonp(ret);
        }, function (error) {
            console.log('QuitTuan Error: ' + JSON.stringify(error));
            res.send('QuitTuan Error');
        });
    } else {
        res.send('Invalid Parameters');
    }
});

app.get('/tuandetail', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    if (req.query.id >= 10) {
        var query = new AV.Query(utils.Tuan);
        query.equalTo('tuanid', Number(req.query.id));
        query.find().then(function(tuans) {
            if (tuans.length == 1) {
                return utils.FormatTuanDetail(tuans[0]);
            } else {
                return AV.Promise.error('Tuan Results Error');
            }
        }).then(function (tuan) {
            res.jsonp(tuan);
        }, function (error) {
            console.log('TuanDetail Error: ' + JSON.stringify(error));
            res.send('TuanDetail Error');
        });
    } else {
        res.send('Invalid Parameters');
    }
});

app.post('/modtuaninfo', function(req, res) {
    console.log('modtuaninfo: ', req.body);
    var tuanid = Number(req.body.id);
    if (tuanid >= 10 && req.body.info) {
        utils.ModifyTuan(tuanid, req.body.info).then(function() {
            res.send('Modtuaninfo Success');
        }, function(error) {
            console.log('Modtuaninfo Error: ' + JSON.stringify(error));
            res.send('Modtuaninfo Error');
        });
    } else {
        res.send('Invalid Parameters');
    }
});

app.post('/bill', function(req, res) {
    var tuanid = Number(req.body.id);
    var othersnum = Number(req.body.othersnum);
    var price = Number(req.body.price);
    if (tuanid >= 10 && req.body.members && req.body.members.length > 0
            && othersnum >= 0 && price >= 0) {
        req.AV.user.fetch().then(function(user) {
            utils.Bill(user, tuanid, req.body.members, othersnum, price).then(function() {
                res.send('Bill Success');
            }, function(error) {
                console.log('Bill Error: ' + JSON.stringify(error));
                res.send('Bill Error');
            });
        });
    } else {
        res.send('Invalid Parameters');
    }
});

app.get('/tuanhistory', function(req, res) {
    console.log('tuanhistory:', req.query);
    var tuanid = Number(req.query.id);
    var start = Number(req.query.start);
    var length = Number(req.query.length);
    if (tuanid >= 10 && start >= 0 && length >=0) {
        utils.GetTuanHistory(tuanid, start, length).then(function(tuanHistory) {
            res.jsonp(tuanHistory);
        }, function(error) {
            console.log('TuanHistory Error: ' + JSON.stringify(error));
            res.send('TuanHistory Error');
        });
    } else {
        res.send('Invalid Parameters');
    }
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
