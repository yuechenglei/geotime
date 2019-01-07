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
    var TrajLayerTotal = function (map, id) {
        //this.model=model
        this.map = map;
        this.id = id;
        this.geometry = {}
        this.depShow = true;
        this.arrShow = false;
        this.oriPoints = false;
        this.beginTime = new Date(2016, 11, 15, 0).getTime();
        this.lineMaterial = {
            linewidth: Datacenter.get('width-slider-current-value'),
            opacity: 1,
            visible: true
        };
        //this.init(data);
    };

    TrajLayerTotal.prototype = {
        init: function (_data) {
            this.overlay = L.canvasOverlay()
            // .params({data:_data})
            // .drawing(this.drawingOnCanvas)
                .containParent(this)
                .addTo(this.map);

            this.updateData(_data);
        },
        render: function (data) {
            var self = this;
            var sel = this.TrajSvgOverlay.selection;
            var proj = this.TrajSvgOverlay.projection;

            $('.samplePoint_dep').remove();

            if (data == null)
                return;

            var depTrajs_g = sel.selectAll(".samplePoint_dep")
                .data(data[ "depPoints" ])
                .enter()
                .append("g")
                .attr("class", "samplePoint_dep");

            var depPoints_g = depTrajs_g.selectAll(".samplePointSingle_dep")
                .data(function (d) {
                    return d.loc.coordinates;
                })
                .enter()
                .append("g")
                .attr("class", "samplePointSingle_dep");

            depPoints_g.append('circle')
                .attr({
                    "class": "samplePoint_dep_circle",
                    "id": function (d) {
                        return "samplePoint_dep_circle_" + d.trajID;
                    },
                    "fill": "rgb(41, 170, 227)",
                    "r": 2 / proj.scale,
                    "cx": function (d) { return proj.latLngToLayerPoint([ d[ 1 ], d[ 0 ] ]).x; },
                    "cy": function (d) { return proj.latLngToLayerPoint([ d[ 1 ], d[ 0 ] ]).y; },
                    "fill-opacity": function (d) {
                        return 0.1;
                    },
                })
                .style("cursor", "pointer");
        },
        drawingOnCanvas: function (canvasOverlay, params) {
            var ctx = params.canvas.getContext('2d');
            var canvas = params.canvas;
            var self = params.containParent;

            var totalData = params.options.totalData;
            var filterFlightList = Datacenter.get('filterFlightList');
            var colorMappingSelection = Config.get('colorMappingSelection');
            var colorMap;
            var selected_trajID = Datacenter.get('selected_trajID');

            if (totalData == null)
                return;

            if (colorMappingSelection == 'aircraft')
                colorMap = Datacenter.get('aircraftColorMap');
            else if (colorMappingSelection == 'aircompany')
                colorMap = Datacenter.get('airCompanyColorMap');
            else if (colorMappingSelection == 'departuretime')
                colorMap = Datacenter.get('departureTimeColorMap');

            var depTrajsTotalArr = totalData[ 'depPoints' ], arrTrajsTotalArr = totalData[ 'arrPoints' ];

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (self.oriPoints && self.depShow) {
                depTrajsTotalArr.map(function (d, i) {
                    var callsign = d.callsign.replace(/[0-9]/ig, "");

                    for (var i = 0; i < d.pos.length; i++) {
                        var dot = canvasOverlay._map.latLngToContainerPoint([ d.pos[ i ][ 'loc' ][ 1 ], d.pos[ i ][ 'loc' ][ 0 ] ]);

                        if ($.inArray(d.trajID, filterFlightList) == -1 && filterFlightList != null) {
                            ctx.fillStyle = "rgba(41, 170, 227, 0)";
                        }
                        else {
                            if (selected_trajID.length == 0 || ($.inArray(d.trajID, selected_trajID) != -1)) {
                                if (colorMappingSelection == 'nomapping')
                                    ctx.fillStyle = "rgba(41, 170, 227, 1)";
                                if (colorMappingSelection == 'aircraft')
                                    ctx.fillStyle = (d[ 'aircraft' ] == "" ? colorMap[ '-' ] : colorMap[ d[ 'aircraft' ][ 'model' ][ 'code' ] ]);
                                else if (colorMappingSelection == 'aircompany')
                                    ctx.fillStyle = colorMap[ callsign ];
                                else if (colorMappingSelection == 'departuretime') {
                                    var parse = d3.time.format("%H");
                                    var actualTime = (d[ 'time' ] == "" ? '-' : d[ 'time' ][ 'real' ][ 'departure' ][ '$numberLong' ]);
                                    var departureHour = (d[ 'time' ] == "" ? '-' : parse(new Date(parseInt(actualTime))) );
                                    ctx.fillStyle = colorMap[ departureHour ];
                                }
                            }
                            else
                                ctx.fillStyle = "rgba(41, 170, 227, 0)";
                        }
                        ctx.beginPath();
                        ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                });
            }
            if (self.oriPoints && self.arrShow) {
                arrTrajsTotalArr.map(function (d, i) {
                    var callsign = d.callsign.replace(/[0-9]/ig, "");

                    for (var i = 0; i < d.pos.length; i++) {
                        var dot = canvasOverlay._map.latLngToContainerPoint([ d.pos[ i ][ 'loc' ][ 1 ], d.pos[ i ][ 'loc' ][ 0 ] ]);

                        if ($.inArray(d.trajID, filterFlightList) == -1 && filterFlightList != null) {
                            ctx.fillStyle = "rgba(209, 71, 69, 0)";
                        }
                        else {
                            if (selected_trajID.length == 0 || ($.inArray(d.trajID, selected_trajID) != -1)) {
                                if (colorMappingSelection == 'nomapping')
                                    ctx.fillStyle = "rgba(209, 71, 69, 1)";
                                if (colorMappingSelection == 'aircraft')
                                    ctx.fillStyle = (d[ 'aircraft' ] == "" ? colorMap[ '-' ] : colorMap[ d[ 'aircraft' ][ 'model' ][ 'code' ] ]);
                                else if (colorMappingSelection == 'aircompany')
                                    ctx.fillStyle = colorMap[ callsign ];
                                else if (colorMappingSelection == 'departuretime') {
                                    var parse = d3.time.format("%H");
                                    var actualTime = (d[ 'time' ] == "" ? '-' : d[ 'time' ][ 'real' ][ 'departure' ][ '$numberLong' ]);
                                    var departureHour = (d[ 'time' ] == "" ? '-' : parse(new Date(parseInt(actualTime))) );
                                    ctx.fillStyle = colorMap[ departureHour ];
                                }
                            }
                            else
                                ctx.fillStyle = "rgba(209, 71, 69, 0)";
                        }
                        ctx.beginPath();
                        ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2, true);
                        ctx.closePath();
                        ctx.fill();
                    }
                });
            }
        },
        updateData: function (data) {
            var self = this;
            if (data == null) return;
            this.overlay.params({ totalData: data });
            this.overlay.drawing(this.drawingOnCanvas);
            this.overlay.redraw();
        },
        updateFilterTraj: function () {
            d3.selectAll('.loadingBtn').classed("hidden", true);
            this.overlay.redraw();
        },
        updateOriPointsShow: function (oriPoints) {
            this.oriPoints = oriPoints;
            this.overlay.redraw();
        },
        updateMovementData: function (data) {
            this.updateData(data);
        },
        updateSpatialTemporalFilteredData: function (data) {
            this.updateData(data);
        },
        updateArrShow: function (arrShow) {
            this.arrShow = arrShow;
            this.overlay.redraw();
        },
        updateDepShow: function (depShow) {
            this.depShow = depShow;// this.render();
            this.overlay.redraw();
        },
    };
    return TrajLayerTotal;
});
