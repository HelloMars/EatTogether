angular.module('tuanFilters', []).filter('checkAverage', function() {
  return function(input) {
    return !isFinite(input) ? 0 : Math.ceil(input * 100) / 100;
  };
});