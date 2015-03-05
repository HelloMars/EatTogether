angular.module('tuanFilters', []).filter('checkNaN', function() {
  return function(input) {
    return isNaN(input) ? 0 : input;
  };
});