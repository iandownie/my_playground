// Set the dimensions of the canvas / graph
var margin = {top: 80, right: 80, bottom: 60, left: 120},
	width = 900 - margin.left - margin.right,
	height = 600 - margin.top - margin.bottom,
	center=[width/2, height/2],
	translate=[0,0],
	zoomOffset= 450,
	textSpacer=20,
	verticalSpace=45,
	active = d3.select(null),
	districtData={},
	stateData={},
	activeData={},
	zipcodeData={},
	viewMode='district';

var projection = d3.geo.albersUsa()
	.scale(1400)
	.translate([width / 2, height / 2]);

var path = d3.geo.path()
	.projection(projection);

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var svg = d3.select("body").append("svg")
	.attr("viewBox", -margin.left*1.5+" "+-margin.top*1.5+" "+(width + margin.left*2 + margin.right*2).toString()+" "+(height + margin.top*2 + margin.bottom*2).toString())
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("width", '100%')
	.attr("height", height);

var g = svg.append("g");

svg.call(zoom);

d3.csv("data/district-data.csv", function(error, data) { 
	districtData = data;
});

d3.csv("data/state-data.csv", function(error, data) { 
	stateData = data;
	stateData.forEach(function(currentD, i){
		d3.select("select.state")
			.append('option')
			.attr('value', function() { return currentD.statecode; })
			.text(function() { return currentD.state; });
	});
});

d3.csv("data/zipcode-data.csv", function(error, data) { 
	zipcodeData = data;
});

d3.selectAll("form#locator")
	.on("submit", locate);

d3.selectAll("input.zipcode")
	.on("keydown", resetError);

d3.selectAll('form#locator select')
	.on('change', locate);

d3.selectAll(".view-mode")
	.on('click', changeView);

d3.selectAll("button[data-zoom], .results .close")
	.on("click", zooming);

d3.selectAll("select.state")
		.data(stateData)
	.enter().append("path")
		.text(function(d) { return d.state; });

	queue()
		.defer(d3.json, "/data/us.json")
		.defer(d3.json, "/data/us-congress-113.json")
		.await(ready);

function ready(error, us, congress) {
	if (error) throw error;

	lookupZipcode=lookup(zipcodeData, 'zipcode'), 
	lookupDistrict = lookup(districtData, 'districtcode'), 
	lookupState = lookup(stateData,'statecode');

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
	    .on("click.init", clicked)
	    .on('click.customize', function(d){ setData(d, 'state'); })
		.attr("data-state", function(d) { return d.id; });

	g.append("g")
		.attr("class", "districts")
		.attr("clip-path", "url(#clip-land)")
	.selectAll("path")
		.data(topojson.feature(congress, congress.objects.districts).features)
	.enter().append("path")
		.attr("d", path)
		.on("click.init", clicked)
		.on('click.customize', function(d){ setData(d, 'district'); })
		.attr("data-district", function(d) { return d.id; })
	// .append("title")
	// 	.text(function(d) { return "id="+d.id; });
}

// Change's the map view mode
function changeView(){
	$('.districts, .district-boundaries, .district, .select.state, input.zipcode').toggle();
	clearResults();
	if($(this).text()==='District View'){
		$(this).text('State Mode');
		viewMode='state';
	}else{
		$(this).text('District View');
		viewMode='district';
	}
}

function setData(d, type){
	if('state'===type){
		$('.jobs').text(lookupState[d.id].jobs);
		$('div.state').text(lookupState[d.id].state);
		$('.goods').text(lookupState[d.id].goods);
		$('.services').text(lookupState[d.id].services);
		$('.total').text(lookupState[d.id].total);
	}else{
		$('.jobs').text(lookupDistrict[d.id].jobs);
		$('div.state').text(lookupDistrict[d.id].state);
		$('.district').text(lookupDistrict[d.id].st+lookupDistrict[d.id].cd);
	}
}

function clearResults(){
	$('.valid-results, .state-only').children(':not(.state-only)').text(''); 
}

//resets canvas after an auto-zoom
function reset() {
	active.classed("active", false);
	active = d3.select(null);

	g.transition()
		.duration(750)
		.style("font-size", "1.5px")
		.attr("transform", "");
}

// "auto-zoom". Centers on clicked element and zooms to it while correcting stroke width. 
function clicked(d) {
	if (active.node() === this) return reset();
	active.classed("active", false);
	active = d3.select(this).classed("active", true);

	var bounds = path.bounds(d),
		dx = bounds[1][0] - bounds[0][0],
		dy = bounds[1][1] - bounds[0][1],
		x = (bounds[0][0] + bounds[1][0]) / 2,
		y = (bounds[0][1] + bounds[1][1]) / 2,
		scale = .3 / Math.max(dx / width, dy / height),   //change first # to increase or decrease zoom amount
		translate = [width / 2 - scale * x + zoomOffset, height / 2 - scale * y];   // Change zoomOffset to change horizontal offset during zoom.

	g.transition()
		.duration(750)
		.style("font-size", 6 / scale + "px")
		.attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}

function zooming() {
	var activeArea=$('path.active');
	var calledZoom = this.getAttribute("data-zoom")
	if('0'=== calledZoom || undefined === calledZoom){
		reset();
		svg.call(zoom.event);
		var center0 = center;
		var translate0 = zoom.translate();
		var coordinates0 = coordinates(center0);
		zoom.scale(zoom.scale()*0);
		// Translate back to the center.
		var center1 = point(coordinates0);
		zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);
		svg.transition().duration(750).call(zoom.event);
	}else{
		if(0===activeArea.length){
			svg.call(zoomed); // https://github.com/mbostock/d3/issues/2387

			// Record the coordinates (in data space) of the center (in screen space).
			var center0 = center;
			var translate0 = zoom.translate();
			var coordinates0 = coordinates(center0);
			zoom.scale(zoom.scale() * Math.pow(2, + calledZoom));

			// Translate back to the center.
			var center1 = point(coordinates0);
			zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

			svg.transition().duration(750).call(zoom.event);
		}else{
			reset();
		}
	}
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
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  g.select(".state-border").style("stroke-width", 1.5 / d3.event.scale + "px");
  g.select(".county-border").style("stroke-width", .5 / d3.event.scale + "px");
}


// Locate district that matches zipcode
function locate(){
	d3.event.preventDefault();
	if('district'===viewMode){
		var zipcode=$(this).children('.zipcode')[0].value;
		if(zipcode.length>5){
			zipcode=zipcode.slice(0,5);
		}
		var district = lookupZipcode[zipcode];
		if (undefined===district){
			$('.invalid-input').show().text('Zipcode not found.');
			clearResults();
		}else{
			district.id=lookupDistrict[district.districtcode].districtcode;
			setData(district, 'district');
			$('path[data-district="'+district.id+'"]').d3Click();
		}
	}else{
		var state= $(this)[0].value;
		state = lookupState[state];
		state.id=state.statecode;
		setData(state, 'state');
		$('path[data-state="'+state.id+'"]').d3Click();
	}
}

function resetError(){
	$('.invalid-input').hide();
}

// Make a convenient data structure to find matching data
function lookup(theData, theKey) {
	var looker = {};
	for (var i = 0; i < theData.length; i++) {
		looker[theData[i][theKey]] = theData[i];
	}
	return looker;
}

d3.select(self.frameElement).style("height", height + "px");

// Improves mousewheel zoom functionality
$(function() {
	var resetting=false;
	$( ".results" ).draggable();
	$('svg').bind('mousewheel', function(e){
		var activeArea=$('path.active');
		if(0<activeArea.length||true===resetting){
			reset();
			resetting=true;
			setTimeout(function(){ resetting=false; }, 500);
		}
	});
});


// Jquery's click invocation on d3 click triggers doesn't work without this work-around.
jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = new MouseEvent("click");
    e.dispatchEvent(evt);
  });
};