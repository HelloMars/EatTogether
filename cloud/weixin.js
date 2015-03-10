var crypto = require('crypto');
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
    var oriStr = [utils.TOKEN, timestamp, nonce].sort().join('');
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
                    // 扫码关注(eventkey以qrscene_开头)，需要入团但首次关注拿不到用户信息，需要做标记等用户通过菜单第一次访问后再入团
                    synch = false;
                    var tuanid = Number(eventkey.substring(8));
                    utils.Subscribe(fromUserId).then(function(user) {
                        return JoinTuanByScan(user, tuanid, false);
                    }).then(function(content) {
                        result.xml.Content = content;
                        cb(null, result);
                    }, function(error) {
                        console.log('扫码关注失败: ' + JSON.stringify(error));
                        result.xml.Content = '激活饭团APP失败，请重新关注公众账号或联系开发者解决:(';
                        cb(null, result);
                    });
                } else {
                    // 主动关注微信账号
                    synch = false;
                    utils.Subscribe(fromUserId).then(function() {
                        result.xml.Content = '您已成功激活饭团APP，尝试点击 \"我的饭团\" 快来体验吧:)';
                        cb(null, result);
                    }, function(error) {
                        console.log('主动关注失败: ' + JSON.stringify(error));
                        result.xml.Content = '激活饭团APP失败，请重新关注公众账号或联系开发者解决:(';
                        cb(null, result);
                    });
                }
                break;
            case 'unsubscribe':
                utils.UnSubscribe(fromUserId);
                break;
            case 'SCAN':
                // 扫码入团
                synch = false;
                var query = new AV.Query(AV.User);
                query.equalTo('username', fromUserId);
                query.first().then(function(user) {
                    return JoinTuanByScan(user, eventkey, true);
                }).then(function(content) {
                    result.xml.Content = content;
                    cb(null, result);
                }, function(error) {
                    console.log('扫码入团失败: ' + JSON.stringify(error));
                    result.xml.Content = '激活饭团APP失败，请重新关注公众账号或联系开发者解决:(';
                    cb(null, result);
                });
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
        result.xml.Content = msg.xml.Content + '。';
    }
    if (synch) {
        cb(null, result);
    }
};

function JoinTuanByScan(user, tuanid, subscribed) {
    var content;
    return utils.getUserTuanObj(user, tuanid).then(function(result) {
        if (result.tuan) {
            if (result.isin) {
                if (subscribed) {
                    content = '您已经处于饭团('
                    + result.tuan.get('name') + ')中，快点击 \"我的饭团\" 体验吧:)';
                } else {
                    content = '您之前已经加入饭团('
                    + result.tuan.get('name') + ')，尝试点击 \"我的饭团\" 快来体验吧:)';
                }
                return AV.Promise.as(content);
            } else {
                if (result.user.get('sex') == -1 || result.user.get('sex') >= 10) {
                    // 在用户未更新用户名时，sex临时存储准备加入的tuanid
                    content = '您已成功激活饭团APP，快点击 \"我的饭团\" 加入您刚才扫描的饭团('
                    + result.tuan.get('name') + ')吧:)';
                    result.user.set('sex', result.tuan.get('tuanid'));
                    result.user.save();
                    return AV.Promise.as(content);
                } else {
                    // 此时用户名已经更新过，可以入团
                    content = '您已成功加入饭团('
                    + result.tuan.get('name') + ')，快来点击 \"我的饭团\" 体验吧:)';
                    utils.JoinTuan(result.user, result.tuan, result.account);
                    return AV.Promise.as(content);
                }
            }
        } else {
            return AV.Promise.error('Illegal');
        }
    });
}