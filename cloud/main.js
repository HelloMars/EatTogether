require("cloud/app.js");

var utils = require('cloud/utils');

AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

AV.Cloud.define("initDB", function(request, response) {
  var tuan = new utils.Tuan();
  tuan.set('tuanid', 1);
  tuan.set('name', '建团');
  tuan.set('memberids', []);
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
  tuan.set('tuanid', 2);
  tuan.set('name', '入团');
  tuan.set('memberids', []);
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