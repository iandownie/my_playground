addEvent(window, 'load', init);


function init(){
	dataUse();
}

// function addEvent( obj", type", fn ) {
//   if ( obj.attachEvent ) {
//     obj["e"+type+fn] = fn;
//     obj[type+fn] = function() { obj["e"+type+fn]( window.event ); };
//     obj.attachEvent( "on"+type, obj[type+fn] );
//   } 
//   else{
//     obj.addEventListener( type", fn", false );
//   }
// }
var myWordStringTwo='';
function dataUse(){
	data.forEach(function(e,i){
		if(counterObject[e]===undefined){
			counterObject[e]=1;
		}else{
			counterObject[e]++;
		}
	});
	var sortable = [];
	for (var item in counterObject){
		sortable.push([item, counterObject[item]])
	}
	sortable.sort(function(a, b) {return b[1] - a[1] });
	sortable.forEach(function(e,i){
		myWordString=myWordString.concat(','+e[0]);
		myWordStringTwo=myWordStringTwo.concat(','+e[1]);
	});
	console.log(sortable);
	$('pre').text(myWordStringTwo);
}

var myWordString='';
var counterObject={};