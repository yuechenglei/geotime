/**
 * Created by fenglu on 2017/3/10.
 */
/**
 * Created by fenglu on 2017/3/2.
 */
define([
  'require',
  'marionette',
  'underscore',
  'jquery',
  'backbone',
  'config',
  "variables",
  "datacenter",
], function (require, Mn, _, $, Backbone, Config, Variables, Datacenter) {
  'use strict';
  var FilterLayer = function (map, id) {
    //this.model=model
    this.map = map;
    this.id = id;
    this.geometry = {}
    this.depShow = true;
    this.arrShow = true;
    this.filterPolygon = false;
    this.beginTime = new Date(2016, 11, 15, 0).getTime();
    //this.init(data);
  };

  FilterLayer.prototype = {
    init: function () {
      var self = this;
      this.filterSvgOverlay = L.d3SvgOverlay(function (sel, proj) {

      });

      this.filterSvgOverlay.addTo(this.map);
    },
    render: function () {
      var self = this;
      var sel = this.filterSvgOverlay.selection;
      var proj = this.filterSvgOverlay.projection;

      var filterSVG = d3.select('.leaflet-overlay-pane svg');
      sel.attr("class", "polygonFilter_g");

    },
    updateFilterShape: function (filterPolygon) {
      this.filterPolygon = filterPolygon;
      var filterSVG = d3.select('.leaflet-overlay-pane svg');

      if(filterPolygon) {
        d3.selectAll(".polygonFilter_g").classed("hidden", false);
        filterSVG.style("cursor", "crosshair");
      }
      else {
        d3.selectAll(".polygonFilter_g").classed("hidden", true);
        filterSVG.style("cursor", "-webkit-grab")
          .on("mousedown", function () {
            d3.select(this).style("cursor", "-webkit-grabbing");
          })
          .on("mouseup", function () {
            d3.select(this).style("cursor", "-webkit-grab");
          });
      }
      this.render();
    },
    updateFilterShow: function () {
      var sel = this.filterSvgOverlay.selection;
      var proj = this.filterSvgOverlay.projection;

    },
  };
  return FilterLayer;
});
