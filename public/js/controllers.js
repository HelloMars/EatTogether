/**
 * Created by Meng on 2015/2/4.
 */

var eatTogetherControllers = angular.module('eatTogetherControllers', []);

/**
 * 根据数值获取样式
 * @param  {int} tuanMemberCounts
 * @return {array}  [cssobj1, cssobj2]
 */
function getDesign(tuanMemberCounts) {
    var len = tuanMemberCounts * 10 + 50;
    var fz = tuanMemberCounts * 2 + 15;
    return {
        'div1' : {
            'width' : len * 1.2 +'px',
            'height' : len * 1.2 + 'px'
        },
        'div2' : {
            'width' : len + 'px',
            'height' : len + 'px',
            'line-height' : len + 'px',
            'font-size' : fz +'px'
        }
    };
}


/** 饭团列表 */
eatTogetherControllers.controller('TuanListCtrl', ['$scope', '$http',
    function ($scope, $http) {
        $scope.list = [];
        $http.get('tuanlist').success(function(tuans) {
            tuans.map(function(tuan) {
                angular.extend(tuan, getDesign(tuan.members));
                $scope.list.push(tuan);
            });
        });
        $scope.click = function(name) {
            console.log(name);
        };
    }
]);

/** 饭团详情页 */
eatTogetherControllers.controller('TuanDetailCtrl', ['$scope', '$routeParams', '$http',
    function ($scope, $routeParams, $http) {
        $scope.list = [];
        $http.get('tuandetail?id='+$routeParams.tuanId).success(function(tuans) {
            tuans.map(function(tuan) {
                angular.extend(tuan, getDesign(tuan.members));
                $scope.list.push(tuan);
            });
        });
        $scope.click = function(name) {
            console.log(name);
        };
    }
]);