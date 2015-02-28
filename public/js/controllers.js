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
eatTogetherControllers.controller('TuanListCtrl', ['$scope', 'tuan',
    function ($scope, tuan) {
        $scope.list = [];

        tuan.getAll().then(function(res) {
            res.map(function(tuan) {
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
eatTogetherControllers.controller('TuanCreateCtrl', ['$scope', '$routeParams', 'tuan',
    function ($scope, $routeParams, tuan) {
        $scope.list = [];
        tuan.createTuan().then(function(res){
            $scope.name = res.name;
        });
        $scope.click = function(name) {
            console.log(name);
        };
    }
]);

/** 加入饭团页 */
eatTogetherControllers.controller('TuanJoinCtrl', ['$scope', '$routeParams', 'tuan', '$location',
    function ($scope, $routeParams, tuan, $location) {

        $scope.confirm = function () {
            if ($scope.tuanId === '') return;
            tuan.joinTuan($scope.tuanId).then(function (res) {
                if (res.id ===  undefined) return;
                $location.url('/tuan/' + res.id + '/home');
            });
        };

    }
]);


/** 饭团详情页(成员列表页) */
eatTogetherControllers.controller('TuanMembersCtrl', ['$scope', '$routeParams', 'tuan',
    function ($scope, $routeParams, tuan) {
        $scope.tuanId = $routeParams.tuanId;
        $scope.list = [];
        tuan.getTuanInfo($scope.tuanId).then(function (res) {
            res.members.map(function(user) {
                angular.extend(user, getDesign(user.money));
                $scope.list.push(user);
            });
        });
        $scope.click = function(name) {
            console.log(name);
        };
    }
]);


/** 饭团首页 */
eatTogetherControllers.controller('TuanIndexCtrl', ['$scope', '$routeParams', 'tuan',
    function ($scope, $routeParams, tuan) {
        $scope.tuanId = $routeParams.tuanId;
        tuan.getTuanInfo($scope.tuanId).then(function (res) {
            $scope.name = res.name;
            $scope.id = res.id;
            $scope.text = res.text;
        });

        /** 二维码生成 */
        var text = 'lalalalaalall';
        var qrcode = new QRCode(document.getElementById("qrcode"), {
            width : 200,
            height : 200
        });
        qrcode.makeCode(text);

    }
]);

/** 饭团历史 */
eatTogetherControllers.controller('TuanHistoryCtrl', ['$scope', '$routeParams', '$http',
    function ($scope, $routeParams) {
        $scope.tuanId = $routeParams.tuanId;
    }

]);