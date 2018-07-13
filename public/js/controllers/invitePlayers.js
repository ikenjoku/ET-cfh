/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0, no-var: 0,
vars-on-top: 0, require-jsdoc: 0 */

angular.module('mean.system')
  .controller('InvitePlayersController', ['$scope', '$http', 'game', function ($scope, $http, game) {
    $scope.hasServerError = false;
    $scope.searchKey = '';
    $scope.disableInviteButton = false;
    $scope.selectedUser = {};
    $scope.showNotFound = false;
    $scope.foundUsers = [];
    $scope.invitedUsers = [];
    $scope.dobounceTimeout = null;
    $scope.searchHelper = 'At least 3 letters are needed for this search';
    var token = localStorage.getItem('#cfhetusertoken');

    $scope.fewPlayersModal = function () {
      var refusableModel = $('#reuse-modal');
      $('.modal-header').empty();
      refusableModel.find('.modal-header').append('<h4 class="modal-title center-align" style="color: #23522d;">3 PLAYERS REQUIRED</h4>');
      refusableModel.find('.modal-body').text('This game requires a minimum of 3 players. Please invite more friends to play');
      var okayBtn = '<button type="button" class="btn waves-effect waves-green modal-close" style="background-color: #23522d;" >OKAY</button>';
      $('.modal-footer').empty();
      $('.modal-footer').append(okayBtn);
      $('#reuse-modal').modal('open');
    };

    $scope.morePlayersModal = function () {
      var refusableModel = $('#reuse-modal');
      $('.modal-header').empty();
      refusableModel.find('.modal-header').append('<h4 class="modal-title center-align" style="color: #23522d;">MAX NUMBER OF PLAYERS</h4>');
      $('.modal-body').empty();
      refusableModel.find('.modal-body').append('<p>The game cannot take more than 12 players.</p> <p>Game has started already. You have been added to a new game</p>');
      var okayBtn = '<button type="button" class="btn waves-effect waves-green modal-close" style="background-color: #23522d;" >OKAY</button>';
      $('.modal-footer').empty();
      $('.modal-footer').append(okayBtn);
      $('#reuse-modal').modal('open');
    };

    $scope.closeReusedModal = function () {
      $('#reuse-modal').modal('close');
      game.isFilledUp = null;
    };

    $scope.findUsers = function () {
      return $http.get(`/api/users/findUsers/${$scope.searchKey}`, { headers: { Authorization: `Bearer ${token}` } }).then(function (response) {
        $scope.foundUsers = response.data.users;
        $scope.showNotFound = $scope.foundUsers.length === 0 && $scope.searchKey.length > 0;
        return response.data.users;
      }, function (error) {
        $scope.searchHelper = error.data;
        $scope.hasServerError = true;
        return error.data;
      });
    };

    $scope.sendInvitation = function (user) {
      $scope.selectedUser = user;
      $scope.disableInviteButton = true;
      var url = window.location.href;

      var formData = {
        user,
        link: url,
      };

      return $http.post('/api/users/invite', formData, { headers: { Authorization: `Bearer ${token}` } }).then(function (response) {
        $scope.invitedUsers.push(response.data.user.email);
        $scope.disableInviteButton = false;
        $scope.selectedUser = {};
        return response.data.user;
      }, function (error) {
        $scope.searchHelper = error.data.message;
        $scope.hasServerError = true;
        return error;
      });
    };
  }]);
