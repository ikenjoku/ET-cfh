angular.module('mean.system')
  .controller('ScrollController', ['$scope', '$location', '$anchorScroll',
    ($scope, $location, $anchorScroll) => {
      $scope.goPlay = () => {
        $location.hash('play');
        $anchorScroll();
      };
    }]);
