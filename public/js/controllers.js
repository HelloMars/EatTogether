/**
 * Created by Meng on 2015/2/4.
 */

var eatTogetherControllers = angular.module('eatTogetherControllers', []);


/** 饭团列表 */
eatTogetherControllers.controller('TuanListCtrl', ['$scope', '$location', 'tuan',
    function ($scope, $location, tuan) {
        $scope.loaded = false;
        $scope.column = 1;
        $scope.list = [];
        tuan.getAll().then(function(res) {
            res.tuans.map(function(tuan) {
                $scope.list.push(tuan);
            });
            $scope.user = res.user;
            $scope.loaded = true;
        });
        $scope.enterTuan = function(id) {
            $location.url('/tuan/' + id + '/members');
        };
        $scope.creatTuan = function () {
            tuan.createTuan().then(function(res){
                $location.url('/tuan/' + res.id + '/home');
            });
        };
    }
]);

/** 饭团详情页(成员列表页) */
eatTogetherControllers.controller('TuanMembersCtrl', ['$scope', '$routeParams', '$location', 'tuan',
    function ($scope, $routeParams, $location, tuan) {
        $scope.loaded = false;
        $scope.column = 2;
        $scope.tuanId = $routeParams.tuanId;
        $scope.list = [];
        tuan.getTuanInfo($scope.tuanId).then(function (res) {
            res.members.map(function(member) {
                member.avatarBg = {
                    'background-image': 'url(' + member.headimgurl + ')',
                };
                member.moneyBgc = {
                    'background' : (member.sex === 1 ? 'lightgreen' : 'violet')
                };
                $scope.list.push(member);
            });
            $scope.loaded = true;
        });
        $scope.bill = function() {
            $location.url('/tuan/' + $scope.tuanId + '/bill');
        };

    }
]);



/** 买单页 */
eatTogetherControllers.controller('TuanBillCtrl', ['$scope', '$routeParams', '$location', 'tuan',
    function ($scope, $routeParams, $location, tuan) {
        $scope.loaded = false;
        $scope.tuanId = $routeParams.tuanId;
        tuan.getTuanInfo($scope.tuanId).then(function (res) {
            $scope.members = res.members;
            $scope.curTotal = res.members.length;
            $scope.notMember = 0;
            $scope.numberErr = false;

            $scope.members.forEach(function(member) {
                member.avatarBg = {
                    'background-image' : 'url(' + member.headimgurl + ')'
                };
                member.inThis = true;
            });
            $scope.loaded = true;
            $scope.changeMember = function () {
                var tmp = 0;
                $scope.members.forEach(function (member) {
                    if (member.inThis) tmp++;
                });
                $scope.curTotal = tmp;
                $scope.average = $scope.totalMoney/( $scope.curTotal +  $scope.notMember);
            };
            $scope.confirm = function () {
                var members = $scope.members.filter(function (member) {
                    return member.inThis;
                }).map(function (member) {
                    return member.uid;
                });
                tuan.bill($scope.tuanId, members, $scope.notMember, $scope.totalMoney).then(function(res) {
                    $location.url('/tuan/' + $scope.tuanId + '/members/');
                });
            };
        });

    }
]);


/** 饭团首页 */
eatTogetherControllers.controller('TuanIndexCtrl', ['$scope', '$routeParams', 'tuan', '$location',
    function ($scope, $routeParams, tuan, $location) {
        $scope.column = 3;
        $scope.tuanId = $routeParams.tuanId;
        $scope.loaded = false;
        tuan.getTuanInfo($scope.tuanId).then(function (res) {
            $scope.name = res.name;
            $scope.newName = res.name;
            $scope.curTabName = $scope.name;
            $scope.id = res.id;
            $scope.qrcode = res.qrcode;
            $scope.money = res.money;
            $scope.slogan = res.slogan;
            $scope.loaded = true;
        });

        $scope.save = function () {
            if ($scope.newName === $scope.name) return;
            tuan.modTuanInfo($scope.id, {
                name : $scope.newName,
                slogan : $scope.slogan
            });
        };

        $scope.quit = function () {
            tuan.quitTuan($scope.tuanId).then(function (res) {
                alert(res.message);
                if (res.code !== -1) $location.url('/tuan/');
            });
        };

    }
]);

/** 饭团历史 */
eatTogetherControllers.controller('TuanHistoryCtrl', ['$scope', '$routeParams', 'tuan',
    function ($scope, $routeParams, tuan) {
        $scope.loaded = false;
        $scope.column = 4;
        $scope.tuanId = $routeParams.tuanId;
        tuan.getTuanHistory($scope.tuanId, 0, 100)
        .then(function (res) {
            $scope.histories = res;
            $scope.loaded = true;
        });

        $scope.swipeLeft = function (enableRevert) {
            if (!enableRevert) return;
            $scope.showDelete = true;
        };
        $scope.swipeRight = function (enableRevert) {
            if (!enableRevert) return;
            $scope.showDelete = false;
        };
        $scope.revert = function ( history) {
            tuan.revertHistory($scope.tuanId, history.id).then(function (res) {
                history.deleted = true;
            });
        };
    }

]);