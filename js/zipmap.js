
// Create the Google Map…
var map = new google.maps.Map(d3.select("#map-here").node(), {
  zoom: 10,
//  center: new google.maps.LatLng(39.8282, -98.5795), //center of US
  //center: new google.maps.LatLng(37.76487, -122.41948), // center on SF 
  center: new google.maps.LatLng(37.7, -122.3), // center on SF bay 
  mapTypeId: google.maps.MapTypeId.MAP
});
 
var colors = ["#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"];

// Load the data. When the data comes back, create an overlay.
// zip code mapping from http://greatdata.com/free-zip-code-database
d3.csv("data/zip_rides.csv", function(data) {
  var overlay = new google.maps.OverlayView();
     
    data.forEach(function(d) {
      d.rides = +d.rides;
  });
      
  var colorScale = d3.scale.threshold()
              //.domain([0, 9, d3.max(data, function (d) { return d.rides; })])
              .domain([50,100,200,400,600,1000,2000,8000])
              .range(colors);
  var radiusScale = d3.scale.threshold()
              .domain([50,100,200,400,600,1000,2000,8000])
              .range([3,4,5,6,7,8,9,10]);      
  
  
  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "overlay");
 
    // Draw each marker as a separate SVG element.
    // We could use a single SVG, but what size would it have?
    overlay.draw = function() {
      var projection = this.getProjection(),
          padding = 10;
 
      var marker = layer.selectAll("svg")
          .data(d3.entries(data))
          .each(transform) // update existing markers
          .enter().append("svg:svg")
          .each(transform)
          .attr("class", "marker");
 
      // Add a circle.
      marker.append("svg:circle")
          .attr("r", function(d){ return radiusScale(d.value.rides)})
          .attr("cx", padding)
          .attr("cy", padding)
          .attr('stroke','black')
          .attr('fill', function(d){ return colorScale(d.value.rides)});
 
      // Add a label.
      marker.append("svg:text")
          .attr("x", padding + 7)
          .attr("y", padding)
          .attr("dy", ".5em")
          .attr("class", "label")
          .text(function(d) { return d.value.zip; });
 
      function transform(d) {
        d = new google.maps.LatLng(d.value['lat'], d.value['lon']);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
      }
    };
  };
 
  // Bind our overlay to the map…
  overlay.setMap(map);
}); 


d3.csv("data/bart.csv", function(data) {
  var overlay = new google.maps.OverlayView();
 
  // Add the container when the overlay is added to the map.
  overlay.onAdd = function() {
    var layer = d3.select(this.getPanes().overlayLayer).append("div")
        .attr("class", "overlay");
 
    // Draw each marker as a separate SVG element.
    // We could use a single SVG, but what size would it have?
    overlay.draw = function() {
      var projection = this.getProjection(),
          padding = 10;
 
      var marker = layer.selectAll("svg")
          .data(d3.entries(data))
          .each(transform) // update existing markers
          .enter().append("svg:svg")
          .each(transform)
          .attr("class", "marker");
 
      // Add a circle.
      marker.append("svg:circle")
          .attr("r", 5)
          .attr('fill','blue')
          .attr("cx", padding)
          .attr("cy", padding);
 
      // Add a label.
      marker.append("svg:text")
          .attr("x", padding + 7)
          .attr("y", padding)
          .attr("dy", ".5em")
          .attr("class", "label")
          //.text(function(d) { return d.value[2]; });
          .text(function(d) { return d.value['name']; });
 
      function transform(d) {
        d = new google.maps.LatLng(d.value['lat'], d.value['lon']);
        d = projection.fromLatLngToDivPixel(d);
        return d3.select(this)
            .style("left", (d.x - padding) + "px")
            .style("top", (d.y - padding) + "px");
      }
    };
  };
 
  // Bind our overlay to the map…
  overlay.setMap(map);
});