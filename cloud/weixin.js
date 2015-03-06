var crypto = require('crypto');
var config = require('cloud/config/weixin.js');
var debug = require('debug')('AV:weixin');
var utils = require('cloud/utils');

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
    var synch = true;
    var content;
    var result = {
        xml: {
            ToUserName: msg.xml.FromUserName[0],
            FromUserName: '' + msg.xml.ToUserName + '',
            CreateTime: new Date().getTime(),
            MsgType: 'text',
            Content: ''
        }
    };
    if (msg.xml.MsgType == 'voice') {
        result.xml.Content = msg.xml.Recognition;
    } else if (msg.xml.MsgType == 'event') {
        var event = msg.xml.Event + '';
        var eventkey = msg.xml.EventKey + '';
        var toUserId = msg.xml.ToUserName + '';
        var fromUserId = msg.xml.FromUserName + '';
        switch (event) {
            case 'subscribe':
                if (msg.xml.Ticket) {
                    // qrscene
                } else {
                    // 主动关注微信账号
                    synch = false;
                    utils.Subscribe(fromUserId).then(function() {
                        result.xml.Content = '您已成功激活饭团APP，尝试点击 \"我的饭团\" 快来体验吧:)';
                        cb(null, result);
                    }, function() {
                        result.xml.Content = '激活饭团APP失败，请重新关注公众账号或联系开发者解决:(';
                        cb(null, result);
                    });
                }
                break;
            case 'unsubscribe':
                utils.UnSubscribe(fromUserId);
                break;
            case 'SCAN':
                break;
            case 'CLICK':
                switch (eventkey) {
                    case 'V001_UP':
                        result.xml.Content = '跪谢赞！';
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
        result.xml.Content = msg.xml.Content + '。用轮子真是太开心了！';
    }
    if (synch) {
        cb(null, result);
    }
};
