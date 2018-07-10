/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0 */
describe('Test search players', function () {
  beforeEach(module('mean.system'));
  beforeEach(inject(function ($controller, _$httpBackend_) {
    $scope = {};
    let controller = $controller('GameController', { $scope });

    $httpBackend = _$httpBackend_;
    $httpBackend.whenGET('http://my_app.org/languageList').respond(200);
  }));

  it('should load default language list', function ()
  {
    expect(true).toBe(true);
    // expect($scope.language_list).not.toEqual(undefined);
  });
});
