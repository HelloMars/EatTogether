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
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.engine('html', require('ejs').renderFile);
app.use(express.bodyParser());    // 读取请求 body 的中间件
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
  } else if (code == 888) {
    // 使用测试用户
    utils.SignupLogin(code, 'pwd:'+code, {
      success: function(user) {
        res.render('myet.html');
      },
      error: function(user, error) {
        res.render('hello', {message: error.message})
      }
    });
  } else {
    // 正常流程先注册用户
    utils.getOpenId(code, function(openid, accessToken) {
      utils.SignupLogin(openid, 'pwd:'+openid, {
        success: function(user) {
          res.render('myet.html');
        },
        error: function(user, error) {
          res.render('hello', {message: error.message})
        }
      });
    });
    res.render('myet.html');
  }
});

app.get('/tuanlist', function(req, res) {
  console.log('/tuanlist: %j', req.AV.user);
  res.setHeader('Content-Type', 'application/json');
  req.AV.user.fetch().then(function(user){
    utils.GetTuanList(user, {
      success: function(tuans) {
        res.jsonp(tuans);
      }
    });
  }, function(error) {
    console.log('Fetch Error: ' + JSON.stringify(error));
  });
});

app.get('/tuandetail', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var tuans = [];
  if (req.query.id == 3) {
    tuans = [
      {'id':1, 'name': '大蛋', 'members': 15, 'news': 0},
      {'id':2, 'name': '中蛋', 'members': 10, 'news': 0},
      {'id':3, 'name': '小蛋', 'members': 5, 'news': 0},
      {'id':4, 'name': '大蛋', 'members': 15, 'news': 0}
    ];
  } else if (req.query.id == 1) {
    // 建团
    var tuan = new utils.Tuan();
    tuan.set('name', '新团');
    tuan.set('memberids', [req.AV.user]);
    tuan.set('news', 0);
    tuan.save(null, {
      success: function(tuan) {
        console.log("建团成功: " + JSON.stringify(tuan));
        tuans = [tuan];
      },
      error: function(tuan, error) {
        console.log("建团失败: " + JSON.stringify(error));
      }
    });
  } else if (req.query.id == 2) {
    tuans = [
      {'id':3, 'name': '入团', 'members': 10, 'news': 0}
    ];
  } else {
    tuans = [
      {'id':1, 'name': '小蛋', 'members': 5, 'news': 0},
      {'id':2, 'name': '中蛋', 'members': 10, 'news': 0},
      {'id':3, 'name': '大蛋', 'members': 15, 'news': 0}
    ];
  }
  res.jsonp(tuans);
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
