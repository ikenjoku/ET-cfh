/* eslint prefer-arrow-callback: 0, func-names: 0 */
angular.module('mean.system')
  .factory('friend', ['socket', function (socket) {
    const friend = {};

    friend.dispatchAddFriend = function (payload) {
      socket.emit('new-friend', { user: payload.user, id: payload.senderId });
    };

    friend.dispatchInvitation = function (payload) {
      socket.emit('invite-player', { user: payload.user, link: payload.link });
    };

    friend.addToRoom = function (room) {
      socket.emit('create-room', `room-${room}`);
    };

    return friend;
  }]);
