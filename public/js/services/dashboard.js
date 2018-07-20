/* eslint prefer-arrow-callback: 0, func-names: 0 */
angular.module('mean.system')
  .factory('DashboardService', ['$http', function DashboardService($http) {
    const token = localStorage.getItem('#cfhetusertoken');
    return {
      leaderBoard: function leaderboard() {
        return $http.get('/api/leaderboard', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(function (response) {
            return response.data;
          }, function (error) {
            throw error;
          });
      },
      gameLog: function gameLog() {
        return $http.get('/api/games/history', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(function (response) {
            return response.data;
          }, function (error) {
            throw error;
          });
      }
    };
  }]);
