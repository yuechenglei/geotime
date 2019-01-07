/**
 * data: 2018-02-03 14:37:53
 * author: yuechenglei
 * describe:
 */

//git test

define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'config',
    "variables",
    "datacenter",
], function(require, Mn, _, $, Backbone, Config, Variables, Datacenter) {
    'use strict';
    var AnimationLayer = function(map, id) {
        //this.model=model
        this.map = map;
        this.id = id;
        this.airplaneShow = true;
        //this.init(data);
    };

    AnimationLayer.prototype = {
        init: function() {
            var self = this;
            console.log('animationlayer init');

            this.animationOverlay = L.d3SvgOverlay(function(sel, proj) {
                sel.selectAll(".bindLine").style("stroke-width", 2 / proj.scale);
                sel.selectAll(".bindLineCircle").style("r", 5 / proj.scale);


            });

            self.tooltip = d3.select("#mapBackground").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);



            this.animationOverlay.addTo(this.map);


            Datacenter.mapModel.get('map').setZoom(Config.get("curScale") - 1)
            Datacenter.mapModel.get('map').setZoom(Config.get("curScale"))
            // Datacenter.mapModel.get('map').setZoom(Config.get("curScale") - 1)
            Datacenter.mapModel.set('layerProjection', this.animationOverlay.projection)
        },
        renderTraj: function(data) {
            var self = this;
            var sel = this.animationOverlay.selection;
            var proj = this.animationOverlay.projection;

            if (data == null || d3.select("#mapBackground").classed('hidden')) return;

            // var data = data.filterTraj

            d3.selectAll(".bindLine").remove()
            d3.selectAll(".myGradient").remove()
            d3.selectAll(".speedCircle").remove()

            // console.warn('renderTraj', self.airplaneShow);

            if (!self.airplaneShow) return;

            //
            var colorGradient = [{
                    'color': "#a50026",
                    'speed': 0
                },
                {
                    'color': "#d73027",
                    'speed': 5
                },
                {
                    'color': "#f46d43",
                    'speed': 10
                },
                {
                    'color': "#fdae61",
                    'speed': 15
                },
                {
                    'color': "#fee08b",
                    'speed': 25
                },
                {
                    'color': "#d9ef8b",
                    'speed': 35
                },
                {
                    'color': "#a6d96a",
                    'speed': 45
                },
                {
                    'color': "#66bd63",
                    'speed': 55
                },
                {
                    'color': "#1a9850",
                    'speed': 1000
                }
            ];

            // Define the line
            var lineG = d3.svg.line()
                .x(function(d) {
                    return proj.latLngToLayerPoint(L.latLng(d.lat, d.lon)).x;
                })
                .y(function(d) {
                    return proj.latLngToLayerPoint(L.latLng(d.lat, d.lon)).y;
                });

            // sel.selectAll('.bindLine')
            //     .data(data)
            //     .enter()
            //     .append("path")
            //     .attr("class", "bindLine")
            //     .style({
            //         'stroke': '#29aae3',
            //         'stroke-width': 2 / proj.scale,
            //         'fill': 'none',
            //     })
            //     .attr("d", function(d, i) {
            //         return lineG(d)
            //     })



            // sel.append("line") // attach a line
            //     .style("stroke", "red") // colour the line
            //     .attr("x1", 100) // x position of the first end of the line
            //     .attr("y1", 50) // y position of the first end of the line
            //     .attr("x2", 300) // x position of the second end of the line
            //     .attr("y2", 150); // y position of the second end of the line


            // var centerFlight = Datacenter.get("centerFlight")
            // var relatedflightList = Datacenter.get('relatedflightList')


            // if (centerFlight != null && relatedflightList != null) {

            //     // console.log('filterFlightList', filterFlightList)

            //     if (filterFlightList.length > 0) {
            //         var newData = new Array()
            //         var filterFlightList = new Array()
            //         data.forEach(function(d, i) {
            //             if (filterFlightList.indexOf(d.trajID) != -1) {
            //                 // console.log()
            //                 newData.push(d)
            //                 filterFlightList.push(d.trajID)
            //             }
            //         })

            //         data = newData
            //         Datacenter.set('filterFlightList', filterFlightList)
            //     }

            // }

            var selected_trajID = Datacenter.get('selected_trajID');

            // console.log('selected_trajID', selected_trajID)
            if (selected_trajID != null)
                if (selected_trajID.length > 0) {
                    var newData = new Array()
                    data.forEach(function(d, i) {
                        if (selected_trajID.indexOf(d.trajID) != -1) {
                            // console.log()
                            newData.push(d)
                        }
                    })

                    data = newData
                }



            // console.log("data.filter.length", data.length)

            data.forEach(function(d, i) {
                var trajID = d.trajID
                var type = d.type

                var d = d.filterTraj



                var graID = i

                for (var j = 0; j < d.length - 1; j++) {

                    // console.log("Add line")

                    var lines = new Object()
                    lines.x1 = proj.latLngToLayerPoint(L.latLng(d[j].lat, d[j].lon)).x
                    lines.y1 = proj.latLngToLayerPoint(L.latLng(d[j].lat, d[j].lon)).y
                    lines.x2 = proj.latLngToLayerPoint(L.latLng(d[j + 1].lat, d[j + 1].lon)).x
                    lines.y2 = proj.latLngToLayerPoint(L.latLng(d[j + 1].lat, d[j + 1].lon)).y



                    if (lines.y2 == lines.y1)
                        lines.y2 += .000001
                    if (lines.x2 == lines.x1)
                        lines.x2 += .000001

                    var line = sel.append("line")
                        .attr("class", "bindLine " + trajID)
                        .style({
                            // 'stroke': '#29aae3',
                            'stroke-width': 2 / proj.scale,
                            'fill': 'none',
                            // 'stroke-opacity': 0
                        })
                        .attr("x1", lines.x1)
                        .attr("y1", lines.y1)
                        .attr("x2", lines.x2)
                        .attr("y2", lines.y2)
                        // .attr("t1", d[j].timestamp)
                        // .attr("t2", d[j + 1].timestamp)
                        .on({
                            'click': function(d) {
                                // console.log()
                                // console.log(this.attr('class'))
                                // Datacenter.get("selected_trajID").forEach(function(d, i) {
                                //     // d3.selectAll('.' + d).style('stroke-width', 2 / proj.scale)
                                // })

                                d3.selectAll('.bindLine').style('stroke', '#999')

                                var trajID = d3.select(this).attr('class').split(" ")[1]
                                var selected_trajID = Datacenter.get('selected_trajID')

                                var now_ID_array = $.extend(true, [], selected_trajID);

                                var index = $.inArray(trajID, now_ID_array);

                                if (index == -1) {
                                    now_ID_array.push(trajID);

                                } else {
                                    now_ID_array.splice(index, 1);
                                }

                                Datacenter.set('selected_trajID', now_ID_array);

                                console.log(trajID)

                                // console.log(d3.selectAll('.' + trajID))
                                // d3.selectAll('.' + trajID).each(function(d,i){
                                //     var gradient = d3.select(this).attr("id")
                                //     d3.select(this).style('stroke', gradient)
                                // })
                                // d3.selectAll('.' + trajID).style('stroke-width', 3.5 / proj.scale)
                                // d3.selectAll('.' + trajID).attr('stroke', )

                            },
                            "mouseover": function(d) {
                                d3.select(this).style("cursor", "pointer");
                            },
                            "mouseout": function(d) {
                                d3.select(this).style("cursor", "default");
                            }

                        })

                    // console.log(d[j])

                    if (typeof(d[j].id) != 'undefined' && d[j].id.substr(0, 1) == 'g')
                    ;
                    else if (d[j].speed == 0) {

                        var data = d[j]

                        sel.append("text")
                            .attr('class', 'speedCircle')
                            .attr('id', d[j].callsign)
                            .attr('font-family', 'FontAwesome')
                            .attr('text-anchor', 'middle')
                            .attr('alignment-baseline', 'central')
                            .style({
                                'fill': 'white',
                            })
                            .attr({
                                // 'stroke': '#29aae3',
                                // 'stroke-width': 2/proj.scale,
                                // 'fill': 'white',
                                // 'fill': '#D14745',
                                'font-size': 6 / proj.scale,
                                'x': lines.x1,
                                'y': lines.y1,
                                // 'text': '\uf28d'
                            })
                            .text(function(d) { return '\uf04b' })
                            .attr("transform", function(d) {
                                // console.log(this)
                                // var rightIndex = d.rightIndex == 0 ? 1 : d.rightIndex
                                // var projPoint = proj.latLngToLayerPoint(L.latLng(d.filterTraj[rightIndex].lat, d.filterTraj[rightIndex].lon))
                                // // console.log('rightIndex', rightIndex)
                                // // console.log('d.filterTraj.length', d.filterTraj.length)
                                // // var x1 = d3.select(this).attr('x'),
                                // //     y1 = d3.select(this).attr('y')
                                // var point = proj.latLngToLayerPoint(L.latLng(d.filterTraj[rightIndex - 1].lat, d.filterTraj[rightIndex - 1].lon))

                                var dy = (lines.y2 - lines.y1),
                                    dx = (lines.x2 - lines.x1);
                                var theta = Math.atan2(dy, dx);
                                var angle = (((theta * 180) / Math.PI)) % 360;
                                angle = (angle < 0) ? (360 + angle) : angle;

                                // console.log(angle)

                                return "rotate(" + angle + "," + d3.select(this).attr('x') + "," + d3.select(this).attr('y') + ")"
                            })
                            .on({
                                'click': function(d) {

                                    console.log(data)
                                },
                                "mouseover": function(d) {
                                    d3.select(this).style("cursor", "pointer");
                                },
                                "mouseout": function(d) {
                                    d3.select(this).style("cursor", "default");
                                }
                            })

                        //f28d
                    }

                    // var lines = sel.append("path")
                    //     .attr("class", "bindLine")
                    //     // .data([d[j], d[j + 1]])
                    //     .style({
                    //         'stroke': '#29aae3',
                    //         'stroke-width': 2 / proj.scale,
                    //         'fill': 'none',
                    //     })
                    //     .attr('d',lineG([d[j], d[j + 1]]))

                    // console.log("lines", lines)



                    // console.log("slope", slope)
                    var gradientX1, gradientY1, gradientX2, gradientY2;



                    var slope = (lines.y2 - lines.y1) / (lines.x2 - lines.x1)

                    if (lines.x1 <= lines.x2 && slope <= -1) {
                        gradientX1 = 0
                        gradientY1 = 1
                        gradientX2 = 1 / -slope
                        gradientY2 = 0
                    } else if (lines.x1 <= lines.x2 && slope > -1 && slope <= 0) {
                        gradientX1 = 0
                        gradientY1 = 1
                        gradientX2 = 1
                        gradientY2 = 1 + slope
                    } else if (lines.x1 <= lines.x2 && slope >= 1) {
                        gradientX1 = 0
                        gradientY1 = 0
                        gradientX2 = 1 / slope
                        gradientY2 = 1
                    } else if (lines.x1 <= lines.x2 && slope < 1 && slope > 0) {
                        gradientX1 = 0
                        gradientY1 = 0
                        gradientX2 = 1
                        gradientY2 = slope
                    } else if (lines.x1 > lines.x2 && slope >= 1) {
                        gradientX1 = 1 / slope
                        gradientY1 = 1
                        gradientX2 = 0
                        gradientY2 = 0
                    } else if (lines.x1 > lines.x2 && slope < 1 && slope > 0) {
                        gradientX1 = 1
                        gradientY1 = slope
                        gradientX2 = 0
                        gradientY2 = 0
                    } else if (lines.x1 > lines.x2 && slope <= -1) {
                        gradientX1 = 1 / -slope
                        gradientY1 = 0
                        gradientX2 = 0
                        gradientY2 = 1
                    } else {
                        gradientX1 = 1
                        gradientY1 = 1 + slope
                        gradientX2 = 0
                        gradientY2 = 1
                    }


                    var gradientID = "myGradient" + graID + j;
                    //console.log(gradientID);
                    var gradient = sel.append("defs")
                        .attr('class', 'myGradient')
                        .append("linearGradient")
                        .attr("class", "linearGradient_Animation")
                        .attr("id", gradientID)
                        .attr("x1", gradientX1)
                        .attr("y1", gradientY1)
                        .attr("x2", gradientX2)
                        .attr("y2", gradientY2);

                    line.style("stroke", "url(#" + gradientID + ")");
                    line.attr('id', "url(#" + gradientID + ")")

                    var colorBlock;
                    for (var i = 0; i < colorGradient.length - 1; i++) {
                        if (d[j].speed >= colorGradient[i].speed && d[j].speed <= colorGradient[i + 1].speed) {
                            colorBlock = i;
                            break;
                        }
                    }

                    // console.log("d[j].speed", d[j].speed)
                    // console.log("colorBlock", colorBlock)
                    // console.log(colorGradient)
                    var a = colorGradient[colorBlock].color;
                    var b = colorGradient[colorBlock + 1].color;

                    var compute = d3.interpolate(a, b);
                    var ratio = (d[j].speed - colorGradient[colorBlock].speed) / (colorGradient[colorBlock + 1].speed - colorGradient[colorBlock].speed);
                    var colorAns = compute(ratio);

                    gradient.append("stop")
                        .attr("offset", "0%")
                        .attr("stop-color", colorAns);

                    var colorBlock;
                    for (var i = 0; i < colorGradient.length - 1; i++) {
                        if (d[j + 1].speed >= colorGradient[i].speed && d[j + 1].speed <= colorGradient[i + 1].speed) {
                            colorBlock = i;
                            break;
                        }
                    }
                    var a = colorGradient[colorBlock].color;
                    var b = colorGradient[colorBlock + 1].color;

                    var compute = d3.interpolate(a, b);
                    var ratio = (d[j + 1].speed - colorGradient[colorBlock].speed) / (colorGradient[colorBlock + 1].speed - colorGradient[colorBlock].speed);
                    var colorAns = compute(ratio);
                    //console.log(colorAns);

                    gradient.append("stop")
                        .attr("offset", "100%")
                        .attr("stop-color", colorAns);

                    /*areas.style("fill", "url(#" + gradientID  + ")");
                     areas.style("stroke", "url(#" + gradientID  + ")");
                     areas.style("stroke-width", 0.3);
                     areas.style("stroke-opacity", 0.6);*/

                    // console.log(gradient)

                }


                if (d[d.length - 1].speed == 0 && type == 0) {
                    sel.append("text")
                        .attr('class', 'speedCircle')
                        .attr('id', d[j].callsign)
                        .attr('font-family', 'FontAwesome')
                        .attr('text-anchor', 'middle')
                        .attr('alignment-baseline', 'central')
                        .style({
                            'fill': 'white',
                        })
                        .attr({
                            // 'stroke': '#29aae3',
                            // 'stroke-width': 2/proj.scale,
                            // 'fill': 'white',
                            // 'fill': '#D14745',
                            'font-size': 8 / proj.scale,
                            'x': proj.latLngToLayerPoint(L.latLng(d[d.length - 1].lat, d[d.length - 1].lon)).x,
                            'y': proj.latLngToLayerPoint(L.latLng(d[d.length - 1].lat, d[d.length - 1].lon)).y,
                            // 'text': '\uf28d'
                        })
                        .text(function(d) { return '\uf04b' })
                        .attr("transform", function() {
                            // console.log(this)
                            // var rightIndex = d.rightIndex == 0 ? 1 : d.rightIndex
                            // var projPoint = proj.latLngToLayerPoint(L.latLng(d.filterTraj[rightIndex].lat, d.filterTraj[rightIndex].lon))
                            // // console.log('rightIndex', rightIndex)
                            // // console.log('d.filterTraj.length', d.filterTraj.length)
                            // // var x1 = d3.select(this).attr('x'),
                            // //     y1 = d3.select(this).attr('y')
                            // var point = proj.latLngToLayerPoint(L.latLng(d.filterTraj[rightIndex - 1].lat, d.filterTraj[rightIndex - 1].lon))

                            var y1 = proj.latLngToLayerPoint(L.latLng(d[d.length - 2].lat, d[d.length - 2].lon)).y,
                                x1 = proj.latLngToLayerPoint(L.latLng(d[d.length - 2].lat, d[d.length - 2].lon)).x

                            var dy = (d3.select(this).attr('y') - y1),
                                dx = (d3.select(this).attr('x') - x1);
                            var theta = Math.atan2(dy, dx);
                            var angle = (((theta * 180) / Math.PI)) % 360;
                            angle = (angle < 0) ? (360 + angle) : angle;

                            // console.log(angle)

                            return "rotate(" + angle + "," + d3.select(this).attr('x') + "," + d3.select(this).attr('y') + ")"
                        })

                }



            })


            // sel.selectAll('.bindLineCircle')
            //     .data(data)
            //     .enter()
            //     .append("circle")
            //     .attr('class', 'bindLineCircle')
            //     .style({
            //         // 'stroke': '#29aae3',
            //         // 'stroke-width': 2/proj.scale,
            //         'fill': '#29aae3',
            //         'r': 3 / proj.scale,
            //         'cx': function(d) {
            //             return proj.latLngToLayerPoint(L.latLng(d[d.length - 1].lat, d[d.length - 1].lon)).x
            //         },
            //         'cy': function(d) {
            //             return proj.latLngToLayerPoint(L.latLng(d[d.length - 1].lat, d[d.length - 1].lon)).y
            //         },
            //     })
            // })

            //draw points

        },

        renderCircle: function(curT) {
            var self = this;

            if (!d3.select("#mapBackground").classed('hidden')) {

                var data = Datacenter.get('filterArray');

                var sel = this.animationOverlay.selection;
                var proj = this.animationOverlay.projection;

                if (data == null) return;

                // console.log(data)
                // console.log(curT)
                // console.log('renderCircle', data)

                var flightTypeArray = {
                    'A332': '2',
                    'B77W': '2',
                    'A321': '0',
                    'B738': '0',
                    'A333': '2',
                    'A388': '3',
                    'A320': '0',
                    'B748': '3',
                    'B789': '2',
                    'B772': '2',
                    'B788': '2',
                    'B737': '0',
                    'B763': '1',
                    'B744': '2',
                    'A319': '0',
                    'B712': '0',
                    'B77L': '2',
                    'A343': '2',
                    'B739': '0',
                }

                if (curT > Config.get('slideWindowR'))
                    curT = Config.get('slideWindowR')
                else if (curT < Config.get('slideWindowL'))
                    curT = Config.get('slideWindowL')

                Config.set('lastRenderTime', curT)

                // d3.selectAll(".bindLine").remove()
                d3.selectAll(".bindLineCircle").remove()
                // console.warn('renderCircle', self.airplaneShow);

                if (!self.airplaneShow) return;

                var selected_trajID = Datacenter.get('selected_trajID');

                var centerFlight = Datacenter.get("centerFlight")
                // console.log("centerFlight",centerFlight)
                var filterFlightList = Datacenter.get('filterFlightList')

                // console.log("filterFlightList", filterFlightList)


                var drag = d3.behavior.drag()
                    .on("dragstart", dragstarted)
                    .on("drag", dragged)
                    .on("dragend", dragended);

                // console.log(drag)
                // var tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.callsign; });

                // sel.call(tip)
                // var selected_trajID = Datacenter.get('selected_trajID');

                var rightIndex, interpolateObj;
                sel.selectAll('.bindLineCircle')
                    .data(data.filter(function (d) {
                        var rightIndex = d.filterTraj.findIndex(function (arr) {
                            return arr.timestamp >= curT
                        })
                        // console.log('rightIndex', rightIndex)
                        // console.log('curT', curT)
                        // console.log('d.filterTraj[0].timestamp', d.filterTraj[0].timestamp)
                        if (rightIndex > 0) {
                            var interpolateObj = self.interpolate(d.filterTraj[rightIndex - 1], d.filterTraj[rightIndex], curT)
                            d.projPoint = proj.latLngToLayerPoint(L.latLng(interpolateObj.lat, interpolateObj.lon))
                        }
                        d.rightIndex = rightIndex
                        if (rightIndex == 0)
                            return d.filterTraj[0].timestamp == curT;

                        if (d.type == 1 && rightIndex < 0) {
                            d.rightIndex = d.filterTraj.length - 1
                            d.projPoint = proj.latLngToLayerPoint(L.latLng(d.filterTraj[d.rightIndex].lat, d.filterTraj[d.rightIndex].lon))
                            return true
                        }
                        return rightIndex > 0;

                    }))
                    .enter()
                    .append("text")
                    .attr('class', 'bindLineCircle')
                    .attr('id', function (d) {
                        return d.callsign
                    })
                    .attr('font-family', 'FontAwesome')
                    .attr('text-anchor', 'middle')
                    .attr('alignment-baseline', 'central')
                    .style({
                        'stroke': function (d) {
                            if ($.inArray(d.trajID, selected_trajID) != -1)
                                return '#fff'
                            return 'none'
                        },
                        'stroke-width': .8 / proj.scale,
                        // 'fill': '#29aae3',
                        'fill': function (d) {
                            if (d.trajID == centerFlight)
                                return "#fff"
                            // else if ($.inArray(d.trajID, selected_trajID) != -1)
                            //     return '#fff'

                            if (d.type == 1)
                                return '#D14745'
                            else
                                return '#29aae3'
                        }

                    })
                    // .style()
                    .attr({
                        // 'fill': '#D14745',
                        'font-size': function (d) {
                            if (d.trajID == centerFlight)
                                return 15 / proj.scale
                            else if (d.flightType != null) {
                                var flightType = flightTypeArray[d.flightType]
                                if (flightType == 0)
                                    return 10 / proj.scale
                                if (flightType == 1)
                                    return 12 / proj.scale
                                if (flightType == 2)
                                    return 14 / proj.scale
                                if (flightType == 3)
                                    return 16 / proj.scale
                            }

                            return 13 / proj.scale

                        },
                        'x': function (d) {

                            // console.log(d)

                            var rightIndex = d.rightIndex

                            // var d = d.filterTraj

                            if (rightIndex > 0) {
                                // var projPoint = d.projPoint
                                // var interpolateObj = self.interpolate(d[rightIndex - 1], d[rightIndex], curT)
                                return d.projPoint.x
                            }
                            return proj.latLngToLayerPoint(L.latLng(d.filterTraj[0].lat, d.filterTraj[0].lon)).x
                        },
                        'y': function (d) {
                            // var d = d.filterTraj
                            var rightIndex = d.rightIndex
                            // console.warn('cy', rightIndex);
                            if (rightIndex > 0) {
                                // var interpolateObj = self.interpolate(d[rightIndex - 1], d[rightIndex], curT)
                                return d.projPoint.y
                            }
                            return proj.latLngToLayerPoint(L.latLng(d.filterTraj[0].lat, d.filterTraj[0].lon)).y
                            //   return -10
                        },
                    })
                    .text(function (d) {
                        if (d.trajID == centerFlight)
                            return "\uf0fb"
                        return '\uf072'
                    })
                    .attr("transform", function (d) {
                        // console.log(this)

                        var rotate = 45

                        var rightIndex = d.rightIndex == 0 ? 1 : d.rightIndex
                        // console.log(d)
                        if (typeof(d.filterTraj[rightIndex].id) != 'undefined' && d.filterTraj[rightIndex].id.substr(0, 1) == 'g' && d.type == 0) {
                            // console.log(d.filterTraj[0].id)
                            rotate = 225
                        }

                        var projPoint = proj.latLngToLayerPoint(L.latLng(d.filterTraj[rightIndex].lat, d.filterTraj[rightIndex].lon))
                        // console.log('rightIndex', rightIndex)
                        // console.log('d.filterTraj.length', d.filterTraj.length)
                        // var x1 = d3.select(this).attr('x'),
                        //     y1 = d3.select(this).attr('y')
                        var point = proj.latLngToLayerPoint(L.latLng(d.filterTraj[rightIndex - 1].lat, d.filterTraj[rightIndex - 1].lon))

                        var dy = (projPoint.y - point.y),
                            dx = (projPoint.x - point.x);
                        var theta = Math.atan2(dy, dx);
                        var angle = (((theta * 180) / Math.PI)) % 360;
                        angle = (angle < 0) ? (360 + angle + rotate) : (angle + rotate);

                        if (d.trajID == centerFlight)
                            angle = (angle < 0) ? (360 + angle - 45) : (angle - 45);

                        // console.log(angle)

                        return "rotate(" + angle + "," + d3.select(this).attr('x') + "," + d3.select(this).attr('y') + ")"
                    })
                    .on('click', function (d) {
                        var selectedFlight = $.extend(true, [], Datacenter.get("selectedFlight"));
                        var findFlight = selectedFlight.findIndex(function (dd) {
                            return dd.trajID == d.trajID;
                        })
                        var flightObj = {"trajID": d.trajID, "callsign": d.callsign, "timestamp": curT, "speed": null};
                        // console.warn(flightObj);
                        console.warn(d);
                        // console.log(curT)

                        if (findFlight == -1) {
                            // d3.select(this).style('fill', '#D14745');
                            selectedFlight.push(flightObj);
                        } else {
                            // d3.select(this).style('fill', '#29aae3');
                            selectedFlight.splice(findFlight, 1);
                        }

                        Datacenter.set("selectedFlight", selectedFlight);


                        var selected_trajID = Datacenter.get('selected_trajID')

                        var now_ID_array = $.extend(true, [], selected_trajID);

                        var index = $.inArray(d.trajID, now_ID_array);

                        if (index == -1) {
                            now_ID_array.push(d.trajID);

                        } else {
                            now_ID_array.splice(index, 1);
                        }

                        Datacenter.set('selected_trajID', now_ID_array);


                    })
                    .on('mouseenter', function (d) {

                        var content = "callsign: " + d.callsign + "<br/>" +
                            "trajID: " + d.trajID + "<br/>"

                        if (typeof(d.flightType) != 'undefined')
                            content = "callsign: " + d.callsign + "<br/>" +
                                "trajID: " + d.trajID + "<br/>" +
                                "flightType: " + d.flightType + "<br/>"

                        self.tooltip.html(content)
                            .style('top', d3.event.pageY - 10 + 'px')
                            .style('left', d3.event.pageX + 10 + 'px')
                            .style("opacity", 1);

                        // console.log('mouseenter')
                        d3.select(this).style("cursor", "pointer");
                    })
                    .on('mouseout', function (d) {
                        // tip.hide(d)

                        self.tooltip.style("opacity", 0);


                        d3.select(this).style("cursor", "default");
                    })
                    .call(drag);

                var dragPath, p

                var lineG = d3.svg.line()
                    .x(function (d) {
                        return proj.latLngToLayerPoint(L.latLng(d.lat, d.lon)).x;
                    })
                    .y(function (d) {
                        return proj.latLngToLayerPoint(L.latLng(d.lat, d.lon)).y;
                    });

                function dragstarted(d) {

                    // console.log(d)

                    d3.event.sourceEvent.stopPropagation();

                    dragPath = sel.append("path")
                    // .data()
                        .style({
                            'stroke': 'none',
                            'stroke-width': 0.1,
                            'fill': 'none',
                        })
                        .attr('d', lineG(d.filterTraj))

                    // console.log("totalLenght", dragPath)

                }

                function dragended(d) {

                    dragPath.remove()

                    // d3.select(this).style('fill', '#29aae3');
                }

                function dragged(d) {
                    // d3.select(this).style('fill', '#D14745');
                    var m = d3.mouse(sel.node())

                    // console.log(dragPath)
                    p = closestPoint(dragPath.node(), m);

                    // console.log(p)
                    // console.log(d.trajID)
                    // console.log($("." + d.trajID))

                    var arr = d.filterTraj,
                        curTime

                    for (var i = 0; i < arr.length - 1; i++) {

                        var a = proj.latLngToLayerPoint(L.latLng(arr[i].lat, arr[i].lon))
                        var b = proj.latLngToLayerPoint(L.latLng(arr[i + 1].lat, arr[i + 1].lon))

                        // console.log("a", a)
                        // console.log("b", b)

                        if (p[0] == a.x && p[1] == a.y) {
                            curTime = arr[i].timestamp
                            break
                        } else if (p[0] == b.x && p[1] == b.y) {
                            curTime = arr[i + 1].timestamp
                            break
                        } else if ((Math.pow(((p[0] - a.x) * (p[0] - a.x) + (p[1] - a.y) * (p[1] - a.y)), 0.5) +
                            Math.pow(((b.x - p[0]) * (b.x - p[0]) + (b.y - p[1]) * (b.y - p[1])), 0.5) -
                            Math.pow(((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y)), 0.5)) < 0.1) {

                            var t1 = arr[i].timestamp
                            var t2 = arr[i + 1].timestamp

                            var allL = Math.pow(((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y)), 0.5),
                                subL = Math.pow(((p[0] - a.x) * (p[0] - a.x) + (p[1] - a.y) * (p[1] - a.y)), 0.5)

                            curTime = t1 + (t2 - t1) * subL / allL

                            break

                        }

                    }


                    Config.set('curTime', curTime)


                    // var t1 = -1,
                    //     t2, curObj, x1, x2, y1, y2


                    // d3.selectAll("." + d.trajID).each(function(d) {

                    //     var obj = d3.select(this)

                    //     // console.log('x1', obj.attr('x1'))
                    //     // console.log('x2', obj.attr('x2'))
                    //     // console.log('y1', obj.attr('y1'))
                    //     // console.log('y2', obj.attr('y2'))

                    //     x1 = obj.attr('x1')
                    //     x2 = obj.attr('x2')
                    //     y1 = obj.attr('y1')
                    //     y2 = obj.attr('y2')

                    //     if (p[0] == x1 && )


                    //         if (p[0] <= obj.attr('x1') && p[0] >= obj.attr('x2') && p[1] <= obj.attr('y1') && p[1] >= obj.attr('y2')) {
                    //             t1 = obj.attr('t1')
                    //             t2 = obj.attr('t2')
                    //             curObj = obj
                    //             // x1 = obj.attr('x1')
                    //             // x2 = obj.attr('x2')
                    //             // y1 = obj.attr('y1')
                    //             // y2 = obj.attr('y2')
                    //             // break
                    //         }

                    // })

                    // if (t1 == -1)
                    //     t1 = d3.select("." + d.trajID).attr('t1')

                    // var curTime
                    // var allL = Math.pow(((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), 0.5),
                    //     subL = Math.pow(((p[0] - x1) * (p[0] - x1) + (p[1] - y1) * (p[1] - y1)), 0.5)

                    // // if(t1<t2){
                    // curTime = t1 + (t2 - t1) * subL / allL
                    // // }


                    // console.log('t1', t1)
                    // console.log('allL', allL)
                    // console.log('subL', subL)
                    // console.log('curTime', curTime)

                    // d3.select(this)
                    //     .attr("transform", "translate(" + p[0] + "," + p[1] + ")")

                    // d3.select(this)
                    //     .attr('x', p[0])
                    //     .attr('y', p[1])
                }

                // // console.log('rightIndex', rightIndex)
                // if (leftIndex >= 0 && rightIndex != 0) {
                //     var filterTraj = new Array();
                //     if (leftIndex > 0) {
                //         var interL = self.interpolate(d[leftIndex - 1], d[leftIndex], leftT);
                //         filterTraj.push(interL)
                //     }


                function closestPoint(pathNode, point) {
                    var pathLength = pathNode.getTotalLength(),
                        precision = 8,
                        best,
                        bestLength,
                        bestDistance = Infinity;

                    // linear scan for coarse approximation
                    for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
                        if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
                            best = scan, bestLength = scanLength, bestDistance = scanDistance;
                        }
                    }

                    // binary search for precise estimate
                    precision /= 2;
                    while (precision > 0.5) {
                        var before,
                            after,
                            beforeLength,
                            afterLength,
                            beforeDistance,
                            afterDistance;
                        if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
                            best = before, bestLength = beforeLength, bestDistance = beforeDistance;
                        } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
                            best = after, bestLength = afterLength, bestDistance = afterDistance;
                        } else {
                            precision /= 2;
                        }
                    }

                    best = [best.x, best.y];
                    // best.distance = Math.sqrt(bestDistance);
                    return best;

                    function distance2(p) {
                        var dx = p.x - point[0],
                            dy = p.y - point[1];
                        return dx * dx + dy * dy;
                    }
                }

            }
        },
        updateAirplaneShow: function(airplaneShow) {
            var self = this;
            this.airplaneShow = airplaneShow;
            if (!airplaneShow)
                Datacenter.timelineModel.set("play", airplaneShow);

            // console.warn('update!!!', this.airplaneShow);
            var curTime = Config.get('curTime')

            self.renderTraj(Datacenter.get('filterArray'));
            self.renderCircle(Config.get('lastRenderTime'));
        },

        updateData: function() {
            var self = this;
            // console.warn("updateData")
            var sel = this.animationOverlay.selection;
            var proj = this.animationOverlay.projection;

            var depTrajData = Datacenter.get("depTrajData");
            var arrTrajData = Datacenter.get("arrTrajData");

            // var trajData = Datacenter.get("fixed_trajData").totalPoint;

            var filterArray = new Array();

            if (depTrajData == null || arrTrajData == null) return;

            if (Datacenter.get('centerFlight') != null && Datacenter.get('relatedflightList') != null) {
                
                depTrajData = []
                arrTrajData = []
                // console.log(Datacenter.get('relatedflightList'))
                Datacenter.get('relatedflightList').forEach(function(d,i){
                    if(d.arrdir==1){
                        // console.log(d)
                        arrTrajData.push(d)
                    }
                    else
                        depTrajData.push(d)
                })

                // console.log(arrTrajData)
                // console.log(depTrajData)
            }

            var curTime = Config.get('curTime')
            var leftT = Config.get('slideWindowL')
            var rightT = Config.get('slideWindowR')

            // console.log('leftT', leftT < rightT)
            // console.log('rightT',)
            if (leftT < rightT) {

                if (Datacenter.get('depShow'))
                    depTrajData.forEach(function(d, i) {
                        // console.log(d)
                        // console.log(leftT)
                        // console.log(rightT)
                        var data = d
                        var d = data.new_pos_add
                        if (d.length != 0) {

                            var leftIndex = d.findIndex(function(arr) {
                                return arr.timestamp >= leftT
                            })
                            // console.log('leftIndex', leftIndex)
                            var rightIndex = d.findIndex(function(arr) {
                                return arr.timestamp > rightT
                            })
                            // console.log('rightIndex', rightIndex)
                            if (leftIndex >= 0 && rightIndex != 0) {
                                var filterTraj = new Array();
                                if (leftIndex > 0) {
                                    var interL = self.interpolate(d[leftIndex - 1], d[leftIndex], leftT);
                                    filterTraj.push(interL)
                                }

                                if (rightIndex > 0) {
                                    for (var i = leftIndex; i < rightIndex; i++)
                                        filterTraj.push(d[i])
                                    var interR = self.interpolate(d[rightIndex - 1], d[rightIndex], rightT);
                                    filterTraj.push(interR)

                                } else
                                    for (var i = leftIndex; i < d.length; i++) {
                                        filterTraj.push(d[i])
                                    }

                                var obj = new Object();
                                obj.filterTraj = filterTraj;
                                obj.callsign = data.callsign;
                                obj.trajID = data.trajID;
                                obj.type = data.arrdir

                                if (data.aircraft != '' && data.aircraft.model != '')
                                    obj.flightType = data.aircraft.model['code'];

                                filterArray.push(obj)

                            }

                        }

                    })

                if (Datacenter.get('arrShow'))
                    arrTrajData.forEach(function(d, i) {
                        // console.log(d)
                        // console.log(leftT)
                        // console.log(rightT)
                        var data = d
                        var d = data.new_pos_add
                        if (d.length != 0) {

                            var leftIndex = d.findIndex(function(arr) {
                                return arr.timestamp >= leftT
                            })
                            // console.log('leftIndex', leftIndex)
                            var rightIndex = d.findIndex(function(arr) {
                                return arr.timestamp > rightT
                            })
                            // console.log('rightIndex', rightIndex)
                            if (leftIndex >= 0 && rightIndex != 0) {
                                var filterTraj = new Array();
                                if (leftIndex > 0) {
                                    var interL = self.interpolate(d[leftIndex - 1], d[leftIndex], leftT);
                                    filterTraj.push(interL)
                                }

                                if (rightIndex > 0) {
                                    for (var i = leftIndex; i < rightIndex; i++)
                                        filterTraj.push(d[i])
                                    var interR = self.interpolate(d[rightIndex - 1], d[rightIndex], rightT);
                                    filterTraj.push(interR)

                                } else
                                    for (var i = leftIndex; i < d.length; i++) {
                                        filterTraj.push(d[i])
                                    }

                                var obj = new Object();
                                obj.filterTraj = filterTraj;
                                obj.callsign = data.callsign;
                                obj.trajID = data.trajID;
                                obj.type = data.arrdir

                                if (data.aircraft != '' && data.aircraft.model != '')
                                    obj.flightType = data.aircraft.model['code'];

                                filterArray.push(obj)

                            }

                        }

                    })

                Datacenter.set('filterArray', filterArray)

                var filterFlightList = new Array();
                filterArray.forEach(function(d, i) {
                    filterFlightList.push(d.trajID)
                })
                Datacenter.set('filterFlightList', filterFlightList)

                // console.log('filterFlightList', filterFlightList)

                self.renderTraj(filterArray);
                window.map3d.renderTrajectoriesbyTime(filterArray);

            }
        },
        interpolate: function(dataT0, dataT1, time) {
            var latScale = d3.scale.linear()
                .range([dataT0.lat, dataT1.lat])
                .domain([dataT0.timestamp, dataT1.timestamp]);

            var lngScale = d3.scale.linear()
                .range([dataT0.lon, dataT1.lon])
                .domain([dataT0.timestamp, dataT1.timestamp]);

            var speedScale = d3.scale.linear()
                .range([dataT0.speed, dataT1.speed])
                .domain([dataT0.timestamp, dataT1.timestamp]);

            var obj = new Object();
            obj.lat = latScale(time)
            obj.lon = lngScale(time)
            obj.speed = speedScale(time)
            // obj.callsign = callsign
            // obj.trajID = trajID
            obj.id = dataT0.id
            obj.timestamp = time;

            return obj;
        }

    };
    return AnimationLayer;
});