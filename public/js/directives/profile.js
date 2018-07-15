
/* eslint prefer-arrow-callback: 0, no-var: 0, func-names: 0 */

/**
 *
 * @param {*} $scope the current scope of the application. instance of _rootScope_
 * @param {*} $http  $http Service provided by angular
 * @description this is the controller that supplies data to the profile page
 * @returns {null} returns null
 */
function ProfileController($scope, $http) {
  const ctrl = this;

  const placeholder = 'https://assets.hotukdeals.com/assets/img/profile-placeholder_f56af.png';

  ctrl.Init = function () {
    const token = localStorage.getItem('#cfhetusertoken');
    if (!token) return;
    $http.get('/api/profile', { headers: { Authorization: token } })
      .then(function (response) {
        $scope.currentUser = response.data.data;
        $scope.currentUser.avatar = $scope.currentUser.avatar || placeholder;
        $scope.games = response.data.data.games;
        $scope.gamesWon = response.data.data.gamesWon;
      }, function () {});
  };

  $scope.generateDate = function (item) {
    // disabling this because moment will be made available from the script tag
    /* eslint-disable-next-line no-undef */
    return moment(new Date(item.createdAt)).fromNow();
  };

  $scope.hideModal = function () {
    document.getElementsByClassName('profile-container')[0].style.display = 'none';
  };

  ctrl.Init();
}
angular.module('mean.system')
  .controller('ProfileController', ['$scope', '$http', ProfileController])
  .directive('profilePage', function () {
    return {
      restrict: 'EA',
      templateUrl: '/views/profile.html',
      controller: 'ProfileController'
    };
  });
