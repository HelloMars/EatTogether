/**
 * Created by Meng on 2015/2/3.
 */

(function(){
    var eatTogether = angular.module("EatTogether",[
        'ngRoute',
        'eatTogetherControllers'
    ]);
    eatTogether.run(function() {
        AV.initialize("vk84p7j0sizwl03zgvb3y1eg6z7klbs97hrgock7ilfascaf",
            "pxbvfffu8uli2tcld6sg9pgfouoq1fbse6l4bf0xt1ukaqrq");
    });

    eatTogether.config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.
                when('/tuan', {
                    templateUrl: './html/tuanlist.html',
                    controller: 'TuanListCtrl'
                }).
                when('/tuan/:tuanId', {
                    templateUrl: './html/tuanlist.html',
                    controller: 'TuanDetailCtrl'
                }).
                otherwise({
                    redirectTo: '/tuan'
                });
        }]);
})();