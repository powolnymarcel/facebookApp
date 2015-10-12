'use strict';

// Declare app level module which depends on views, and components
angular.module('ngSocial', [
  'ngRoute','firebase',
    'ngSocial.facebook'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/facebook'});
}]);
