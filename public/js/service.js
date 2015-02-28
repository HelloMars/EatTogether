var tuanService = angular.module('tuanService', []);

tuanService.factory('tuan', ['$http',
    function($http) {

        var SERVER = 'http://127.0.0.1:3000/';

        var ec = encodeURIComponent;


        return {
            getAll : getAll,
            getTuanInfo : getTuanInfo,
            getTuanHistory : getTuanHistory,

            createTuan : createTuan,

            joinTuan : joinTuan,

            modTuanInfo : modTuanInfo

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
                url: SERVER + 'tuanlist',
                method: 'GET',
                params: {}
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 获取单个团信息 */
        function getTuanInfo(id) {
            var request = $http({
                url: SERVER + 'tuandetail',
                method: 'GET',
                params: {
                    id : id
                }
            });

            return (request.then(handleSuccess, handleError));

        }

        /** 获取单个团历史 */
        function getTuanHistory (argument) {
            // body...
        }

        /** 创建团 */
        function createTuan () {
            return getTuanInfo(1);
        }

        /** 入团 */
        function joinTuan (id) {
            var request = $http({
                url: SERVER + 'tuandetail',
                method: 'GET',
                params: {
                    id : 2,
                    tuanid : id
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 修改团信息 */
        function modTuanInfo (jsonString) {
            //
        }

    }
]);