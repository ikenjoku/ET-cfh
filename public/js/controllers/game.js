/* eslint prefer-arrow-callback: 0, func-names: 0 */
angular.module('mean.system')
  .controller('GameController', ['$scope', '$http', '$q', 'game', 'socket', '$timeout', '$location', 'MakeAWishFactsService', '$dialog', '$rootScope', function ($scope, $http, $q, game, socket, $timeout, $location, MakeAWishFactsService) {
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.modalShown = false;
    $scope.region = '';
    $scope.game = game;
    $scope.custom = $location.search().game;
    $scope.MessageInput = '';
    $scope.pickedCards = [];
    $scope.messages = [];
    $scope.notificationCount = 0;
    let makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();

    $scope.pickCard = function (card) {
      if (!$scope.hasPickedCards) {
        if ($scope.pickedCards.indexOf(card.id) < 0) {
          $scope.pickedCards.push(card.id);
          if (game.curQuestion.numAnswers === 1) {
            $scope.sendPickedCards();
            $scope.hasPickedCards = true;
          } else if (game.curQuestion.numAnswers === 2
            && $scope.pickedCards.length === 2) {
            // delay and send
            $scope.hasPickedCards = true;
            $timeout($scope.sendPickedCards, 300);
          }
        } else {
          $scope.pickedCards.pop();
        }
      }
    };

    $scope.pointerCursorStyle = function () {
      if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
        return { cursor: 'pointer' };
      }
      return {};
    };

    $scope.sendPickedCards = function () {
      game.pickCards($scope.pickedCards);
      $scope.showTable = true;
    };

    $scope.cardIsFirstSelected = function (card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
      }
      return false;
    };

    $scope.cardIsSecondSelected = function (card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
      }
      return false;
    };

    $scope.firstAnswer = function ($index) {
      if ($index % 2 === 0 && game.curQuestion.numAnswers > 1) {
        return true;
      }
      return false;
    };

    $scope.secondAnswer = function ($index) {
      if ($index % 2 === 1 && game.curQuestion.numAnswers > 1) {
        return true;
      }
      return false;
    };

    $scope.showFirst = function (card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;
    };

    $scope.showSecond = function (card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;
    };

    $scope.isCzar = function () {
      return game.czar === game.playerIndex;
    };

    $scope.isPlayer = function ($index) {
      return $index === game.playerIndex;
    };

    $scope.isCustomGame = function () {
      return !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';
    };

    $scope.isPremium = function ($index) {
      return game.players[$index].premium;
    };

    $scope.currentCzar = function ($index) {
      return $index === game.czar;
    };

    $scope.winningColor = function ($index) {
      if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
        return $scope.colors[game.players[game.winningCardPlayer].color];
      }
      return '#f9f9f9';
    };

    $scope.pickWinning = function (winningSet) {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = function () {
      return game.winningCard !== -1;
    };


    $scope.fewPlayersModal = function () {
      const reusableModel = $('#reuse-modal');
      $('.modal-header').empty();
      reusableModel.find('.modal-header').append('<h4 class="modal-title center-align" style="color: #23522d;">3 PLAYERS REQUIRED</h4>');
      reusableModel.find('.modal-body').text('This game requires a minimum of 3 players. Please invite more friends to play');
      const okayBtn = '<button type="button" class="btn waves-effect waves-green modal-close" id="play-chioce-btn">OKAY</button>';
      $('.modal-footer').empty();
      $('.modal-footer').append(okayBtn);
      $('#reuse-modal').modal('open');
    };

    $scope.morePlayersModal = function () {
      const reusableModel = $('#reuse-modal');
      $('.modal-header').empty();
      reusableModel.find('.modal-header').append('<h4 class="modal-title center-align" style="color: #23522d;">MAX NUMBER OF PLAYERS</h4>');
      $('.modal-body').empty();
      reusableModel.find('.modal-body').append('<p>The game cannot take more than 12 players.</p> <p>Game has started already. You have been added to a new game</p>');
      const okayBtn = '<button type="button" class="btn waves-effect waves-green modal-close"  id="play-chioce-btn">OKAY</button>';
      $('.modal-footer').empty();
      $('.modal-footer').append(okayBtn);
      $('#reuse-modal').modal('open');
    };

    $scope.$watch('game.userExist', function () {
      if (game.userExist) {
        const reusableModel = $('#reuse-modal');
        $('.modal-header').empty();
        reusableModel.find('.modal-header').append('<h4 class="modal-title center-align" style="color: #23522d;">You Cannot Join A Game Twice</h4>');
        $('.modal-body').empty();
        reusableModel.find('.modal-body').append('<p>You have already joined this game</p>');
        const okayBtn = '<a href="/" class="btn" style="background-color: #23522d;">OKAY</a>';
        $('.modal-footer').empty();
        $('.modal-footer').append(okayBtn);
        $('#reuse-modal').modal('open');
      }
    });

    $scope.startGame = function () {
      if (game.players.length < game.playerMinLimit) {
        $scope.fewPlayersModal();
      } else {
        $('#region-modal').modal('open');
      }
    };

    $scope.startGameWithRegion = function () {
      game.startGame($scope.region);
    };

    $scope.beginRound = function () {
      game.beginRound();
    };

    $scope.shuffleCards = function (e) {
      if ($scope.isCzar()) {
        const card = $(`#${e.target.id}`);
        card.addClass('animated flipOutY');
        setTimeout(() => {
          $scope.beginRound();
          card.removeClass('animated flipOutY');
          $('#czarSelectCard').modal('close');
        }, 700);
      }
    };

    // Watches for a new players where game has started already
    $scope.$watch('game.isFilledUp', function () {
      if (game.isFilledUp) {
        $scope.morePlayersModal();
      }
    });

    $scope.abandonGame = function () {
      game.leaveGame();
      $location.path('/');
    };
    // Catches changes to round to update when no players pick card
    // (because game.state remains the same)
    $scope.$watch('game.round', function () {
      $scope.hasPickedCards = false;
      $scope.showTable = false;
      $scope.winningCardPicked = false;
      $scope.makeAWishFact = makeAWishFacts.pop();
      if (!makeAWishFacts.length) {
        makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      }
      $scope.pickedCards = [];
    });

    // function called when the send button is pressed;
    $scope.SendMessage = function () {
      // emoji target is the message the user inputed + any emojis used
      const emojiTarget = document.getElementsByClassName('emojionearea-editor').length ? document.getElementsByClassName('emojionearea-editor')[0].innerHTML : $scope.MessageInput;
      if (!emojiTarget.length) return;
      const str = `<div id="chat-box-content" style="align-self: flex-end; background-color: #ABEBC6;">
      <div style="background-color: #ABEBC6;">
        <p id="user-name"></p>
        <p id="user-message" style="color: white;">${emojiTarget}</p>
      </div>
    </div>`;
      const html = $.parseHTML(str);
      const target = $('#chat-box-content-container');
      target.append(html);
      if (document.getElementsByClassName('emojionearea-editor').length) {
        document.getElementsByClassName('emojionearea-editor')[0].innerHTML = '';
      }
      $scope.MessageInput = '';
      game.dispatchMessage(emojiTarget);
    };
    // determines when to show the chat;
    $scope.$watch('game.openChatLog', function () {
      $scope.renderChatLog = game.openChatLog;
    });

    socket.on('incoming-message', function () {
      if (document.getElementById('chat-box').style.height !== '450px') {
        $scope.notificationCount += 1;
      }
    });

    // In case player doesn't pick a card in time, show the table
    $scope.$watch('game.state', function () {
      if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
        $scope.showTable = true;
      }
      if ($scope.isCzar() && game.state === 'czar picks card') {
        $('#czarSelectCard').modal('open');
      }
      if (game.state === 'game dissolved') {
        $('#czarSelectCard').modal('close');
      }
    });

    $scope.$watch('game.gameID', function () {
      if (game.gameID && game.state === 'awaiting players') {
        if (!$scope.isCustomGame() && $location.search().game) {
          // If the player didn't successfully enter the request room,
          // reset the URL so they don't think they're in the requested room.
          $location.search({});
        } else if ($scope.isCustomGame() && !$location.search().game) {
          // Once the game ID is set, update the URL if this is a game with friends,
          // where the link is meant to be shared.
          $location.search({ game: game.gameID });
          if (!$scope.modalShown) {
            setTimeout(function () {
              const link = document.URL;
              const txt = 'You can send the link below to your friends to join the game. Your friends do not have to be signed in to join.';
              $('#lobby-how-to-play').text(txt);
              $('#oh-el').css({
                'text-align': 'center', 'font-size': '22px', background: 'white', color: 'black'
              }).text(link);
            }, 200);
            $scope.modalShown = true;
          }
        }
      }
    });

    $scope.toggleChatbox = function () {
      const toggleDiv = document.getElementById('chat-box');
      if (toggleDiv.style.height === '450px') {
        toggleDiv.style.height = '50px';
      } else {
        toggleDiv.style.height = '450px';
        $scope.notificationCount = 0;
      }
    };


    if ($('#chat-input').emojioneArea) {
      $(document).ready(function () {
        $('#chat-input').emojioneArea({
          standalone: false,
          inline: true,
          placeholder: 'Press enter to send a message',
          filtersPosition: 'bottom',
          events: {
            keydown(_, e) {
              if (e.keyCode === 13) return $scope.SendMessage();
            }
          },
          filters: {
            symbols: false,
            flags: false
          }
        });
      });
    }

    if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
      game.joinGame('joinGame', $location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame', null, true);
    } else {
      game.joinGame();
    }
  }]);
