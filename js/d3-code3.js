// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 20, bottom: 30, left: 50},
	width = 600 - margin.left - margin.right,
	height = 270 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.time.format("%d-%b-%y").parse;

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
	.orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
	.orient("left").ticks(5);

// Define the line
var valueline = d3.svg.line()
	.x(function(d) { return x(d.date); })
	.y(function(d) { return y(d.close); })
	.interpolate("basis-closed");
	
// Adds the svg canvas
var svg = d3.select("section#d3")
	.append("svg")
		.attr("width", "100%")
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", 
			  "translate(" + margin.left + "," + margin.top + ")");

function make_x_axis() {
    return d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5)
}

function make_y_axis() {
    return d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
}

// Get the data
d3.csv("data/test-data.csv", function(error, data) {
	data.forEach(function(d) {
		d.date = parseDate(d.date);
		d.close = +d.close;
	});

	// Scale the range of the data
	x.domain(d3.extent(data, function(d) { return d.date; }));
	y.domain([0, d3.max(data, function(d) { return d.close; })]);

	// Add the valueline path.
	svg.append("path")
		.attr("class", "line")
		.attr("d", valueline(data));

	// Add the X Axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg.append("text")             // text label for the x axis
		.attr("x", width / 2 )
		.attr("y",  height + margin.top)
		.style("text-anchor", "middle")
		.text("Date");

	// Add the Y Axis
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);

	svg.append("text")
	       .attr("transform", "rotate(-90)")
	       .attr("y", 0 - margin.left)
	       .attr("x",0 - (height / 2))
	       .attr("dy", "1em")
	       .style("text-anchor", "middle")
	       .text("Value");

	svg.append("text")
	    .attr("x", (width / 2))				
	    .attr("y", 0 - (margin.top / 2))
	    .attr("text-anchor", "middle")	
	    .style("font-size", "16px") 
	    .style("text-decoration", "underline") 	
	    .text("Value vs Date Graph");
});