define([
  'require',
  'marionette',
  'underscore',
  'jquery',
  'backbone',
  'config',
  "variables",
], function (require, Mn, _, $, Backbone, Config, Variables) {
  'use strict';
  var GatePositionlayer = function (map, model, id) {
    this.map = map;
    this.mapModel = model;
    this.id = id;
    this.rCircle = 3;
    this.labelSize = 0.9;

    // this.init(data);
  };

  GatePositionlayer.prototype = {
    init: function (_data) {
      var self = this;

      this.GateSvgOverlay = L.d3SvgOverlay(function (sel, proj) {
        sel.selectAll(".gatePoint_Circle").attr("r", self.rCircle / proj.scale);
        sel.selectAll(".gatePoint_Label").style("font-size", self.labelSize / proj.scale + 'em');
      });

      this.GateSvgOverlay.addTo(this.map);
      this.updateData(_data);
    },
    render: function (data) {
      var self = this;

      var sel = this.GateSvgOverlay.selection;
      var proj = this.GateSvgOverlay.projection;
      var gateShow = self.mapModel.get('gateShow');
      var gateLabelShow = self.mapModel.get('gateLabelShow');

      sel.selectAll(".gatePoint").remove();

      var potGs = sel.selectAll('.gatePoint')
        .data(data)
        .enter().append("g")
        .attr("class", "gatePoint")
        .classed('hidden', !gateShow);

      potGs.each(function (d) {
        var cx = proj.latLngToLayerPoint(L.latLng(d.lat, d.lon)).x;
        var cy = proj.latLngToLayerPoint(L.latLng(d.lat, d.lon)).y;
        d.cx = cx;
        d.cy = cy;
      });

      var potCircle = potGs.append("circle")
        .attr("cx", function (d) {
          return d.cx;
        })
        .attr("cy", function (d) {
          return d.cy;
        })
        .attr("r", self.rCircle / proj.scale)
        .attr("fill", "yellow")
        .attr("class", "gatePoint_Circle")
        .style('cursor', 'pointer')
        .on("click", function (d) {
          // var index = $.inArray(d.name, fixpotsShowTip);
          // if( index == -1 ) {
          //   fixpotsShowTip.push(d.name);
          //   d3.select("#fixpot_tip_border_"+d.name).classed("hidden", false);
          // }
          // else {
          //   fixpotsShowTip.splice(index, 1);
          //   d3.select("#fixpot_tip_border_"+d.name).classed("hidden", true);
          // }
          // Datacenter.set('fixpotsShowTip', fixpotsShowTip);
        });

      var potName = potGs.append("text")
        .attr("class", "gatePoint_Label")
        .attr("id", function (d) { return 'gatePoint_Label_' + d.id; })
        .attr("x", function (d) {
          return d.cx;
        })
        .attr("y", function (d) {
          return d.cy;
        })
        .attr("dy", "-.71em")
        .text(function (d) {
          return d.id;
        })
        .style("font-size", function () {
          return self.labelSize / proj.scale + 'em';
        })
        .style('fill', 'yellow')
        .attr("text-anchor", "middle")
        .classed('hidden', !gateLabelShow);
      //
      // potGs.append("path")
      //   .attr("class", "fixpot_tip_border")
      //   .attr("id", function (d) { return "fixpot_tip_border_"+d.name; })
      //   .attr("d", function(d){ return d3line(Fixpot_text_BBox(d.name)); })
      //   .style("stroke-width", 1/proj.scale)
      //   .style("stroke", "yellow")
      //   .style("fill", "none");
      //
      // d3.selectAll('.fixpot_tip_border').classed("hidden", function (d) {
      //   var index = $.inArray(d.name, fixpotsShowTip);
      //   // console.warn(index);
      //   if( index == -1 ) { return true; }
      //   else { return false; }
      // });

    },
    updateData: function (_data) {
      var self = this;
      if (_data == null)
        return;

      self.render(_data);
    }
  }
  return GatePositionlayer;
});


