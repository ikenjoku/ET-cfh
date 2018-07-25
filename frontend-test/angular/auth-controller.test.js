/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */
describe('AuthController', function () {
  let $scope, $location, controller;
  beforeEach(module('mean.system'));
  mockApireq = function () {
    return {
      execute(a, b, callback) {
        if (typeof b === 'function') return b();
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

  const friend = {
    dispatchAddFriend() {},
    dispatchInvitation() {},
    addToRoom() {},
  };

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
      friend,
      cloudinary: {}
    });
  }));

  it('Should sign up the user successfully, setting the token to local storage ater', function () {
    $scope.newUser = { name: 'Test User', email: 'test@test', password: 'test123' };
    $scope.SignUpUser();
    const token = localStorage.getItem('#cfhetusertoken');
    expect(token).toEqual('Thisisatesttoken');
    expect($location.path()).toBe('/');
  });

  it('Upload function returns a url', function () {
    const img = $scope.uploadImage('file/url');
    expect(img.data.url).toEqual('url');
  });

  it('Should log in the user with the successful data then set the returning token to local storage', function () {
    $scope.user = { name: 'Test User', email: 'test@test', password: 'test123' };
    // listen for calls to the api
    $scope.SignInUser();
    const token = localStorage.getItem('#cfhetusertoken');
    // check the token now
    expect(token).toEqual('Thisisatesttoken');
    expect($location.path()).toBe('/');
  });

  it('Should return false if a user is not logged; token is absence', function () {
    $scope.logOut();
    const token = $scope.checkToken();
    expect(token).toEqual(false);
  });
});
