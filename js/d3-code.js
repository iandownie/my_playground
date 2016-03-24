// Parse the date / time
var parseDate = d3.time.format("%Y").parse;

// Set the dimensions of the canvas / graph
var margin = {top: 120, right: 550, bottom: 60, left: 270},
	width = 2600 - margin.left - margin.right,
	height = 1300 - margin.top - margin.bottom,
	textSpacer=20,
	verticalSpace=45;

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Other important variables
var	currentMax=0,
	startingValue = parseDate('1960'),
	normalPathWidth = '6px',
	blockData = {x: 240, y: -10, r: 20},
	boldPathWidth = '12px',
	perCapita=false,
	popData={},
	popped=false,
	dataGroup={},
	organizedData={};

// Define the axes
var xAxis = d3.svg.axis().scale(x)
	.orient("bottom").ticks(5);
var yAxis = d3.svg.axis().scale(y)
	.orient("left").ticks(5);

// Set Color Scales
var range = d3.scale.category20().range().concat(d3.scale.category20b().range().concat(d3.scale.category20c().range()));
var domain = [];
for(var l=0; l<51; l++){
	domain.push(l);
}
var color = d3.scale.linear()
	.domain(domain)
	.range(range);

// Define the line
var valueline = d3.svg.line()
	.x(function(d) { return x(d.year); })
	.y(function(d) { 
		if(perCapita===true){
			return y(d.amountPerCapita);
		} 
		return y(d.amount); 
	})
	.interpolate("basis");

// Adds the svg canvas
var svg = d3.select("body")
	.append("svg")
		.attr("viewBox", "0 0 "+(width + margin.left + margin.right).toString()+" "+(height + margin.top + margin.bottom).toString())
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("width", '100%')
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.style('color', 'white');

//Define Gaussian Filter
var filter = svg.append("defs")
	.append("filter")
		.attr("id", "highlight")
	.append("feGaussianBlur")
		.attr("stdDeviation", 5);

// Define Path Clipping
var clipping = svg.append("defs")
	.append("clipPath")
		.attr("id", "clipping")
		.append("rect")
			.attr('width', width)
			.attr('height', height);

//setup axes
function make_x_axis() {
	return d3.svg.axis()
		.scale(x)
		.orient("bottom")
		.ticks(10);
}
function make_y_axis() {
	return d3.svg.axis()
		.scale(y)
		.orient("left")
		.ticks(10);
}

// Build State filter block
var stateBlock = svg.append('g')
	.style('transform', 'translateX('+ (textSpacer + width) +'px)')
	.attr('class','state-block');
stateBlock.append('text')
	.attr('y', -1*verticalSpace)
	.attr('class', 'label')
	.text('States');
stateBlock.append('rect')
	.attr('y', -1*verticalSpace + 12)
	.attr('x', '-5')
	.attr('width', 100)
	.attr('height', height+verticalSpace+7)
	.attr('stroke-width', '2px')
	.attr('stroke', 'white')
	.attr('fill', 'none');

//Build Energy type filter block
var energyBlock = svg.append('g')
	.style('transform', 'translateX('+ (170 + width) +'px)')
	.attr('class','energy-block');
energyBlock.append('text')
	.attr('y', -1*verticalSpace)
	.attr('class', 'label')
	.text('Energy Type');
energyBlock.append('rect')
	.attr('x', '-5')
	.attr('y', -1*verticalSpace + 12)
	.attr('width', 354)
	.attr('height', 640)
	.attr('stroke-width', '2px')
	.attr('stroke', 'white')
	.attr('fill', 'none');

//Build per capita button
var perCapitaBlock= svg.append('g') //Build Per Capita option button
	.style('transform', 'translate(' + (170+ width) + 'px, '+ (640+60) +'px)')
	.attr('class', 'per-capita-block');
perCapitaBlock.append('text')
	.attr('y', 0)
	.attr('class', 'label')
	.text('Per Capita?');
perCapitaBlock.append('rect')
	.attr("class","radio-frame")
	.attr('x', blockData.x - blockData.r*1.3)
	.attr('y', blockData.y - blockData.r*1.3)
	.attr('ry', 25)
	.attr('width', blockData.r*1.3*5)
	.attr('height', blockData.r*1.3*2);
perCapitaBlock.append('circle')
	.attr("class","radio-button-frame")
	.attr('cx', blockData.x)
	.attr('cy', blockData.y)
	.attr('r', blockData.r*1.3);
perCapitaBlock.append('circle')
	.attr("class","radio-button")
	.attr('cx', blockData.x)
	.attr('cy', blockData.y)
	.attr('r', blockData.r);

//Graph Title
svg.append("text")
	.attr("x", (width / 2))
	.attr("y", 0 - (margin.top / 2))
	.attr("text-anchor", "middle")
	.attr("class", "chart-title")
	.attr('fill', 'white')
	.style("text-decoration", "underline")
	.text("Energy Consumption By State and Type");

//build's slider input
d3.select('body').append('input')
	.attr('class', 'year-slider')
	.style('width', '300px')
	.style('left', 'calc(45vw - 125px)')
	.style('top', ' calc(140px + 30vw)')
	.attr('type', 'range')
	.attr('min', 1960)
	.attr('max', 2012)
	.attr('value', 1960)
	.on('change', updateData);

// Load per capita data
d3.csv("data/population.csv", function(error, data) { 
	data.forEach(function(d) {
		for(var key in d){
			if(key !== 'year'){
				d[key] = +d[key];//Coerces data string into number
			}
		}
	});
	popData = data;
});

// Load the primary data and build the chart
d3.csv("data/us_consumption_btu.csv", function(error, data) {
	// filter out states if desired
	// data=data.filter(function(d) { 
	// 	return d.state == 'VA';
	// });

	//format data and add per capita data
	data.forEach(function(d) { 
		d.amount = +d.amount;
		popData.some(function(el, i){
			if(el.year===d.year){
				d.amountPerCapita=d.amount/el[d.state]*1000000;
				return true;
			}
		});
		d.year = parseDate(d.year.toString());
	});
	organizedData=data;

	// Scale the range of the data
	x.domain(d3.extent(data, function(d) { return d.year; }));
	y.domain([0, d3.max(data, function(d) {
		return d.amount; 
	})]);

	// restructure data
	dataGroup = d3.nest()
		.key(function(d) { return d.state; })
		.key(function(d) { return d.energy_type; })
		.entries(data);

	// Itterate through each state's data
	dataGroup.forEach(function(d, i) {
		var finalI = dataGroup.length;
		var max=d3.max(d.values, function(d) {
			return d3.max(d.values, function(innerD){
				return innerD.amount;
			});
		});

		// Add energy type labels
		if(i===0){
			d.values.forEach(function(dtwo,i){
				energyBlock.append('rect') 
					.attr('y',(i*verticalSpace)-28)
					.attr('width', 340)
					.attr('height', 36)
					.attr('class','energy_type '+dtwo.key.split(' ').join('_'))
					.attr('fill', 'white')
					.style('display', 'none');
				energyBlock.append('text')
					.attr('y',i*verticalSpace)
					.attr('class',dtwo.key.split(' ').join('_')+ ' energy_type')
					.attr('data-activated', 'no')
					.attr('data-energy', dtwo.key.split(' ').join('_'))
					.style('text-anchor', 'start')
					.attr('fill','white')
					.text(dtwo.key);
				if(i===d.values.length-1){
					energyBlock.append('text') 
						.attr("y",(i+1)*verticalSpace)
						.attr("class","wipe")
						.attr("fill", "white")
						.style("text-anchor", "start")
						.text("None");
				}
			});
		}

		//Put States Labels into columns
		var k = i;
		if(i>25){ 
			k=i-26;
			textSpacer=70;
		}

		// Add State Labels
		stateBlock.append('circle')
			.attr('cx', textSpacer)
			.attr('cy',(k*verticalSpace)-8)
			.attr('r', 20)
			.attr('class',d.key +" state")
			.attr('fill', 'white')
			.text(d.key);
		stateBlock.append('text') 
			.attr('x', textSpacer)
			.attr('y',k*verticalSpace)
			.attr('class',d.key+ ' yes line')
			.attr('data-state',d.key)
			.attr('data-max',max)
			.style('text-anchor', 'middle')
			.attr('data-color',color(i))
			.attr('fill', color(i))
			.text(d.key);
		if(i===finalI-1){
			stateBlock.append('text')
				.attr("x", textSpacer)
				.attr("y",(k+1)*verticalSpace)
				.attr("class","wipe")
				.attr("fill", "white")
				.style("text-anchor", "middle")
				.text("None");
		}

		// Itterate through each energy type's data
		d.values.forEach(function(dtwo, itwo){
			var pathMax=d3.max(dtwo.values, function(d){
				return d.amount;
			});
			var pathPerCapitaMax=d3.max(dtwo.values, function(d){
				return d.amountPerCapita;
			});
			var visibility='';
			if(dtwo.key=="Total"){
				visibility='initial';
				$('rect.Total').show();
				$('text.Total').attr('fill', 'black').attr('activated','yes');
			}else{
				visibility='none';
			}
			//Build paths
			svg.append('path')
				.attr("stroke", color(i))
				.attr("class", dtwo.values[itwo].energy_type.split(' ').join('_')+" line "+dtwo.values[0].state)
				.attr('data-state', dtwo.values[itwo].state)
				.attr('data-energy', dtwo.values[itwo].energy_type.split(' ').join('_'))
				.attr('data-max',pathMax)
				.attr('data-percapitamax',pathPerCapitaMax)
				.attr('d', valueline(dtwo.values))
				.attr("clip-path", "url(#clipping)")
				.style('display', visibility);
		});
	});
	
	// Add the X Axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height+3) + ")")
		.call(xAxis);
	svg.append("text")  
		.attr("x", width / 2 )
		.attr("y", + height + margin.top)
		.attr("class", "x axis")
		.style("text-anchor", "middle")
		.text("Year");

	// Add the Y Axis
	svg.append("g")  
		.attr("class", "y axis")
		.call(yAxis);
	svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 30 - margin.left)
		.attr("x", 0 - (height / 2))
		.attr("dy", "1em")
		.attr("class", "y axis")
		.style("text-anchor", "middle")
		.text("Energy Consumption in Billions of BTUs");

	d3Actions();
});


function d3Actions(){
	var data= organizedData;

	// Build Per Capita Functionality
	var radioButton=$('.radio-button');
	radioButton.click(function(){
		if($(this)[0].classList[1]!== undefined){
			$('text.y.axis').text('Energy Consumption in Thousands of BTUs');
			$(this).css('transform', 'translateX(0)');
			$('.radio-button-frame').css('transform', 'translateX(0)');
			$(this).attr('class', 'radio-button');
		}else{
			$('text.y.axis').text('Energy Consumption in Billions of BTUs');
			$(this).attr('class', 'radio-button on');
			$(this).css('transform', 'translateX('+blockData.r*1.3*3+'px)');
			$('.radio-button-frame').css('transform', 'translateX('+blockData.r*1.3*3+'px)');
		}
		perCapita=!perCapita;
		updateData();
	});

	// Turns lines on/off
	var state="";
	$("text.line, text.energy_type").click(function(){
		var type='';
		if($(this).data("state")!==undefined){
			target=$(this).data("state");
		}else{
			target=$(this).data("energy").split(' ').join('_');
			type='energy';
		}
		if($(this).data("activated")!=="no"){
			$(this).removeClass("yes");
			$(this).data("activated", "no");
			if(type==='energy'){
				$('text.'+target).attr('fill', 'white');
			}
			$("path."+target+', circle.'+target+', rect.'+target).hide();
		}else{
			$(this).addClass("yes");
			$(this).data("activated", "yes");
			if(type==='energy'){
				$('text.'+target).attr('fill', 'black');
			}
			$("path."+target+', circle.'+target+', rect.'+target).show();
		}
		updateData();
	});

	// Add the "None" functionality.
	$("text.wipe").click(function(){ 
		$('path.line, circle.state').hide();
		$('text.line, text.energy_type').data('activated', 'no');
		$('rect.energy_type').hide();
		$('text.energy_type').attr('fill', 'white');
	});

	// Add the focus in functionality.
	$("text.line, text.energy_type").mouseenter(function(){
		if($(this).data('activated')!=='no'){
			var dataType='';
			$(this)[0].classList.forEach(function(d, i){
				if(d==='energy_type'||d==='line'){
					dataType=d;
				}
			});
			if(dataType==='energy_type'){
				var hoveredTarget=$(this).data('energy');
			}else{
				var hoveredTarget=$(this).data('state');
			}
			$('path.line').each(function(){
				var targetLine=false;
				$(this)[0].classList.forEach(function(d, i){
					if(d===hoveredTarget){
						targetLine=true;
					}
				});
				if(targetLine===true){
					$(this).css('stroke-width', boldPathWidth);
				}else{
					$(this).css('filter', 'url(#highlight)').css('stroke-width', '2px');
				}
			});
		}
	});

	// End the focus in functionality.
	$("text.line, text.energy_type").mouseleave(function(){ 
		if($(this).data('energy')!==undefined){
			target=$(this).data('energy');
		}else{
			target=$(this).data('state');
		}
		$('path.line').css('filter', 'none').css('stroke-width', normalPathWidth);
		$('path.line.'+target).css('stroke-width', normalPathWidth);
	});
}

// ** Updates data
function updateData() {
	//checks if update comes from date slider and sets start date.
	if(this.value!==undefined){ 
		startingValue=parseDate(this.value.toString());
	}

	// determine which paths should be active
	var activePaths={ states:[],energies:[] };
	$('text.energy_type').each(function(d,i){
		if($(this).data('activated')!=='no'){
			activePaths.energies.push($(this).data('energy'));
		}
	});
	$('text.line').each(function(d,i){
		if($(this).data('activated')!=='no'){
			activePaths.states.push($(this).data('state'));
		}
	});
	if(activePaths.energies.length===0){
		$('text.Total').data('activated', 'yes').attr('fill', 'black').addClass("yes");
		$('rect.Total').show();
		activePaths.energies.push('Total');
	}

	// show/hide paths.
	currentMax=0;
	$('path.line').each(function(d,i){ 
		$(this).hide();
		if(activePaths.states.indexOf($(this).data('state')) >=0 && activePaths.energies.indexOf($(this).data('energy')) >= 0){
			$(this).show();
			var thisMax=0;
			if (perCapita===true){
				thisMax=$(this).data('percapitamax');
			}else{
				thisMax=$(this).data('max');
			}
			if(currentMax < thisMax){
				currentMax=thisMax;
			}
		}
	});

	//retrieves data;
	data=organizedData;

	// Scale the range of the data
	x.domain([startingValue,d3.max(data, function(d) { return d.year; })]);
	y.domain([0, currentMax]);

	var svg = d3.select("body").transition();

	//update axes
	svg.select(".y.axis")
		.duration(750)
		.call(yAxis);
	svg.select(".x.axis")
		.duration(750)
		.call(xAxis);

	// Update paths
	dataGroup.forEach(function(d, i) {
		d.values.forEach(function(dtwo, itwo){
			if(dtwo.values[itwo]!==undefined){
				svg.select('path.line.'+dtwo.values[0].state+'.'+dtwo.values[itwo].energy_type.split(' ').join('_'))
					.duration(1450)
					.attr("class", dtwo.values[itwo].energy_type.split(' ').join('_')+" line "+dtwo.values[0].state)
					.attr('d', valueline(dtwo.values));
			}
		});
	});
}