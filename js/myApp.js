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
  }, 
  // {
  //   id: 2,
  //   label: 'Random',
  //   subItem: { name: 'random' }
  // }
  ];
  $scope.chosenQuestion='';
  $scope.questions={};
  fb.on("value", function(snapshot) {
    $scope.questions=snapshot.val();
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

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

  // Feeds D3 with selected question's data
  $scope.selectQuestion = function(){
    task=$scope.chosenQuestion;
    myDataRef = new Firebase('https://scorching-heat-2457.firebaseio.com/-'+task.hash);
    wipeD3();
    build();
    keepUpdated();
  };

  $scope.resetApp = function(){
    fb.set(null);
    $scope.d3Ready=false;
    setCookie('voteStatus', 'hasnt-voted');
    wipeD3();
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
    var newQuestionRef = fb.push();
    var path = newQuestionRef.toString();
    var ID = path.split('/-')[1];
    theQuestion.hash=ID;
    newQuestionRef.set(theQuestion);
    $scope.d3Ready=true;
    $scope.updateQuestions();
  };

  // Delete the selected question
  $scope.deletePoll=function(){
    myDataRef=new Firebase('https://scorching-heat-2457.firebaseio.com/-'+$scope.chosenQuestion.hash);
    myDataRef.remove();
    $scope.chosenQuestion='';
    wipeD3();
    task={};
  };

  
  //updates questions when new ones are made 
  $scope.updateQuestions=function(){
    fb.once("value", function(snapshot) {
      $scope.questions=snapshot.val();
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
  };

  // Votes for a random option
  // $scope.randomVote = function(){
  //   randomVoter();
  // };
});
