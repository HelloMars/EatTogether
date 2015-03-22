
angular.module('eatTogetherControllers').controller('changeNameModal', function ($scope, $modalInstance, oldName) {
    $scope.getFocus = function () {
        document.querySelector('#nameInput').focus();
    };
    $scope.newNickname = oldName;

    $scope.ok = function () {
        $modalInstance.close($scope.newNickname);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});