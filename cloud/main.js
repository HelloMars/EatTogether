require("cloud/app.js");

var utils = require('cloud/utils');

AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});