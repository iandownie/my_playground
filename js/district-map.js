// Set the dimensions of the canvas / graph
var margin = {top: 120, right: 550, bottom: 60, left: 270},
	width = 2600 - margin.left - margin.right,
	height = 1300 - margin.top - margin.bottom,
	textSpacer=20,
	verticalSpace=45,
	districtData={},
	stateData={};

var projection = d3.geo.albersUsa()
	.scale(1400)
	.translate([width / 2, height / 2]);

var path = d3.geo.path()
	.projection(projection);

var zoom = d3.behavior.zoom()
    .translate(projection.translate())
    .scale(projection.scale())
    .scaleExtent([height, 8 * height])
    .on("zoom", zoomed);

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var g = svg.append("g")
    .call(zoom);

g.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .attr('fill', 'white');

d3.csv("data/district-data.csv", function(error, data) { 
	districtData = d3.nest()
		.key(function(d) { return d.districtcode; })
		.entries(data);
});

d3.csv("data/state-data.csv", function(error, data) { 
	stateData = data;
});

	queue()
		.defer(d3.json, "/data/us.json")
		.defer(d3.json, "/data/us-congress-113.json")
		.await(ready);

function ready(error, us, congress) {
	if (error) throw error;

	var lookupDistrict = {};
	for (var i = 0; i < districtData.length; i++) {
	    lookupDistrict[districtData[i].key] = districtData[i];
	}
	var lookupState = {};
	for (var i = 0; i < stateData.length; i++) {
	    lookupState[stateData[i].statecode] = stateData[i];
	}
	g.append("defs").append("path")
		.attr("id", "land")
		.datum(topojson.feature(us, us.objects.land))
		.attr("d", path);

	g.append("clipPath")
		.attr("id", "clip-land")
	.append("use")
		.attr("xlink:href", "#land");

	g.append("g")
	    .attr("id", "states")
	  .selectAll("path")
	    .data(topojson.feature(us, us.objects.states).features)
	  .enter().append("path")
	    .attr("d", path)
	    .on("click", clicked)
		.on('mouseover', function(d){$('.jobs').text(lookupState[d.id].jobs); $('.state').text(lookupState[d.id].state); $('.district').text(lookupState[d.id].st);})
		.attr("data-state", function(d) { return d.id; });

	g.append("path")
		.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
		.attr("class", "state-boundaries")
		.attr("d", path);

	g.append("g")
		.attr("class", "districts")
		.attr("clip-path", "url(#clip-land)")
	.selectAll("path")
		.data(topojson.feature(congress, congress.objects.districts).features)
	.enter().append("path")
		.attr("d", path)
		.on("click", clicked)
		.on('mouseover', function(d){$('.jobs').text(lookupDistrict[d.id].values[0].jobs); $('.state').text(lookupDistrict[d.id].values[0].state); $('.district').text(lookupDistrict[d.id].values[0].st+lookupDistrict[d.id].values[0].cd);})
		.attr("data-district", function(d) { return d.id; })
	.append("title")
		.text(function(d) { return "id="+d.id; });

	g.append("path")
		.attr("class", "district-boundaries")
		.datum(topojson.mesh(congress, congress.objects.districts, function(a, b) { return a !== b && (a.id / 1000 | 0) === (b.id / 1000 | 0); }))
		.attr("d", path);
}

function clicked(d) {
	var centroid = path.centroid(d),
		translate = projection.translate();

	projection.translate([
		translate[0] - centroid[0] + width / 2,
		translate[1] - centroid[1] + height / 2
	]);

	zoom.translate(projection.translate());

	g.selectAll("path").transition()
		.duration(700)
		.attr("d", path);
}

function zoomed() {
	projection.translate(d3.event.translate).scale(d3.event.scale);
	g.selectAll("path").attr("d", path);
}

d3.select(self.frameElement).style("height", height + "px");