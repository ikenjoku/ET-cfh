/* eslint prefer-arrow-callback: 0, func-names: 0, no-undef: 0, no-var: 0 */
angular.module('mean.system')
  .filter('upperFirstLetter', function () {
    return function (input) {
      input = input || '';
      return input.charAt(0).toUpperCase() + input.slice(1);
    };
  });
