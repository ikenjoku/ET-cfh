angular.module('mean.system')
  .controller('ScrollController', ['$scope', '$location', '$anchorScroll',
    function($scope, $location, $anchorScroll) {
      $scope.goPlay = function() {
        $location.hash('play');
        $anchorScroll();
      };
    }]);
