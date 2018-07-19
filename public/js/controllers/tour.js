/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0, no-var: 0,
vars-on-top: 0, require-jsdoc: 0 */

angular.module('mean.system')
  .controller('TourController', ['$scope', '$http', function ($scope, $http) {
    var token = localStorage.getItem('#cfhetusertoken');

    $scope.closeTourModal = function () {
      $('#tour-modal').modal('close');
      $scope.updateTour();
    };

    const steps = [
      {
        intro: 'Welcome to the gaming screen for Cards for Humanity. This tour will give you a brief introduction to how to play the game.',
      },
      {
        element: document.querySelector('#player'),
        intro: 'Here are the instructions on how to play the game. If you are an authenticated user, you have the option to invite friends to play with you.',
        position: 'top',
      },
      {
        intro: 'Click on the abandon game button if you want to abandon a game. And the take a tour button if you would like to take a tour again.',
        position: 'left'
      },
      {
        element: document.querySelector('#timer-container'),
        intro: 'Here is the timer. It counts down from 20s when choosing a card, from 15s when the Czar is making a decision and 4s when another round is about to begin.',
        position: 'right'
      },
      {
        element: document.querySelector('#social-bar-container'),
        intro: 'Here is a display of all the players that are part of the game. You can also see each person score during the game.',
        position: 'bottom'
      },
      {
        element: document.querySelector('#social-bar-container'),
        intro: 'An icon besides the score is used to show that the card is yours.',
        position: 'right'
      },
      {
        element: document.querySelector('#social-bar-container'),
        intro: 'A Czar text will appear under the score text to identify who the czar is.',
        position: 'right'
      },
      {
        element: document.querySelector('#question-container-outer'),
        intro: 'This shows you how many players have joined the game. You can click on the start game icon when the number of players is at least 3.',
        position: 'bottom'
      },
      {
        element: document.querySelector('#question-container-outer'),
        intro: 'The questions are displayed here also as well as the final answer when Czar makes a choice.',
        position: 'bottom'
      },
      {
        element: document.querySelector('#player'),
        intro: 'When a game is in session, a deck of 10 answer cards is displayed here for you to pick from if you not the Czar.',
        position: 'top',
      },
      {
        element: document.querySelector('#player'),
        intro: 'If you are the Czar, some Make-a-Wish facts will be displayed to you while you wait for others to chose their answers.',
        position: 'top',
      },
      {
        element: document.querySelector('#player'),
        intro: 'At the end of the game, a donation link is provided for you to make a donation to Make-a-Wish foundation if you want to.',
        position: 'top',
      },
      {
        intro: 'You can also chat with other players will the game is on with this chatbox. Simply click on the chatbox to toggle it open or close.',
        position: 'top',
      },
      {
        element: document.querySelector('#question-container-outer'),
        intro: 'You can click on the start game icon if the number of players is at least 3 to start the game.',
        position: 'bottom'
      },
    ];

    $scope.tour = function () {
      const intro = introJs();
      intro.setOptions({
        steps,
        exitOnOverlayClick: false
      });
      intro.start();
    };

    $scope.takeNewUserTour = function () {
      $scope.tour();
      $scope.updateTour();
    };

    $scope.takeGeneralTour = function () {
      $scope.tour();
    };

    $scope.updateTour = function () {
      const id = localStorage.getItem('#cfhetUserId');
      return $http.post(`/api/tour/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then(function () {
        localStorage.setItem('#cfhuseristourtaken', true);
      }, function (error) {
        return error;
      });
    };
  }]);
