/* eslint prefer-arrow-callback: 0, no-var: 0, func-names: 0 */

angular.module('mean.system')
  .directive('isLoading', ['$http', function isLoading($http) {
    /**
     * isLoading directive factory function
     *
     * @param {object} scope Directive scope
     * @param {DOMElement} elem HTML element
     *
     * @returns {object} New directive instance
     */
    function link(scope, elem) {
      /**
       * Toggles loading indicator visibility
       *
       * @param {boolean} loading Either true or false
       *
       * @returns {null} Returns nothing
       */
      function toggleShowLoadingIndicator(loading) {
        if (loading) {
          scope.loadingIndicatorShow = true;
          elem.show();
        } else {
          scope.loadingIndicatorShow = false;
          elem.hide();
          $('.modal').modal('close');
        }
      }

      /**
       * Checks request state
       *
       * @returns {boolean} true or false depending on request state
       */
      function isHttpLoading() {
        return $http.pendingRequests.length >= 1;
      }

      scope.isHttpLoading = isHttpLoading;
      scope.$watch(scope.isHttpLoading, toggleShowLoadingIndicator);
    }

    return {
      link,
    };
  }]);
