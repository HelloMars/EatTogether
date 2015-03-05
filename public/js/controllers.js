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
    // var len = Math.abs(tuanMemberCounts) * 0.01 + 50;
    // var fz = Math.abs(tuanMemberCounts) * 0.02 + 15;
    var len = 100;
    var fz = 20;
    return {
        'div1' : {
            'width' : len * 1.2 +'px',
            'height' : len * 1.2 + 'px'
        },
        'div2' : {
            'width' : len + 'px',
            'height' : len + 'px',
            'line-height' : fz + 'px',
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
eatTogetherControllers.controller('TuanCreateCtrl', ['$scope', '$routeParams', 'tuan', '$location',
    function ($scope, $routeParams, tuan, $location) {
        tuan.createTuan().then(function(res){
            if (res.id === undefined) return;
            $location.url('/tuan/' + res.id + '/home');
        });
    }
]);

/** 加入饭团页 */
eatTogetherControllers.controller('TuanJoinCtrl', ['$scope', '$routeParams', 'tuan', '$location',
    function ($scope, $routeParams, tuan, $location) {

        $scope.confirm = function () {
            if ($scope.tuanId === '') return;
            tuan.joinTuan($scope.tuanId).then(function (res) {
                if (res.id === undefined) return;
                $location.url('/tuan/' + res.id + '/home');
            });
        };
    }
]);


/** 饭团详情页(成员列表页) */
eatTogetherControllers.controller('TuanMembersCtrl', ['$scope', '$routeParams', '$location', 'tuan',
    function ($scope, $routeParams, $location, tuan) {
        $scope.tuanId = $routeParams.tuanId;
        $scope.list = [];
        tuan.getTuanInfo($scope.tuanId).then(function (res) {
            res.members.map(function(user) {
                angular.extend(user, getDesign(user.money));
                $scope.list.push(user);
            });
            $scope.list.unshift(maidan);

        });
        var maidan = {
            name : '窝买单',
            money : 10
        };
        angular.extend(maidan, getDesign(maidan.money));
        $scope.click = function(name) {
            if (name !== '窝买单') return;
            $location.url('/tuan/' + $scope.tuanId + '/bill');
        };
    }
]);

/** 买单页 */
eatTogetherControllers.controller('TuanBillCtrl', ['$scope', '$routeParams', '$location', 'tuan',
    function ($scope, $routeParams, $location, tuan) {
        $scope.tuanId = $routeParams.tuanId;
        tuan.getTuanInfo($scope.tuanId).then(function (res) {
            $scope.members = res.members;
            $scope.curTotal = res.members.length;
            $scope.notMember = 0;
            $scope.numberErr = false;

            $scope.members.forEach(function(user) {
                user.inThis = true;
                console.log(user);
            });
            $scope.changeMember = function () {
                var tmp = 0;
                $scope.members.forEach(function (member) {
                    if (member.inThis) tmp++;
                });
                $scope.curTotal = tmp;
                $scope.average = totalMoney/(curTotal + notMember);
            };
            $scope.confirm = function () {
                var members = $scope.members.map(function (member) {
                    return member.uid;
                });
                tuan.bill($scope.tuanId, members, $scope.notMember, $scope.totalMoney).then(function(res) {
                    console.log(res);
                    $location.url('/tuan/' + $scope.tuanId + '/members/');
                });
            };
        });

    }
]);


/** 饭团首页 */
eatTogetherControllers.controller('TuanIndexCtrl', ['$scope', '$routeParams', 'tuan', '$location',
    function ($scope, $routeParams, tuan, $location) {
        $scope.tuanId = $routeParams.tuanId;
        $scope.loaded = false;
        tuan.getTuanInfo($scope.tuanId).then(function (res) {
            $scope.name = res.name;
            $scope.id = res.id;
            $scope.slogan = res.slogan;
            $scope.loaded = true;
        });

        /** 二维码生成 */
        var text = 'lalalalaalall';
        var qrcode = new QRCode(document.getElementById("qrcode"), {
            width : 200,
            height : 200
        });
        qrcode.makeCode(text);

        $scope.save = function () {
            tuan.modTuanInfo($scope.id, {
                name : $scope.name,
                slogan : $scope.slogan
            });
        };

        $scope.quit = function () {
            tuan.quit($scope.tuanId).then(function (res) {
                $location.url('/tuan/');
            });

        };

    }
]);

/** 饭团历史 */
eatTogetherControllers.controller('TuanHistoryCtrl', ['$scope', '$routeParams', 'tuan',
    function ($scope, $routeParams, tuan) {
        $scope.tuanId = $routeParams.tuanId;
        tuan.getTuanHistory($scope.tuanId, 0, 100)
        .then(function (res) {
            $scope.histories = res;
        });
    }

]);