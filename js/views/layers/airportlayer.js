define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'config',
    "variables",
], function(require, Mn, _, $, Backbone,Config,Variables) {
    'use strict';
    var AirPortLayer = function(map,data,id){
        this.map = map;
        this.id = id;
        this.data = data;
        // this.airportsShowTip = [];

        // this.init(data);
    }

    AirPortLayer.prototype = {
        init:function(options){
            // this.airportsShowTip = [];
            this.airportSvgOverlay = L.d3SvgOverlay(this.airportDrawFunc,options);
            this.airportSvgOverlay.addTo(this.map);
        },
        airportDrawFunc: function(sel,proj) {
            var self = this;
            var airports = this.options["airports"];
            var model = this.options['model'];
            var show = model.get("airportShow");
            var fontSize = 1/proj.scale;
            var rectSize = 20/proj.scale;
            var tmp = Datacenter.get("airportsShowTip");
            var airportsShowTip = $.extend(true, [], tmp);
            var map = this.map;

            if(airports == null) return;

            // console.warn(this.map, this.airportsShowTip);
            d3.selectAll('.airport_tip').style("font-size", fontSize + 'em');

          // var tip = d3.tip()
            //   .attr('class', 'd3-tip')
            //   .offset([ -10, 0 ])
            //   .html(function (d) {
            //     return d.name;
            //   });

            var zoom = map.getZoom();
            var bound = map.getBounds() ;
            sel.selectAll(".airport").remove();
            // sel.call(tip);
           var airportGs = sel.selectAll('.airport').data(airports)
                        .enter().append("g").attr("class","airport")
                        .classed("hidden",!show);

            airportGs.each(function(d) {
                var projPot = proj.latLngToLayerPoint(L.latLng(d.position.latitude,d.position.longitude));
                var x = projPot.x;
                var y = projPot.y;
                d.x = x;
                d.y = y;
            });

            airportGs.append("rect")
                .attr("x", function(d) { return d.x-rectSize/2; })
                .attr("y", function(d) { return d.y-rectSize/2; })
                .attr("width", rectSize)
                .attr("height", rectSize)
                .style("stroke", "#FFFFFF")
                .style("stroke-width", 2.5/proj.scale)
                .style("fill", "none")
                .style('cursor', 'pointer')
                .on("click", function (d) {
                  var index = $.inArray(d.code.iata, airportsShowTip);
                  if( index == -1 ) {
                    airportsShowTip.push(d.code.iata);
                    showTooltip(d, this);
                  }
                  else {
                    airportsShowTip.splice(index, 1);
                    removeTooltip(d);
                  }
                  Datacenter.set('airportsShowTip', airportsShowTip);
                });

          function showTooltip (d, that) {
            var airport_tip = sel.append('g')
              .attr("class", "airport_tip_g")
              .attr("id", function () { return 'airport_tip_'+d.code.iata; });

            airport_tip.append("text")
              .attr("class", "airport_tip")
              .attr("x", d.x)
              .attr("y", d.y)
              .attr("dy", "-1.1em")
              .style("font-size", fontSize + 'em')
              .style('fill', 'white')
              .attr("text-anchor", "middle")
              .html(function() { return d.name; });
          }

          function removeTooltip (d) {
            $('#airport_tip_'+d.code.iata).remove();
          }

        },
        // init:function(){
        //     var data = this.data['airports'];
        //     var self = this;
        //     self.airportMarkers = [];
        //     // console.log(data);
        //     for(var i = 0;i<data.length;i++) {
        //         var airport = data[i];
        //         if(airport['position']['longitude'] < -20)
        //           airport['position']['longitude'] += 360;
        //         var latlon = [airport['position']['latitude'], airport['position']['longitude']];
        //         var marker = L.marker(latlon).bindPopup(airport['name']);
        //         // marker.setOpacity(0.5);
        //         self.airportMarkers.push(marker);
        //     }
        //     // console.log(self.airportMarkers);
        //     self.layer = L.layerGroup(self.airportMarkers);
        //     self.layer.addTo(self.map);
        // },
        // render:function(){
        //     this.overlay.redraw();
        // },
        // updateData:function(data){
        //     this.overlay.params({data: data});
        //     this.render();
        // },
    }
    return AirPortLayer;
});


