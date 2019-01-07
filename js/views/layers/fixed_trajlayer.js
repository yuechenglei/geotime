/**
 * Created by fenglu on 2017/12/17.
 */
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
    var Fixed_TrajLayer = function (map, id) {
        //this.model=model
        this.map = map;
        this.id = id;
        this.geometry = {};
        this.depShow = true;
        this.arrShow = false;
        this.fixedTrajShow = false;
        this.filterTrajShow = false;
        this.timeBias = 15 * 60 * 1000;
        this.timeBin = 10 * 60 * 1000;
        this.minTimeThreshold = 10; //低速阈值
        this.flightsShowTip = [];
        this.beginTime = new Date(2016, 11, 15, 0).getTime();
        this.lineMaterial = {
            linewidth: Datacenter.get('width-slider-current-value'),
            opacity: 1,
            visible: true
        };
        this.minSpeed = 0;
        this.maxSpeed_dep = 200;
        this.maxSpeed_arr = 1200;
        this.renderFlightNumber = 0;
        this.renderArrFlightNumber = 0;
        this.renderDepFlightNumber = 0;
        this.renderSamplePointNumber = 0;
        //this.init(data);
    };

    Fixed_TrajLayer.prototype = {
        init: function (_data) {
            var self = this;

            this.overlay = L.canvasOverlay()
            // .params({data:_data})
            // .drawing(this.drawingOnCanvas)
                .containParent(this)
                .addTo(this.map);

            this.updateData(_data);
        },

        drawingOnCanvas: function (canvasOverlay, params) {
            var self = this;

            var ctx = params.canvas.getContext('2d');
            var canvas = params.canvas;
            var self = params.containParent;

            var data = params.options.trajData;
            var depTrajsArr = data[ 'depPoints' ],
                arrTrajsArr = data[ 'arrPoints' ];

            self.renderFlightNumber = 0;
            self.renderArrFlightNumber = 0;
            self.renderDepFlightNumber = 0;
            self.renderSamplePointNumber = 0;

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
            ctx.lineWidth = 3;

            depTrajsArr.forEach(function (d, j) {
                if (d.new_pos_add.length < 2)
                    return;

                self.renderFlightNumber++;
                self.renderDepFlightNumber++;
                self.renderSamplePointNumber += d.new_pos_add.length;
            });

            arrTrajsArr.forEach(function (d, j) {
                if (d.new_pos_add.length < 2)
                    return;

                self.renderFlightNumber++;
                self.renderArrFlightNumber++;
                self.renderSamplePointNumber += d.new_pos_add.length;
            });

            if (self.fixedTrajShow && self.depShow) {
                depTrajsArr.forEach(function (d, j) {
                    //判断是否要渲染该轨迹
                    if (d.new_pos_add.length < 2)
                        return;

                    var hasSamplePoint = $.grep(d.new_pos_add, function (n) {
                        return n.isKeyPoint == false;
                    })
                    if (hasSamplePoint.length == 0) return;

                    if ($.inArray(d.trajID, filterFlightList) == -1 && filterFlightList != null)
                        return;
                    if (!(selected_trajID.length == 0 || ($.inArray(d.trajID, selected_trajID) != -1)))
                        return;

                    var callsign = d.callsign.replace(/[0-9]/ig, "");

                    if (colorMappingSelection == 'nomapping') {
                        d.new_pos_add[ 0 ].pointOnMap = canvasOverlay._map.latLngToContainerPoint([ d.new_pos_add[ 0 ].lat, d.new_pos_add[ 0 ].lon ]);

                        for (var i = 1; i < d.new_pos_add.length; i++) {
                            d.new_pos_add[ i ].pointOnMap = canvasOverlay._map.latLngToContainerPoint([ d.new_pos_add[ i ].lat, d.new_pos_add[ i ].lon ]);
                            var begin = d.new_pos_add[ i - 1 ].pointOnMap,
                                end = d.new_pos_add[ i ].pointOnMap;

                            ctx.beginPath();
                            ctx.moveTo(begin.x, begin.y);
                            ctx.lineTo(end.x, end.y);

                            var grad = ctx.createLinearGradient(begin.x, begin.y, end.x, end.y);
                            grad.addColorStop(0, self.color(d.new_pos_add[ i - 1 ].speed));
                            grad.addColorStop(1, self.color(d.new_pos_add[ i ].speed));

                            ctx.strokeStyle = grad;
                            // ctx.strokeStyle = "rgba(41, 170, 227, 0.6)";
                            // ctx.globalAlpha=0.5;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";

                            ctx.stroke();
                            ctx.closePath();

                            if (d.new_pos_add[ i - 1 ].speed == 0 && i > 1) {
                                ctx.fillStyle = self.color(d.new_pos_add[ i - 1 ].speed);
                                // ctx.fillStyle = "rgba(41, 170, 227, 0.6)";
                                ctx.beginPath();
                                ctx.arc(begin.x, begin.y, 4, 0, Math.PI * 2, true);
                                ctx.closePath();
                                ctx.fill();
                            }
                        }

                        if (d.new_pos_add[ d.new_pos_add.length - 1 ].speed == 0) {
                            var begin = d.new_pos_add[ d.new_pos_add.length - 1 ].pointOnMap;
                            ctx.fillStyle = self.color(d.new_pos_add[ d.new_pos_add.length - 1 ].speed);
                            // ctx.fillStyle = "rgba(41, 170, 227, 0.6)";
                            ctx.beginPath();
                            ctx.arc(begin.x, begin.y, 4, 0, Math.PI * 2, true);
                            ctx.closePath();
                            ctx.fill();
                        }
                    } else {
                        var dot1 = canvasOverlay._map.latLngToContainerPoint([ d.new_pos_add[ 0 ].lat, d.new_pos_add[ 0 ].lon ]);

                        ctx.beginPath();
                        ctx.moveTo(dot1.x, dot1.y);

                        for (var i = 1; i < d.new_pos_add.length; i++) {
                            var dot = canvasOverlay._map.latLngToContainerPoint([ d.new_pos_add[ i ].lat, d.new_pos_add[ i ].lon ]);
                            ctx.lineTo(dot.x, dot.y);
                        }

                        if (colorMappingSelection == 'aircraft') {
                            ctx.strokeStyle = (d[ 'aircraft' ] == "" ? colorMap[ '-' ] : colorMap[ d[ 'aircraft' ][ 'model' ][ 'code' ] ]);
                        }

                        if (colorMappingSelection == 'aircompany') {
                            ctx.strokeStyle = colorMap[ callsign ];
                        }

                        if (colorMappingSelection == 'departuretime') {
                            var parse = d3.time.format("%H");
                            var actualTime = (d[ 'time' ] == "" ? '-' : d[ 'time' ][ 'real' ][ 'departure' ][ '$numberLong' ]);
                            var departureHour = (d[ 'time' ] == "" ? '-' : parse(new Date(parseInt(actualTime))));
                            ctx.strokeStyle = colorMap[ departureHour ];
                        }

                        ctx.stroke();
                        ctx.closePath();
                    }
                });
            }

            if (self.fixedTrajShow && self.arrShow) {
                arrTrajsArr.forEach(function (d, j) {
                    //判断是否要渲染该轨迹
                    if (d.new_pos_add.length < 2)
                        return;

                    var hasSamplePoint = $.grep(d.new_pos_add, function (n) {
                        return n.isKeyPoint == false;
                    })
                    if (hasSamplePoint.length == 0) return;

                    if ($.inArray(d.trajID, filterFlightList) == -1 && filterFlightList != null)
                        return;
                    if (!(selected_trajID.length == 0 || ($.inArray(d.trajID, selected_trajID) != -1)))
                        return;

                    var callsign = d.callsign.replace(/[0-9]/ig, "");

                    if (colorMappingSelection == 'nomapping') {
                        d.new_pos_add[ 0 ].pointOnMap = canvasOverlay._map.latLngToContainerPoint([ d.new_pos_add[ 0 ].lat, d.new_pos_add[ 0 ].lon ]);

                        for (var i = 1; i < d.new_pos_add.length; i++) {
                            d.new_pos_add[ i ].pointOnMap = canvasOverlay._map.latLngToContainerPoint([ d.new_pos_add[ i ].lat, d.new_pos_add[ i ].lon ]);
                            var begin = d.new_pos_add[ i - 1 ].pointOnMap,
                                end = d.new_pos_add[ i ].pointOnMap;

                            ctx.beginPath();
                            ctx.moveTo(begin.x, begin.y);
                            ctx.lineTo(end.x, end.y);

                            var grad = ctx.createLinearGradient(begin.x, begin.y, end.x, end.y);
                            grad.addColorStop(0, self.color(d.new_pos_add[ i - 1 ].speed));
                            grad.addColorStop(1, self.color(d.new_pos_add[ i ].speed));

                            ctx.strokeStyle = grad;
                            // ctx.strokeStyle = "rgba(41, 170, 227, 0.6)";
                            // ctx.globalAlpha=0.5;
                            ctx.lineJoin = "round";
                            ctx.lineCap = "round";

                            ctx.stroke();
                            ctx.closePath();

                            if (d.new_pos_add[ i - 1 ].speed == 0 && i > 1) {
                                ctx.fillStyle = self.color(d.new_pos_add[ i - 1 ].speed);
                                // ctx.fillStyle = "rgba(41, 170, 227, 0.6)";
                                ctx.beginPath();
                                ctx.arc(begin.x, begin.y, 4, 0, Math.PI * 2, true);
                                ctx.closePath();
                                ctx.fill();
                            }
                        }

                        // if (d.new_pos_add[ d.new_pos_add.length - 1 ].speed == 0) {
                        //     var begin = d.new_pos_add[ d.new_pos_add.length - 1 ].pointOnMap;
                        //     ctx.fillStyle = self.color(d.new_pos_add[ d.new_pos_add.length - 1 ].speed);
                        //     // ctx.fillStyle = "rgba(41, 170, 227, 0.6)";
                        //     ctx.beginPath();
                        //     ctx.arc(begin.x, begin.y, 4, 0, Math.PI * 2, true);
                        //     ctx.closePath();
                        //     ctx.fill();
                        // }
                    } else {
                        var dot1 = canvasOverlay._map.latLngToContainerPoint([ d.new_pos_add[ 0 ].lat, d.new_pos_add[ 0 ].lon ]);

                        ctx.beginPath();
                        ctx.moveTo(dot1.x, dot1.y);

                        for (var i = 1; i < d.new_pos_add.length; i++) {
                            var dot = canvasOverlay._map.latLngToContainerPoint([ d.new_pos_add[ i ].lat, d.new_pos_add[ i ].lon ]);
                            ctx.lineTo(dot.x, dot.y);
                        }

                        if (colorMappingSelection == 'aircraft') {
                            ctx.strokeStyle = (d[ 'aircraft' ] == "" ? colorMap[ '-' ] : colorMap[ d[ 'aircraft' ][ 'model' ][ 'code' ] ]);
                        }

                        if (colorMappingSelection == 'aircompany') {
                            ctx.strokeStyle = colorMap[ callsign ];
                        }

                        if (colorMappingSelection == 'departuretime') {
                            var parse = d3.time.format("%H");
                            var actualTime = (d[ 'time' ] == "" ? '-' : d[ 'time' ][ 'real' ][ 'departure' ][ '$numberLong' ]);
                            var departureHour = (d[ 'time' ] == "" ? '-' : parse(new Date(parseInt(actualTime))));
                            ctx.strokeStyle = colorMap[ departureHour ];
                        }

                        ctx.stroke();
                        ctx.closePath();
                    }
                });
            }

            var flightNum = { 'totalNum': self.renderFlightNumber, 'arrNum': self.renderArrFlightNumber, 'depNum': self.renderDepFlightNumber };

            Datacenter.set('flightNum', flightNum);
            Datacenter.set('pointTotalNum', self.renderSamplePointNumber);
        },

        calRelatedFlights: function (centerFlight) {
            var self = this;
            if (centerFlight == null) return;

            console.log(centerFlight);

            var flightGraphNode = [],
                relatedflightList = [],
                relatedflight_trajData = [],
                flightGraphLink = [];
            var relatedLineData = { 'center': centerFlight, 'related': [] };

            var fixed_trajData = Datacenter.get('fixed_trajData');
            var keyPointPass = Datacenter.get('keyPointPass');
            var centerFlight_trajData = $.extend(true, {}, fixed_trajData.totalPoint.find(function (n) { return n.trajID == centerFlight; }));

            //找出中心航班的所有keyPoint
            var keys = centerFlight_trajData.new_pos_add.filter(function (d) { return d.isKeyPoint; })
            relatedflightList.push(centerFlight);

            //找出每个keyPoint的相关航班链（按照lastKey，nextKey分类）
            keys.forEach(function (k) {
                var index = keyPointPass[ k.id ].findIndex(function (d) {
                    return d.trajID == centerFlight && d.timestamp == k.timestamp;
                })

                var lastArray = [], nextArray = [];

                for (let ii = index - 1; ii >= 0; ii--) {
                    var lastFlight = keyPointPass[ k.id ][ ii ];

                    if (lastFlight != undefined && lastFlight.trajID != centerFlight) {
                        let isExist = false;
                        lastArray.some(function (a, j) {
                            if (a.lastKey == lastFlight.lastKey && a.nextKey == lastFlight.nextKey ||
                                a.nextKey == lastFlight.lastKey && a.lastKey == lastFlight.nextKey) {
                                isExist = true;
                                a.data.push(lastFlight);
                                return true;
                            }
                        })
                        if (isExist == false) {
                            lastArray.push({ lastKey: lastFlight.lastKey, nextKey: lastFlight.nextKey, data: [ lastFlight ] });
                            var lastSearch = $.inArray(lastFlight.trajID, relatedflightList);
                            if (lastSearch == -1) relatedflightList.push(lastFlight.trajID);
                        }
                    }
                }

                for (let ii = index + 1; ii < keyPointPass[ k.id ].length; ii++) {
                    var nextFlight = keyPointPass[ k.id ][ ii ];

                    if (nextFlight != undefined && nextFlight.trajID != centerFlight) {
                        let isExist = false;
                        nextArray.some(function (a, j) {
                            if (a.lastKey == nextFlight.lastKey && a.nextKey == nextFlight.nextKey ||
                                a.nextKey == nextFlight.lastKey && a.lastKey == nextFlight.nextKey) {
                                isExist = true;
                                a.data.push(nextFlight);
                                return true;
                            }
                        })
                        if (isExist == false) {
                            nextArray.push({ lastKey: nextFlight.lastKey, nextKey: nextFlight.nextKey, data: [ nextFlight ] });
                            var nextSearch = $.inArray(nextFlight.trajID, relatedflightList);
                            if (nextSearch == -1) relatedflightList.push(nextFlight.trajID);
                        }
                    }
                }

                relatedLineData.related.push({
                    'keyName': k.id,
                    'pass': {
                        'this': keyPointPass[ k.id ][ index ],
                        'last': lastArray,
                        'next': nextArray
                    }
                });
            })

            relatedflightList.forEach(function (d) {
                var trajData = $.extend(true, {}, fixed_trajData.totalPoint.find(function (n) { return n.trajID == d; }));

                relatedflight_trajData.push(trajData);
                flightGraphNode.push({ 'name': d, 'type': 'flight', 'callsign': trajData.callsign });
            })

            flightGraphNode.forEach(function (d) {
                if (d.trajID == centerFlight) return;
                var obj = { 'source': centerFlight, 'target': d.name };
                flightGraphLink.push(obj);
            })

            //link的index转换
            flightGraphLink.forEach(function (d) {
                d.source = flightGraphNode.findIndex(function (x) {
                    return x.name == d.source;
                });
                d.target = flightGraphNode.findIndex(function (x) {
                    return x.name == d.target;
                });
            });

            //航班路径数据汇总
            var flightGraphData = {};
            flightGraphData.flightGraphNode = flightGraphNode;
            flightGraphData.flightGraphLink = flightGraphLink;

            Datacenter.set('flightGraphData', flightGraphData);

            Datacenter.set('filterFlightList', relatedflightList);
            Datacenter.set('relatedLineData', relatedLineData);

            // var relatedflightListArr = []
            // var timeTrajData = Datacenter.get("timeTrajData")
            // relatedflightList.forEach(function(d, i) {
            //
            //     var findIndex = timeTrajData.findIndex(function(arr) {
            //         return arr.trajID == d
            //     })
            //     if (findIndex != -1)
            //         relatedflightListArr.push(timeTrajData[findIndex])
            //
            // })

            Datacenter.set('relatedflightList', relatedflight_trajData);
        },

        updateData: function (data) {
            var self = this;

            if (data == null) return;
            var trajData = $.extend(true, [], data);

            self.maxSpeed = d3.max(trajData.depPoints, function (d) {
                return d3.max(d.new_pos_add, function (n) {
                    return n.speed;
                });
            });

            self.color = d3.scale.linear()
                .domain([ self.minSpeed, 5, 10, 15, 25, 35, 45, 55, self.maxSpeed_dep, self.maxSpeed_arr ])
                .range([ "#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837" ]);

            self.renderSpeedLegend();

            this.overlay.params({ trajData: trajData });
            this.overlay.drawing(this.drawingOnCanvas);
            this.overlay.redraw();
        },
        updateArrShow: function (arrShow) {
            this.arrShow = arrShow;
            this.overlay.redraw();
        },
        updateDepShow: function (depShow) {
            this.depShow = depShow;
            this.overlay.redraw();
        },

        renderSpeedLegend: function () {
            var self = this;

            $(".speedLegend_svg").remove();

            var margin = { top: 1, right: 2, bottom: 10, left: 2 },
                width = $("#speedLegend").width() - margin.left - margin.right,
                height = $("#speedLegend").height() - margin.top - margin.bottom;

            var legendRectWidth = width / (self.color.range().length - 1),
                legendRectHeight = height / 2.5;

            var svg = d3.select("#speedLegend")
                .append("svg")
                .attr("class", "speedLegend_svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var defs = svg.append("defs");

            for (var i = 0; i < self.color.range().length - 1; i++) {
                var gradient = defs.append('svg:linearGradient')
                    .attr('id', 'gradient' + i);

                // Gradient i stop 1
                gradient.append('svg:stop')
                    .attr('stop-color', self.color.range()[ i ])
                    .attr('offset', '0%');

                // Gradient i stop 2
                gradient.append('svg:stop')
                    .attr('stop-color', self.color.range()[ i + 1 ])
                    .attr('offset', '100%');

            }

            var colorScale = self.color.range().splice(0, self.color.range().length - 1);

            // var legend = svg.selectAll('.legend')
            //     .data(colorScale)
            //     .enter()
            //     .append('g')
            //     .attr('class', 'legend')
            //     .attr('transform', function (d, i) {
            //         var horz = i * legendRectWidth;
            //         var vert = 0;
            //         return 'translate(' + horz + ',' + vert + ')';
            //     });
            //
            // legend.append('rect')
            //     .attr('width', legendRectWidth)
            //     .attr('height', legendRectHeight)
            //     .style('fill', function (d, i) {
            //         return 'url(#gradient' + i + ')';
            //     });
            //
            // legend.append('text')
            //     .attr('x', 0)
            //     .attr('y', height)
            //     .attr('dy', '.4em')
            //     .style('font-size', '0.8em')
            //     .text(function (d, i) { return self.color.domain()[ i ]; });
        },

        updateFixedTrajShow: function (fixedTrajShow) {
            this.fixedTrajShow = fixedTrajShow;
            this.overlay.redraw();
        },

        updateFilterTraj: function () {
            this.overlay.redraw();
        }
    };
    return Fixed_TrajLayer;
});