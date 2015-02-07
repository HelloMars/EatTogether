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
                if (tuan.id === 1) tuan.id = 'create';
                if (tuan.id === 2) tuan.id = 'join';
                $scope.list.push(tuan);
            });
        });
        $scope.click = function(name) {
            console.log(name);
        };
    }
]);

/** 创建饭团页 */
eatTogetherControllers.controller('TuanCreateCtrl', ['$scope', '$routeParams', '$http',
    function ($scope, $routeParams, $http) {
        $scope.list = [];
        $http.get('tuandetail?id='+$routeParams.tuanId).success(function(tuans) {

        });
        $scope.click = function(name) {
            console.log(name);
        };
    }
]);

/** 加入饭团页 */
eatTogetherControllers.controller('TuanJoinDetail', ['$scope', '$routeParams', '$http',

]);


/** 饭团详情页(成员列表页) */
eatTogetherControllers.controller('TuanMembersCtrl', ['$scope', '$routeParams', '$http',
    function ($scope, $routeParams, $http) {
        $scope.tuanId = $routeParams.tuanId;
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


/** 饭团首页 */
eatTogetherControllers.controller('TuanIndexCtrl', ['$scope', '$routeParams', '$http',
    function ($scope, $routeParams) {
        $scope.tuanId = $routeParams.tuanId;
    }
]);

/** 饭团历史 */
eatTogetherControllers.controller('TuanHistoryCtrl', ['$scope', '$routeParams', '$http',
    function ($scope, $routeParams) {
        $scope.tuanId = $routeParams.tuanId;
    }

]);