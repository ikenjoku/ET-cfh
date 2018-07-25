/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0, no-var: 0,
vars-on-top: 0, require-jsdoc: 0 */

angular.module('mean.system')
  .controller('FriendsController', ['$scope', '$http', 'socket', function ($scope, $http, socket) {
    $scope.friends = [];
    $scope.friendRequests = [];
    $scope.friendRequestsLength = 0;
    $scope.isLoading = true;
    $scope.gameAddress = '';
    $scope.selectedUser = {};
    const token = localStorage.getItem('#cfhetusertoken');
    const userId = localStorage.getItem('#cfhetUserId');
    const modal = $('#modal3');
    const popupModal = $('#modal4');

    $scope.acceptFriend = function (user) {
      $scope.selectedUser = user;
      $http.put(`/api/user/accept/${userId}`, { id: user._id }, { headers: { Authorization: `Bearer ${token}` } }).then(function () {
        $scope.selectedUser = {};
        $scope.friendRequestsLength -= 1;
        $scope.friendRequests = $scope.friendRequests.filter(x => x._id !== user._id);
        $scope.friends.push(user);
        return user;
      }, function (error) {
        $scope.selectedUser = {};
        return error.data;
      });
    };

    $scope.declineRequest = function (user) {
      $scope.selectedUser = user;
      $http.put(`/api/user/decline/${userId}`, { id: user._id }, { headers: { Authorization: `Bearer ${token}` } }).then(function () {
        $scope.selectedUser = {};
        $scope.friendRequestsLength -= 1;
        $scope.friendRequests = $scope.friendRequests.filter(x => x._id !== user._id);
        return user;
      }, function (error) {
        $scope.selectedUser = {};
        return error.data;
      });
    };

    $scope.unfriend = function (user) {
      $scope.selectedUser = user;
      return $http.put(`/api/user/unfriend/${userId}`, { id: user._id }, { headers: { Authorization: `Bearer ${token}` } }).then(function () {
        $scope.friends = $scope.friends.filter(x => x._id !== user._id);
        $scope.selectedUser = {};
        return user;
      }, function (error) {
        $scope.selectedUser = {};
        return error.data;
      });
    };

    socket.on('friendSaved', function () {
      $scope.friendRequestsLength += 1;
    });

    socket.on('popup-invitation-modal', function (data) {
      $scope.gameAddress = data;
      popupModal.modal('open');
    });

    $scope.showFriendsModal = function () {
      modal.modal('open');
      $scope.isLoading = true;
      return $http.get(`/api/user/friends/${userId}`, { headers: { Authorization: `Bearer ${token}` } }).then(function (response) {
        $scope.isLoading = false;
        $scope.friends = response.data.friends;
        $scope.friendRequests = response.data.friendRequests;
        return response.data;
      }, function (error) {
        $scope.isLoading = false;
        return error.data;
      });
    };

    const init = function () {
      if (userId) {
        $http.get(`/api/user/getRequestCount/${userId}`, { headers: { Authorization: `Bearer ${token}` } }).then(function (response) {
          $scope.friendRequestsLength = response.data.length;
        },
        function (error) {
          return error;
        });
      }
    };

    init();
  }]);
