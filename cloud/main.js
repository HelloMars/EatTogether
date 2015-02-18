require("cloud/app.js");

var utils = require('cloud/utils');

AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

AV.Cloud.define("initDB", function(request, response) {
  var tuan = new utils.Tuan();
  tuan.set('tuanid', utils.CREAT_TUAN.id);
  tuan.set('name', utils.CREAT_TUAN.name);
  tuan.set('memberids', [1,1,1,1,1,1,1,1,1,1]);
  tuan.set('news', 0);
  tuan.save(null, {
    success: function(tuan) {
      console.log("建团成功: " + JSON.stringify(tuan));
    },
    error: function(tuan, error) {
      console.log("建团失败: " + JSON.stringify(error));
    }
  });

  tuan = new utils.Tuan();
  tuan.set('tuanid', utils.JOIN_TUAN.id);
  tuan.set('name', utils.JOIN_TUAN.name);
  tuan.set('memberids', [1,1,1,1,1,1,1,1,1,1]);
  tuan.set('news', 0);
  tuan.save(null, {
    success: function(tuan) {
      console.log("建团成功: " + JSON.stringify(tuan));
    },
    error: function(tuan, error) {
      console.log("建团失败: " + JSON.stringify(error));
    }
  });
});