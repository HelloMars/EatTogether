(function(){
    var eatTogether = angular.module("EatTogether",[]);
    eatTogether.run(function() {
        AV.initialize("vk84p7j0sizwl03zgvb3y1eg6z7klbs97hrgock7ilfascaf",
            "pxbvfffu8uli2tcld6sg9pgfouoq1fbse6l4bf0xt1ukaqrq");
    });

    eatTogether.controller('TuanListCtrl', function ($scope, $http) {
        $http.get('hello').success(function(tuans) {
            tuans = [
                {'name': '一蛋', 'members': 5, 'news': 1},
                {'name': '建团', 'members': 10, 'news': 0},
                {'name': '入团', 'members': 10, 'news': 0}
            ];
            $scope.list = [];
            tuans.forEach(function(tuan) {
                var len = tuan.members*10+50;
                var entry = {'name':tuan.name,
                    'div1':"{'width':'"+len*1.2+"px', 'height':'"+len*1.2+"px'}",
                    'div2':"{'width':'"+len+"px', 'height':'"+len+"px','background':'#FF8040',\
                    'text-align':'center', 'vertical-align':'middle', 'line-height':'"+len+"px',\
                    'font-size':'"+(tuan.members*2+15)+"px', 'text-shadow':'0 0 3px #000000', 'margin': '0 auto'}"};
                $scope.list.push(entry);
            });
        });

    });

    $('.ball div').mouseover(function(e){
        var oWidth = $(this).width();
        var oHeight = $(this).height();
        $(this).css({
            width: oWidth * 1.2,
            height : oHeight * 1.2
        });
    }).mouseout(function (e) {
        var oWidth = $(this).width();
        var oHeight = $(this).height();
        $(this).css({
            width: oWidth / 1.2,
            height : oHeight / 1.2
        });
    });
})();