function line_series_zoom(opt){
  var margin = {top: 10, right: 40, bottom: 100, left: 40},
      margin2 = {top: 430, right: 40, bottom: 20, left: 40},
      width = (opt.width || 800) - margin.left - margin.right,
      height = (opt.height || 500) - margin.top - margin.bottom,
      height2 = (opt.height || 500) - margin2.top - margin2.bottom;

  var parseDate = d3.time.format(opt.dateParse).parse;

  var x = d3.time.scale().range([0, width]),
      x2 = d3.time.scale().range([0, width]),
      y = d3.scale.linear().range([height, 0]),
      y2 = d3.scale.linear().range([height2, 0]);

  var xAxis = d3.svg.axis().scale(x).orient("bottom"),
      xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
      yAxis = d3.svg.axis().scale(y).orient("left");

  var brush = d3.svg.brush()
      .x(x2)
      .on("brush", brushed);

  var series = d3.scale.ordinal()
        .range(opt.colorSwatches);

  var line = d3.svg.line()
      .interpolate("monotone")
      .x(function(d) { return x(d.xVar); })
      .y(function(d) { return y(d.yVar); });

  var line2 = d3.svg.line()
      .interpolate("monotone")
      .x(function(d) { return x2(d.xVar); })
      .y(function(d) { return y2(d.yVar); });

  var svg = d3.select(opt.pageTarget).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

  svg.append("defs").append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  var focus = svg.append("g")
      .attr("class", "focus")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var context = svg.append("g")
      .attr("class", "context")
      .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

  d3.json(opt.filePath, function(error, data) {

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
          return {xVar: d[opt.indVar], yVar: +d[name]};
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return d[opt.indVar]; }));
    y.domain([
      d3.min(seriesNum, function(c) { return d3.min(c.values, function(v) { return v.yVar; }); }),
      d3.max(seriesNum, function(c) { return d3.max(c.values, function(v) { return v.yVar; }); })
    ]);
    x2.domain(x.domain());
    y2.domain(y.domain());

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

    context.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    var focusSeries = focus.selectAll(".focusSeries")
        .data(seriesNum)
      .enter().append("g")
        .attr("class", "focusSeries");

    var contextSeries = context.selectAll(".contextSeries")
        .data(seriesNum)
      .enter().append("g")
        .attr("class", "contextSeries");

    contextSeries.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line2(d.values); })
        .style("stroke", function(d) { return series(d.name); })
        .style("stroke-width", "2px");

    focusSeries.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return series(d.name); })
        .style("stroke-width", "2px");

    focusSeries.append("text")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
        .attr("x", width - 26)
        .attr("dy", 10)
        .style("text-anchor", "end")
        .text(function(d) { return d.name; });

    focusSeries.append("rect")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; })
        .attr("x", width - 20)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) { return series(d.name); });

    context.append("g")
        .attr("class", "x brush")
        .call(brush)
      .selectAll("rect")
        .attr("y", -6)
        .attr("height", height2 + 7);
    });

  function brushed() {
    x.domain(brush.empty() ? x2.domain() : brush.extent());
    focus.selectAll(".line").attr("d", function(d) { return line(d.values); });
    focus.select(".x.axis").call(xAxis);
  }
}

line_series_zoom({
  title: "System-wide Rides per Day",
  filePath: "data/daytripdata.json",
  pageTarget: "#focuschart",
  colorSwatches: [ "#7bccc4", "#0070cd", "#bae4bc" ],
  indVar:'date',
  dateParse: "%Y-%m-%d",
  yAxisTitle: "rides"
 });
