// Set the dimensions of the canvas / graph
var margin = {top: 120, right: 0, bottom: 60, left: 0},
	width = 2600 - margin.left - margin.right,
	height = 1300 - margin.top - margin.bottom,
	textSpacer=20,
	verticalSpace=45,
	active = d3.select(null),
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
    .center([width / 2, height / 2])
    .scaleExtent([height, 8 * height])
    .on("zoom", zoomed);

var svg = d3.select("body").append("svg")
	.attr("viewBox", "0 0 "+(width + margin.left + margin.right).toString()+" "+(height + margin.top + margin.bottom).toString())
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("width", '100%')
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

d3.selectAll("button[data-zoom]")
    .on("click", clicked);

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

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  g.transition()
      .duration(750)
      .style("font-size", "1.5px")
      .attr("transform", "");
}
function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  g.transition()
      .duration(750)
      .style("font-size", 6 / scale + "px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}

function clicked() {
  svg.call(zoom.event); // https://github.com/mbostock/d3/issues/2387

  // Record the coordinates (in data space) of the center (in screen space).
  var center0 = zoom.center();
  var translate0 = zoom.translate();
  var coordinates0 = coordinates(center0);
  zoom.scale(zoom.scale() * Math.pow(2, +this.getAttribute("data-zoom")));

  // Translate back to the center.
  var center1 = point(coordinates0);
  zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

  svg.transition().duration(750).call(zoom.event);
}

function coordinates(point) {
  var scale = zoom.scale();
  var translate = zoom.translate();
  return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
}

function point(coordinates) {
  var scale = zoom.scale();
  var translate = zoom.translate();
  return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
}

function zoomed() {
	projection.translate(d3.event.translate).scale(d3.event.scale);
	g.selectAll("path").attr("d", path);
}

d3.select(self.frameElement).style("height", height + "px");