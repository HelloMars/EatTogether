angular.module('tuanFilters', []).filter('checkFinite', function() {
  return function(input) {
    return !isFinite(input) ? 0 : input;
  };
});