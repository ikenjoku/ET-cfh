/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */
describe('AuthController', function () {
  let $scope, $location, controller;
  beforeEach(module('mean.system'));
  mockApireq = function () {
    return {
      execute(a, b, callback) {
        return callback({ token: 'Thisisatesttoken' });
      }
    };
  };
  beforeEach(inject(function (_$controller_, _$rootScope_, _$location_) {
    // assining providers to global scope
    $scope = _$rootScope_.$new();
    $location = _$location_;
    controller = _$controller_;
    controller('AuthController', {
      $scope,
      $resource: mockApireq,
      $location
    });
  }));

  it('Should sign up the user successfully, setting the token to local storage ater', function () {
    $scope.newUser = { name: 'Test User', email: 'test@test', password: 'test123' };
    $scope.SignUpUser();
    const token = localStorage.getItem('#cfhetusertoken');
    expect(token).toEqual('Thisisatesttoken');
    expect($location.path()).toBe('/app');
  });

  it('Should log in the user with the successful data then set the returning token to local storage', function () {
    $scope.user = { name: 'Test User', email: 'test@test', password: 'test123' };
    // listen for calls to the api
    $scope.SignInUser();
    const token = localStorage.getItem('#cfhetusertoken');
    // check the token now
    expect(token).toEqual('Thisisatesttoken');
    expect($location.path()).toBe('/app');
  });
});
