/**
 * Created by Meng on 2015/2/4.
 */

var eatTogetherControllers = angular.module('eatTogetherControllers', []);


/** 饭团列表 */
var randomBgColor = ['229, 207, 99', '91, 204, 190', '250, 154, 99', '161,189,220', '234,110,111'];
eatTogetherControllers.controller('TuanListCtrl', ['$scope', '$location', 'tuan', '$modal',
    function ($scope, $location, tuan, $modal) {
        $scope.loaded = false;
        $scope.column = 1;
        $scope.list = [];

        tuan.getAll().then(function(res) {
            res.tuans.map(function(tuan) {
                var inx = Math.floor(Math.random()*5);
                tuan.style = {
                    'background' : 'rgb(' + randomBgColor[inx] + ')',
                    'box-shadow' : '0 0 0 5px rgba('+ randomBgColor[inx] + ', .3)'
                };
                if (tuan.news !== 0) {
                    tuan.style = angular.extend(tuan.style, {
                        '-webkit-animation-delay' :  Math.random() + 's',
                        'animation-delay' :  Math.random() + 's'
                    });

                }
                $scope.list.push(tuan);
            });
            $scope.user = res.user;
            $scope.user.newNickname = res.user.nickname;
            $scope.loaded = true;
        });
        $scope.enterTuan = function(tuanObj) {
            if (tuanObj.news !== 0) {
                $location.url('/tuan/' + tuanObj.id + '/history');
            } else {
                $location.url('/tuan/' + tuanObj.id + '/members');

            }
        };
        $scope.changeName = function () {

            // 注意！！： 使用的ui-bootstrapjs有更改 解决ngTouch导致的modal内input失效
            // @ref: https://github.com/angular-ui/bootstrap/issues/2280
            var modalInstance = $modal.open({
                templateUrl: '../html/modals/changeName.html',
                controller: 'changeNameModal',
                size: 'lg',
                resolve: {
                    oldName: function () {
                        return $scope.user.nickname;
                    }
                }
            });

            modalInstance.result.then(function (newNickname) {
                $scope.user.newNickname = newNickname;
                if ($scope.user.newNickname !== $scope.user.nickname) {
                    tuan.setUserName($scope.user.newNickname).then(function (res) {
                        $scope.user.nickname = $scope.user.newNickname;
                    });
                }
                console.log(newNickname);
            }, function () {
            });
        };

        $scope.creatTuan = function () {
            $scope.loaded = false;
            tuan.createTuan().then(function(newTuan){
                newTuan.new = true;
                $scope.loaded = true;
                $scope.list.map(function(tuan) {
                    tuan.new = false;
                });
                $scope.list.unshift(newTuan);
                //$location.url('/tuan/' + res.id + '/home');
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
                    'background-image': 'url(' + member.headimgurl + ')'
                };
                member.status = member.money < 0;
                $scope.list.push(member);
                if (member.history) {
                    member.history = member.history.map(function(his){
                        if (his.time) {
                            his.date = (new Date(his.time).getMonth() + 1) + '/' + new Date(his.time).getDate();
                        }
                        return his;
                    });
                }
            });
            $scope.name = res.name;

            $scope.loaded = true;
        });
        $scope.bill = function() {
            $location.url('/tuan/' + $scope.tuanId + '/bill');
        };

        $scope.status = {
            isopen: false
        };

    }
]);



/** 买单页 */
eatTogetherControllers.controller('TuanBillCtrl', ['$scope', '$routeParams', '$location', 'tuan', '$modal',
    function ($scope, $routeParams, $location, tuan, $modal) {
        $scope.loaded = false;
        $scope.column = 2;
        $scope.tuanId = $routeParams.tuanId;
        tuan.getTuanInfo($scope.tuanId).then(function (res) {
            $scope.user = res.user;
            $scope.name = res.name;
            $scope.members = res.members;
            $scope.curTotal = res.members.length;
            $scope.notMember = 0;
            $scope.numberErr = false;
            $scope.abMode = false;
            $scope.all = true;
            $scope.members.forEach(function(member) {
                member.avatarBg = {
                    'background-image' : 'url(' + member.headimgurl + ')'
                };
                member.moneyBgc = {
                    'background' : (member.sex === 1 ? '#A3B1CF' : 'rgb(240, 188, 240)')
                };
                member.inThis = true;
                member.moneySpent = 0;
            });
            $scope.loaded = true;
            $scope.selectAll = function () {
                $scope.members.forEach(function (member) {
                    member.inThis = $scope.all;
                });
                if ($scope.all === true) {
                    $scope.curTotal = $scope.members.length;
                } else {
                    $scope.curTotal = 0;

                }

            };
            $scope.changeMember = function () {
                var tmp = 0;
                $scope.members.forEach(function (member) {
                    if (member.inThis) tmp++;
                });
                $scope.curTotal = tmp;
                if (tmp === $scope.members.length) {
                    $scope.all = true;
                } else {
                    $scope.all = false;
                }
                $scope.average = $scope.totalMoney/( $scope.curTotal +  $scope.notMember);
            };
            $scope.confirm = function () {
                var membersList = $scope.members.filter(function (member) {
                    return member.inThis;
                })
                var members = membersList.map(function (member) {
                    return member.uid;
                });
                var prices = membersList.map(function (member) {
                    return parseFloat(member.moneySpent);
                });
                if ($scope.abMode) {
                    tuan.abupBill($scope.tuanId, members, prices, $scope.totalMoney).then(function(res) {
                        if (res.code === 0) {
                            $location.url('/tuan/' + $scope.tuanId + '/history/' + res.historyId);
                        } else {
                            alert(res.message);
                            $location.url('/tuan/' + $scope.tuanId + '/members/');
                        }
                    });
                } else {
                    tuan.bill($scope.tuanId, members, $scope.notMember, $scope.totalMoney).then(function(res) {
                        $location.url('/tuan/' + $scope.tuanId + '/members/');
                    });
                }
            };
            $scope.cancel = function () {
                    $location.url('/tuan/' + $scope.tuanId + '/members/');
            };
            $scope.setMoney = function (member) {
                if (!$scope.abMode) return;
                // 注意！！： 使用的ui-bootstrapjs有更改 解决ngTouch导致的modal内input失效
                // @ref: https://github.com/angular-ui/bootstrap/issues/2280
                var modalInstance = $modal.open({
                    templateUrl: '../html/modals/setMoney.html',
                    controller: 'setMoneyModal',
                    size: 'lg',
                    resolve: {
                        money: function () {
                            return member.moneySpent;
                        }
                    }
                });

                modalInstance.result.then(function (money) {
                    member.moneySpent = money;
                }, function () {
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
            $scope.newSlogan = res.slogan;
            $scope.loaded = true;
        });

        $scope.save = function () {
            if ($scope.newName === $scope.name && $scope.newSlogan === $scope.slogan) return;
            tuan.modTuanInfo($scope.id, {
                name : $scope.newName,
                slogan : $scope.newSlogan
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
eatTogetherControllers.controller('TuanHistoryCtrl', ['$scope', '$routeParams', 'tuan', '$location',
    function ($scope, $routeParams, tuan, $location) {
        $scope.loaded = false;
        $scope.column = 4;
        $scope.tuanId = $routeParams.tuanId;
        tuan.getTuanHistory($scope.tuanId, 0, 100)
        .then(function (res) {
            $scope.histories = res;
            $scope.loaded = true;
        });

        $scope.leftMoveStyle = {
          'left' : '0'
        };
        $scope.goTop = function () {
            document.body.scrollTop = 0;
        };
        $scope.swipeLeft = function (enableRevert, $event) {
            if (enableRevert) {
                if ($scope.leftMoveStyle.left === '-50px') return;
                var deltaX = Math.abs($event.deltaX);
                if (deltaX > 50 ) {
                    $scope.leftMoveStyle = {
                        'left' : '-50px'
                    };

                } else {
                    $scope.leftMoveStyle = {
                        'left' : - deltaX + 'px'
                    };
                }
                // console.log('left', $event.deltaX);

            }
        };
        $scope.swipeRight = function (enableRevert, $event) {
            if (enableRevert) {
                var deltaX = Math.abs($event.deltaX);
                if ($scope.leftMoveStyle.left === 0) return;
                if (deltaX > 50) {
                    $scope.leftMoveStyle = {
                        left : 0
                    }
                } else {
                    $scope.leftMoveStyle = {
                        left : (- 50 + deltaX) + 'px'
                    }
                }
            }
        };
        $scope.revert = function ( history) {
            tuan.revertHistory($scope.tuanId, history.id).then(function (res) {
                history.deleted = true;
            });
        };
        $scope.goDetail = function (history) {
            if (history.type < 10) return;
            $location.url('/tuan/' + $routeParams.tuanId + '/history/' + history.id);
        };
        $scope.bill = function() {
            $location.url('/tuan/' + $scope.tuanId + '/bill');
        };
    }

]);

/** 饭团历史详情 */

eatTogetherControllers.controller('TuanHistoryDetailCtrl', ['$scope', '$routeParams', 'tuan', '$location', '$modal',
    function ($scope, $routeParams, tuan, $location, $modal) {
        $scope.loaded = false;
        $scope.column = 4;
        $scope.tuanId = $routeParams.tuanId;
        $scope.historyId = $routeParams.historyId;
        tuan.getHistoryDetail($scope.tuanId, $scope.historyId)
        .then(function (res) {
            angular.extend($scope, res);
            $scope.abMode = $scope.type > 11;
            $scope.members.forEach(function(member) {
                member.avatarBg = {
                    'background-image' : 'url(' + member.headimgurl + ')'
                };
                member.moneyBgc = {
                    'background' : (member.sex === 1 ? '#A3B1CF' : 'rgb(240, 188, 240)')
                };
                member.modMoney = member.money;
            });
            $scope.processbarStyle = {
                'width' : (res.percent * 100 ) + '%'
            };
            $scope.processbarStyleTotal = {
                'width' : (1 - res.percent) * 100 + '%'
            };
            $scope.loaded = true;
        });
        $scope.cancelAbBill = function () {
            tuan.finishABUp($scope.historyId).then(function (res) {
                alert(res.message);
                if (res.code === 0) {
                    $location.url('/tuan/' + $scope.tuanId + '/history');
                }
            });
        };
        $scope.modMoney = function (member) {
            // 注意！！： 使用的ui-bootstrapjs有更改 解决ngTouch导致的modal内input失效
            // @ref: https://github.com/angular-ui/bootstrap/issues/2280
            var modalInstance = $modal.open({
                templateUrl: '../html/modals/setMoney.html',
                controller: 'setMoneyModal',
                size: 'lg',
                resolve: {
                    money: function () {
                        return parseFloat(member.money);
                    }
                }
            });

            modalInstance.result.then(function (money) {
                tuan.modABUpBill($scope.tuanId, $scope.historyId, member.uid, money, member.money).then(function (res) {
                    if (res.code === 0) {
                        $location.url('/tuan/' + $scope.tuanId + '/history/' + $scope.historyId + '?modMoney');
                    } else {
                        alert(res.message);
                    }
                });
            }, function () {
            });
        };
    }

]);