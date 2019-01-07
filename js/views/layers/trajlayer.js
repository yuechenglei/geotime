define([
    'require',
    "d3",
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'config',
    "variables",
    "datacenter",
    "d3tip"
], function (require, d3, Mn, _, $, Backbone, Config, Variables, Datacenter, d3tip) {
    'use strict';
    var TrajLayer = function (map, id) {
        //this.model=model
        this.map = map;
        this.id = id;
        this.geometry = {}
        this.depShow = true;
        this.arrShow = false;
        this.trajectoryShow = false;
        this.filterTrajShow = false;
        this.flightsShowTip = [];
        this.beginTime = new Date(2016, 11, 15, 0).getTime();
        this.lineMaterial = {
            linewidth: Datacenter.get('width-slider-current-value'),
            opacity: 1,
            visible: true
        };
        //this.init(data);
    };

    TrajLayer.prototype = {
        init: function (_data) {
            this.overlay = L.canvasOverlay()
            // .params({data:_data})
            // .drawing(this.drawingOnCanvas)
                .containParent(this)
                .addTo(this.map);

            // console.warn('trajlayer init');

            this.updateData(_data);
        },

        drawingOnCanvas: function (canvasOverlay, params) {
            var ctx = params.canvas.getContext('2d');
            var canvas = params.canvas;
            var self = params.containParent;

            var data = params.options.trajData;
            var depTrajsArr = data[ 'depPoints' ], arrTrajsArr = data[ 'arrPoints' ];
			Datacenter.set("depTrajsArr", depTrajsArr);

            var filterFlightList = Datacenter.get('filterFlightList');
            var colorMappingSelection = Config.get('colorMappingSelection');
            var colorMap;
            var selected_trajID = Datacenter.get('selected_trajID');

            if (colorMappingSelection == 'aircraft')
                colorMap = Datacenter.get('aircraftColorMap');
            else if (colorMappingSelection == 'aircompany')
                colorMap = Datacenter.get('airCompanyColorMap');
            else if (colorMappingSelection == 'departuretime')
                colorMap = Datacenter.get('departureTimeColorMap');

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (self.trajectoryShow && self.depShow) {
                depTrajsArr.forEach(function (d, i) {
                    var callsign = d.callsign.replace(/[0-9]/ig, "");

                    if (d.pos.length > 1) {
                        var dot1 = canvasOverlay._map.latLngToContainerPoint([ d.pos[ 0 ][ 'loc' ][ 1 ], d.pos[ 0 ][ 'loc' ][ 0 ] ]);
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = "rgba(41, 170, 227, 0)";

                        ctx.beginPath();
                        ctx.moveTo(dot1.x, dot1.y);

                        for (var i = 1; i < d.pos.length; i++) {
                            var dot = canvasOverlay._map.latLngToContainerPoint([ d.pos[ i ][ 'loc' ][ 1 ], d.pos[ i ][ 'loc' ][ 0 ] ]);
                            ctx.lineTo(dot.x, dot.y);
                        }

                        if ($.inArray(d.trajID, filterFlightList) == -1 && filterFlightList != null) {
                            ctx.strokeStyle = "rgba(41, 170, 227, 0)";
                        }
                        else {
                            if (selected_trajID.length == 0 || ($.inArray(d.trajID, selected_trajID) != -1)) {
                                if (colorMappingSelection == 'nomapping')
                                    ctx.strokeStyle = "rgba(41, 170, 227, 1)";
                                if (colorMappingSelection == 'aircraft')
                                    ctx.strokeStyle = (d[ 'aircraft' ] == "" ? colorMap[ '-' ] : colorMap[ d[ 'aircraft' ][ 'model' ][ 'code' ] ]);
                                else if (colorMappingSelection == 'aircompany')
                                    ctx.strokeStyle = colorMap[ callsign ];
                                else if (colorMappingSelection == 'departuretime') {
                                    var parse = d3.time.format("%H");
                                    var actualTime = (d[ 'time' ] == "" ? '-' : d[ 'time' ][ 'real' ][ 'departure' ][ '$numberLong' ]);
                                    var departureHour = (d[ 'time' ] == "" ? '-' : parse(new Date(parseInt(actualTime))) );
                                    ctx.strokeStyle = colorMap[ departureHour ];
                                }
                            }
                            else
                                ctx.strokeStyle = "rgba(41, 170, 227, 0)";
                        }

                        ctx.stroke();
                        ctx.closePath();
                    }
                });
            }

            if (self.trajectoryShow && self.arrShow) {
                arrTrajsArr.forEach(function (d, i) {
                    var callsign = d.callsign.replace(/[0-9]/ig, "");

                    if (d.pos.length > 1) {
                        var dot1 = canvasOverlay._map.latLngToContainerPoint([ d.pos[ 0 ][ 'loc' ][ 1 ], d.pos[ 0 ][ 'loc' ][ 0 ] ]);
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = "rgba(209, 71, 69, 0)";

                        ctx.beginPath();
                        ctx.moveTo(dot1.x, dot1.y);

                        for (var i = 1; i < d.pos.length; i++) {
                            var dot = canvasOverlay._map.latLngToContainerPoint([ d.pos[ i ][ 'loc' ][ 1 ], d.pos[ i ][ 'loc' ][ 0 ] ]);
                            ctx.lineTo(dot.x, dot.y);
                        }

                        if ($.inArray(d.trajID, filterFlightList) == -1 && filterFlightList != null) {
                            ctx.strokeStyle = "rgba(209, 71, 69, 0)";
                        }
                        else {
                            if (selected_trajID.length == 0 || ($.inArray(d.trajID, selected_trajID) != -1)) {
                                if (colorMappingSelection == 'nomapping')
                                    ctx.strokeStyle = "rgba(209, 71, 69, 1)";
                                if (colorMappingSelection == 'aircraft')
                                    ctx.strokeStyle = (d[ 'aircraft' ] == "" ? colorMap[ '-' ] : colorMap[ d[ 'aircraft' ][ 'model' ][ 'code' ] ]);
                                else if (colorMappingSelection == 'aircompany')
                                    ctx.strokeStyle = colorMap[ callsign ];
                                else if (colorMappingSelection == 'departuretime') {
                                    var parse = d3.time.format("%H");
                                    var actualTime = (d[ 'time' ] == "" ? '-' : d[ 'time' ][ 'real' ][ 'departure' ][ '$numberLong' ]);
                                    var departureHour = (d[ 'time' ] == "" ? '-' : parse(new Date(parseInt(actualTime))) );
                                    ctx.strokeStyle = colorMap[ departureHour ];
                                }
                            }
                            else
                                ctx.strokeStyle = "rgba(209, 71, 69, 0)";
                        }

                        ctx.stroke();
                        ctx.closePath();
                    }
                });
            }
        },

        updateData: function (data) {
            if (data == null) return;

            this.overlay.params({ trajData: data });
            this.overlay.drawing(this.drawingOnCanvas);
            this.overlay.redraw();

        },
        updateHistoryTrajShow: function (trajectoryShow) {
            this.trajectoryShow = trajectoryShow;
            this.overlay.redraw();
        },
        updateMovementData: function (data) {
            this.updateData(data);
        },
        updateSpatialTemporalFilteredData: function (data) {
            this.updateData(data);
        },
        updateArrShow: function (arrShow) {
            console.log(arrShow);
            this.arrShow = arrShow;
            this.overlay.redraw();
        },
        updateDepShow: function (depShow) {
            console.log(depShow);
            this.depShow = depShow;
            this.overlay.redraw();
        },
        updateFilterShow: function (filterTrajShow) {
            this.filterTrajShow = filterTrajShow;
            this.overlay.redraw();
        },
        updateFilterTraj: function () {
            d3.selectAll('.loadingBtn').classed("hidden", true);
            this.overlay.redraw();
        },
        updateSizeWidth: function () {
            d3.selectAll('.TrajCircle_arr_circle').attr('r', Datacenter.get('size-slider-current-value'));
            d3.selectAll('.TrajCircle_dep_circle').attr('r', Datacenter.get('size-slider-current-value'));

            this.overlay.redraw();
        },
        updateFixpotFilter: function () {
            var self = this;
            var fixpot_select = $.extend(true, [], Datacenter.get("fixpot_filter"));
            var beijingfixpotsShowTip = $.extend(true, [], Datacenter.get("beijingfixpotsShowTip"));
            // console.warn("fixpot_filter", fixpot_select);

            var fixpot_filterDataArray = [];

            beijingfixpotsShowTip.forEach(function (t) {
                var fixpot = fixpot_select[ 'arr' ][ t ];
                if (fixpot == undefined) fixpot = fixpot_select[ 'dep' ][ t ];
                fixpot.forEach(function (dd) {
                    fixpot_filterDataArray.push(dd[ 'select_traj' ][ 'trajID' ]);
                })
            });

            Datacenter.set("fixpot_filterDataArray", fixpot_filterDataArray);
            this.overlay.redraw();
        },
        updateCurrentSelection: function () {
            var self = this;
            this.overlay.redraw();
        },
    };
    return TrajLayer;
});
