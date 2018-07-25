/* eslint prefer-arrow-callback: 0, no-var: 0,
func-names: 0, no-undef: 0, prefer-const: 0, require-jsdoc: 0 */
describe('Controller: Profile', function () {
  let $scope, profilecontroller, controller, mockApireq, $httpBackend;

  mockApireq = function () {
    return {
      execute(a, b, callback) {
        return callback({ token: 'Thisisatesttoken' });
      }
    };
  };
  mockUpload = {
    upload() {
      return {
        data: { url: 'url' }
      };
    }
  };

  beforeEach(module('mean.system'));

  beforeEach(inject(function (_$controller_, _$rootScope_, _$location_) {
    // assining providers to global scope
    $scope = _$rootScope_.$new();
    $location = _$location_;
    controller = _$controller_;
    controller('AuthController', {
      $scope,
      $resource: mockApireq,
      $location,
      Upload: mockUpload,
      friend: {
        addToRoom() {}
      },
      cloudinary: {}

    });
    $scope.SignUpUser();
  }));

  beforeEach(inject(function (_$httpBackend_) {
    $httpBackend = _$httpBackend_;
    profilecontroller = controller('ProfileController', {
      $scope
    });
  }));

  beforeEach(function () {
    $httpBackend.whenGET('/api/profile')
      .respond(201, {
        data: {
          _id: 123,
          name: 'Hasstrup.ezekiel',
          games: [
            {
              _id: 123,
              name: 'Hasstrup.ezekiel'
            },
            {
              _id: 12345,
              name: 'Hasstrups Ezekiel'
            },
          ],
          gamesWon: [
            {
              _id: 123,
              players: [{ _id: 123, name: 'test.user' }],
              gameWinner: { _id: 123 }
            }
          ]
        }
      });
  });

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });


  it('Should fetch the user profile containing the user profile and the games gotten', function () {
    profilecontroller.Init();
    $httpBackend.flush();
    expect($scope.currentUser.name).toEqual('Hasstrup.ezekiel');
    expect($scope.currentUser.games.length).toEqual(2);
  });
});
