// Get data from Firebase
var task={};
var myDataRef = new Firebase('https://scorching-heat-2457.firebaseio.com/');

// Updates data
function keepUpdated(){
	myDataRef.on('value', function(snapshot) {
		task = snapshot.val();
		updateData();
	});
}

// Make & Fetch cookies
function setCookie(cname, cvalue, minutes) {
	var d = new Date();
	d.setTime(d.getTime() + (minutes*60*1000));
	var expires = "expires="+d.toUTCString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
	}
	return "";
}

// Important variables
var requiredVotes='',
	votes='',
	highest={
		'name':'',
		'count':0
	},
	secondHighest={
		'name':'',
		'count':0
	},
	x='',
	y='',
	chart='',
	yAxis='',
	color='';

// Set the dimensions of the canvas / graph
var margin = {top: 120, right: 150, bottom: 60, left: 300},
	width = 2600 - margin.left - margin.right,
	height = 1300 - margin.top - margin.bottom,
	textSpacer=20,
	verticalSpace=45;

// Tacks the lead contestant option scores.
pluralityFunc=function(){
	task.options.forEach(function(e, i){
		if(e.count>=highest.count){
			if(highest.name !== e.name){
				secondHighest=highest;
			}
			highest=e;
		}else if(e.count>secondHighest.count){
			secondHighest=e;
		}
	});
};

// Animates winning option(s)
function showWinner(){
	var rect='';
	task.options.forEach(function(e, i){
		if(e.count===highest.count){
			rect = chart.select('rect.'+e.name.split(' ').join('-'));
			(function repeat() {
				rect = rect.transition().duration(1500).delay(500)
						.style("opacity", 0)
					.transition()
						.style("opacity", 1)
						.attr('stroke', 'black')
						.attr('stroke-width', '10px');
			})();
		}
	});
}

// Votes for a random option
// function randomVoter(){
// 	setTimeout(function(){
// 		if(0===votes){
// 			task.options.forEach(function(e, i){
// 				if(e.count===highest.count){
// 					var rect = chart.select('rect.'+e.name.split(' ').join('-'));
// 					showWinner(rect);
// 				}
// 			});
			
// 		}else{
// 			var min=0;
// 			var voteFor=Math.floor(Math.random() * (task.options.length - min )) + min;
// 			task.options[voteFor].count++;
// 			updateData();
// 			// randomVoter();
// 		}
// 		myDataRef.set(task);
// 	}, 500);
// }

function vote(votedOption){
	if(0===votes){
		alert('This poll has already finished.');
	}else{
		setCookie('voteStatus', 'voted', 0.2);
		task.options[votedOption].count++;
	}
	myDataRef.set(task);
}

// ** Find highest possible necessary vote for win
function findMaxNeed(){
	if('poll'===task.type.name){
		switch(task.type.winCondition){
			case 'plurality':
				countVotes();
				pluralityFunc();
				if(votes+secondHighest.count<highest.count){
					votes=0;
				}else{
					requiredVotes=highest.count + 1 + Math.floor((votes-(highest.count - secondHighest.count))/2);
				}
			break;
		}
	}
}

function countVotes(){
	var voteCounter = task.type.participantCount;
	task.options.forEach(function(e,i){
		voteCounter-=e.count;
	});
	votes=voteCounter;
}

// ** Updates D3 data
function updateData() {
	findMaxNeed();
	task.options.forEach(function(d, i){
		chart.select('rect.'+d.name.split(' ').join('-'))
			.transition().duration(450)
			.attr("y", y(+d.count))
			.attr("height", height - y(d.count));
	});
	y.domain([0,requiredVotes]);
	chart.select(".y.axis")
		.transition().duration(350)
		.call(yAxis);
	if(0===votes){
		showWinner();
	}
}

// Deletes D3 content but not chart
function wipeD3(){
	$('svg').remove();
}

//post-build functions declared
function registerFunctions(){
	$('.reset-votes').click(function(){
		task.options.forEach(function(e,i){
			e.count=0;
		});
		setCookie('voteStatus', 'hasnt-voted');
		myDataRef.set(task);
		wipeD3();
		build();
	});
	$('.reset-app').click(function(){
		myDataRef.set('');
		setCookie('voteStatus', 'hasnt-voted');
		wipeD3();
	});
	$('.submit-question').click(function(){
		wipeD3();
		build();
	});
	$('rect[data-option], text[data-option]').click(function(){
		var voteStatus=getCookie('voteStatus');
		if(voteStatus==='voted'){
			alert("you have already voted.");
		}else{
			var votedOption = $(this).data("option");
			vote(votedOption);
		}
	});
}

	// Set the scales
function build(){
	votes=task.type.participantCount;
	findMaxNeed();
	var range=d3.scale.category10().range();
	x = d3.scale.ordinal().rangeBands([0, width]).domain(task.options);  //checkout .rangePoints as well
	y = d3.scale.linear().range([height, 0]);
	y.domain([0,requiredVotes]);

		// Build the base chart
	chart = d3.select("section.d3")
		.append("svg")
			.attr("viewBox", "0 0 "+(width + margin.left + margin.right).toString()+" "+(height + margin.top + margin.bottom).toString())
			.attr("preserveAspectRatio", "xMinYMin meet").attr("width", width)
			.attr("width", '100%')
			.attr("height", height + margin.top + margin.bottom)
			.attr('class', 'animated fadeIn')
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var barWidth = width / task.options.length;
	var bar = chart.selectAll("g")
			.data(task.options)
		.enter().append("g")
			.attr("transform", function(d, i) { return "translate(" + i * barWidth + ",0)"; });

		// build the axis
	yAxis = d3.svg.axis().scale(y)
		.orient("left").ticks(5);

		// Add the Y Axis
	chart.append("g")  
		.attr("class", "y axis")
		.call(yAxis);
	chart.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 30 - margin.left)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.attr("class", "y axis")
		.style("text-anchor", "middle")
		.text("Number of Votes");

		//  Creates reset votes button (Adds to SVG, but may be inefficient)
	chart.append('text')
		.attr('y', height + 180)
		.attr('x', width/2)
		.attr('class', 'reset-votes')
		.style('text-anchor', 'middle')
		.text('Reset Votes');

		//Title of chart
	chart.append('text')
		.attr('y', 0 )
		.attr('x', width/2 )
		.style('text-anchor', 'middle')
		.text(task.title);
	
		// Add the option bars and labels
	bar.append("rect")
		.attr("y", function(d) { return y(+d.count); })
		.attr("height", function(d) { return height - y( +d.count); })
		.attr("width", barWidth - 1)
		.attr("class", function(d) { return d.name.split(' ').join('-'); })
		.attr('data-option', function(d, i){ return i; })
		.style('fill', function(d, i) { return range[i]; })
		.style('opacity', 1);
	bar.append("text")
		.attr("x", barWidth*0.25 )
		.attr("y", function(d) { return height; })
		.attr("dy", ".75em")
		.attr('data-option', function(d, i){ return i; })
		.text(function(d) { return d.name; });

	// Registers functions that need to come after the above elements are created.
	registerFunctions();
}
