var express = require('express');
var xml2js = require('xml2js');
var weixin = require('cloud/weixin.js');
var utils = require('express/node_modules/connect/lib/utils');
var sign = require("cloud/sign.js");
var https = require('https');

// 解析微信的 xml 数据
var xmlBodyParser = function (req, res, next) {
  if (req._body) return next();
  req.body = req.body || {};

  // ignore GET
  if ('GET' == req.method || 'HEAD' == req.method) return next();

  // check Content-Type
  if ('text/xml' != utils.mime(req)) return next();

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

var APPID = 'wx215f75c4627af14a';
var APPSECRET = 'c4dfb380644d4fb5266468da939935d5';

var httpsget = function(options, callback) {
  var req = https.request(options, function(res) {
    var output = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      output += chunk;
    });

    res.on('end', function() {
      console.log(JSON.parse(output));
      callback(JSON.parse(output));
    });
  });
  req.end();
};

var getAccessToken = function(callback) {
  var options = {
    host: 'api.weixin.qq.com',
    port: 443,
    path: '/cgi-bin/token?grant_type=client_credential&appid='+APPID+'&secret='+APPSECRET,
    method: 'GET'
  };
  httpsget(options, function(json) {
    callback(json.access_token);
  });
};

var getJsapiTicket = function(callback) {
  getAccessToken(function(access_token) {
    var options = {
      host: 'api.weixin.qq.com',
      port: 443,
      path: '/cgi-bin/ticket/getticket?access_token=' + access_token + '&type=jsapi',
      method: 'GET'
    };
    httpsget(options, function(json) {
      callback(json.jsapi_ticket);
    });
  });
};

var app = express();

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件
app.use(xmlBodyParser);

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

app.get('/wxsign', function(req, res) {
  getJsapiTicket(function(jsapi_ticket) {
    res.setHeader('Content-Type', 'application/json');
    var ret = sign(jsapi_ticket, req.query.url);
    ret.appId = APPID;
    res.jsonp(ret);
  });
});

app.get('/auth', function(req, res) {
  utils.getOpenId(req.query.code, function(openid, accessToken){
    res.setHeader('Content-Type', 'application/json');
    ret.openid = openid;
    res.jsonp(ret);
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
