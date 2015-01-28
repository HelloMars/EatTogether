var wxconfig = {
    debug: false,
    appId: 'wxf8b4f85f3a794e77',
    timestamp: null,
    nonceStr: null,
    signature: null,
    jsApiList: [
        /* 基础接口 */
        'checkJsApi' // 判断当前客户端版本是否支持指定JS接口

        /* 分享接口 */
        ,'onMenuShareTimeline' // 分享到朋友圈
        ,'onMenuShareAppMessage' // 分享给朋友
        ,'onMenuShareQQ' // 分享到QQ
        ,'onMenuShareWeibo' // 分享到腾讯微博

        /* 图像接口 */
        ,'chooseImage' // 拍照或从手机相册中选图接口
        ,'previewImage' // 预览图片接口
        ,'uploadImage' // 上传图片接口
        ,'downloadImage' // 下载图片接口

        /* 音频接口 */
        ,'startRecord' // 开始录音接口
        ,'stopRecord' // 停止录音接口
        ,'playVoice' // 播放语音接口
        ,'pauseVoice' // 暂停播放接口
        ,'stopVoice' // 停止播放接口
        ,'uploadVoice' // 上传语音接口
        ,'downloadVoice' // 下载语音接口
        ,'onRecordEnd'  // ! 监听录音自动停止接口, 官方文档是 onVoiceRecordEnd
        ,'onVoicePlayEnd' // 监听语音播放完毕接口

        /* 智能接口 */
        ,'translateVoice' // 识别音频并返回识别结果接口

        /* 设备信息 */
        ,'getNetworkType' // 获取网络状态接口

        /* 地理位置 */
        ,'openLocation' // 使用微信内置地图查看位置接口
        ,'getLocation' // 获取地理位置接口

        /* 界面操作 */
        ,'hideOptionMenu' // 隐藏右上角菜单接口
        ,'showOptionMenu' // 显示右上角菜单接口
        ,'closeWindow' // 关闭当前网页窗口接口
        ,'hideMenuItems' // 批量隐藏功能按钮接口
        ,'showMenuItems' // 批量显示功能按钮接口
        ,'hideAllNonBaseMenuItem' // 隐藏所有非基础按钮接口
        ,'showAllNonBaseMenuItem' // 显示所有功能按钮接口

        /* 微信扫一扫 */
        ,'scanQRCode' // 调起微信扫一扫接口

        /* 微信小店 [服务号] */
        // ,'openProductSpecificView' // 跳转微信商品页接口

        /* 微信卡券 */
        ,'chooseCard' // 调起适用于门店的卡券列表并获取用户选择列表
        ,'addCard' // 批量添加卡券接口
        ,'openCard' // 查看微信卡包中的卡券接口

        /* 微信支付 [服务号] */
        // ,'chooseWXPay' // 发起一个微信支付请求
    ]
};

function callback(json) {
    wxconfig.timestamp = json.timestamp;
    wxconfig.nonceStr = json.nonceStr;
    wxconfig.signature = json.signature;

    var script = document.createElement('script');
    script.text = "wx.config(" + JSON.stringify(wxconfig) + ");";
    document.body.appendChild(script);
}

window.onload = function(){
    var script = document.createElement('script');
    script.src = "http://eat.avosapps.com/wxsign?callback=callback";
    document.body.appendChild(script);
};
