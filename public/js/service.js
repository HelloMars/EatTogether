var tuanService = angular.module('tuanService', []);

tuanService.factory('tuan', ['$http',
    function($http) {

        var SERVER = 'http://' + location.host + '/';

        var ec = encodeURIComponent;

        return {
            getAll : getAll,
            getTuanInfo : getTuanInfo,
            getTuanHistory : getTuanHistory,

            getHistoryDetail : getHistoryDetail,

            createTuan : createTuan,

            joinTuan : joinTuan,

            quitTuan : quitTuan,

            modTuanInfo : modTuanInfo,

            getUserHistory : getUserHistory,

            setUserName : setUserName,

            bill: bill,

            abupBill: abupBill,

            modABUpBill: modABUpBill,

            finishABUp: finishABUp,

            abdownBill: abdownBill,

            revertHistory: revertHistory,

            getJsConfig: getJsConfig
        };

        /**
         * ----------------------------------------
         * 通用handler
         */
        function handleError(response) {
            return ($q.reject(response.data.message));
        }

        function handleSuccess(response) {
            return (response.data);
        }

        /** 获取团列表 */
        function getAll () {
            var request = $http({
                url: wrapUrl('tuanlist'),
                method: 'GET',
                params: {}
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 获取单个团信息 */
        function getTuanInfo(id) {
            var request = $http({
                url: wrapUrl('tuandetail'),
                method: 'GET',
                params: {
                    id : id
                }
            });

            return (request.then(handleSuccess, handleError));

        }

        /** 获取单个团历史 */
        function getTuanHistory (id, start, length) {
            var request = $http({
                url: wrapUrl('tuanhistory'),
                method: 'GET',
                params: {
                    id : id,
                    start: start,
                    length: length
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 获取历史详情 */
        function getHistoryDetail (tuanId, historyId) {
            var request = $http({
                url: wrapUrl('historyDetail'),
                method: 'GET',
                params: {
                    id : tuanId,
                    historyId : historyId
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 创建团 */
        function createTuan () {
            var request = $http({
                url: wrapUrl('createtuan'),
                method: 'GET',
                params: {}
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 入团 */
        function joinTuan (id) {
            var request = $http({
                url: wrapUrl('jointuan'),
                method: 'GET',
                params: {
                    id : id
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 退团 */
        function quitTuan (id) {
            var request = $http({
                url: wrapUrl('quittuan'),
                method: 'GET',
                params: {
                    id : id
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 修改团信息 */
        function modTuanInfo (id, jsonObj) {
            var request = $http({
                url: wrapUrl('modtuaninfo'),
                method: 'POST',
                data: {
                    id : id,
                    info : jsonObj
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 获取用户在该团的简单历史 */
        function getUserHistory (id) {
            var request = $http({
                url: wrapUrl('userhistory'),
                method: 'GET',
                params: {
                    id : id
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 修改用户昵称 */
        function setUserName(nickname) {
            var request = $http({
                url: wrapUrl('setusername'),
                method: 'POST',
                data: {
                    nickname : nickname
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 买单 */
        function bill (id, members, othersnum, price) {
            var request = $http({
                url: wrapUrl('bill'),
                method: 'POST',
                data: {
                    id : id,
                    members : members,
                    othersnum : othersnum,
                    price : price
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 筹款买单 */
        function abupBill (id, members, prices, price) {
            var request = $http({
                url: wrapUrl('abup'),
                method: 'POST',
                data: {
                    id : id,
                    members : members,
                    prices : prices,
                    price : price
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 修改筹款买单成员价格 */
        function modABUpBill (id, historyId, userid, diff) {
            var request = $http({
                url: wrapUrl('modabup'),
                method: 'POST',
                data: {
                    id : id,
                    historyId : historyId,
                    userid : userid,
                    diff : diff
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 结束筹款买单 */
        function finishABUp (historyId) {
            var request = $http({
                url: wrapUrl('finishabup'),
                method: 'POST',
                data: {
                    historyId : historyId
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 分配买单 */
        function abdownBill (id, members, prices) {
            var request = $http({
                url: wrapUrl('abdown'),
                method: 'POST',
                data: {
                    id : id,
                    members : members,
                    prices : prices
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 撤销历史记录(目前只支持撤销最近一次消费) */
        function revertHistory (tuanId, historyId) {
            var request = $http({
                url: wrapUrl('revertHistory'),
                method: 'POST',
                data: {
                    'tuanId': tuanId,
                    'historyId': historyId
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 获取 JS Config */
        function getJsConfig () {
            var request = $http({
                url: wrapUrl('jsconfig'),
                method: 'GET',
                params: {}
            });

            return (request.then(handleSuccess, handleError));
        }

        function wrapUrl (path) {
            return SERVER + path + '?t=' + new Date().getTime();
        }
    }
]);