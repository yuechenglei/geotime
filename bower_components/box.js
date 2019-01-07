/**
 * Created by manan on 17/4/16.
 */

(function() {

// Inspired by http://informationandvisualization.de/blog/box-plot
  d3.box = function() {
    var width = 1,
      height = 1,
      phaseData = {},
      duration = 0,
      domain = null,
      value = Number,
      whiskers = boxWhiskers,
      quartiles = boxQuartiles,
      tickFormat = null,
      clickEvent = null;

    // For each small multiple…
    function box(g) {
      g.each(function(d, i) {
        d = d.sort(d3.ascending)
        var g = d3.select(this),
          n = d.length,
          min = d[0],
          max = d[n - 1]
        // console.log('d',d)

        // Compute quartiles. Must return exactly 3 elements.
        var quartileData = d.quartiles = quartiles(d)
        console.log('quartileData', quartileData)
        // Compute whiskers. Must return exactly 2 elements, or null.
        var whiskerIndices = whiskers && whiskers.call(this, d, i),
          whiskerData = whiskerIndices && whiskerIndices.map(function(i) { return d[i] })
        console.log('whiskerData', whiskerData)
        // Compute outliers. If no whiskers are specified, all data are "outliers".
        // We compute the outliers as indices, so that we can join across transitions!
        // var outlierIndices = whiskerIndices
        //   ? d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n))
        //   : d3.range(n)
        // console.log('outlierIndices', outlierIndices);
        // Compute the new x-scale.
        var x1 = d3.scale.linear()
          .domain(domain && domain.call(this, d, i) || [min, max])
          .range([0, width])

        // Retrieve the old x-scale, if this is an update.
        var x0 = this.__chart__ || d3.scale.linear()
            .domain([0, Infinity])
            .range(x1.range())

        // Stash the new scale.
        this.__chart__ = x1

        var tip = d3.tip().attr('class', 'Gantta-d3-tip').offset([ -10, 0 ]).html(function(d) { return d/(1000 * 60) + '&acute;' })

        /* Invoke the tip in the context of your visualization */

        // Note: the box, median, and box tick elements are fixed in number,
        // so we only have to handle enter and update. In contrast, the outliers
        // and other elements are variable, so we need to exit them! Variable
        // elements also fade in and out.

        // Update center line: the vertical line spanning the whiskers.

        var center = g.selectAll("line.center")
          .data(whiskerData ? [whiskerData] : [])

        center.enter().insert("line", "rect")
          .attr("class", "center")
          .attr("y1", height / 2)
          .attr("x1", function(d) { return x0(d[0]) })
          .attr("y2", height / 2)
          .attr("x2", function(d) { return x0(d[1]) })
          .style("opacity", 1e-6)
          .transition()
          .duration(duration)
          .style("opacity", 1)
          .attr("x1", function(d) { return x1(d[0]) })
          .attr("x2", function(d) { return x1(d[1]) })

        center.transition()
          .duration(duration)
          .style("opacity", 1)
          .attr("x1", function(d) { return x1(d[0]) })
          .attr("x2", function(d) { return x1(d[1]) })

        center.exit().transition()
          .duration(duration)
          .style("opacity", 1e-6)
          .attr("x1", function(d) { return x1(d[0]) })
          .attr("x2", function(d) { return x1(d[1]) })
          .remove()

        // Update innerquartile box.
        var box = g.selectAll("rect.box")
          .data([quartileData])

        box.enter().append("rect")
          .attr("class", "box")
          .attr("y", 0)
          .attr("x", function(d) { return x0(d[0]) })
          .attr("width", function(d) { return x0(d[2]) - x0(d[0]) })
          .attr("height", height )
          .transition()
          .duration(duration)
          .attr("x", function(d) { return x1(d[0]) })
          .attr("width", function(d) { return x1(d[2]) - x1(d[0]) })

        box.transition()
          .duration(duration)
          .attr("x", function(d) { return x1(d[0]) })
          .attr("width", function(d) { return x1(d[2]) - x1(d[0]) })

        var data01 = [whiskerData[0],quartileData[0]]
        var rect01 = g.selectAll('rect01.box')
          .data([data01])
        var clickcount0 = 0
        rect01.enter().append("rect")
          .attr("class", "box-select")
          .attr("y", 0)
          .attr("x", function(d) { return x0(d[0]) })
          .attr("width", function(d) { return x0(d[1]) - x0(d[0]) })
          .attr("height", height )
          .attr('chosen', false)
          .attr("opacity", 0)
          .on('mouseover', function (d, i) {
            d3.select(this).classed('selected-box-rect-mouseover', true)
            d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('mouseover-unhighlight', true)
            for (var k = 0; k < phaseData.d1.length; k++) {
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d1[k]).classed('mouseover-unhighlight', false)
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d1[k]).classed('mouseover-highlight', true)
            }
          })
          .on('mouseout', function (d, i) {
            d3.select(this).classed('selected-box-rect-mouseover', false)
            d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('mouseover-unhighlight', false)
            for (var k = 0; k < phaseData.d1.length; k++) {
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d1[k]).classed('mouseover-highlight', false)
            }
          })
          // .on('click', function (d, i) {
          //   d3.select(this).attr('chosen', true)
          //   d3.select(this).style('opacity', 0.7).style('fill', '#999').style('stroke', null)
          //   d3.selectAll('.timesequence-whole').classed('click-unhighlight', true)
          //   for (var k = 0; k < phaseData.d1.length; k++) {
          //     d3.selectAll('.' + phaseData.d1[k]).classed('click-unhighlight', false)
          //     // d3.selectAll('.' + phaseData.d1[k]).classed('mouseover-highlight', true)
          //   }
          //
          // })
          .on('click', function (d, i) {
            if (!d3.select(this).classed('selected-box-rect')) {
              d3.selectAll('.box-select').classed('selected-box-rect', false)
              d3.select(this).classed('selected-box-rect', true)
              d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('click-unhighlight', true)
              for (var k = 0; k < phaseData.d1.length; k++) {
                d3.select('#CDM_Gantta').selectAll('.' + phaseData.d1[ k ]).classed('click-unhighlight', false)
              }
            }
            else if (d3.select(this).classed('selected-box-rect')) {
              d3.select(this)
                .classed('selected-box-rect', false)
              for (var k = 0; k < phaseData.d1.length; k++) {
                d3.select('#CDM_Gantta').selectAll('.' + phaseData.d1[ k ]).classed('click-unhighlight', true)
              }
            }
            clickEvent()
          })
          // .transition()
          // .duration(duration)
          // .attr("x", function(d) { return x1(d[0]) })
          // .attr("width", function(d) { return x1(d[1]) - x1(d[0]) })
          // .style("opacity", 0)

        rect01.transition()
          .duration(duration)
          .attr("x", function(d) { return x1(d[0]) })
          .attr("width", function(d) { return x1(d[1]) - x1(d[0]) })
          .attr("opacity", 0)

        var rect12 = g.selectAll('rect12.box')
          .data([quartileData.slice(0,2)])

        rect12.enter().append("rect")
          .attr("class", "box-select")
          .attr("y", 0)
          .attr("x", function(d) { return x0(d[0]) })
          .attr("width", function(d) { return x0(d[1]) - x0(d[0]) })
          .attr("height", height )
          .attr("opacity", 0)
          .on('mouseover', function (d, i) {
            d3.select(this).classed('selected-box-rect-mouseover', true)
            d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('mouseover-unhighlight', true)
            for (var k = 0; k < phaseData.d2.length; k++) {
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d2[k]).classed('mouseover-unhighlight', false)
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d2[k]).classed('mouseover-highlight', true)
            }
          })
          .on('mouseout', function (d, i) {
            d3.select(this).classed('selected-box-rect-mouseover', false)
            d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('mouseover-unhighlight', false)
            for (var k = 0; k < phaseData.d2.length; k++) {
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d2[k]).classed('mouseover-highlight', false)
            }
          })
          .on('click', function (d, i) {
            if (!d3.select(this).classed('selected-box-rect')) {
              d3.selectAll('.box-select').classed('selected-box-rect', false)
              d3.select(this).classed('selected-box-rect', true)
              d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('click-unhighlight', true)
              for (var k = 0; k < phaseData.d2.length; k++) {
                d3.select('#CDM_Gantta').selectAll('.' + phaseData.d2[ k ]).classed('click-unhighlight', false)
              }
            }
            else if (d3.select(this).classed('selected-box-rect')) {
              d3.select(this)
                .classed('selected-box-rect', false)
              for (var k = 0; k < phaseData.d2.length; k++) {
                d3.select('#CDM_Gantta').selectAll('.' + phaseData.d2[ k ]).classed('click-unhighlight', true)
              }
            }
            clickEvent()
          })
          // .transition()
          // .duration(duration)
          // .attr("x", function(d) { return x1(d[0]) })
          // .attr("width", function(d) { return x1(d[1]) - x1(d[0]) })
          // .style("opacity", 0)

        rect12.transition()
          .duration(duration)
          .attr("x", function(d) { return x1(d[0]) })
          .attr("width", function(d) { return x1(d[1]) - x1(d[0]) })
          .attr("opacity", 0)

        var rect23 = g.selectAll('rect23.box')
          .data([quartileData.slice(1)])

        rect23.enter().append("rect")
          .attr("class", "box-select")
          .attr("y", 0)
          .attr("x", function(d) { return x0(d[0]) })
          .attr("width", function(d) { return x0(d[1]) - x0(d[0]) })
          .attr("height", height )
          .attr("opacity", 0)
          .attr('fill', '#999')
          .on('mouseover', function (d, i) {
            d3.select(this).classed('selected-box-rect-mouseover', true)
            d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('mouseover-unhighlight', true)
            for (var k = 0; k < phaseData.d3.length; k++) {
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d3[k]).classed('mouseover-unhighlight', false)
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d3[k]).classed('mouseover-highlight', true)
            }
          })
          .on('mouseout', function (d, i) {
            d3.select(this).classed('selected-box-rect-mouseover', false)
            d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('mouseover-unhighlight', false)
            for (var k = 0; k < phaseData.d3.length; k++) {
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d3[k]).classed('mouseover-highlight', false)
            }
          })
          .on('click', function (d, i) {
            if (!d3.select(this).classed('selected-box-rect')) {
              d3.selectAll('.box-select').classed('selected-box-rect', false)
              d3.select(this).classed('selected-box-rect', true)
              d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('click-unhighlight', true)
              for (var k = 0; k < phaseData.d3.length; k++) {
                d3.select('#CDM_Gantta').selectAll('.' + phaseData.d3[ k ]).classed('click-unhighlight', false)
              }
            }
            else if (d3.select(this).classed('selected-box-rect')) {
              d3.select(this)
                .classed('selected-box-rect', false)
              for (var k = 0; k < phaseData.d3.length; k++) {
                d3.select('#CDM_Gantta').selectAll('.' + phaseData.d3[ k ]).classed('click-unhighlight', true)
              }
            }
            clickEvent()
          })
          // .transition()
          // .duration(duration)
          // .attr("x", function(d) { return x1(d[0]) })
          // .attr("width", function(d) { return x1(d[1]) - x1(d[0]) })
          // .attr("opacity", 0)

        rect23.transition()
          .duration(duration)
          .attr("x", function(d) { return x1(d[0]) })
          .attr("width", function(d) { return x1(d[1]) - x1(d[0]) })
          .attr("opacity", 0)

        var data34 = [quartileData[2],whiskerData[1]]
        var rect34 = g.selectAll('rect34.box')
          .data([data34])

        rect34.enter().append("rect")
          .attr("class", "box-select")
          .attr("y", 0)
          .attr("x", function(d) { return x0(d[0]) })
          .attr("width", function(d) { return x0(d[1]) - x0(d[0]) })
          .attr("height", height )
          .attr("opacity", 0)
          .attr('fill', '#999')
          .on('mouseover', function (d, i) {
            d3.select(this).classed('selected-box-rect-mouseover', true)
            // .classed('selected-box-rect', true)
            d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('mouseover-unhighlight', true)
            for (var k = 0; k < phaseData.d4.length; k++) {
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d4[k]).classed('mouseover-unhighlight', false)
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d4[k]).classed('mouseover-highlight', true)
            }
          })
          .on('mouseout', function (d, i) {
            d3.select(this).classed('selected-box-rect-mouseover', false)
            d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('mouseover-unhighlight', false)
            for (var k = 0; k < phaseData.d4.length; k++) {
              d3.select('#CDM_Gantta').selectAll('.' + phaseData.d4[k]).classed('mouseover-highlight', false)
            }
          })
          .on('click', function (d, i) {
            if (!d3.select(this).classed('selected-box-rect')) {
              d3.selectAll('.box-select').classed('selected-box-rect', false)
              d3.select(this).classed('selected-box-rect', true)
              d3.select('#CDM_Gantta').selectAll('.timesequence-whole').classed('click-unhighlight', true)
              for (var k = 0; k < phaseData.d4.length; k++) {
                d3.select('#CDM_Gantta').selectAll('.' + phaseData.d4[ k ]).classed('click-unhighlight', false)
              }
            }
            else if (d3.select(this).classed('selected-box-rect')) {
              d3.select(this).classed('selected-box-rect', false)
              for (var k = 0; k < phaseData.d4.length; k++) {
                d3.select('#CDM_Gantta').selectAll('.' + phaseData.d4[ k ]).classed('click-unhighlight', true)
              }
            }
            clickEvent()
          })
          // .transition()
          // .duration(duration)
          // .attr("x", function(d) { return x1(d[0]) })
          // .attr("width", function(d) { return x1(d[1]) - x1(d[0]) })
          // .attr("opacity", 0)

        rect34.transition()
          .duration(duration)
          .attr("x", function(d) { return x1(d[0]) })
          .attr("width", function(d) { return x1(d[1]) - x1(d[0]) })
          .attr("opacity", 0)

        var line1 = g.selectAll('line1.box')
          .data([quartileData[0]])

        line1.enter().append('line')
          .attr('class', 'box')
          .attr('x1', x0)
          .attr("y1", 0)
          .attr("x2", x0)
          .attr("y2", height)
          .style("opacity", 0)
          .call(tip)
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          .transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .style("opacity", 0)

        line1.transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .style("opacity", 0)

        var line2 = g.selectAll('line2.box')
          .data([quartileData[2]])

        line2.enter().append('line')
          .attr('class', 'box')
          .attr('x1', x0)
          .attr("y1", 0)
          .attr("x2", x0)
          .attr("y2", height)
          .style("opacity", 0)
          .call(tip)
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          .transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .style("opacity", 0)

        line2.transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .style("opacity", 0)

        // Update median line.
        var medianLine = g.selectAll("line.median")
          .data([quartileData[1]])

        medianLine.enter().append("line")
          .attr("class", "median")
          .attr("y1", 0)
          .attr("x1", x0)
          .attr("y2", height)
          .attr("x2", x0)
          .call(tip)
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          .transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)

        medianLine.transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)

        // Update whiskers.
        var whisker = g.selectAll("line.whisker")
          .data(whiskerData || [])

        whisker.enter().insert("line", "circle, text")
          .attr("class", "whisker")
          .attr("y1", 0)
          .attr("x1", x0)
          .attr("y2", height)
          .attr("x2", x0)
          .style("opacity", 1e-6)
          .call(tip)
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)
          .transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .style("opacity", 1)

        whisker.transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .style("opacity", 1)

        whisker.exit().transition()
          .duration(duration)
          .attr("x1", x1)
          .attr("x2", x1)
          .style("opacity", 1e-6)
          .remove()

        // Update outliers.
        // if (outlierIndices.length != 0) {
        //   var outlier = g.selectAll("circle.outlier")
        //     .data(outlierIndices, Number)
        //
        //   outlier.enter().insert("circle", "text")
        //     .attr("class", "outlier")
        //     .attr("r", 2)
        //     .attr("cy", height / 2)
        //     .attr("cx", function (i) { return x0(d[ i ]) })
        //     .style("opacity", 1e-6)
        //     // .call(tip)
        //     // .on('mouseover', tip.show)
        //     // .on('mouseout', tip.hide)
        //     .transition()
        //     .duration(duration)
        //     .attr("cx", function (i) { return x1(d[ i ]) })
        //     .style("opacity", 1)
        //
        //   outlier.transition()
        //     .duration(duration)
        //     .attr("cx", function (i) { return x1(d[ i ]) })
        //     .style("opacity", 1)
        //
        //   outlier.exit().transition()
        //     .duration(duration)
        //     .attr("cx", function (i) { return x1(d[ i ]) })
        //     .style("opacity", 1e-6)
        //     .remove()
        // }

        // Compute the tick format.
        var format = tickFormat || x1.tickFormat(8)

        // Update box ticks.
        // var boxTick = g.selectAll("text.box")
        //   .data(quartileData);
        //
        // boxTick.enter().append("text")
        //   .attr("class", "box")
        //   .attr("dx", ".3em")
        //   .attr("dy", function(d, i) { return i & 1 ? 6 : -6 })
        //   .attr("y", function(d, i) { return i & 1 ? height : 0 })
        //   .attr("x", x0)
        //   .attr("text-anchor", function(d, i) { return i & 1 ? "start" : "end"; })
        //   .text(format)
        //   .transition()
        //   .duration(duration)
        //   .attr("x", x1);
        //
        // boxTick.transition()
        //   .duration(duration)
        //   .text(format)
        //   .attr("x", x1);

        // Update whisker ticks. These are handled separately from the box
        // ticks because they may or may not exist, and we want don't want
        // to join box ticks pre-transition with whisker ticks post-.
        // var whiskerTick = g.selectAll("text.whisker")
        //   .data(whiskerData || []);
        //
        // whiskerTick.enter().append("text")
        //   .attr("class", "whisker")
        //   .attr("dx", ".3em")
        //   .attr("dy", 6)
        //   .attr("y", height)
        //   .attr("x", x0)
        //   .text(format)
        //   .style("opacity", 1e-6)
        //   .transition()
        //   .duration(duration)
        //   .attr("x", x1)
        //   .style("opacity", 1);
        //
        // whiskerTick.transition()
        //   .duration(duration)
        //   .text(format)
        //   .attr("x", x1)
        //   .style("opacity", 1);
        //
        // whiskerTick.exit().transition()
        //   .duration(duration)
        //   .attr("x", x1)
        //   .style("opacity", 1e-6)
        //   .remove();
      });
      d3.timer.flush();
    }

    box.width = function(x) {
      if (!arguments.length) return width;
      width = x;
      return box;
    };

    box.height = function(x) {
      if (!arguments.length) return height;
      height = x;
      return box;
    };

    box.phaseData = function (x) {
      if (!arguments.length) return phaseData
      phaseData = x
      return box
    };

    box.tickFormat = function(x) {
      if (!arguments.length) return tickFormat;
      tickFormat = x;
      return box;
    };

    box.duration = function(x) {
      if (!arguments.length) return duration;
      duration = x;
      return box;
    };

    box.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x == null ? x : d3.functor(x);
      return box;
    };

    box.value = function(x) {
      if (!arguments.length) return value;
      value = x;
      return box;
    };

    box.whiskers = function(x) {
      if (!arguments.length) return whiskers;
      whiskers = x;
      return box;
    };

    box.quartiles = function(x) {
      if (!arguments.length) return quartiles;
      quartiles = x;
      return box;
    };

    box.clickEvent = function (x) {
      if (!arguments.length) return clickEvent;
      clickEvent = x;
      return box;
    };

    return box;
  };

  function boxWhiskers(d) {
    return [0, d.length - 1];
  }

  function boxQuartiles(d) {
    return [
      d3.quantile(d, .25),
      d3.quantile(d, .5),
      d3.quantile(d, .75)
    ];
  }

})();

