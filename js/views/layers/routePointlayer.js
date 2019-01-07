/**
 * Created by fenglu on 2017/10/31.
 */
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
    var RoutepointLayer = function (map, model, id) {
        this.map = map;
        this.mapModel = model;
        this.id = id;
        this.rCircle = 3;
        this.labelSize = 0.8;

        // this.init(data);
    };

    RoutepointLayer.prototype = {
        init: function (_data) {
            var self = this;

            this.RoutepointSvgOverlay = L.d3SvgOverlay(function (sel, proj) {
                sel.selectAll(".routePoint_Circle").attr("r", self.rCircle / proj.scale);
                sel.selectAll(".routePoint_Label").style("font-size", self.labelSize / proj.scale + 'em');
            });

            this.RoutepointSvgOverlay.addTo(this.map);
            this.updateData(_data);
        },
        render: function (data) {
            var self = this;
            var zoom = self.map._zoom;

            var sel = this.RoutepointSvgOverlay.selection;
            var proj = this.RoutepointSvgOverlay.projection;

            sel.selectAll(".routePoint").remove();

            var keyPointShow = self.mapModel.get('keyPointShow');
            var keyPointLabelShow = self.mapModel.get('keyPointLabelShow');

            var potGs = sel.selectAll('.routePoint')
                .data(data[ 'node' ])
                .enter().append("g")
                .attr("class", "routePoint")
                .classed('hidden', keyPointShow);

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
                .attr("fill", function (d) {
                    if (d.id.toString()[ 0 ] == 'g') return 'yellow';
                    // else if(d.id.toString()[0] == 'a') return 'pink';
                    else return 'white';
                })
                .attr("class", "routePoint_Circle")
                .style('cursor', 'pointer')
                .on("click", function (d) {
                    console.warn(d.id);
                    // var selectPoint = Datacenter.get('selectPoint');
                    // var index = $.inArray(d.id, selectRouteList);
                    // if( index == -1 ) {
                    //   selectRouteList.push(d.id);
                    // }
                    // else {
                    //   selectRouteList.splice(index, 1);
                    // }
                    // Datacenter.set('selectPoint', d.id);
                    // console.warn(selectRouteList);
                });

            var potName = potGs.append("text")
                .attr("class", "routePoint_Label")
                .attr("id", function (d) { return 'routePoint_Label_' + d.id; })
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
                .style("font-size", self.labelSize / proj.scale + 'em')
                .style('fill', function (d) {
                    if (d.id.toString()[ 0 ] == 'g') return 'yellow';
                    // else if(d.id.toString()[0] == 'a') return 'pink';
                    else return 'white';
                })
                .attr("text-anchor", "middle")
                .classed('hidden', !keyPointLabelShow);

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
        highlightPoints: function () {
            var self = this;
            // var sel = this.RoutepointSvgOverlay.selection;
            // var fixed_trajData = Datacenter.get('fixed_trajData');
            //
            // var selected_keyPointList = $.grep(fixed_trajData.depPoints, function (d) {
            //     return d.trajID == "c0e070c";
            // })[0];
            //
            // sel.selectAll(".routePoint_Circle")
            //     .style('fill', function (d) {
            //         if ($.inArray(d.id, selected_keyPointList.keyPointList) != -1) return '#fbb4ae';
            //         else return 'grey';
            //     })
            //     .style('fill-opacity', function (d) {
            //         if ($.inArray(d.id, selected_keyPointList.keyPointList) != -1) return 1;
            //         else return 0.3;
            //     });
        },
        updateData: function (_data) {
            var self = this;
            if (_data == null)
                return;

            self.render(_data);
        }
    }
    return RoutepointLayer;
});


