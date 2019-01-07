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
        this.filterCircleShow = false;
        // this.beginTime = new Date(2016, 11, 15, 0).getTime();
        //this.init(data);
    };

    FilterLayer.prototype = {
        init: function () {
            var self = this;
            this.filterSvgOverlay = L.d3SvgOverlay(function (sel, proj) {
                // if(d3.select(".filterCircle_g").node() != null)
                //   m1 = d3.mouse(d3.select(".filterCircle_g").node());//zoom的时候会有偏移，svg的位置和g是不一样的，应该以g为准

                sel.selectAll(".filterCircle").style("stroke-width", 2 / proj.scale);
                sel.selectAll(".centerPoint").attr("r", 3 / proj.scale);
                sel.selectAll(".removeBtn").style('font-size', function () { return 1.2 / proj.scale + 'em'; });
                sel.selectAll(".loadingBtn").style('font-size', function () { return 0.8 / proj.scale + 'em'; });

                sel.selectAll(".filterCenterText")
                    .style('font-size', 0.8 / proj.scale + 'em')
                    .attr('x', function () {
                        var filterCircle = d3.select(this.parentNode).select('.filterCircle');
                        var initialX = filterCircle.attr("cx");
                        return +initialX;
                    })
                    .attr('y', function () {
                        var filterCircle = d3.select(this.parentNode).select('.filterCircle');
                        var initialY = filterCircle.attr("cy");
                        return +initialY + 30 / proj.scale;
                    });

                sel.selectAll(".radiusText").style('font-size', 0.8 / proj.scale + 'em')
                    .attr('x', function () {
                        var filterCircle = d3.select(this.parentNode).select('.filterCircle');
                        var initialX = filterCircle.attr("cx");
                        return +initialX;
                    })
                    .attr('y', function () {
                        var filterCircle = d3.select(this.parentNode).select('.filterCircle');
                        var initialY = filterCircle.attr("cy");
                        return +initialY + 40 / proj.scale;
                    });

                self.updateCursor();
            });

            this.filterSvgOverlay.addTo(this.map);
        },
        render: function () {
            var self = this;
            var sel = this.filterSvgOverlay.selection;
            var proj = this.filterSvgOverlay.projection;
            var circle, isDragging = false, m1, m2, cx = 0, cy = 0;

            var filterSVG = d3.select('.leaflet-overlay-pane svg');
            sel.attr("class", "filterCircle_g");

            filterSVG
                .on("mousedown", function (d) {
                    if (self.filterCircleShow) {
                        //清空 related graph view
                        Datacenter.set('flightGraphData', null);

                        d3.event.stopPropagation();
                        // $('.OneFilterCircle_g').remove();
                        m1 = d3.mouse(d3.select(".filterCircle_g").node());//zoom的时候会有偏移，svg的位置和g是不一样的，应该以g为准

                        var idString = Datacenter.randomString(4);

                        var OneFilterCircle_g = sel.append("g")
                            .attr("class", "OneFilterCircle_g")
                            .attr("id", "OneFilterCircle_g_" + idString);

                        //center point
                        var hiddenRect = OneFilterCircle_g.append("rect")
                            .attr({
                                "class": "hiddenRect",
                                "id": "hiddenRect_" + idString,
                                "x": m1[ 0 ],
                                "y": m1[ 1 ] - 15 / proj.scale - 10 / proj.scale,//半径+偏移
                                "width": 15 / proj.scale + 10 / proj.scale,
                                "height": 15 / proj.scale + 10 / proj.scale
                            })
                            .style({
                                "fill": "#000",
                                "fill-opacity": 0
                            });

                        var centerPoint = OneFilterCircle_g.append("circle")
                            .attr("class", "centerPoint")
                            .attr("id", "centerPoint_" + idString)
                            .attr("cx", m1[ 0 ])
                            .attr("cy", m1[ 1 ])
                            .attr("r", 1.5 / proj.scale)
                            .style({
                                "fill": "#fff"
                            });

                        var removeBtn = OneFilterCircle_g.append("text")
                            .style('font-family', 'FontAwesome')
                            .style('font-size', function () {
                                return 1.2 / proj.scale + 'em';
                            })
                            .attr('class', 'removeBtn')
                            .attr('id', 'removeBtn_' + idString)
                            .text(function () { return '\uf00d' })
                            .style("cursor", "pointer")
                            .on("click", function () {
                                d3.select(this.parentNode).remove();

                                if (d3.selectAll(".OneFilterCircle_g").node() == null)
                                    Datacenter.removeAllView();
                                else
                                    self.updateFilterData();
                            })
                            .classed("hidden", true);

                        var circle = OneFilterCircle_g.append("circle")
                            .attr("class", "filterCircle")
                            .attr('id', 'filterCircle_' + idString)
                            .attr("cx", m1[ 0 ])
                            .attr("cy", m1[ 1 ])
                            .attr("r", 15 / proj.scale)
                            .style({
                                "fill": "#fff",
                                "fill-opacity": 0,
                                "stroke": "#fff",
                                "stroke-width": 2 / proj.scale,
                            });

                        var filterCenterText = OneFilterCircle_g.append('text')
                            .attr({
                                "class": 'filterCenterText',
                                "id": "filterCenterText_" + idString,
                                'x': m1[ 0 ],
                                'y': m1[ 1 ] + 30 / proj.scale,
                            })
                            .style({
                                'fill': '#999',
                                'font-size': 0.8 / proj.scale + 'em',
                            })
                            .text('lat: ' + proj.layerPointToLatLng(m1).lat.toFixed(3) + ', lng: ' + proj.layerPointToLatLng(m1).lng.toFixed(3));

                        var radiusText = OneFilterCircle_g.append('text')
                            .attr({
                                "class": 'radiusText',
                                "id": "radiusText_" + idString,
                                'x': m1[ 0 ],
                                'y': m1[ 1 ] + 40 / proj.scale,

                            })
                            .style({
                                'fill': '#999',
                                'font-size': 0.8 / proj.scale + 'em',
                            })
                            .text(function () {
                                var r = +d3.select('.filterCircle').attr('r');
                                var cx = +d3.select('.filterCircle').attr('cx'),
                                    cy = +d3.select('.filterCircle').attr('cy');

                                var p2 = [ cx - r, cy ];
                                var lat1 = proj.layerPointToLatLng([ cx, cy ]).lat,
                                    lng1 = proj.layerPointToLatLng([ cx, cy ]).lng,
                                    lat2 = proj.layerPointToLatLng(p2).lat,
                                    lng2 = proj.layerPointToLatLng(p2).lng;

                                return 'r: ' + (getFlatternDistance(lat1, lng1, lat2, lng2)).toFixed(3) + 'm';
                            });

                        var loadingBtn = OneFilterCircle_g.append("text")
                            .style('font-size', function () {
                                return 0.8 / proj.scale + 'em';
                            })
                            .attr('class', 'loadingBtn')
                            .attr('id', 'loadingBtn_' + idString)
                            .text("Loading...");

                        OneFilterCircle_g
                            .on("mouseover", function () {
                                var thisFilter = d3.select(this);
                                var thisID = thisFilter.attr('id').split('_').pop();

                                var removeBtn = thisFilter.select("#removeBtn_" + thisID);
                                var cx = +thisFilter.select("#filterCircle_" + thisID).attr("cx"),
                                    cy = +thisFilter.select("#filterCircle_" + thisID).attr("cy"),
                                    r = +thisFilter.select("#filterCircle_" + thisID).attr("r");

                                removeBtn.attr("x", cx + r)
                                    .attr("y", cy - r)
                                    .classed("hidden", false);
                            })
                            .on("mouseout", function () {
                                var thisFilter = d3.select(this);
                                var thisID = thisFilter.attr('id').split('_').pop();

                                var removeBtn = thisFilter.select("#removeBtn_" + thisID);
                                removeBtn.classed("hidden", true);
                            })
                            .on("mousedown", function () {
                                if (self.filterCircleShow) {
                                    d3.event.stopPropagation();

                                    var pos = d3.mouse(d3.select(".filterCircle_g").node());
                                    var thisFilter = d3.select(this);
                                    var thisID = thisFilter.attr('id').split('_').pop();

                                    var cx = thisFilter.select("#filterCircle_" + thisID).attr("cx"),
                                        cy = thisFilter.select("#filterCircle_" + thisID).attr("cy"),
                                        r = thisFilter.select("#filterCircle_" + thisID).attr("r");
                                    var distance = getRadius(cx, cy, pos[ 0 ], pos[ 1 ]);
                                    if (distance < r * 3 / 4)
                                        isDragging = true;
                                    else
                                        isDragging = false;
                                }
                            })
                            .on("mouseup", function () {
                                isDragging = false;
                                var thisFilter = d3.select(this);
                                var thisID = thisFilter.attr('id').split('_').pop();

                                thisFilter.select('#filterCircle_' + thisID).style("stroke-dasharray", "none");

                                Config.set("filterTrajShow", true);

                                var cx = +thisFilter.select('#filterCircle_' + thisID).attr("cx"),
                                    cy = +thisFilter.select('#filterCircle_' + thisID).attr("cy"),
                                    r = +thisFilter.select('#filterCircle_' + thisID).attr("r");

                                if (self.filterCircleShow) {
                                    var loadingBtn = thisFilter.select("#loadingBtn_" + thisID);
                                    // loadingBtn.classed("hidden", false);
                                    loadingBtn.attr("x", cx + r + 10 / proj.scale)
                                        .attr("y", cy);
                                }
                                self.updateFilterData();

                                var hiddenRect = thisFilter.select("#hiddenRect_" + thisID);
                                hiddenRect.attr({
                                    "x": cx,
                                    "y": cy - r - 10 / proj.scale,//半径+偏移
                                    "width": r + 10 / proj.scale,
                                    "height": r + 10 / proj.scale
                                });

                                var removeBtn = thisFilter.select("#removeBtn_" + thisID);
                                removeBtn.classed("hidden", false);
                                removeBtn.attr("x", cx + r)
                                    .attr("y", cy - r);
                            })
                            .on("mousemove", function () {
                                var thisFilter = d3.select(this);
                                var thisID = thisFilter.attr('id').split('_').pop();

                                if (self.filterCircleShow) {
                                    var pos = d3.mouse(d3.select(".filterCircle_g").node());
                                    var cx = +thisFilter.select('#filterCircle_' + thisID).attr("cx"),
                                        cy = +thisFilter.select('#filterCircle_' + thisID).attr("cy"),
                                        r = +thisFilter.select('#filterCircle_' + thisID).attr("r");
                                    var distance = getRadius(cx, cy, pos[ 0 ], pos[ 1 ]);
                                    if (distance < r * 3 / 4)
                                        $('#filterCircle_' + thisID).css("cursor", "move");
                                    else
                                        $('#filterCircle_' + thisID).css("cursor", "nwse-resize");
                                }
                                else
                                    $('#filterCircle_' + thisID).css("cursor", "-webkit-grab");
                            })
                            .call(drag);

                        self.updateCursor();
                    }
                });

            function getRadius (x1, y1, x2, y2) {
                return Math.sqrt((Math.pow(x2 - x1, 2) + (Math.pow(y2 - y1, 2))));
            }

            var drag = d3.behavior.drag()
                .on("drag", function () {
                    var thisFilter = d3.select(this);
                    var thisID = thisFilter.attr('id').split('_').pop();

                    thisFilter.select('#filterCircle_' + thisID).style("stroke-dasharray", (3 / proj.scale, 3 / proj.scale));

                    if (self.filterCircleShow) {
                        thisFilter.select('#removeBtn_' + thisID).classed("hidden", true);
                        if (isDragging) {
                            var filterCircle = thisFilter.select("#filterCircle_" + thisID),
                                centerPoint = thisFilter.select("#centerPoint_" + thisID),
                                filterCenterText = thisFilter.select("#filterCenterText_" + thisID),
                                radiusText = thisFilter.select("#radiusText_" + thisID);

                            var initialX = filterCircle.attr("cx"),
                                initialY = filterCircle.attr("cy");

                            filterCircle
                                .attr("cx", +initialX + d3.event.dx)
                                .attr("cy", +initialY + d3.event.dy);

                            centerPoint
                                .attr("cx", +initialX + d3.event.dx)
                                .attr("cy", +initialY + d3.event.dy);

                            filterCenterText
                                .attr('x', +initialX + d3.event.dx)
                                .attr('y', +initialY + d3.event.dy + 30 / proj.scale)
                                .text(function () {
                                    var pos = [ +initialX + d3.event.dx, +initialY + d3.event.dy ];
                                    var lat_lng = proj.layerPointToLatLng(pos);
                                    return 'lat: ' + lat_lng.lat.toFixed(3) + ', lng: ' + lat_lng.lng.toFixed(3);
                                });

                            radiusText
                                .attr('x', +initialX + d3.event.dx)
                                .attr('y', +initialY + d3.event.dy + 40 / proj.scale);
                        }
                        else {
                            m2 = d3.mouse(d3.select(".filterCircle_g").node());

                            var filterCircle = thisFilter.select("#filterCircle_" + thisID),
                                radiusText = thisFilter.select('#radiusText_' + thisID);

                            var cx = +filterCircle.attr("cx"),
                                cy = +filterCircle.attr("cy");
                            filterCircle.attr("r", getRadius(m2[ 0 ], m2[ 1 ], cx, cy));

                            radiusText
                                .text(function () {
                                    var lat1 = proj.layerPointToLatLng(m2).lat,
                                        lng1 = proj.layerPointToLatLng(m2).lng,
                                        lat2 = proj.layerPointToLatLng([ cx, cy ]).lat,
                                        lng2 = proj.layerPointToLatLng([ cx, cy ]).lng;

                                    return 'r: ' + (getFlatternDistance(lat1, lng1, lat2, lng2)).toFixed(3) + 'm';
                                })
                        }
                    }
                });

            var EARTH_RADIUS = 6378137.0;    //单位M
            var PI = Math.PI;

            function getRad (d) {
                return d * PI / 180.0;
            }

            function getFlatternDistance (lat1, lng1, lat2, lng2) {
                if (lat1 == lat2 && lng1 == lng2)
                    return 0;

                var EARTH_RADIUS = 6378137.0;    //单位M

                var radLat1 = getRad(lat1);
                var radLat2 = getRad(lat2);

                var a = radLat1 - radLat2;
                var b = getRad(lng1) - getRad(lng2);

                var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
                s = s * EARTH_RADIUS;
                s = Math.round(s * 10000) / 10000.0;

                return s;
            }

        },
        updateFilterShow: function (filterShow) {
            var self = this;

            if (filterShow == "filterCircle") {
                this.filterCircleShow = true;
                d3.selectAll(".filterCircle_g").classed("hidden", false);
                this.render();
            }
            else {
                this.filterCircleShow = false;
                if (filterShow == "filterRemove")
                    d3.selectAll(".filterCircle_g").classed("hidden", true);
                if (filterShow == "filterForbid")
                    d3.selectAll(".filterCircle_g").classed("hidden", false);
                if (filterShow == "filterDeleteAll") {
                    d3.selectAll(".OneFilterCircle_g").remove();
                    Config.set("filterTrajShow", false);
                }
            }
        },
        updateFilterData: function () {
            var self = this;

            var sel = this.filterSvgOverlay.selection;
            var proj = this.filterSvgOverlay.projection;

            if (d3.selectAll(".filterCircle").node() == null)
                return;

            var proj = this.filterSvgOverlay.projection;
            var Data = $.extend(true, [], Datacenter.get('fixed_trajData')[ 'totalPoint' ]);

            var flightList_total = [];

            d3.selectAll('.filterCircle').each(function (dd) {
                var thisFilter = d3.select(this);
                var thisID = thisFilter.attr('id').split('_').pop();

                var cx = +thisFilter.node().getAttribute("cx");
                var cy = +thisFilter.node().getAttribute("cy");
                var r = +thisFilter.node().getAttribute("r");
                var flightList = [];

                //找出经过该filter内部的轨迹
                Data.forEach(function (d) {
                    for (var ii = 0; ii < d.fixed_pos.length - 1; ii++) {
                        var thisLink = { 'src': d.fixed_pos[ ii ], 'dst': d.fixed_pos[ ii + 1 ] };
                        var samplePoint = { 'x': cx, 'y': cy };
                        GetLinePara(thisLink);
                        var dist = distanceSamplePointToRoute(samplePoint, thisLink);
                        if (dist <= r) {
                            flightList.push(d.trajID);
                            break;
                        }
                    }
                });

                flightList_total.push(flightList);
            })

            if (flightList_total.length == 1)
                flightList_total = $.extend(true, [], flightList_total[ 0 ]);
            else {
                var fl = $.extend(true, [], flightList_total[ 0 ]);
                for (var ii = 1; ii < flightList_total.length; ii++)
                    fl = $.extend(true, [], _.intersection(fl, flightList_total[ ii ]));
                flightList_total = $.extend(true, [], fl);
            }

            Datacenter.set('filterFlightList', flightList_total);

            self.updateCursor();

            function distanceSamplePointToRoute (samplePoint, thisLink) {
                var distance = (Math.abs(thisLink.a * samplePoint.x + thisLink.b * samplePoint.y + thisLink.c)) / Math.sqrt(Math.pow(thisLink.a, 2) + Math.pow(thisLink.b, 2));
                var cross_x = (thisLink.b * thisLink.b * samplePoint.x - thisLink.a * thisLink.b * samplePoint.y - thisLink.a * thisLink.c) / (
                    thisLink.a * thisLink.a + thisLink.b * thisLink.b);
                var cross_y = (thisLink.a * thisLink.a * samplePoint.y - thisLink.a * thisLink.b * samplePoint.x - thisLink.b * thisLink.c) / (
                    thisLink.a * thisLink.a + thisLink.b * thisLink.b);
                if (cross_x >= Math.min(thisLink.x1, thisLink.x2) && cross_x <= Math.max(thisLink.x1, thisLink.x2) &&
                    cross_y >= Math.min(thisLink.y1, thisLink.y2) && cross_y <= Math.max(thisLink.y1, thisLink.y2)
                )
                    return distance;
                else {
                    var endPoint1 = { 'x': thisLink.x1, 'y': thisLink.y1 };
                    var endPoint2 = { 'x': thisLink.x2, 'y': thisLink.y2 };
                    return Math.min(distancePointToPoint(samplePoint, endPoint1), distancePointToPoint(samplePoint, endPoint2));
                }
            }

            function distancePointToPoint (p1, p2) {
                var x = p1.x - p2.x;
                var y = p1.y - p2.y;
                var dis = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
                return dis;
            }

            function GetLinePara (thisLink) {
                thisLink.x1 = proj.latLngToLayerPoint(L.latLng(thisLink.src.lat, thisLink.src.lon)).x;
                thisLink.y1 = proj.latLngToLayerPoint(L.latLng(thisLink.src.lat, thisLink.src.lon)).y;
                thisLink.x2 = proj.latLngToLayerPoint(L.latLng(thisLink.dst.lat, thisLink.dst.lon)).x;
                thisLink.y2 = proj.latLngToLayerPoint(L.latLng(thisLink.dst.lat, thisLink.dst.lon)).y;

                thisLink.a = thisLink.y1 - thisLink.y2;
                thisLink.b = thisLink.x2 - thisLink.x1;
                thisLink.c = thisLink.x1 * thisLink.y2 - thisLink.x2 * thisLink.y1;
            }
        },
        updateCursor: function () {
            var self = this;
            var filterShow = Config.get('filterShow');
            if (filterShow == 'filterCircle') {
                var filterSVG = d3.select('.leaflet-overlay-pane svg');
                filterSVG.style("cursor", "crosshair");
            }
        }
    };
    return FilterLayer;
});
