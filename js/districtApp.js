/**
 * Our Angular module and controller
 */
var app = angular.module('districtApp', []);
app.controller('districtCtrl', function($scope) {

  //Sets default settings form app's form
  $scope.jobs="Hover Over A District";
});
