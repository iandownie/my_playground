// @codekit-prepend "vendor/d3.min.js"
// @codekit-prepend "vendor/topojson.js"
// @codekit-prepend "vendor/queue.v1.min.js"
// @codekit-prepend "vendor/heartcode-canvasloader-min-0.9.1.js"
// @codekit-append "vendor/fastclick.js"

$( document ).ready(function() {

    $('.js-race').css('display', 'none');
    $('.js-age').css('display', 'none');

    var supported = true,
        mobile = false;

    var path = d3.geo.path()
        .projection(null);

    var m_width = $(".map-container").outerWidth(),
        widthMap = 790,
        heightMap = 490,
        aspectMap = heightMap / widthMap;

    var svgMap = d3.select("#map")
        .attr("preserveAspectRatio", "xMidYMin")
        .attr("viewBox", "85 5 " + widthMap + " " + heightMap)
        .attr("width", m_width)
        .attr("height", m_width * aspectMap);

    var keyMargin = {top: 5, right: 0, bottom: 0, left: 0},
        keyWidth = 240 - keyMargin.left - keyMargin.right,
        keyHeight = 35 - keyMargin.top - keyMargin.bottom;

    var svgKey = d3.select("#key")
        .attr("width", keyWidth + keyMargin.left + keyMargin.right)
        .attr("height", keyHeight + keyMargin.top + keyMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + keyMargin.left + "," + keyMargin.top + ")");

    var g = svgKey.append("g")
        .attr("class", "key");

    var cd113,
        features,
        housePolygons,
        cities,
        statePolygons;

    var zoom,
        t = [0, 0],
        s = 1,
        ox = widthMap / 2,
        oy = widthMap / 2;


    var districtBorderWidth = 0.3,
        stateBorderWidth = 1.5,
        placeLabelSize,
        stateLabelSize;

    if ( window.screen.width < 500 ) {
        mobile = true;
    }

    if (!Modernizr.inlinesvg) {
        supported = false;
        $('#unsupported').removeClass('hidden');
        $('#unsupported a.close').on("click", function() {
            $('#unsupported').addClass("hidden");
        });
    }

    window.addEventListener('load', function() {
        FastClick.attach(document.getElementById("mapOptionsPanel"));
        FastClick.attach(document.getElementById("map"));
    }, false);

    if ( mobile ) {
        placeLabelSize = widthMap / m_width * 10;
        stateLabelSize = widthMap / m_width * 10;
    } else {
        placeLabelSize = widthMap / m_width * 13;
        stateLabelSize = widthMap / m_width * 13;
    }


    var tooltip = d3.select("#mapTooltip");

    var colorKey6blue = ['rgb(199,233,180)','rgb(127,205,187)','rgb(65,182,196)','rgb(29,145,192)','rgb(34,94,168)','rgb(12,44,132)'],
        colorKey6red = ["rgb(255,213,125)","rgb(255,184,97)","rgb(255,138,72)","rgb(254,80,54)","rgb(228,38,41)","rgb(165,24,42)"];

    var redDomain = [0.12, 0.16, 0.20, 0.24, 0.28],
        blueDomain = [0.10, 0.15, 0.20, 0.25, 0.30],
        redxDomain = [0, 0.32],
        bluexDomain = [0, 0.4],
        testDomain = [0.15, 0.3, 0.45, 0.6, 0.75],
        testxDomain = [0, 1];

    var color = d3.scale.threshold()
        .domain(redDomain)
        .range(colorKey6red);

    var geocoder = new google.maps.Geocoder();
    var autocomplete = new google.maps.places.Autocomplete(
        (document.getElementById('address')),
      { types: ['geocode'] });

    var povertyShareById = {},
        poorShareById = {},
        affectedAllShareById = {},
        affectedAllCountById = {},
        affectedAllRankById = {},
        affectedWomenShareById = {},
        affectedMenShareById = {},
        childrenShareById = {},
        dadsShareById = {},
        momsShareById = {},
        parentsShareById = {},
        familyMemberShareById = {},
        whiteAllShareById = {},
        whiteShareById = {},
        blackAllShareById = {},
        blackShareById = {},
        hispanicAllShareById = {},
        hispanicShareById = {},
        otherRaceAllShareById = {},
        otherRaceShareById = {},
        aged0to25ShareById = {},
        aged25to39ShareById = {},
        aged40to54ShareById = {},
        aged55plusShareById = {},
        repNameById = {},
        districtNameById = {},
        twitterById = {},
        contactById = {};

    var view = {map: "house", series: "all", data: affectedAllShareById};
    
    var x = d3.scale.linear()
        .domain(redxDomain)
        .range([0, 230]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(13)
        .tickFormat(d3.format("%"))
        .tickValues(color.domain());


    $(window).resize(function() {
        var w = $(".map-container").outerWidth();
        svgMap.attr("width", w);
        svgMap.attr("height", w * aspectMap);
        placeLabelSize = widthMap / w * 13;
        stateLabelSize = widthMap / w * 13;
    });


    function formatPercent(value) {
        if ( isNaN(parseFloat(value)) ) {
            return "Insufficient survey data available";
        } else {
            return d3.format(",.1%")(value);
        }
    }



    function ready(error, cd113Data, mapJSON) {
       
        cd113 = mapJSON;

        cd113Data.forEach(function(d) { povertyShareById[d.id] = d.povertyShare; });
        cd113Data.forEach(function(d) { poorShareById[d.id] = d.poorShare; });
        cd113Data.forEach(function(d) { affectedAllShareById[d.id] = d.affectedAllShare; });
        cd113Data.forEach(function(d) { affectedAllCountById[d.id] = d.affectedAllCount; });
        cd113Data.forEach(function(d) { affectedAllRankById[d.id] = d.affectedAllRank; });
        cd113Data.forEach(function(d) { affectedWomenShareById[d.id] = d.affectedWomenShare; });
        cd113Data.forEach(function(d) { affectedMenShareById[d.id] = d.affectedMenShare; });
        cd113Data.forEach(function(d) { childrenShareById[d.id] = d.childrenShare; });
        cd113Data.forEach(function(d) { momsShareById[d.id] = d.momsShare; });
        cd113Data.forEach(function(d) { dadsShareById[d.id] = d.dadsShare; });
        cd113Data.forEach(function(d) { parentsShareById[d.id] = d.parentsShare; });
        cd113Data.forEach(function(d) { familyMemberShareById[d.id] = d.familyMemberShare; });
        cd113Data.forEach(function(d) { whiteAllShareById[d.id] = d.whiteAllShare; });
        cd113Data.forEach(function(d) { whiteShareById[d.id] = d.whiteShare; });
        cd113Data.forEach(function(d) { blackAllShareById[d.id] = d.blackAllShare; });
        cd113Data.forEach(function(d) { blackShareById[d.id] = d.blackShare; });
        cd113Data.forEach(function(d) { hispanicAllShareById[d.id] = d.hispanicAllShare; });
        cd113Data.forEach(function(d) { hispanicShareById[d.id] = d.hispanicShare; });
        cd113Data.forEach(function(d) { otherRaceAllShareById[d.id] = d.otherRaceAllShare; });
        cd113Data.forEach(function(d) { otherRaceShareById[d.id] = d.otherRaceShare; });
        cd113Data.forEach(function(d) { aged0to25ShareById[d.id] = d.aged0to25Share; });
        cd113Data.forEach(function(d) { aged25to39ShareById[d.id] = d.aged25to39Share; });
        cd113Data.forEach(function(d) { aged40to54ShareById[d.id] = d.aged40to54Share; });
        cd113Data.forEach(function(d) { aged55plusShareById[d.id] = d.aged55plusShare; });
        cd113Data.forEach(function(d) { repNameById[d.id] = d.fullName; });
        cd113Data.forEach(function(d) { districtNameById[d.id] = d.districtName; });
        cd113Data.forEach(function(d) { twitterById[d.id] = d.twitter; });
        cd113Data.forEach(function(d) { contactById[d.id] = d.contact; });

        view.data = affectedAllShareById;
        view.series = "all";

        drawHouse();
        drawKey();

    } // queue ready function



    function eraseMap() {
        svgMap.select("g").remove();
    }


    function drawKey() {
        g.selectAll("rect")
            .data(color.range().map(function(d, i) {
              return {
                x0: i ? x(color.domain()[i - 1]) : x.range()[0],
                x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
                z: d
              };
            }))
          .enter().append("rect")
            .attr("height", 8)
            .attr("x", function(d) { return d.x0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .style("fill", function(d) { return d.z; });

        g.call(xAxis).append("text")
            .attr("class", "caption")
            .attr("y", -6);
    }

    function updateKey() {

        xAxis.scale(x)
            .tickValues(color.domain());

        g.selectAll("rect")
            .data(color.range().map(function(d, i) {
                return {
                    x0: i ? x(color.domain()[i - 1]) : x.range()[0],
                    x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
                    z: d
                };
            }))
            .transition().duration(500)
            .attr("height", 8)
            .attr("x", function(d) { return d.x0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .style("fill", function(d) { return d.z; });

        g.transition().duration(500)
         .call(xAxis);
    }
    

    function drawHouse() {
        zoom = d3.behavior.zoom()
            .on("zoom", zoomed);

        if ( mobile ) {
            zoom.scaleExtent([1, 52]);
        } else {
            zoom.scaleExtent([1, 24]);
        }

        svgMap.call(zoom).on("dblclick.zoom", null);

        features = svgMap.append("g").classed("features", true);

        housePolygons = features.selectAll("path")
            .data(topojson.feature(cd113, cd113.objects.districts).features)
            .enter()
            .append("path")
            .attr("class", function(d) { return "district " + d.id; })
            .attr("fill", function(d) {
                if ( isNaN(parseFloat(view.data[d.id])) ) {
                        return '#d7d7d7';
                    } else {
                        return color(view.data[d.id]);
                    }
            })
            .style("stroke-width", districtBorderWidth + "px")
            .attr("d", path)
            .on("mouseover", function(d) {
                if (screen.width > 600) {
                    d3.select(this).classed("hover", true);

                    tooltip
                    .html('<h5>' + districtNameById[d.id] + '</h5><p>' + formatPercent(view.data[d.id]) + '</p><p class="more">Click to zoom and<br>get district scorecard</p>')
                    .style("display", "block");
                }
            })
            .on("mousemove", function() {
                if (screen.width > 600) {
                    tooltip
                    .style("left", (d3.mouse(document.getElementById("interactive"))[0] - 20) + "px")
                    .style("top", (d3.mouse(document.getElementById("interactive"))[1] + 20) + "px");
                }
                
            })
            .on("mouseout", function() {
                if (screen.width > 600) {
                    d3.select(this).classed("hover", false);
                    tooltip.style("display", "none");
                }
            })
            .on("click", function(d) {
                if (d3.event.defaultPrevented) { return; }
                updatePopUp(d.id);
                if ( ! mobile ) {
                    zoomTo(d.id);
                } else {
                    updateSelectedPath(d.id);
                    d3.select("#popUp").classed("show", true);
                }
            });
            
        svgMap.on("mousewheel.zoom", null)
        .on("DOMMouseScroll.zoom", null)
        .on("wheel.zoom", null);       
        
        features.append("path")
            .datum(topojson.mesh(cd113, cd113.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "state-border")
            .style("stroke-width", stateBorderWidth + "px")
            .attr("d", path);

        cities = features.append("g").classed("citiesGroup", true);

        cities.selectAll(".place")
            .data(topojson.feature(cd113, cd113.objects.places).features)
            .enter()
            .append("circle")
            .attr("d", path)
            .attr("cx", function(d) {
                return d.geometry.coordinates[0];
            })
            .attr("cy", function(d) {
                return d.geometry.coordinates[1];
            })
            .attr("r", function() {
                if ( mobile ) { return 4; } else { return 2; }
            })
            .attr("class", "place")
            .attr("opacity", "0");

        cities.selectAll("text.place-label")
            .data(topojson.feature(cd113, cd113.objects.places).features)
            .enter()
            .append("text")
            .attr("class", "place-label")
            .attr("x", function(d) { return d.geometry.coordinates[0]; })
            .attr("y", function(d) { return d.geometry.coordinates[1]; })
            .attr("text-anchor", function(d) {
                switch(d.properties.cityName) {
                    case "Minneapolis" : return "end";
                    case "Ft. Worth" : return "end";
                    case "Topeka" : return "end";
                    default : return "start";
                }
            })
            .attr("font-size", function() { return placeLabelSize + "px"; })
            .attr("opacity", "0")
            .text(function(d) { return d.properties.cityName; });

       google.maps.event.addListener(autocomplete, 'place_changed', function() { fillInAddress(); });



        function fillInAddress() {
            autocomplete.getPlace();  // Get the place details from the autocomplete object.
        }



        function codeAddress() {          
            d3.select('#addressForm').append("div").attr("id", "canvasloader-container");

            var cl = new CanvasLoader('canvasloader-container');
            cl.setColor('#61A534'); // default is '#000000'
            cl.setShape('rect'); // default is 'oval'
            cl.setDiameter(17); // default is 40
            cl.setDensity(9); // default is 40
            cl.setRange(0.9); // default is 1.3
            cl.setSpeed(1); // default is 2
            cl.setFPS(17); // default is 24
            cl.show(); // Hidden by default

            var address = document.getElementById('address').value;
            
            geocoder.geocode( { 'address': address}, function(results, status) {            
            if (status === google.maps.GeocoderStatus.OK) {
                var lat = results[0].geometry.location.lat();
                var lon = results[0].geometry.location.lng();

                var query_params = { apikey: '68a9d53a00c9462cafb63657e4664820',
                    latitude: lat,
                    longitude: lon
                };

                var endpoint = 'https://congress.api.sunlightfoundation.com/districts/locate/';

                var options = {
                    data: query_params,
                    type: 'GET',
                    dataType: 'jsonp'
                };

                jQuery.ajax(endpoint, options)
                    .done(function(data){
                        var state = data.results[0].state;
                        var district = data.results[0].district;
                        tooltip.style("display", "none");
                        updatePopUp(state + "-" + district);
                        zoomTo(state + "-" + district);
                        cl.kill();
                        d3.select("#canvasloader-container").remove();
                    });
            } else {
              document.getElementById('address').value = "Error: " + status;
              d3.select("#canvasloader-container").remove();
            }
          });
        }

        $('#geocodeSubmit').on("click", function() { codeAddress(); });
    } // drawHouse



    function drawStates() {
        tooltip.style("display", "none");
        s = 1;
        t = [0, 0];
        zoom.translate(t);
        zoom.scale(s);

        features = svgMap.append("g").classed("features", true);
        
        statePolygons = features.selectAll("path")
            .data(topojson.feature(cd113, cd113.objects.states).features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", function(d) { return "state " + d.id; })
            .attr("fill", function(d) { 
                if ( isNaN(parseFloat(view.data[d.id])) ) {
                        return '#d7d7d7';
                    } else {
                        return color(view.data[d.id]);
                    }
            })
            .on("mouseover", function(d) {
                if (screen.width > 600) {
                    d3.select(this).classed("hover", true);

                    tooltip
                    .html('<h5>' + districtNameById[d.id] + '</h5><p>' + formatPercent(view.data[d.id]) + '</p><p class="more">Click to get state scorecard</p>')
                    .style("display", "block");
                }
            })
            .on("mousemove", function() {
                if (screen.width > 600) {
                    tooltip
                    .style("left", (d3.mouse(document.getElementById("interactive"))[0] - 15) + "px")
                    .style("top", (d3.mouse(document.getElementById("interactive"))[1] + 15) + "px");
                }
                
            })
            .on("mouseout", function() {
                if (screen.width > 600) {
                    d3.select(this).classed("hover", false);
                    tooltip.style("display", "none");
                }
            })
            .on("click", function(d) {
                if (d3.event.defaultPrevented) { return; }
                updatePopUp(d.id);
                if ( ! mobile ) {
                    zoomTo(d.id);
                } else {
                    updateSelectedPath(d.id);
                    d3.select("#popUp").classed("show", true);
                }
            });

        features.append("path")
            .datum(topojson.mesh(cd113, cd113.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "state-border")
            .style("stroke-width", stateBorderWidth + "px")
            .attr("d", path);

        features.selectAll(".stateLabel")
            .data(topojson.feature(cd113, cd113.objects.states).features)
            .enter()
            .append("text")
            .text(function(d) { if (d.properties.APname !== "D.C." &&
                d.properties.APname !== "Del." &&
                d.properties.APname !== "R.I." &&
                d.properties.APname !== "Md.") { return d.properties.APname; }})
            .attr("class", function(d) { return "stateLabel " + d.properties.APname; } )
            .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
            .attr("dy", function(d) {
                switch(d.properties.APname) {
                    case "Mich." : return widthMap / 33;
                    case "N.H." : return widthMap / 120;
                    case "Idaho" : return widthMap / 45;
                    case "Mass." : return 0;
                    case "Conn." : return 1;
                    default : return 3;
                }
            })
            .attr("dx", function(d) {
                switch(d.properties.APname) {
                    case "Calif." : return -widthMap / 120;
                    case "Fla." : return widthMap / 60;
                    case "Hawaii" : return -widthMap / 40;
                    case "La." : return -widthMap / 120;
                    case "Mich." : return widthMap / 60;
                    case "N.H." : return widthMap / 500;
                    case "N.J." : return widthMap / 200;
                    default : return 0;
                }
            })
            .style("opacity", function() {
                if ( mobile ) { return 0; } else { return 1;}
            })
            .attr("font-size", function(d) {
                switch(d.properties.APname) {
                    case "Conn." : return 0.6 * stateLabelSize + "px";
                    case "N.J." : return 0.6 * stateLabelSize + "px";
                    case "Mass." : return 0.7 * stateLabelSize + "px";
                    case "N.H." : return 0.7 * stateLabelSize + "px";
                    default : return stateLabelSize + "px";
                }
            });
    }



    function updateHouse(dataset) {
        if ( mobile ) {
            housePolygons.attr("fill", function(d) { 
                if ( isNaN(parseFloat(dataset[d.id])) ) {
                    return '#d7d7d7';
                } else {
                    return color(dataset[d.id]);
                }
            });
        } else {
            housePolygons.transition().duration(500)
                .attr("fill", function(d) { 
                    if ( isNaN(parseFloat(dataset[d.id])) ) {
                        return '#d7d7d7';
                    } else {
                        return color(dataset[d.id]);
                    }
                });
        }
    }



    function updateStates(dataset) {
        if ( mobile ) {
            statePolygons.attr("fill", function(d) { 
                if ( isNaN(parseFloat(dataset[d.id])) ) {
                    return '#d7d7d7';
                } else {
                    return color(dataset[d.id]);
                }
            });
        } else {
            statePolygons.transition().duration(500)
                .attr("fill", function(d) { 
                    if ( isNaN(parseFloat(dataset[d.id])) ) {
                        return '#d7d7d7';
                    } else {
                        return color(dataset[d.id]);
                    }
                });
        }
        
    }



    function updateCities() {
        if ( mobile ) {
            cities.selectAll(".place-label")
                .attr("opacity", function() {
                    if ( mobile ) { return -3 + s; } else { return -1.25 + s; }
                })
                .attr("font-size", function() { return placeLabelSize / s + "px"; })
                .attr("dy", function() { return placeLabelSize / 2.6 / s + "px"; })
                .attr("dx", function(d) {
                    switch (d.properties.cityName) {
                        case "Minneapolis" : return -placeLabelSize / 2 / s + "px";
                        case "Ft. Worth" : return -placeLabelSize / 2 / s + "px";
                        case "Topeka" : return -placeLabelSize / 2 / s + "px";
                        default : return placeLabelSize / 2 / s + "px";
                    }
                });

            cities.selectAll(".place")
                .attr("opacity", function() {
                    if ( mobile ) { return -3 + s; } else { return -1.25 + s; }
                })
                .attr("r", function() {
                    if ( mobile ) { return 4 / s; } else { return 2 / s; }
                });

        } else {
            cities.selectAll(".place-label")
                .transition().duration(500)
                .attr("opacity", function() {
                    if ( mobile ) { return -3 + s; } else { return -1.25 + s; }
                })
                .attr("font-size", function() { return placeLabelSize / s + "px"; })
                .attr("dy", function() { return placeLabelSize / 2.6 / s + "px"; })
                .attr("dx", function(d) {
                    switch (d.properties.cityName) {
                        case "Minneapolis" : return -placeLabelSize / 2 / s + "px";
                        case "Ft. Worth" : return -placeLabelSize / 2 / s + "px";
                        case "Topeka" : return -placeLabelSize / 2 / s + "px";
                        default : return placeLabelSize / 2 / s + "px";
                    }
                });

            cities.selectAll(".place")
                .transition().duration(500)
                .attr("opacity", function() {
                    if ( mobile ) { return -3 + s; } else { return -1.25 + s; }
                })
                .attr("r", function() {
                    if ( mobile ) { return 4 / s; } else { return 2 / s; }
                });
        }
    } //updateCities



    function updateStateLabels() {
        if ( mobile ) {
            features.selectAll('.stateLabel')
                .attr("font-size", function(d) {
                    switch(d.properties.APname) {
                        case "Conn." : return 0.6 * stateLabelSize / s + "px";
                        case "Mass." : return 0.7 * stateLabelSize / s + "px";
                        case "N.H." : return 0.7 * stateLabelSize / s + "px";
                        case "N.J." : return 0.7 * stateLabelSize / s + "px";
                        default : return stateLabelSize / s + "px";
                    }
                })
                .style("opacity", function() {
                    return -1 + s;
                });
           
        } else {
            if ( s < 3 ) {
                features.selectAll('.stateLabel').transition().duration(500)
                    .attr("font-size", function(d) {
                        switch(d.properties.APname) {
                            case "Conn." : return 0.6 * stateLabelSize / s + "px";
                            case "Mass." : return 0.7 * stateLabelSize / s + "px";
                            case "N.H." : return 0.7 * stateLabelSize / s + "px";
                            case "N.J." : return 0.7 * stateLabelSize / s + "px";
                            default : return stateLabelSize / s + "px";
                        }
                    });
            } else {
                features.selectAll('.stateLabel').transition().duration(500)
                    .attr("font-size", function() { return stateLabelSize / s + "px"; });
            }
        }
        
    }



    function updateFeatures() {
        if ( mobile ) {
            features.attr("transform", "translate(" + t + ")scale(" + s + ")");
            features.select(".state-border").style("stroke-width", stateBorderWidth / s + "px");
            features.selectAll(".district").style("stroke-width", districtBorderWidth / s + "px");
        } else {
            features.transition().duration(500)
                .attr("transform", "translate(" + t + ")scale(" + s + ")");
            features.select(".state-border").transition().duration(500)
                .style("stroke-width", stateBorderWidth / s + "px");
            features.selectAll(".district").transition().duration(500)
                .style("stroke-width", districtBorderWidth / s + "px");
        }
    }


    function zoomed() {
        tooltip.style("display", "none");
    
        t = d3.event.translate;
        s = d3.event.scale;    
        t[0] = Math.min((widthMap / 2 - ox + 150) * (s - 1), Math.max((widthMap / 2 + ox + 125) * (1 - s), t[0]));
        t[1] = Math.min((heightMap / 2 - oy + 155) * (s - 1), Math.max((heightMap / 2 + oy - 120)  * (1 - s), t[1]));

        zoom.translate(t);

        features.attr("transform", "translate(" + t + ")scale(" + s + ")");
        features.select(".state-border").style("stroke-width", stateBorderWidth / s + "px");
        features.selectAll(".district").style("stroke-width", districtBorderWidth / s + "px");

        if ( view.map === "house") {
            updateCities();
        } else {
            updateStateLabels();
        }
    }



    function updateSelectedPath(location) {
        d3.selectAll("#map .selected").classed("selected", false);
        d3.select("path." + location).classed("selected", true);
    }



    function zoomTo(location) {
        t = zoom.translate();

        var theSelection = d3.select("path." + location);
        
        d3.selectAll("#map .selected").classed("selected", false);
        theSelection.classed("selected", true);
        
        var element = theSelection.node(),
            bbox = element.getBBox(),
            bboxArea = bbox.width * bbox.height;
        
        var zoomX = bbox.x + bbox.width/2,
            zoomY = bbox.y + bbox.height/2;

        if (bboxArea < 30) {
            s = 12;
        } else if (bboxArea < 200 ) {
            s = 8;
        } else if (bboxArea < 2200 ) {
            s = 4;
        } else {
            s = 2;
        }
        
        t[0] = -((zoomX * s) - (widthMap / 1.35));

        if (zoomY < 130 ) {
            t[1] = -((zoomY * s) - (heightMap / 4));
        } else {
            t[1] = -((zoomY * s) - (heightMap / 2));
        }
            
        t[0] = Math.min((widthMap / 2 - ox + 150) * (s - 1), Math.max((widthMap / 2 + ox + 125) * (1 - s), t[0]));
        t[1] = Math.min((heightMap / 2 - oy + 155) * (s - 1), Math.max((heightMap / 2 + oy - 120)  * (1 - s), t[1]));
        
        zoom.scale(s)
            .translate(t);

        updateFeatures();
        if ( view.map === "house") {
            updateCities();
        } else {
            updateStateLabels();
        }
        
        if ( ! d3.select("#popUp").classed("show") ) {
            setTimeout(function(){ $('#popUp').addClass("show"); },450);
        }
        
    } // function zoomTo



    function closePopUp() {
        $('#popUp').removeClass("show");
        d3.selectAll("#map .selected").classed("selected", false);
        document.getElementById('address').value = "";
    }



    function updatePopUp(location) {
        var state = location.substring(0,2);

        $('#popUp .popUpContent .districtName').html(districtNameById[location]);
        $('#popUp .senatorName').html(repNameById[state]);
        $('#popUp .affectedCount').html(affectedAllCountById[location]);
        $('a.printBtn').attr("href", function() { return "scorecard?district=" + location; });
        
        $('#popUp .popupTable').html('<tr class="label"><td colspan="2">Percent of workers likely to benefit from increasing the minimum wage to $10.10</td></tr><tr class="data"><td class="col1">All</td><td class="col2">' + formatPercent(affectedAllShareById[location]) + '</td></tr>');

        if ( view.series === "all" ) {
            $('#popUp .popupTable').append('<tr class="data"><td class="col1">Women</td><td class="col2">' + formatPercent(affectedWomenShareById[location]) + '</td></tr><tr class="data last"><td class="col1">Men</td><td class="col2">' + formatPercent(affectedMenShareById[location]) + '</td></tr>' + '<tr class="label"><td colspan="2">Percent of working families that live ...</td></tr><tr class="data"><td class="col1">In poverty</td><td class="col2">' + formatPercent(povertyShareById[location]) + '</td></tr><tr class="data last"><td class="col1">Below 200% of the poverty line</td><td class="col2">' + formatPercent(poorShareById[location]) + '</td></tr>');
        }

        if ( view.series === "gender" ) {
            $('#popUp .popupTable').append('<tr class="data"><td class="col1">Women</td><td class="col2">' + formatPercent(affectedWomenShareById[location]) + '</td></tr><tr class="data last"><td class="col1">Men</td><td class="col2">' + formatPercent(affectedMenShareById[location]) + '</td></tr>');
        }

        if ( view.series === "poverty" ) {
            $('#popUp .popupTable').append('<tr class="label"><td colspan="2">Percent of working families that live ...</td></tr><tr class="data"><td class="col1">In poverty</td><td class="col2">' + formatPercent(povertyShareById[location]) + '</td></tr><tr class="data last"><td class="col1">Below 200% of the poverty line</td><td class="col2">' + formatPercent(poorShareById[location]) + '</td></tr>');
        }

        if ( view.series === "race") {
            $('#popUp .popupTable').append('<tr class="data"><td class="col1">Whites</td><td class="col2">' + formatPercent(whiteShareById[location]) + '</td></tr><tr class="data"><td class="col1">African Americans</td><td class="col2">' + formatPercent(blackShareById[location]) + '</td></tr><tr class="data"><td class="col1">Latinos</td><td class="col2">' + formatPercent(hispanicShareById[location]) + '</td></tr><tr class="data"><td class="col1">Asian Americans and others</td><td class="col2">' + formatPercent(otherRaceShareById[location]) + '</td></tr>');

            $('#popUp .popupTable').append('<tr class="label"><td colspan="2">Share of all affected workers who are ...<sup id="footnoteRef5"><a class="inlineFootnote" href="#fn5">5</a></sup></td></tr><tr class="data"><td class="col1">White</td><td class="col2">' + formatPercent(whiteAllShareById[location]) + '</td></tr><tr class="data"><td class="col1">African American</td><td class="col2">' + formatPercent(blackAllShareById[location]) + '</td></tr><tr class="data"><td class="col1">Latino</td><td class="col2">' + formatPercent(hispanicAllShareById[location]) + '</td></tr><tr class="data last"><td class="col1">Asian American and other</td><td class="col2">' + formatPercent(otherRaceAllShareById[location]) + '</td></tr>');
        }

        if ( view.series === "family" ) {
            $('#popUp .popupTable').append('<tr class="data"><td class="col1">Parents</td><td class="col2">' + formatPercent(parentsShareById[location]) + '</td></tr><tr class="data"><td class="col1">Mothers</td><td class="col2">' + formatPercent(momsShareById[location]) + '</td></tr><tr class="data"><td class="col1">Fathers</td><td class="col2">' + formatPercent(dadsShareById[location]) + '</td></tr>');
            $('#popUp .popupTable').append('<tr class="label"><td colspan="2">Percent of members of working families likely to benefit</td></tr><tr class="data"><td class="col1">Children<sup id="footnoteRef3"><a class="inlineFootnote" href="#fn3">3</a></sup></td><td class="col2">' + formatPercent(childrenShareById[location]) + '</td></tr><tr class="data last"><td class="col1">All family members<sup id="footnoteRef4"><a class="inlineFootnote" href="#fn4">4</a></sup></td><td class="col2">' + formatPercent(familyMemberShareById[location]) + '</td></tr>');
        }

        if ( view.series === "age") {
            $('#popUp .popupTable').append('<tr class="label"><td colspan="2">Share of all affected workers who are ...</td></tr><tr class="data"><td class="col1">Younger than 25</td><td class="col2">' + formatPercent(aged0to25ShareById[location]) + '</td></tr><tr class="data"><td class="col1">25-39 years old</td><td class="col2">' + formatPercent(aged25to39ShareById[location]) + '</td></tr><tr class="data"><td class="col1">40-54 years old</td><td class="col2">' + formatPercent(aged40to54ShareById[location]) + '</td></tr><tr class="data last"><td class="col1">55 and older</td><td class="col2">' + formatPercent(aged55plusShareById[location]) + '</td></tr>');
        }

        if (twitterById[state] !== "") {
            d3.select('#popUp a.tweetSen')
                .classed('hidden', false)
                .attr("href", function() {
                    var baseURL = "https://twitter.com/home?status=";
                    var message1 = "%20workers%20in%20",
                        message2 = "%20could%20benefit%20from%20a%20$10.10%20minimum%20wage.%20See%20this%20Oxfam%20report:%20http://www.oxfamamerica.org/workingpoormap";
                    return baseURL + twitterById[state] + ":%20" + affectedAllCountById[state] + message1 + state + message2;
                });
        } else {
            d3.select('#popUp a.tweetSen').classed('hidden', true);
        }

        if (view.map === "house") {
            $('.houseOnly').removeClass('hidden');
            $('.statesOnly').addClass('hidden');

            $('#popUp .districtRank').html(affectedAllRankById[location]);
            $('#popUp .repName').html(repNameById[location]);

            d3.select("#popUp a.contactBtn").attr("href", contactById[location]);
            
            if (twitterById[location] !== "") {
                d3.select('#popUp a.tweetRep')
                    .classed('hidden', false)
                    .attr("href", function() {
                        var baseURL = "https://twitter.com/home?status=";
                        var message = "%20workers%20in%20your%20district%20could%20benefit%20from%20a%20$10.10%20minimum%20wage.%20See%20this%20Oxfam%20report:%20http://www.oxfamamerica.org/workingpoormap";
                        return baseURL + twitterById[location] + ":%20" + affectedAllCountById[location] + message;
                    });
            } else {
                d3.select('#popUp a.tweetRep').classed('hidden', true);
            }
        } else {
            $('.houseOnly').addClass('hidden');
            $('.statesOnly').removeClass('hidden');
        }
    } // updatePopUp


    // Search, Reset/Home, Zoom in and out map control buttons

    d3.select(".homeBtn").on("click", function() {
        tooltip.style("display", "none");
        s = 1;
        t = [0, 0];

        if (zoom.scale() > zoom.scaleExtent()[0]) {
            zoom.scale(s);
            zoom.translate(t);
            
            if ( mobile ) {
                features.attr('transform', 'translate(0,0) scale(1)');
                features.select(".state-border").style("stroke-width", stateBorderWidth / s + "px");
                features.selectAll(".district").style("stroke-width", districtBorderWidth / s + "px");
            } else {
                features.transition().duration(500)
                    .attr('transform', 'translate(0,0) scale(1)');
                features.select(".state-border").transition().duration(500)
                    .style("stroke-width", stateBorderWidth / s + "px");
                features.selectAll(".district").transition().duration(500)
                    .style("stroke-width", districtBorderWidth / s + "px");
            }

            if ( view.map === "house" ) {
                updateCities();
            } else {
                updateStateLabels();
            }
            
        }
    });

    d3.select(".zoomInBtn").on("click", function() {
        if (zoom.scale() * 2 <= zoom.scaleExtent()[1]) {
            s = zoom.scale() * 2;
            t = zoom.translate();

            t[0] = t[0] * 2 - (widthMap / 2);
            t[1] = t[1] * 2 - (heightMap / 2);

            zoom.scale(s);
            zoom.translate(t);
            updateFeatures();
            
            if ( view.map === "house" ) {
                updateCities();
            } else {
                updateStateLabels();
            }
        }
    });

    d3.select(".zoomOutBtn").on("click", function() {
        tooltip.style("display", "none");

        if (zoom.scale() > zoom.scaleExtent()[0]) {
            if (s < zoom.scaleExtent()[0]) { s = zoom.scaleExtent()[0]; }

            s = Math.max( zoom.scale() / 2, zoom.scaleExtent()[0] );
            t = zoom.translate();

            t[0] = t[0] / 2 + (widthMap / 4);
            t[1] = t[1] / 2 + (heightMap / 4);

            t[0] = Math.min((widthMap / 2 - ox - 100) * (s - 1), Math.max((widthMap / 2 + ox) * (1 - s), t[0]));
            t[1] = Math.min((heightMap / 2 - oy + 175) * (s - 1), Math.max((heightMap / 2 + oy - 200)  * (1 - s), t[1]));

            zoom.scale(s);
            zoom.translate(t);
            updateFeatures();
            
            if ( view.map === "house" ) {
                updateCities();
            } else {
                updateStateLabels();
            }
        }
    });



    // ******************
    // More maps panel
    // ******************

    $('a.mapOptionsBtn').on('click', function() {
        $('.panel-overlay').removeClass('hidden');
        $('div.mapOptionsPanel').addClass('show');
    });

    $('.panel-overlay').on('click touchend', function() {
        $('.panel-overlay').addClass('hidden');
        $('div.mapOptionsPanel').removeClass('show');
    });

    $('ul.tabs a').click(function() {
        var $this = $(this);

        if ( !$this.closest('li').hasClass('active') ) {
            $('ul.tabs li').toggleClass('active');
            $('.benefit-content').toggleClass('hidden');
            $('.poverty-content').toggleClass('hidden');
        }
    });

    $('ul.sub-group a').click(function() {
        $(this).closest('.group-header').addClass('has-active');
    });

    $('ul.btn-list li.group-header > a').click(function() {
        var $this = $(this);

        if ( $this.closest('li.group-header').hasClass('open') ) {
            $('ul.btn-list li.group-header').removeClass('open');
        } else {
            $('ul.btn-list li.group-header').removeClass('open');
            $(this).closest('li.group-header').addClass('open');
        }
    });

    $('ul.btn-list a.btn').click(function() {
        var $this = $(this);

        $('ul.btn-list li').removeClass('active');
        $this.closest('li').addClass('active');

        if ( $this.closest('ul').hasClass('btn-list') ) {
            $('li.group-header').removeClass('has-active');
            $('li.group-header').removeClass('open');
        }

        if ( $this.closest('ul').hasClass('sub-group') ) {
            $('li.group-header').removeClass('has-active');
            $this.closest('li.group-header').addClass('has-active');
        }

        $('.panel-overlay').addClass('hidden');
        $('div.mapOptionsPanel').removeClass('show');

        switch ($this.attr('data-value')) {
            case "all" :
                $('.mapTitle').text("Concentrations of low-wage workers");
                $('.mapSubtitle').text('This map illustrates the percentages of workers who would benefit from a raise in the minimum wage to $10.10. The darker colors indicate higher concentrations of low-wage workers.');
                $('.mapSubtitle').removeClass('hidden');
                view.data = affectedAllShareById;
                view.series = "all";
                color
                    .domain(redDomain)
                    .range(colorKey6red);
                x.domain(redxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(affectedAllShareById);
                } else {
                    closePopUp();
                    updateStates(affectedAllShareById);
                }
                break;
            case "women" :
                $('.mapTitle').html("Concentrations of low-wage female workers");
                $('.mapSubtitle').text('This map shows the share of all female workers in each district that would benefit by increasing the minimum wage to $10.10. The darker colors indicate higher concentrations of low-wage workers.');
                $('.mapSubtitle').removeClass('hidden');
                view.data = affectedWomenShareById;
                view.series = "gender";
                color
                    .domain(redDomain)
                    .range(colorKey6red);
                x.domain(redxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(affectedWomenShareById);
                } else {
                    closePopUp();
                    updateStates(affectedWomenShareById);
                }
                break;
            case "men" :
                $('.mapTitle').html("Concentrations of low-wage male workers");
                $('.mapSubtitle').text('This map shows the share of all male workers in each district that would benefit by increasing the minimum wage to $10.10. The darker colors indicate higher concentrations of low-wage workers.');
                $('.mapSubtitle').removeClass('hidden');
                view.data = affectedMenShareById;
                view.series = "gender";
                color
                    .domain(redDomain)
                    .range(colorKey6red);
                x.domain(redxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(affectedMenShareById);
                } else {
                    closePopUp();
                    updateStates(affectedMenShareById);
                }
                break;
            case "poverty" :
                $('.mapTitle').html("Percent of working families living in poverty");
                $('.mapSubtitle').text('This map shows the percentage of families who live near poverty despite having at least one employed adult. The darker colors indicate higher concentrations of low-wage workers.');
                view.data = povertyShareById;
                view.series = "poverty";
                color
                    .domain(blueDomain)
                    .range(colorKey6blue);
                x.domain(bluexDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(povertyShareById);
                } else {
                    closePopUp();
                    updateStates(povertyShareById);
                }
                break;
            case "nearPoverty" :
                $('.mapTitle').html("Percent of working families living below 200% of the poverty line");
                $('.mapSubtitle').text('The percentage of families who live near the poverty line despite having at least one employed adult. The darker colors indicate higher concentrations of low-wage workers.');
                view.data = poorShareById;
                view.series = "poverty";
                color
                    .domain(blueDomain)
                    .range(colorKey6blue);
                x.domain(bluexDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(poorShareById);
                } else {
                    closePopUp();
                    updateStates(poorShareById);
                }
                break;
            case "dads" : 
                $('.mapTitle').html("Concentrations of low-wage fathers");
                $('.mapSubtitle').text('This map shows the share of all working fathers in each district that would benefit by increasing the minimum wage to $10.10. The darker colors indicate higher concentrations of low-wage workers.');
                view.data = dadsShareById;
                view.series = "family";
                color
                    .domain(redDomain)
                    .range(colorKey6red);
                x.domain(redxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(dadsShareById);
                } else {
                    closePopUp();
                    updateStates(dadsShareById);
                }
                break;
            case "moms" : 
                $('.mapTitle').html("Concentrations of low-wage mothers");
                $('.mapSubtitle').text('This map shows the share of all working mothers in each district that would benefit by increasing the minimum wage to $10.10. The darker colors indicate higher concentrations of low-wage workers.');
                view.data = momsShareById;
                view.series = "family";
                color
                    .domain(redDomain)
                    .range(colorKey6red);
                x.domain(redxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(momsShareById);
                } else {
                    closePopUp();
                    updateStates(momsShareById);
                }
                break;
            case "parents" : 
                $('.mapTitle').html("Concentrations of low-wage parents");
                $('.mapSubtitle').text('This map shows the share of all working  parents in each district that would benefit by increasing the minimum wage to $10.10. The darker colors indicate higher concentrations of low-wage workers.');
                view.data = parentsShareById;
                view.series = "family";
                color
                    .domain(redDomain)
                    .range(colorKey6red);
                x.domain(redxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(parentsShareById);
                } else {
                    closePopUp();
                    updateStates(parentsShareById);
                }
                break;
            case "children" : 
                $('.mapTitle').html("Concentrations of children of low-wage workers");
                $('.mapSubtitle').text('This map shows the share of all children (under 18 years old) in each district who have a parent that would benefit by increasing the minimum wage to $10.10. The darker colors indicate higher concentrations of children with a low-wage working parent.');
                view.data = childrenShareById;
                view.series = "family";
                color
                    .domain(redDomain)
                    .range(colorKey6red);
                x.domain(redxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(childrenShareById);
                } else {
                    closePopUp();
                    updateStates(childrenShareById);
                }
                break;
            case "family" : 
                $('.mapTitle').html("Concentrations of families dependent on low-wage workers");
                $('.mapSubtitle').text('This map shows the share of households in each district where a low-wage worker is sustaining other family members. The darker colors indicate higher concentrations of dependents with a low-wage working head of household.');
                view.data = familyMemberShareById;
                view.series = "family";
                color
                    .domain(redDomain)
                    .range(colorKey6red);
                x.domain(redxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(familyMemberShareById);
                } else {
                    closePopUp();
                    updateStates(familyMemberShareById);
                }
                break;

            case "white" : 
                $('.mapTitle').html("Low-wage workers by race/ethnicity: Whites");
                $('.mapSubtitle').text('This map shows the share of all low-wage workers who would benefit from a raise in the minimum wage to $10.10 who are white. The darker colors indicate higher percentages of low-wage workers in this category.');
                view.data = whiteAllShareById;
                view.series = "race";
                color
                    .domain(testDomain)
                    .range(colorKey6red);
                x.domain(testxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(whiteAllShareById);
                } else {
                    closePopUp();
                    updateStates(whiteAllShareById);
                }
                break;

            case "black" : 
                $('.mapTitle').html("Low-wage workers by race/ethnicity: African Americans");
                $('.mapSubtitle').text('This map shows the share of all low-wage workers who would benefit from a raise in the minimum wage to $10.10 who are African American. The darker colors indicate higher percentages of low-wage workers in this category.');
                view.data = blackAllShareById;
                view.series = "race";
                color
                    .domain(testDomain)
                    .range(colorKey6red);
                x.domain(testxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(blackAllShareById);
                } else {
                    closePopUp();
                    updateStates(blackAllShareById);
                }
                break;

            case "hispanic" : 
                $('.mapTitle').html("Low-wage workers by race/ethnicity: Latinos");
                $('.mapSubtitle').text('This map shows the share of all low-wage workers who would benefit from a raise in the minimum wage to $10.10 who are latino. The darker colors indicate higher percentages of low-wage workers in this category.');
                view.data = hispanicAllShareById;
                view.series = "race";
                color
                    .domain(testDomain)
                    .range(colorKey6red);
                x.domain(testxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(hispanicAllShareById);
                } else {
                    closePopUp();
                    updateStates(hispanicAllShareById);
                }
                break;

            case "otherRace" : 
                $('.mapTitle').html("Low-wage workers by race/ethnicity: Asian Americans and Others");
                $('.mapSubtitle').text('This map shows the share of all low-wage workers who would benefit from a raise in the minimum wage to $10.10 who are Asian American or another race not included in other categories. The darker colors indicate higher percentages of low-wage workers in this category.');
                view.data = otherRaceAllShareById;
                view.series = "race";
                color
                    .domain(testDomain)
                    .range(colorKey6red);
                x.domain(testxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(otherRaceAllShareById);
                } else {
                    closePopUp();
                    updateStates(otherRaceAllShareById);
                }
                break;

            case "age1" : 
                $('.mapTitle').html("Low-wage workers by age: Younger than 25");
                $('.mapSubtitle').text('This map shows the share of all low-wage workers who would benefit from a raise in the minimum wage to $10.10 who are younger than 25. The darker colors indicate higher percentages of low-wage workers in this category.');
                view.data = aged0to25ShareById;
                view.series = "age";
                color
                    .domain(testDomain)
                    .range(colorKey6red);
                x.domain(testxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(aged0to25ShareById);
                } else {
                    closePopUp();
                    updateStates(aged0to25ShareById);
                }
                break;

            case "age2" : 
                $('.mapTitle').html("Low-wage workers by age: 25-39 years old");
                $('.mapSubtitle').text('This map shows the share of all low-wage workers who would benefit from a raise in the minimum wage to $10.10 who are between the ages of 25 and 39. The darker colors indicate higher percentages of low-wage workers in this category.');
                view.data = aged25to39ShareById;
                view.series = "age";
                color
                    .domain(testDomain)
                    .range(colorKey6red);
                x.domain(testxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(aged25to39ShareById);
                } else {
                    closePopUp();
                    updateStates(aged25to39ShareById);
                }
                break;

            case "age3" : 
                $('.mapTitle').html("Low-wage workers by age: 40-54 years old");
                $('.mapSubtitle').text('This map shows the share of all low-wage workers who would benefit from a raise in the minimum wage to $10.10 who are between the ages of 40 and 54. The darker colors indicate higher percentages of low-wage workers in this category.');
                view.data = aged40to54ShareById;
                view.series = "age";
                color
                    .domain(testDomain)
                    .range(colorKey6red);
                x.domain(testxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(aged40to54ShareById);
                } else {
                    closePopUp();
                    updateStates(aged40to54ShareById);
                }
                break;

            case "age4" : 
                $('.mapTitle').html("Low-wage workers by age: 55 or older");
                $('.mapSubtitle').text('This map shows the share of all low-wage workers who would benefit from a raise in the minimum wage to $10.10 who are 55 years old or older. The darker colors indicate higher percentages of low-wage workers in this category.');
                view.data = aged55plusShareById;
                view.series = "age";
                color
                    .domain(testDomain)
                    .range(colorKey6red);
                x.domain(testxDomain);
                updateKey();
                if (view.map === "house") {
                    closePopUp();
                    updateHouse(aged55plusShareById);
                } else {
                    closePopUp();
                    updateStates(aged55plusShareById);
                }
                break;
        }
    });


    $('ul.btnGroupToggle.set2 li a').click(function() {
        var $this = $(this);
        $('ul.btnGroupToggle.set2 li').removeClass('active');
        $this.closest('li').addClass('active');

        switch ($this.attr('data-value')) {
            case "6" :
                if (view.map === "states") {
                    view.map = "house";
                    closePopUp();
                    $('#addressForm').removeClass("hidden");
                    eraseMap();
                    drawHouse();
                }
                break;

            case "7" :
                if (view.map === "house") {
                    view.map = "states";
                    closePopUp();
                    $('#addressForm').addClass("hidden");
                    eraseMap();
                    drawStates();
                }
                break;
        }
    });

    $('.popUpContent a.closeBtn').on("click", function() { closePopUp(); });

    if (supported) {
        queue()
          .defer(d3.csv, "/static/oxfam-min-wage-interactive/data/cd113-data.csv")
          .defer(d3.json, "/data/us-congress-113-ox.json")
          .await(ready);
    }
 }); // document ready