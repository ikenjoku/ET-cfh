/* eslint prefer-arrow-callback: 0, no-var: 0, func-names: 0, no-undef: 0, require-jsdoc: 0 */

describe('Directive: isLoading', function () {
  let $scope, $compile;

  beforeEach(module('mean.system'));
  beforeEach(inject(function (_$compile_, $rootScope, _$httpBackend_) {
    $compile = _$compile_;
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;

    $compile(angular
      .element('<div is-loading></div>'))($scope);
    $scope.$digest();
  }));

  it('should render hide loading indicator', function () {
    expect($scope.loadingIndicatorShow).toBeDefined();
    expect($scope.loadingIndicatorShow).toBeFalsy();
  });
});
