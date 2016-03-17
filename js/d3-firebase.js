// Get data from Firebase
var myDataRef = new Firebase('https://scorching-heat-2457.firebaseio.com/');
var task={};

// Initial data grab
myDataRef.once("value", function(snapshot) {
	task=snapshot.val();
	build();
	keepUpdated();
}, function (errorObject) {
	console.log("The read failed: " + errorObject.code);
});
// Updates data
function keepUpdated(){
	myDataRef.on('value', function(snapshot) {
		if(task.hash===snapshot.val().hash){
			task = snapshot.val();
			updateData();
		}else{
			task = snapshot.val();
			wipeD3();
			build();
		}
	});
}


// Important variables
var requiredVotes=0,
	votes=100,
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
pluralityFunc=function(e, i){
	if(0===i){
		votes=task.type.participantCount;
	}
	votes-=e.count;
	if(e.count>=highest.count){
		if(highest.name !== e.name){
			secondHighest=highest;
		}
		highest=e;
	}else if(e.count>secondHighest.count){
		secondHighest=e;
	}
};

// Animates winning option(s)
function showWinner(rect){
	(function repeat() {
		rect = rect.transition().duration(1500)
				.style("opacity", 0)
			.transition()
				.style("opacity", 1)
				.each("end", repeat);
	})();
}

// Votes for a random option
function randomVoter(){
	setTimeout(function(){
		if(0===votes){
			task.options.forEach(function(e, i){
				if(e.count===highest.count){
					var rect = chart.select('rect.'+e.name.split(' ').join('-'));
					showWinner(rect);
				}
			});
			
		}else{
			var min=0;
			var voteFor=Math.floor(Math.random() * (task.options.length - min )) + min;
			task.options[voteFor].count++;
			updateData();
			// randomVoter();
		}
		myDataRef.set(task);
	}, 500);
}

// ** Find highest possible necessary vote for win
function findMaxNeed(){
	if('poll'===task.type.name){
		switch(task.type.winCondition){
			case 'plurality':
				task.options.forEach(pluralityFunc);
				if(votes+secondHighest.count<highest.count){
					console.log('poll finished');
					votes=0;
				}else{
					requiredVotes=highest.count + 1 + Math.floor((votes-(highest.count - secondHighest.count))/2);
				}
			break;
		}
	}
}

// findMaxNeed(); ugly
requiredVotes=100;
possibleMaxVote=requiredVotes;


// ** Updates D3 data
function updateData() {
	findMaxNeed();
	task.options.forEach(function(d, i){
		chart.select('rect.'+d.name.split(' ').join('-')).transition().duration(450)
			.attr("y", y(+d.count))
			.attr("height", height - y(d.count));
	});
	possibleMaxVote=requiredVotes;
	y.domain([0,possibleMaxVote]);
	chart.select(".y.axis")
		.transition().duration(350)
		.call(yAxis);
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
		myDataRef.set(task);
		updateData();
	});
	$('.reset-app').click(function(){
		myDataRef.set('');
		wipeD3();
	});
	$('.submit-question').click(function(){
		wipeD3();
		build();
	});
}

	// Set the scales
function build(){
	var range=d3.scale.category10().range();
	x = d3.scale.ordinal().rangeBands([0, width]).domain(task.options);  //checkout .rangePoints as well
	y = d3.scale.linear().range([height, 0]);
	y.domain([0,possibleMaxVote]);

		// Build the base chart
	chart = d3.select("section.d3")
		.append("svg")
			.attr("viewBox", "0 0 "+(width + margin.left + margin.right).toString()+" "+(height + margin.top + margin.bottom).toString())
			.attr("preserveAspectRatio", "xMinYMin meet").attr("width", width)
			.attr("width", '100%')
			.attr("height", height + margin.top + margin.bottom)
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
	    .style('fill', function(d, i) { return range[i]; });
	bar.append("text")
	    .attr("x", barWidth*0.25 )
	    .attr("y", function(d) { return height; })
	    .attr("dy", ".75em")
	    .text(function(d) { return d.name; });

	// Registers functions that need to come after the above elements are created.
	registerFunctions();
}
