function factors(filePath) {
var margin = {top: 10, right: 40, bottom: 40, left: 40},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  
var parseDate = d3.time.format("%m/%d/%y").parse;

var x = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    ybar = d3.scale.linear().range([height, 0]).domain([0,1]);
    ytemp = d3.scale.linear().range([height, 0]).domain([37,77]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left"),
    yAxisTemp = d3.svg.axis().scale(ytemp).orient("right");

//
var color = d3.scale.ordinal()
      .range([colorUsers.total, colorUsers.subscriber, colorUsers.customer]),
    avgs = d3.scale.ordinal()
      .range([colorUsers.total, colorUsers.subscriber, colorUsers.customer]),
    bars = d3.scale.ordinal()
      .range(colorFact),
    temps = d3.scale.ordinal();

//
var line = d3.svg.line()
    .interpolate("linear") // linear, step, step-before, step-after, basis, basis-open, cardinal, cardinal-open, monotone
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.rides); });

var area = d3.svg.area()
    .interpolate("linear") // linear, step, step-before, step-after, basis, basis-open, cardinal, cardinal-open, monotone
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return y(d.rides); });


var baritup = d3.svg.area()
    .interpolate("step")
    .x(function(d) { return x(d.date); })
    .y0(height)
    .y1(function(d) { return ybar(d.bool); });

var tempLine = d3.svg.line()
    .interpolate("basis") // linear, step, step-before, step-after, basis, basis-open, cardinal, cardinal-open, monotone
    .x(function(d) { return x(d.date); })
    .y(function(d) { return ytemp(d.temp); });

//
var svg = d3.select("#focuschart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", filePath+" factorsChart") // this is a very inelegant solution to showing factors based on checkboxes.
    .style("display", "none");               // if i had the time i would figure out a better way, light research leads me
                             // to believe "deferring" checkboxes() in the commented out caseStudy() switch could work

svg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("data/"+filePath+".csv", function(error, data) {
  
  color.domain(d3.keys(data[0]).filter(function(key) { return (key == "total" || key == "subscriber" || key =="customer"); }));
  avgs.domain(d3.keys(data[0]).filter(function(key) { return (key == "totalAvg" || key == "subscriberAvg" || key =="customerAvg"); }));
  temps.domain(d3.keys(data[0]).filter(function(key) { return (key == "temp"); }));
  bars.domain(d3.keys(data[0]).filter(function(key) { return (key == "weekend" || key =="BART" || key =="49ers" || key =="Giants" || key =="Sharks" || key =="AmericasCup" || key =="rain" || key =="holiday" || key =="USGovShutdown") ; }));

//    
  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.total = +d.total;
    d.subscriber = +d.subscriber;
    d.customer = +d.customer;
    d.totalAvg = +d.totalAvg;
    d.subscriberAvg = +d.subscriberAvg;
    d.customerAvg = +d.customerAvg;  
    d.temp = +d.temp;
  });

//    
  var userType = color.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, rides: +d[name]};
      })
    };
  });
var userTypeAvg = avgs.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, rides: +d[name]};
      })
    };
  });                                                     
    
var specialDay = bars.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, bool: +d[name]};
      })
    };
  });
var tempCities = temps.domain().map(function(name) {
    return {
      name: name,
      values: data.map(function(d) {
        return {date: d.date, temp: +d[name]};
      })
    };
  });
    
//    
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([
    d3.min(userType, function(c) { return d3.min(c.values, function(v) { return v.rides; }); }),
    d3.max(userType, function(c) { return d3.max(c.values, function(v) { return v.rides; }); })
  ]);

  focus.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  focus.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("rides");
  
  focus.append("g")
      .attr("class", "y axis axisTemp")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxisTemp)
      .style("display","none")
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("ºF");
 
//   
  var focusUsers = focus.selectAll(".focusUsers")
      .data(userType)
    .enter().append("g")
      .attr("class", "focusUsers");
  
  var focusUsersAvg = focus.selectAll(".focusUsersAvg")
      .data(userTypeAvg)
    .enter().append("g")
      .attr("class", "focusUsersAvg")
      .style("display", "none");

 var focusTemps = focus.selectAll(".focusTemps")
      .data(tempCities)
    .enter().append("g")
      .attr("class", "focusTemps")
      .style("display", "none");

  var notableDay = focus.selectAll(".notableDay")
      .data(specialDay)
    .enter().append("g")
      .attr("class", "notableDay");    
  
//
  focusUsers.append("path")
      .attr("class", "area")
      .attr("d", function(d) { return area(d.values); })
      .style("stroke", function(d) { return color(d.name); })
      .style("fill", function(d) { return color(d.name); });

  focusUsersAvg.append("path")
      .attr("class", "avgline")
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return avgs(d.name); });

  focusTemps.append("path")
      .attr("class", "tempLine")
      .attr("d", function(d) { return tempLine(d.values); })
      .style("stroke", colorUsers.highlight);

  notableDay.append("path")
      .attr("class", function(d){ return "bars " + d.name; })
      .attr("d", function(d) { return baritup(d.values); })
      .style("fill", function(d) { return bars(d.name); })
      .style("stroke", function(d) { return bars(d.name); })
      .style("display", "none");
      
//
  focusUsers.append("text")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })    
      .attr("x", width - 26)
      .attr("dy", 10)
      .style("text-anchor", "end")
      .text(function(d) { return d.name; });
    
  focusUsers.append("rect")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
      .attr("x", width - 20)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function(d) { return color(d.name); });
    
  });
  
} //end factors()



function heatmap(city) {
  var margin = city.margin,
    width = city.width - margin.left - margin.right,
    height = city.height - margin.top - margin.bottom;

var rowNames = [],
    colNames = [];
 
$.get(city.docks, function (txt){
    rowNames = txt.split('\n');
});
$.get(city.docks, function (txt){
    colNames = txt.split('\n');
}); 

var //numCols = colNames.length,
    cellSize = city.cells,
    //cellSize = 16,
    legendElementWidth = 40;

d3.csv(city.file,
        function(d) {
          return {
            row: +d.start,
            col: +d.end,
            value: +d.rides
          };
        },
        function(error, data) {
          var colorScale = d3.scale.threshold()
              //.domain([0, colorHeat.length - 1, d3.max(data, function (d) { return d.value; })])
              .domain(city.slices)
              .range(colorHeat);

          var svg = d3.select("#heat").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("class", "heatmap heat"+city.location)// for switching btwn cities
                //.style("display", "none")// for switching btwn cities
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 ///*
          if (city.showlabels){
            svg.style("display", "inline");
            var rowLabels = svg.selectAll(".rowLabel")
              .data(rowNames)
              .enter().append("text")
                .text(function (d) { return d; })
                .attr("x", 0)
                .attr("y", function (d, i) { return (i+1) * cellSize; })
                .style("text-anchor", "end")
                .attr("transform", "translate(" + cellSize / 2 + "," + cellSize / 2 + ")")
                .attr("class", "rowLabel mono axis")
                .on("mouseover", function(d) {
                  d3.select(this).classed("text-hover",true);})
                .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);});
             
            svg.append("text")
                .text("Starting station:")
                .attr("x", 0)
                .attr("y", cellSize/2)
                .attr("class", "mono axis")
                .style("text-anchor", "end");
          
            var colLabels = svg.selectAll(".colLabel")
              .data(colNames)
              .enter().append("text")
                .text(function(d) { return d; })
                .attr("x", 0)
                .attr("y", function(d, i) { return (i+1) * cellSize; })
                .style("text-anchor", "left")
                .attr("transform", "translate(" + cellSize / 2 + ","+cellSize / 2 +") rotate (-90)")
                .attr("class", "colLabel mono axis")
                .on("mouseover", function(d) {d3.select(this).classed("text-hover",true);})
                .on("mouseout" , function(d) {d3.select(this).classed("text-hover",false);});
            svg.append("text")
                .text("Ending station:")
                .attr("x", 0)
                .attr("y", 0)
                .attr("transform", "translate(" + cellSize / 2 + ","+ 0 +") rotate (-90)")
                .attr("class", "mono axis")
                .style("text-anchor", "left");
          };
/**/
          var heatMap = svg.selectAll(".cell")
                .data(data)
              .enter().append("rect")
                .attr("x", function(d,i) { return (d.col) * cellSize; })
                .attr("y", function(d,i) { return (d.row) * cellSize; })
                /*.attr("rx", 4)
                .attr("ry", 4)*/
                .attr("class", "cell bordered")
                .attr("width", cellSize)
                .attr("height", cellSize)
                .style("fill", colorHeat[0])
                .style("fill", function(d) { return colorScale(d.value); })
                .on("mouseover", function(d){
                  //highlight text
                  d3.select(this).classed("highlight",true);
                  d3.selectAll(".rowLabel").classed("text-hover",function(r,ri){ return ri==(d.row-1);});
                  d3.selectAll(".colLabel").classed("text-hover",function(c,ci){ return ci==(d.col-1);});
                  //Update the tooltip position and value
                  d3.select("#tooltip")
                    .style("left", (d3.event.pageX - 75) + "px")
                    .style("top", (d3.event.pageY+10) + "px")
                    .select("#value")
                    .text(d.value+" rides from " + rowNames[d.row-1] + " to "  + colNames[d.col-1]);  
                  //Show the tooltip
                  d3.select("#tooltip").classed("hidden", false);
                })
                .on("mouseout", function(){
                  d3.select(this).classed("highlight",false);
                  d3.selectAll(".rowLabel").classed("text-hover",false);
                  d3.selectAll(".colLabel").classed("text-hover",false);
                  d3.select("#tooltip").classed("hidden", true);
                });

          
          if(city.showlabels){    
            var legend = svg.selectAll(".legend")
                .data([0].concat(colorScale.domain()), function(d) { return d; })
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", "translate("+ city.legend +",0)");;

            legend.append("rect")
              .attr("x", function(d, i) { return legendElementWidth * i; })
              .attr("y", height)
              .attr("width", legendElementWidth)
              .attr("height", cellSize / 2)
              .style("fill", function(d, i) { return colorHeat[i]; })
              .style("stroke", "#E6E6E6");
///*
            legend.append("text")
              .attr("class", "mono")
              .text(function(d) { return "≥ " + Math.round(d); })
              .attr("x", function(d, i) { return legendElementWidth * i; })
              .attr("y", height + cellSize);
/**/
          };
  
      });
} //end heatmap()

function checkboxes(){
$('#weekendCB').is(':checked') ? $('.weekend').toggle(true) : $('.weekend').toggle(false);
$('#bartCB').is(':checked') ? $('.BART').toggle(true) : $('.BART').toggle(false);
$('#49ersCB').is(':checked') ? $('.49ers').toggle(true) : $('.49ers').toggle(false);
$('#giantsCB').is(':checked') ? $('.Giants').toggle(true) : $('.Giants').toggle(false);
$('#sharksCB').is(':checked') ? $('.Sharks').toggle(true) : $('.Sharks').toggle(false);
$('#americasCB').is(':checked') ? $('.AmericasCup').toggle(true) : $('.AmericasCup').toggle(false);
$('#rainCB').is(':checked') ? $('.rain').toggle(true) : $('.rain').toggle(false);
$('#holidayCB').is(':checked') ? $('.holiday').toggle(true) : $('.holiday').toggle(false);
$('#govCB').is(':checked') ? $('.USGovShutdown').toggle(true) : $('.USGovShutdown').toggle(false);
$('#avgCB').is(':checked') ? $('.focusUsersAvg').toggle(true) : $('.focusUsersAvg').toggle(false);
$('#tempCB').is(':checked') ? $('.focusTemps').toggle(true) & $('.axisTemp').toggle(true) : $('.focusTemps').toggle(false) & $('.axisTemp').toggle(false);
}

/*
function caseCity(){
   var city=$('input[name=city]:checked').val();
  switch (city) {
        case "all":
            $("#chart").empty();
            factors("data/factorsAll.csv");
            break;
        case "sj":
            $("#chart").empty();
            factors("data/factorsSJ.csv"); 
            break;
        case "rc":
            $("#chart").empty();
            factors("data/factorsRC.csv"); 
            break;
        case "mv":
          $("#chart").empty();
            factors("data/factorsMV.csv"); 
            break;
        case "pa":
            $("#chart").empty();
            factors("data/factorsPA.csv"); 
            break;
        case "sf":
            $("#chart").empty();
            factors("data/factorsSF.csv"); 
            break;
        default:
            break;
        }
}
*/
function caseCity(){
   var city=$('input[name=city]:checked').val();
  switch (city) {
        case "all":
            $(".factorsChart").toggle(false);
            $('.factorsAll').toggle(true);
            break;
        case "sj":
            $(".factorsChart").toggle(false);
            $('.factorsSJ').toggle(true);
            break;
        case "rc":
            $(".factorsChart").toggle(false);
            $('.factorsRC').toggle(true);
            break;
        case "mv":
            $(".factorsChart").toggle(false)
            $('.factorsMV').toggle(true);
            break;
        case "pa":
            $(".factorsChart").toggle(false);
            $('.factorsPA').toggle(true);
            break;
        case "sf":
            $(".factorsChart").toggle(false);
            $('.factorsSF').toggle(true);
            break;
        default:
            break;
        }
}

$(document).on('click', 'input[type=checkbox]', function () { 
  checkboxes();
 });


$(document).on('click', '#reset', function () { 
  $('input[type=checkbox]').prop('checked', false);
  checkboxes();
 });

$(document).on('click', 'input[name=city]', function () { 
  caseCity();
});

var heatCity = {
  all:{
      file:"data/heatmapAll.csv",
      docks:"data/docksAll.txt",
      slices:[1,10,20,50,100,150,300,500,1000],
      showlabels:false,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
      height:800,
      width:800,
      cells:11,
      location:"all",
      legend: 0
  },
  sj:{
      file:"data/heatmapSJ.csv",
      docks:"data/docksSJ.txt",
      slices:[1,10,20,30,50,100,200,300,400],
      showlabels:true,
      margin: { top: 200, right: 50, bottom: 45, left: 200 },
      height:750,
      width:650,
      cells:30,
      location:"sj",
      legend: -10
  },
  rc:{
      file:"data/heatmapRC.csv",
      docks:"data/docksRC.txt",
      slices:[1,3,10,20,30,40,50,60,100],
      showlabels:true,
      margin: { top: 200, right: 50, bottom: 45, left: 200 },
      height:630,
      width:670,
      cells:45,
      location:"rc",
      legend: -10
  },
  mv:{
      file:"data/heatmapMV.csv",
      docks:"data/docksMV.txt",
      slices:[1,5,10,20,40,60,80,100,400],
      showlabels:true,
      margin: { top: 200, right: 50, bottom: 45, left: 200 },
      height:670,
      width:670,
      cells:45,
      location:"mv"
  },
  pa:{
      file:"data/heatmapPA.csv",
      docks:"data/docksPA.txt",
      slices:[1,10,20,30,40,60,80,100,200],
      showlabels:true,
      margin: { top: 200, right: 50, bottom: 45, left: 200 },
      height:550,
      width:670,
      cells:45,
      location:"pa",
      legend: -40
  },
  mvpa:{
      file:"data/heatmapMVPA.csv",
      docks:"data/docksMVPA.txt",
      slices:[1,5,10,20,40,60,80,100,400],
      showlabels:true,
      margin: { top: 200, right: 50, bottom: 45, left: 200 },
      height:850,
      width:800,
      cells:45,
      location:"mvpa",
      legend: 120
  },
  sf:{
      file:"data/heatmapSF.csv",
      docks:"data/docksSF.txt",
      slices:[1,10,20,50,100,150,300,500,1000],
      showlabels:true,
      margin: { top: 220, right: 50, bottom: 45, left: 220 },
      height:870,
      width:800,
      cells:16,
      location:"sf",
      legend: 80
  },
};


$(document).on('click', 'input[name=heat]', function () { 
  var city=$('input[name=heat]:checked').val();
  switch (city) {
        case "all":
            $("#heat").empty();
            heatmap(heatCity.all);
            break;
        case "sj":
            $("#heat").empty();
            heatmap(heatCity.sj);
            break;
        case "rc":
            $("#heat").empty();
            heatmap(heatCity.rc);
            break;
        case "mv":
            $("#heat").empty();
            heatmap(heatCity.mv);
            break;
        case "pa":
            $("#heat").empty();
            heatmap(heatCity.pa);
            break;
         case "mvpa":
            $("#heat").empty();
            heatmap(heatCity.mvpa);
            break;
        case "sf":
            $("#heat").empty();
            heatmap(heatCity.sf);
            break;
        default:
            break;
        }
});

/*
$(document).on('click', 'input[name=heat]', function () { 
  var city=$('input[name=heat]:checked').val();
  switch (city) {
        case "all":
            $(".heatmap").toggle(false);
            $('.heatall').toggle(true);
            break;
        case "sj":
            $(".heatmap").toggle(false);
            $('.heatsj').toggle(true);
            break;
        case "rc":
            $(".heatmap").toggle(false);
            $('.heatrc').toggle(true);
            break;
        case "mv":
            $(".heatmap").toggle(false);
            $('.heatmv').toggle(true);
            break;
        case "pa":
            $(".heatmap").toggle(false);
            $('.heatpa').toggle(true);
            break;
         case "mvpa":
            $(".heatmap").toggle(false);
            $('.heatmvpa').toggle(true);
            break;
        case "sf":
            $(".heatmap").toggle(false);
            $('.heatsf').toggle(true);
            break;
        default:
            break;
        }
});
*/



function horizontalbar(filePath) {
  var margin = {top: 20, right: 0, bottom: 0, left: 10},
      width = 600 - margin.left - margin.right,
      height = 900 - margin.top - margin.bottom;
  
  var y = d3.scale.ordinal()
  .rangeRoundBands([0, height], .1);
  
  var x = d3.scale.linear()
  .range([0, width]);
  
  var xr = d3.scale.linear()
  .range([0, width/2]);
  
  var xl = d3.scale.linear()
  .range([0, width/2]);
  
  var xAxis = d3.svg.axis()
  .scale(x)
  .orient("top")
  .ticks(10, "s");
  
  var yAxis = d3.svg.axis()
  .scale(y)
  .orient("right");
  
  var svg = d3.select("#hbar").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  svg.append("text")
    .text("Starting Rides")
    .style("text-anchor", "end")
    .attr("transform", "translate(" + width * 0.25 + "," + 0 + ")");
  svg.append("text")
    .text("Ending Rides")
    .style("text-anchor", "end")
    .attr("transform", "translate(" + width * 0.75 + "," + 0 + ")");
  
  d3.csv(filePath, type, function(error, data) {
    y.domain(data.map(function(d) { return d.name; }));
    xr.domain([0, d3.max(data, function(d) { return d.end; })]);
    xl.domain([0, d3.max(data, function(d) { return d.start; })]);

   var group = svg.selectAll(".group")
      .data(data)
      .enter().append("g")
      .attr("class", function(d) { return d.city + " " + d.transport + " group hover-hide"; })
      .on("mouseover", function(d) {d3.select(this).classed("hover-hide",false);})
      .on("mouseout" , function(d) {d3.select(this).classed("hover-hide",true);});
    
    group.append("rect")
      .attr("class", "xright")
      .attr("y", function(d) { return y(d.name); })
      .attr("height", y.rangeBand())
      .attr("x", width/2)
      .attr("width", function(d) { return xr(d.end); })
      .style("fill", colorUsers.total)
      .append("title")
      .text(function(d) { return d.end; });
      
    group.append("rect")
      .attr("class", "xleft")
      .attr("y", function(d) { return y(d.name); })
      .attr("height", y.rangeBand())
      .attr("x", function(d) { return width/2 - xl(d.start); })
      .attr("width", function(d) { return xl(d.start); })
      .style("fill", colorUsers.customer)
      .append("title")
      .text(function(d) { return d.start; });
    
    group.append("text")
      .attr("transform", "translate(" + 0 + "," + y.rangeBand() + ")")
      .attr("class", "label")
      .attr("y", function(d) { return y(d.name); })
      .attr("x", width/2)
      .style("text-anchor", "middle")
      .text(function(d) { return d.name; });
    
    group.append("text")
      .attr("transform", "translate(" + 0 + "," + y.rangeBand() + ")")
      .attr("class", "startCount")
      .attr("y", function(d) { return y(d.name); })
      .attr("x", width*0.75)
      .style("text-anchor", "end")
      .text(function(d) { return d.end; });
    
    group.append("text")
      .attr("transform", "translate(" + 0 + "," + y.rangeBand() + ")")
      .attr("class", "endCount")
      .attr("y", function(d) { return y(d.name); })
      .attr("x", width*0.25)
      .style("text-anchor", "end")
      .text(function(d) { return d.start; });
  });
  
  function type(d) {
    d.start = +d.start;
    d.end = +d.end;
    return d;
  }
}  //end horizontalbar()

//i know, d3 is all about manipulating DOM elements, but i can't get the sorting to work within the deadline
$(document).on('click', 'input[name=stationSort]', function () { 
  var sort=$('input[name=stationSort]:checked').val();
  switch (sort) {
        case "start":
            $("#hbar").empty();
            horizontalbar("data/stationStart.csv");
            break;
        case "end":
            $("#hbar").empty();
            horizontalbar("data/stationEnd.csv");
            break;
        default:
            break;
        }
});


factors("factorsAll");
factors("factorsSJ"); 
factors("factorsRC"); 
factors("factorsMV"); 
factors("factorsPA"); 
factors("factorsSF"); 
heatmap(heatCity.all);
horizontalbar("data/stationStart.csv");
$('.factorsAll').toggle(true);
