function line_series(opt) {
  var margin = {top: 0, right: 0, bottom: 50, left: 45},
      width = 700 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  var parseDate = d3.time.format(opt.dateParse).parse;

  var x = d3.time.scale().range([0, width]),
      y = d3.scale.linear().range([height, 0]),
      ybar = d3.scale.linear().range([height, 0]).domain([0,1]);

  var xAxis = d3.svg.axis().scale(x).orient("bottom"),
      yAxis = d3.svg.axis().scale(y).orient("left");

  var series = d3.scale.ordinal()
      .range( opt.colorSwatches ),
      bars = d3.scale.ordinal();

  var line = d3.svg.line()
      .interpolate("monotone")
      .x(function(d) { return x(d.xVar); })
      .y(function(d) { return y(d.yVar); });

  var svg = d3.select(opt.pageTarget).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  var chart = svg.append("g")
      .attr("class", "chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var title = chart.append("text")
      .text(opt.title)
      .attr("class", "title")
      .style("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height+margin.bottom-5);

  d3.json(opt.filePath, function(error, data) {
  // d3.csv(opt.filePath, function(error, data) {
    series.domain(d3.keys(data[0]).filter(function(key) { return (key !== opt.indVar ); }));

    if (opt.dateParse) {
      data.forEach(function(d) {
        d[opt.indVar] = parseDate(d[opt.indVar]);
      });
    };

    var seriesNum = series.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return { xVar: d[opt.indVar], yVar: +d[name] };
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return d[opt.indVar]; }));
    y.domain([
        d3.min(seriesNum, function(c) { return d3.min(c.values, function(v) { return v.yVar; }); }),
        d3.max(seriesNum, function(c) { return d3.max(c.values, function(v) { return v.yVar; }); })
    ]);

    var chartSeries = chart.selectAll(".chartSeries")
        .data(seriesNum)
      .enter().append("g")
        .attr("class", "chartSeries");

    chartSeries.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return series(d.name); })
        .style("stroke-width", "2px");

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(opt.yAxisTitle);
  });
};

line_series({
  title: "System-wide Rides per Day",
  filePath: "data/daytripdata.json",
  pageTarget: "#row2",
  colorSwatches: [ "#7bccc4", "#0070cd", "#bae4bc" ],
  indVar:'date',
  dateParse: "%Y-%m-%d",
  yAxisTitle: "rides"
 });
