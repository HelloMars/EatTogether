/**
 * Created by Meng on 2015/2/4.
 */

var eatTogetherControllers = angular.module('eatTogetherControllers', []);

eatTogetherControllers.controller('TuanListCtrl', ['$scope', '$http',
    function ($scope, $http) {
        $http.get('tuanlist').success(function(tuans) {
            $scope.list = [];
            tuans.forEach(function(tuan) {
                var len = tuan.members*10+50;
                var entry = {'id':tuan.id, 'name':tuan.name,
                    'div1':"{'width':'"+len*1.2+"px', 'height':'"+len*1.2+"px'}",
                    'div2':"{'width':'"+len+"px', 'height':'"+len+"px',\
                        'vertical-align':'middle', 'line-height':'"+len+"px',\
                        'font-size':'"+(tuan.members*2+15)+"px'}"};
                $scope.list.push(entry);
            });
        });
        $scope.click = function(name) {
            console.log(name);
        };
    }
]);

eatTogetherControllers.controller('TuanDetailCtrl', ['$scope', '$routeParams', '$http',
    function ($scope, $routeParams, $http) {
        $http.get('tuandetail?id='+$routeParams.tuanId).success(function(tuans) {
            $scope.list = [];
            tuans.forEach(function(tuan) {
                var len = tuan.members*10+50;
                var entry = {'id':tuan.id, 'name':tuan.name,
                    'div1':"{'width':'"+len*1.2+"px', 'height':'"+len*1.2+"px'}",
                    'div2':"{'width':'"+len+"px', 'height':'"+len+"px',\
                        'vertical-align':'middle', 'line-height':'"+len+"px',\
                        'font-size':'"+(tuan.members*2+15)+"px'}"};
                $scope.list.push(entry);
            });
        });
        $scope.click = function(name) {
            console.log(name);
        };
    }
]);