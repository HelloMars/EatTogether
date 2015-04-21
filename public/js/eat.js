/**
 * Created by Meng on 2015/2/3.
 */

(function(){
    var eatTogether = angular.module("EatTogether",[
        'ngRoute',
        'ngTouch',
        'eatTogetherControllers',
        'tuanService',
        'tuanFilters',
        'ui.bootstrap',
        'angular-gestures'
    ]);
    eatTogether.run(['tuan', function(tuan) {
            AV.initialize("vk84p7j0sizwl03zgvb3y1eg6z7klbs97hrgock7ilfascaf",
                "pxbvfffu8uli2tcld6sg9pgfouoq1fbse6l4bf0xt1ukaqrq");
        }]);


    eatTogether.config(['$routeProvider', 'hammerDefaultOptsProvider',
        function($routeProvider, hammerDefaultOptsProvider) {
            $routeProvider.
                when('/tuan', {
                    templateUrl: './html/list.html',
                    controller: 'TuanListCtrl'
                }).
                when('/tuan/:tuanId/members', {
                    templateUrl: './html/tuanMembers.html',
                    controller: 'TuanMembersCtrl'
                }).
                when('/tuan/:tuanId/history', {
                    templateUrl: './html/tuanHistory.html',
                    controller: 'TuanHistoryCtrl'
                }).
                when('/tuan/:tuanId/history/:historyId', {
                    templateUrl: './html/tuanHistoryDetail.html',
                    controller: 'TuanHistoryDetailCtrl'
                }).
                when('/tuan/:tuanId/home', {
                    templateUrl: './html/tuanIndex.html',
                    controller: 'TuanIndexCtrl'
                }).
                when('/tuan/:tuanId/bill', {
                    templateUrl: './html/tuanBill.html',
                    controller: 'TuanBillCtrl'
                }).
                when('/tuan/:tuanId', {
                    redirectTo: 'tuan/:tuanId/members'
                }).
                otherwise({
                    redirectTo: '/tuan'
                });

            hammerDefaultOptsProvider.set({
                recognizers: [
                    [Hammer.Tap],
                    [Hammer.Press],
                    [Hammer.Pan]
                ]
            });
        }]);

})();