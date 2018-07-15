/* eslint prefer-arrow-callback: 0, no-var: 0, func-names: 0, no-undef: 0, require-jsdoc: 0 */
describe('Directive: Profile', function () {
  let compile, element, $scope, httpBackend;

  beforeEach(module('mean.system'));
  beforeEach(module('/views/profile.html'));

  function getCompiledElement() {
    var customDirective = angular.element('<profile-page></profile-page>');
    var compiledElement = compile(customDirective)($scope);
    $scope.$digest();
    return compiledElement;
  }

  beforeEach(inject(function ($compile, $rootScope, $httpBackend) {
    compile = $compile;
    $scope = $rootScope.$new();
    httpBackend = $httpBackend;
    httpBackend.whenGET('/api/profile')
      .respond(201, { data: {} });
    $scope.currentUser = { name: 'Hasstrup Ezekiel', email: 'hasstrup@email.com' };
    $scope.currentUser.gamesWon = [
      {
        gameWinner:
            {
              name: 'hasstrup',
              _id: 12
            },
        players: [{}, {}]
      }
    ];
    $scope.currentUser.games = [
      {
        gameWinner:
              {
                name: 'hasstrup',
                _id: 12
              },
        players: [{}, {}]
      },
      {
        gameWinner: { name: 'test' },
        players: [{}, {}]
      }
    ];
    element = getCompiledElement();
  }));

  it('should contain a div showing the name of the user and the details', function () {
    target = element[0].querySelector('.user-name');
    expect(element[0].querySelector('.user-name').innerText).toEqual('Hasstrup Ezekiel');
    expect(element[0].querySelector('.user-email').innerText).toEqual('hasstrup@email.com');
  });

  it('should show the number of games played and the games won', function () {
    expect(Array.from(element[0].getElementsByClassName('games-inner-text-b'))[0].innerText).toEqual('2');
    expect(element[0].getElementsByClassName('games-inner-text-b')[1].innerText).toEqual('1');
  });

  it('should show two game cards', function () {
    expect(element[0].querySelectorAll('.game-card').length).toEqual(2);
  });
});
