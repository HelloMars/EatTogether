require("cloud/app.js");

var utils = require('cloud/utils');

AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

AV.Cloud.define("initDB", function(request, response) {
  utils.CreateTuan({
    'name': utils.CREAT_TUAN.name,
    'tuanid': utils.CREAT_TUAN.id,
    'count': 10
  });

  utils.CreateTuan({
    'name': utils.JOIN_TUAN.name,
    'tuanid': utils.JOIN_TUAN.id,
    'count': 10
  });
});