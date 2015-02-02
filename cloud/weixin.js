var crypto = require('crypto');
var config = require('cloud/config/weixin.js');
var debug = require('debug')('AV:weixin');

exports.exec = function(params, cb) {
  if (params.signature) {
    checkSignature(params.signature, params.timestamp, params.nonce, params.echostr, cb);
  } else {
    receiveMessage(params, cb)
  }
};

// 验证签名
var checkSignature = function(signature, timestamp, nonce, echostr, cb) {
  var oriStr = [config.token, timestamp, nonce].sort().join('')
  var code = crypto.createHash('sha1').update(oriStr).digest('hex');
  debug('code:', code);
  if (code == signature) {
    cb(null, echostr);
  } else {
    var err = new Error('Unauthorized');
    err.code = 401;
    cb(err);
  }
};

// 接收普通消息
var receiveMessage = function(msg, cb) {
  var content;
  if (msg.xml.MsgType == 'voice') {
    content = msg.xml.Recognition;
  } else if (msg.xml.MsgType == 'event') {
    var event = msg.xml.Event + '';
    var eventkey = msg.xml.EventKey + '';
    switch (event) {
      case 'CLICK':
        switch (eventkey) {
          case 'V001_UP':
              content = '跪谢赞！';
            break;
          default: console.log('No support for EventKey: ' + eventkey);
        }
        break;
      case 'VIEW':
        console.log('Redirect to: ' + eventkey);
        break;
      default: console.log('No support for Event: ' + event);
    }
  } else {
    content = msg.xml.Content + '。用轮子真是太开心了！';
  }
  var result = {
    xml: {
      ToUserName: msg.xml.FromUserName[0],
      FromUserName: '' + msg.xml.ToUserName + '',
      CreateTime: new Date().getTime(),
      MsgType: 'text',
      Content: content
    }
  };
  cb(null, result);
};
