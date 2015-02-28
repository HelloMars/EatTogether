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
        $http.get('tuandetail?id=1').success(function(tuan) {

        });
        $scope.click = function(name) {
            console.log(name);
        };
    }
]);

/** 加入饭团页 */
eatTogetherControllers.controller('TuanJoinCtrl', ['$scope', '$routeParams', '$http',
    function ($scope, $routeParams, $http) {
        // 扫描二维码，获取要加入的tuanid
        $scope.startScan = function () {
            alert("a");
            wx.scanQRCode({
                needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                scanType: ["qrCode"], // 可以指定扫二维码还是一维码，默认二者都有
                success: function (res) {
                    alert(res);
                    $('.s-join').append(JSON.sringify(res));
                }
            });
        };
        // $http.get('tuandetail?id=2&tuanid='+tuanid).success(function(tuan) {

        // });

    }
]);


/** 饭团详情页(成员列表页) */
eatTogetherControllers.controller('TuanMembersCtrl', ['$scope', '$routeParams', '$http',
    function ($scope, $routeParams, $http) {
        $scope.tuanId = $routeParams.tuanId;
        $scope.list = [];
        $http.get('tuandetail?id='+$routeParams.tuanId).success(function(tuan) {
            tuan.members.map(function(user) {
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
eatTogetherControllers.controller('TuanIndexCtrl', ['$scope', '$routeParams', '$http',
    function ($scope, $routeParams) {
        $scope.tuanId = $routeParams.tuanId;

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