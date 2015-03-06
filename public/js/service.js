var tuanService = angular.module('tuanService', []);

tuanService.factory('tuan', ['$http',
    function($http) {

        var SERVER = 'http://127.0.0.1:3000/';
        if (__local) {
            // 当前环境为「开发环境」，是由命令行工具启动的
            SERVER = 'http://127.0.0.1:3000/';
        } else if(__production) {
            // 当前环境为「生产环境」，是线上正式运行的环境
            SERVER = 'http://eat.avosapps.com/';
        } else {
            // 当前环境为「测试环境」，云代码方法通过 HTTP 头部 X-AVOSCloud-Application-Production:0 来访问；webHosting 通过 dev.xxx.avosapps.com 域名来访问
            SERVER = 'http://dev.eat.avosapps.com/';
        }

        var ec = encodeURIComponent;

        return {
            getAll : getAll,
            getTuanInfo : getTuanInfo,
            getTuanHistory : getTuanHistory,

            createTuan : createTuan,

            joinTuan : joinTuan,

            quitTuan : quitTuan,

            modTuanInfo : modTuanInfo,

            bill: bill,

            requestWriteOff: requestWriteOff,

            verifyWriteOff: verifyWriteOff
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
        function getTuanHistory (id, start, length) {
            var request = $http({
                url: SERVER + 'tuanhistory',
                method: 'GET',
                params: {
                    id : id,
                    start: start,
                    length: length
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 创建团 */
        function createTuan () {
            var request = $http({
                url: SERVER + 'createtuan',
                method: 'GET',
                params: {}
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 入团 */
        function joinTuan (id) {
            var request = $http({
                url: SERVER + 'jointuan',
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
                url: SERVER + 'quittuan',
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
                url: SERVER + 'modtuaninfo',
                method: 'POST',
                data: {
                    id : id,
                    info : jsonObj
                }
            });

            return (request.then(handleSuccess, handleError));
        }

        /** 买单 */
        function bill (id, members, othersnum, price) {
            var request = $http({
                url: SERVER + 'bill',
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

        /** 请求销账 (请求与tuanid里的uid销账) */
        function requestWriteOff (tuanid, uid) {
            var request = $http({
                url: SERVER + 'requestWriteOff',
                method: 'GET',
                params: {
                    tuanid : tuanid,
                    uid : uid
                }
            });

            return (request.then(handleSuccess, handleError));
        }


        /** 确认销账 (确认与tuanid里的uid销账) */
        function verifyWriteOff (tuanid, uid) {
            var request = $http({
                url: SERVER + 'verifyWriteOff',
                method: 'GET',
                params: {
                    tuanid : tuanid,
                    uid : uid
                }
            });

            return (request.then(handleSuccess, handleError));
        }

    }
]);