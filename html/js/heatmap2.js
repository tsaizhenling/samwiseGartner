var drawHeatMap2 = function(heatmapData, chartId, startColor, endColor, screenWidth,title){
  var buckets = JSON.parse(JSON.stringify(heatmapData));
  var margin = {top: 20, right: 90, bottom: 30, left: 50},
    width = screenWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d").parse,
    formatDate = d3.time.format("%H");

var x = d3.scale.linear().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    z = d3.scale.linear().range([startColor, endColor]);

// The size of the buckets in the CSV data file.
// This could be inferred from the data if it weren't sparse.
var xStep = 1;//864e5,
    yStep = 1;

var svg = d3.select("#"+chartId).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  buckets.forEach(function(d) {
    d.date = new Date(d.timestamp);
    d.bucket = d.date.getMinutes();
    d.count = d.value;
  });

  // Compute the scale domains.
  x.domain([0,23]);
  y.domain(d3.extent(buckets, function(d) { return d.bucket; }));
  z.domain([0, d3.max(buckets, function(d) { return d.count; })]);

  y.domain([y.domain()[0], y.domain()[1] + yStep]);

  // Display the tiles for each non-zero bucket.
  // See http://bl.ocks.org/3074470 for an alternative implementation.
  svg.selectAll(".tile")
      .data(buckets)
    .enter().append("rect")
      .attr("class", "tile")
      .attr("x", function(d) { return x(d.date.getHours()); })
      .attr("y", function(d) { return y(d.bucket + yStep); })
      .attr("width", x(xStep) - x(0))
      .attr("height",  y(0) - y(yStep))
      .style("fill", function(d) { return z(d.count); });

  // Add a legend for the color values.
  var legend = svg.selectAll(".legend")
      .data(z.ticks(6).slice(1).reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + (width + 20) + "," + (20 + i * 20) + ")"; });

  legend.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", z);

  legend.append("text")
      .attr("x", 26)
      .attr("y", 10)
      .attr("dy", ".35em")
      .text(String);

  svg.append("text")
      .attr("class", "label")
      .attr("x", width + 20)
      .attr("y", 10)
      .attr("dy", ".35em")
      .text(title);

  // Add an x-axis with label.
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.svg.axis().scale(x).orient("bottom"))
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .attr("text-anchor", "end")
      .text("Hours");

  // Add a y-axis with label.
  svg.append("g")
      .attr("class", "y axis")
      .call(d3.svg.axis().scale(y).orient("left"))
    .append("text")
      .attr("class", "label")
      .attr("y", 6)
      .attr("dy", "-1em")
      .attr("text-anchor", "end")
      //.attr("transform", "rotate(-90)")
      .text("Minutes");
};
