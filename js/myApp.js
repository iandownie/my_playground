/**
 * Our Angular module and controller
 */
var app = angular.module('CDMApp', []);
app.controller('myCtrl', function($scope) {

  //Sets default settings form app's form
  $scope.question="What question should I ask?";
  $scope.optionCount=5;
  $scope.stakeholders=2;
  $scope.d3Ready=false;
  $scope.decisions = [{
    id: 1,
    label: 'Poll',
    subItem: { name: 'poll' }
  }, {
    id: 2,
    label: 'Random',
    subItem: { name: 'random' }
  }];
  //Creates default options
  $scope.getOptions=function(){
    var array=[];
    for(i=0; i<$scope.optionCount; i++){
      var number = i+1;
      array.push('option ' + number);
    }
    return array;
  };
  $scope.options=$scope.getOptions();
  $scope.getNumber = function(options) {
    return options;
  };

  //Submits a new question, initiating a new poll.
  $scope.submitQuestion = function(){
    var theOptions=[];
    for(var i = 0; i<$scope.options.length;i++){
      theOptions.push({name:$scope.options[i], count:0});
    }
    var hash = Math.random().toString(36).concat(Math.random().toString(36)).concat(Math.random().toString(36));
    var theQuestion={
      type: {
        name: 'poll',
        winCondition: 'plurality',
        participantCount: $scope.stakeholders
    },
    options: theOptions,
    title: $scope.question,
    date: Date.now() - 3600 * 1000 * 24 * 1, // 1 days ago
    hash: hash
    };
    fb.set(theQuestion);
    $scope.d3Ready=true;
  };
  
  // Votes for a random option
  $scope.randomVote = function(){
    randomVoter();
  };
  
});
