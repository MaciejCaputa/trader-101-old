/**
 * Plotting a graph of a historic data of a company on a canvas.
 * @param {Array} historicData - array of two-element arrays of date and end of the day quote.
 */
function plotGraph( historicData ) {
  // Declaring and initialising chart's variables.

  $( '#visualisation').width( window.innerWidth );
  // canvas.width = window.innerWidth;

  let
    parseDate = d3.time.format("%Y-%m-%d").parse,
    margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = $( '#visualisation').width(),
    height = $( '#visualisation').height(),
    vis = d3.select("#visualisation"),
    xRange, yRange, xAxis, yAxis,
    lineData = [],
    lineFunc;

  // Creating points which will be plotted on a grpah.
  for (let i = historicData.length - 1; i > 0; i--) {
    lineData.push({
      'x': parseDate( historicData[i][0] ),
      'y': historicData[i][1]
    });
  }

  // Ensuring that canvas is empty.
  d3.selectAll("svg > *").remove();

  // Getting a range of horizontal axis.
  xRange = d3.time.scale()
    .domain([new Date(lineData[0].x), d3.time.day.offset(new Date(lineData[lineData.length - 1].x), 1)])
    .rangeRound([0, width - margin.left - margin.right]);

  // Getting a range of vertical axis.
  yRange = d3.scale.linear()
    .range([height - margin.top - margin.bottom, 0])
    .domain([d3.min(lineData, function (d) { return d.y; }), d3.max(lineData, function (d) { return d.y; }) ]);

  // Initialising x-axis to be of a date format.
  xAxis = d3.svg.axis()
    .scale(xRange)
    .tickSize(1)
    .tickFormat(d3.time.format('%d/%m/%Y'))
    .tickSubdivide(true);

  // Initialising y-axis
  yAxis = d3.svg.axis()
    .scale(yRange)
    .tickSize(5)
    .orient("left")
    .tickSubdivide(true);

  // Appending x-axis to a chart.
  vis.append("svg:g")
    .attr("class", "x axis")
    .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom) + ")")
    .call(xAxis);

  // Appending y-axis to a chart.
  vis.append("svg:g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
    .call(yAxis);

  // Initialising the graph that is to be plotted.
  lineFunc = d3.svg.line()
    .x(function (d) { return xRange(d.x); })
    .y(function (d) { return yRange(d.y); });

  // Appending the graph to the cart.
  vis.append("svg:path")
    .attr("d", lineFunc(lineData))
    .attr("stroke", "#00796B")
    .attr("stroke-width", 2)
    .attr("transform", "translate(" + (margin.left) + "," + margin.top + ")")
    .attr("fill", "none");
}
