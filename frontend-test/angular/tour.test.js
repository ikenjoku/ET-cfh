/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */
describe('Tour', function () {
  let $scope, $http, $httpBackend, controller;
  beforeEach(module('mean.system'));
  beforeEach(inject(function (_$controller_, _$httpBackend_, _$http_, _$rootScope_) {
    $scope = _$rootScope_.$new();
    $http = _$http_;
    controller = _$controller_;
    $httpBackend = _$httpBackend_;
    controller('TourController', {
      $scope,
      $http
    });
  }));

  beforeEach(function () {
    const store = {};
    spyOn(localStorage, 'getItem').and.callFake(function (key) {
      return store[key];
    });
    spyOn(localStorage, 'setItem').and.callFake(function (key, value) {
      store[key] = `${value}`;
      return store[key];
    });
    localStorage.setItem('#cfhetUserId', '1233jjfjf');
  });

  it('Update the tour option in the database and update localstorage', function () {
    const tourUpdate = { tourUpdate: 'true' };

    $httpBackend.whenPOST('/api/tour/1233jjfjf').respond(function () {
      return tourUpdate;
    }());

    $scope.updateTour().then(() => {});

    $httpBackend.flush();
    expect(localStorage.getItem('#cfhuseristourtaken')).toEqual(tourUpdate.tourUpdate);
  });

  it('Should close the tour modal', function () {
    spyOn($scope, 'closeTourModal').and.callThrough();
    expect($scope.closeTourModal).toBeDefined();
  });

  it('Should call the takeTour method', function () {
    spyOn($scope, 'takeNewUserTour').and.callThrough();
    spyOn($scope, 'takeGeneralTour').and.callThrough();
    spyOn($scope, 'tour').and.callThrough();
    expect($scope.takeNewUserTour).toBeDefined();
    expect($scope.takeGeneralTour).toBeDefined();
    expect($scope.tour).toBeDefined();
  });
});
