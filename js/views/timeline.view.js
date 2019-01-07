/**
 * Created by aji on 15/7/13.
 */
define([
    'require',
    "d3",
    'd3tip',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    'jqueryUI',
    'text!templates/timeline.tpl',
    "views/timelineSVG.itemview",
    "views/timelineSVGB.itemview"
], function(require, d3, d3tip, Mn, _, $, Backbone, Datacenter, Config, jqueryUI,
    Tpl, timelineSVG, timelineSVGB) {
    'use strict';

    return Mn.LayoutView.extend({

        tagName: 'div',

        template: function() {
            return _.template(Tpl);
        },

        attributes: {
            'style': 'width: 100%; height:100%;',
            'id': 'timelineDiv'
        },
        // regions:{
        //     // 'map': '#map',
        //     'timelineSVGB':'#timelineSvgB',
        //     'timelineSVG':'#timelineSvg',
        // },
        events: {
            // "click #button_play":"onClickTimePlay",
            // 'click #button_autoRepeat':"onClickRepeat",
            // "click .barTitle": "onClickBarTitle"
        },

        initialize: function(options) {
            var self = this;
            options = options || {};
            // var timeTrajData = [];
            var emPixel = d3.select("#maindiv").style('font-size')
            emPixel = parseInt(emPixel.split('p')[0])
            self.emPixel = emPixel

            Config.set("emPixel", emPixel)


            // if (Datacenter.get("fixed_trajData") != null) {
            // console.log("listenTo")
            var arr = new Array();
            Datacenter.get("fixed_trajData").depPoints.forEach(function(d, i) {
                if (d.aircraft != '' && d.aircraft.model != '')
                    arr.push(d)
            })
            // console.log(arr)
            var FlightType = d3.nest()
                .key(function(d) {
                    return d.aircraft.model['code'];
                })
                .entries(arr);
            // Datacenter.get("fixed_trajData").depPoints.forEach(function(d, i) {
            //     var
            //     timeTrajData.push(d.new_pos_add)
            // })
            // console.log("FlightType", FlightType)
            console.log('fixed_trajData', Datacenter.get("fixed_trajData").depPoints)
            Datacenter.set("depTrajData", Datacenter.get("fixed_trajData").depPoints)
            Datacenter.set("arrTrajData", Datacenter.get("fixed_trajData").arrPoints)

            // var data = Datacenter.get("fixed_trajData").totalPoint

            Datacenter.get("depTrajData").forEach(function(d, i) {
                var len = d.new_pos_add.length
                var data = d.new_pos_add
                // d.new_pos_add.forEach(function(d, i) {
                // if (d.trajID == 'c0bc87c')
                    // console.log(data)



                for (var i = 2; i < len; i++) {

                    // if ((data[i].lat == data[i - 2].lat && data[i].lon == data[i - 2].lon) || data[i].lat == data[i - 1].lat && data[i].lon == data[i - 1].lon) {
                    //     // console.log(data)
                    //     data.splice(i, 1)
                    //     i -= 1
                    //     len -= 1
                    // }

                    if (data[i].lat == data[i - 2].lat && data[i].lon == data[i - 2].lon) {
                        // console.log(data)
                        data.splice(i - 1, 2)
                        i -= 2
                        len -= 2
                    }
                }


                // if (d.trajID == 'c0bc87c')
                //     console.log(data)

                // })
            })

            Datacenter.get("arrTrajData").forEach(function(d, i) {
                var len = d.new_pos_add.length
                var data = d.new_pos_add


                // d.new_pos_add.forEach(function(d, i) {

                for (var i = 2; i < len; i++) {

                    if ((data[i].lat == data[i - 2].lat && data[i].lon == data[i - 2].lon) || data[i].lat == data[i - 1].lat && data[i].lon == data[i - 1].lon) {
                        // console.log(data)
                        data.splice(i, 1)
                        i -= 1
                        len -= 1
                    }
                }


                // d.new_pos_add.forEac

                // })
            })

            // var pos, newPos

            // Datacenter.get("fixed_trajData").depPoints.forEach(function(d, i) {
            //     if (d.callsign == 'CHH7147') {
            //     // if (d.trajID == 'c0bc87c') {
            //         pos = d.pos;
            //         newPos = d.new_pos_add;
            //     }
            // })

            // console.log('pos', pos)
            // console.log('newPos', newPos)

            // pos.forEach(function(d, i) {
            //     L.circle([d.loc[1], d.loc[0]], 2 * i * 0.1, {
            //         color: 'red',
            //         fillColor: '#f03',
            //         fillOpacity: 1,
            //         class: 'redPoint'
            //     }).addTo(Datacenter.mapModel.get('map')).bindPopup("id: " + i);
            // })

            // newPos.forEach(function(d, i) {
            //     L.circle([d.lat, d.lon], 3, {
            //         color: 'yellow',
            //         fillColor: 'yellow',
            //         fillOpacity: 1,
            //         class: 'yellowPoint'
            //     }).addTo(Datacenter.mapModel.get('map'))
            // })

            self.processData();

            // }

            self.listenTo(self.model, 'change:play', function(model, play) {

                // console.log(new Date(Config.get('curTime')))

            });

            // self.listenTo(Datacenter, 'change:fixed_trajData', function(model, fixed_trajData) {

            //     // console.warn('listenTo change');
            //     var arr = new Array();
            //     Datacenter.get("fixed_trajData").depPoints.forEach(function(d, i) {
            //         if (d.aircraft != '' && d.aircraft.model != '')
            //             arr.push(d)
            //     })
            //     // console.log(arr)
            //     var FlightType = d3.nest()
            //         .key(function(d) {
            //             return d.aircraft.model['code'];
            //         })
            //         .entries(arr);
            //     // Datacenter.get("fixed_trajData").depPoints.forEach(function(d, i) {
            //     //     var
            //     //     timeTrajData.push(d.new_pos_add)
            //     // })
            //     // console.log("FlightType", FlightType)
            //     console.log('fixed_trajData', Datacenter.get("fixed_trajData"))
            //     Datacenter.set("depTrajData", Datacenter.get("fixed_trajData").depPoints)
            //     Datacenter.set("arrTrajData", Datacenter.get("fixed_trajData").arrPoints)

            //     self.processData();


            // // self.renderTimeline()
            // // self.initSlidingPath()
            // });


            self.listenTo(Config, 'change:curTime', function(model, curTime) {
                // console.log(curTime);
                self.updateSlidingPath(curTime);
                self.updateSlidingWindow(curTime);
                $("#curTimeText").text(new Date(curTime))



                var timeFormatWithDate = d3.time.format("%Y-%m-%d %H:%M:%S");
                $("#curTimeText").text(timeFormatWithDate(new Date(curTime)))
                // // var timeFormatWithDate = d3.time.format("%Y-%m-%d %H:%M:%S");
                // $("#playTime").text("Time: " + timeFormatWithDate(new Date(curTime)) + " " + self.WeekFormat(new Date(curTime)));

            });

            self.listenTo(Config, 'change:slidingwindowsize', function(model, slidingwindowsize) {
                // console.log("slidingwindowsize", slidingwindowsize);
                // self.updateSlidingPath(curTime);

            });

        },
        //timeline data group 10 min
        processData: function() {
            var self = this;

            var data = Datacenter.get("fixed_trajData").totalPoint

            // var maxT = new Date(d3.max(data, function(d) {
            //     return d3.max(d.new_pos_add, function(d) {
            //         return d.timestamp
            //     })
            // }))
            //
            // // console.log("max", maxT)
            // // console.log(new Date(maxT).getMinutes())
            //
            // var minT = new Date(d3.min(data, function(d) {
            //     return d3.min(d.new_pos_add, function(d) {
            //         return d.timestamp
            //     })
            // }))

            // var maxT =

            // console.log("min", minT)
            // console.log(new Date(minT).getMinutes())
            // maxT.setMinutes(Math.ceil(new Date(maxT).getMinutes() / 10) * 10)
            // maxT.setSeconds(0)
            // minT.setMinutes(Math.floor(new Date(minT).getMinutes() / 10) * 10)
            // minT.setSeconds(0)

            var parseDate = d3.time.format("%Y%m%d").parse;

            var  minTime = parseDate(Config.get('StartTotalFile')).getTime(),
                 maxTime = parseDate(Config.get('EndTotalFile')).getTime();

            // console.log(maxTime)
            // console.log(minTime)
            Config.set("curTime", minTime)
            Config.set("slideWindowR", minTime)
            Config.set("slideWindowL", minTime - Config.get('slidingwindowsize'))
            Config.set("bottomTime", minTime)
            Config.set("topTime", maxTime)

            self.maxTime = maxTime, self.minTime = minTime

            var boxNum = Math.ceil((maxTime - minTime) / 600000);
            // console.log("boxNum", boxNum)

            // var boxArray = new Array()
            var boxArray = [],
                depBoxArray = []
            for (var n = 0; n < boxNum; n++) {
                boxArray[n] = 0
                depBoxArray[n] = 0
            }

            data.forEach(function(d, i) {

                if (d.new_pos_add.length > 0) {

                    var left = Math.floor((d.new_pos_add[0].timestamp - minTime) / 600000)
                    if(d.new_pos_add[d.new_pos_add.length - 1].timestamp<=maxTime){
                        var right = Math.floor((d.new_pos_add[d.new_pos_add.length - 1].timestamp - minTime) / 600000)
                        for (; left <= right; left++)
                            boxArray[left]++;
                    }else{
                        for (; left < boxNum; left++)
                            boxArray[left]++;
                    }

                }

            })

            Datacenter.get("depTrajData").forEach(function(d, i) {

                if (d.new_pos_add.length > 0) {

                    var left = Math.floor((d.new_pos_add[0].timestamp - minTime) / 600000)
                    if(d.new_pos_add[d.new_pos_add.length - 1].timestamp<=maxTime){
                        var right = Math.floor((d.new_pos_add[d.new_pos_add.length - 1].timestamp - minTime) / 600000)
                        for (; left <= right; left++)
                            depBoxArray[left]++;
                    }else{
                        for (; left < boxNum; left++)
                            depBoxArray[left]++;
                    }
                }

            })

            // console.log("boxArray", boxArray)
            // console.log("depBoxArray", depBoxArray)
            //600 === 10 min
            self.boxArray = boxArray;
            self.depBoxArray = depBoxArray;

        },
        onShow: function() {
            var self = this;

            $("#timePlay").click(function() {
                // console.log("mapline play")
                if (!self.model.get("play")) {

                    if (typeof(Config.get("curTime")) != "undefined")
                        if (Config.get("curTime") >= Config.get("topTime")) {
                            Config.set("curTime", Config.get("bottomTime"))
                            self.model.set("play", true);
                        } else {
                            self.model.set("play", true);
                        }

                    self.model.set("play", true);
                } else {
                    self.model.set("play", false);
                }

            })

            $("#playSpeedDropdown ul li").click(function(evt) {
                console.log(evt)
                var speed = evt.target.getAttribute("value");
                $("#playSpeedDropdown button").html('x ' + speed + ' <span class=\"caret\"></span>');
                self.model.set("playspeed", +speed);
            })

            $("#winSizeDropdown ul li").click(function(evt) {
                var min = evt.target.getAttribute("value");
                $("#winSizeDropdown button").html(min + ' min' + ' <span class=\"caret\"></span>');
                // self.model.set("playspeed", +speed);
                var curTime = Config.get("curTime")
                Config.set("slidingwindowsize", min * 60 * 1000)
                Config.set("slideWindowR", curTime + 1)
                Config.set("curTime", curTime + 1)

                // Config.set("slideWindowL", curTime - min * 60 * 1000)
                // Config.set("curTime", l + min * 60 * 1000)
            })



            self.renderTimeline()
            self.initSlidingPath()
        },
        renderTimeline: function() {
            var self = this;
            self.height = $("#timelineLeft").outerHeight()
            self.width = $("#timelineLeft").outerWidth()

            var emPixel = Config.get("emPixel")

            self.margin = { top: 1 * emPixel, right: 1 * emPixel, bottom: 1.5 * emPixel, left: 2.5 * emPixel },
                self.width = self.width - self.margin.left - self.margin.right,
                self.height = self.height - self.margin.top - self.margin.bottom;

            // Parse the date / time
            var parseDate = d3.time.format("%d-%b-%y").parse;
            // Set the ranges
            self.xScale = d3.time.scale().range([0, self.width]);
            self.yScale = d3.scale.linear().range([self.height, 0]);
            // Define the axes

            var timeFormatYear = d3.time.format("%Y");
            var timeFormatMonth = d3.time.format("%m/%d");
            var timeFormatDay = d3.time.format("%d %H:%M");
            var timeFormatHour = d3.time.format("%H:%M");



            self.xAxis = d3.svg.axis().scale(self.xScale)
                .orient("bottom")
                .tickFormat(function(d, i) {
                    var ticks = self.xAxis.scale().ticks();
                    //console.log('ticks', ticks)

                    if (i == 0 || i == ticks.length - 1) {
                        //i==1||i==ticks.length-2
                        return ""
                    } else {
                        if (d.getFullYear() - ticks[i - 1].getFullYear() != 0) {
                            return timeFormatYear(d);
                        } else if (d.getMonth() - ticks[i - 1].getMonth() != 0) {
                            return timeFormatMonth(d);
                        } else if (d.getDay() - ticks[i - 1].getDay() != 0) {
                            return timeFormatMonth(d);
                        } else {
                            return timeFormatHour(d);
                        }
                    }
                    // if (i > 0 && ticks[i - 1].getDay() === d.getDay()) {
                    //   return timeFormatWithoutDate(d);
                    // } else {
                    //   return timeFormatWithDate(d);
                    // }
                });

            self.yAxis = d3.svg.axis().scale(self.yScale)
                .orient("left").ticks(3);

            self.svg = d3.select("#timelineLeft")
                .append("svg")
                .attr("class", "timelineTop")
                .attr("width", self.width + self.margin.left + self.margin.right)
                .attr("height", self.height + self.margin.top + self.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

            self.slideWindowL = self.slideWindowR = 0;

            self.updateTimeline();

        },
        updateTimeline: function() {
            var self = this;

            // console.log('boxArray', self.boxArray)

            self.xScale.domain([self.minTime, self.maxTime]);
            self.yScale.domain([0, d3.max(self.boxArray, function(d, i) { return d; })]);
            // console.log("self.yScale.domain", d3.max(self.boxArray, function(d, i) { return d; }))

            self.intTimeScale = d3.scale.linear().domain([0, this.model.get('timelength')])
                .range([0, self.width])

            var timeFormatWithDate = d3.time.format("%Y/%m/%d %H:%M");
            var rightTimeFormatWithDate = d3.time.format("%m/%d %H:%M");

            // Add the X Axis

            var nowAxis = self.svg.append("g")
                .attr("class", "curveAxis")
                .attr("transform", "translate(0," + self.height + ")")
                .call(self.xAxis)

            nowAxis.append("text")
                .attr("x", self.width)
                .attr("dy", "1.5em")
                .style("text-anchor", "end")
                .text(rightTimeFormatWithDate(new Date(self.maxTime)));

            nowAxis.append("text")
                .attr("x", 0)
                .attr("dy", "1.5em")
                .style("text-anchor", "start")
                .text(timeFormatWithDate(new Date(self.minTime)));

            // Add the Y Axis
            self.svg.append("g")
                .attr("class", "curveAxis")
                .call(self.yAxis)
                .append("text")
                .text("Num")

            var depRects = self.svg.selectAll(".MyRect")
                .data(self.depBoxArray)
                .enter()
                .append("rect")
                .attr("class", "MyRect")
                // .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
                .attr("x", function(d, i) {
                    return self.xScale(i * 600000 + self.minTime);
                })
                .attr("y", function(d) {
                    // console.log(d)
                    // console.log(self.yScale(d))
                    return self.yScale(d);
                })
                .attr("width", self.width / self.boxArray.length-.2)
                .attr("height", function(d) {
                    return self.height - self.yScale(d);
                })
                .attr("fill", "#29aae3")
                .attr("stroke", "grey")
                .attr("stroke-width", ".1")

            // var arrRects = self.svg.selectAll(".MyRect")
            //     .data(self.boxArray)
            //     .enter()
            //     .append("rect")
            //     .attr("class", "MyRect")
            //     // .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
            //     .attr("x", function(d, i) {
            //         return self.xScale(i * 600000 + self.minTime);
            //     })
            //     .attr("y", function(d) {
            //         return self.yScale(d);
            //     })
            //     .attr("width", self.width / self.boxArray.length)
            //     .attr("height", function(d) {
            //         return self.height - self.yScale(d);
            //     })
            //     .attr("fill", "#D14745")
            //     .attr("stroke", "grey")
            //     .attr("stroke-width", ".1")

            self.boxArray.forEach(function(d, i) {
                self.svg.append("rect")
                    .attr("class", "MyRect")
                    // .attr("transform", "translate(" + padding.left + "," + padding.top + ")")
                    .attr("x", self.xScale(i * 600000 + self.minTime))
                    .attr("y", self.yScale(d))
                    .attr("width", self.width / self.boxArray.length-.2)
                    .attr("height", self.yScale(self.depBoxArray[i]) - self.yScale(d))
                    .attr("fill", "#D14745")
                    .attr("stroke", "grey")
                    .attr("stroke-width", ".1")

            })




            self.brush = d3.svg.brush()
                .x(self.xScale)
                .on("brush", function() {
                    self.model.set("play", false);
                    var ext = self.brush.extent()
                    var brushStart = Date.parse(ext[0]);
                    var brushEnd = Date.parse(ext[1]);
                    self.slideWindowL = brushStart = parseInt((brushStart / 60000)) * 60000
                    self.slideWindowR = brushEnd = parseInt((brushEnd / 60000)) * 60000

                    Config.set("slideWindowR", self.slideWindowR)
                    Config.set("slideWindowL", self.slideWindowL)


                    var winSize = brushEnd - brushStart
                    // Config.set("slidingwindowsize", winSize)

                    if (brushStart != brushEnd) {
                        Config.set("slidingwindowsize", winSize)
                        // console.log("slidingwindowsize",winSize)
                    }

                    if (Config.get("curTime") < brushStart)
                        Config.set("curTime", brushStart);
                    if (Config.get("curTime") > brushEnd)
                        Config.set("curTime", brushEnd);
                    // Config.set('brushFinish', false)
                    // console.log(self.brush.empty())

                    $("#playIcon").addClass("glyphicon-pause");
                    $("#playIcon").removeClass("glyphicon-play");
                })
                .on("brushend", function() {
                    // console.log('brushend')
                    self.model.set("play", false);
                    var ext = self.brush.extent()
                    var brushStart = Date.parse(ext[0]);
                    var brushEnd = Date.parse(ext[1]);
                    self.slideWindowL = brushStart = parseInt((brushStart / 60000)) * 60000
                    self.slideWindowR = brushEnd = parseInt((brushEnd / 60000)) * 60000

                    // console.log(self.slideWindowL)
                    // console.log(self.slideWindowR)
                    // Config.set("slideWindowL", self.slideWindowL)
                    // Config.set("slideWindowR", self.slideWindowR)
                    if (brushStart == brushEnd) {
                        var end = parseInt((brushEnd / 600000)) * 600000 + 10 * 60 * 1000
                        var winSize = 5 * 60 * 1000
                        // $("#slidingWindowSizeDropdown button").html(10 + 'Min <span class=\"caret\"></span>');
                        Config.set("slidingwindowsize", winSize)
                        Config.set("slideWindowL", brushEnd - winSize)
                        // d3.select("#timelineLeft .brush").call((self.brush.empty()) ? self.brush.clear() : self.brush.extent([new Date(end - winSize), new Date(end)]));

                        var left = self.xScale(new Date(Config.get('curTime') - winSize))

                        d3.select("#timelineLeft .extent")
                            .attr("width", function() {
                                return self.xScale(Config.get('curTime')) - left;
                            })
                            .attr("x", function(d, i) {
                                return left
                            })
                    }

                    if (Config.get("curTime") < brushStart)
                        Config.set("curTime", brushStart);
                    if (Config.get("curTime") > brushEnd)
                        Config.set("curTime", brushEnd);
                    // brushEnd = Date.parse(ext[1]);
                    // brushEnd = parseInt((brushEnd / 60000)) * 60000
                    // Config.set("curTime", brushEnd)
                    // Config.set('brushFinish', true)
                    $("#playIcon").removeClass("glyphicon-pause");
                    $("#playIcon").addClass("glyphicon-play");
                });



            // console.log(Config.get('curTime'))
            // console.log(Config.get('slidingwindowsize'))

            self.brush.extent([new Date(Config.get('curTime') - Config.get('slidingwindowsize')), new Date(Config.get('curTime'))]);


            //console.warn('brush: ',self.brush.extent())

            self.rect = self.svg.append("g")
                .attr("class", "x brush")
                .call(self.brush)

            // var lineData = [{ "x": 0, "y": 0 }, { "x": 1, "y": 0 }, { "x": 1, "y": self.height }, { "x": 0, "y": self.height }, { "x": 0, "y": 0 }, { "x": 0, "y": 0 }, { "x": 2, "y": 0 }, { "x": 2, "y": self.height }, { "x": 0, "y": self.height }, { "x": 0, "y": 0 }];

            // var lineFunction = d3.svg.line()
            //     .x(function(d, i) { return i < 1 ? -d.x : d.x; })
            //     .y(function(d) { return d.y; })
            //     .interpolate("linear");

            // self.rect.selectAll("#timelineLeft .resize").append("path")
            //     .attr("transform", "translate(" + -1 + "," + 0 + ")")
            //     .attr("d", function(d, i) {
            //         return lineFunction(lineData)
            //     })

            // self.svg.selectAll("#timelineSvg .resize").append("path")
            //     .attr("transform", "translate("+-1+"," + 0 + ")")
            //     .attr("d", function(d,i){
            //         return lineFunction(triangleData)
            //     })

            var timeFormatWithDate = d3.time.format("%H:%M");
            self.rect.selectAll("rect")
                .attr("y", 0)
                .attr("height", self.height)

            // d3.select("#timelineSvg .extent")
            //     .on('mouseover', function(d) {
            //       var enTime = self.model.get('curtime')
            //       var stTime = self.model.get('curtime') - self.model.get('slidingwindowsize')
            //       //var tipWindow = d3.time.format("%Y/%m/%d %H:%M");
            //       console.log(stTime)
            //       console.log(enTime)
            //       self.tip.show(timeFormatWithDate(new Date(stTime))+"-"+timeFormatWithDate(new Date(enTime)))
            //     })
            //     .on('mouseout', self.tip.hide)

            //.attr("id","extentTop")

            self.svg.select(".x .brush")
                .call(self.brush)

        },
        initSlidingPath: function() {

            var self = this;
            var model = self.model
            var curtime = Config.get('curTime')
            // console.log(curtime)
            var xLoc = self.xScale(curtime)
            d3.selectAll(".slidingPath").remove();

            var emPixel = Config.get('emPixel')
            // console.log(emPixel)

            var triangleData = [{ "x": xLoc, "y": 0 }, { "x": xLoc + 0.4 * emPixel, "y": -0.8 * emPixel }, { "x": xLoc - 0.4 * emPixel, "y": -0.8 * emPixel }, { "x": xLoc, "y": 0 }, { "x": xLoc, "y": self.height }, { "x": xLoc, "y": 0 }];

            // console.log("triangleData", triangleData)
            var lineFunction = d3.svg.line()
                .x(function(d, i) { return d.x })
                .y(function(d) { return d.y; })
                .interpolate("linear");

            var lineFunction = d3.svg.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .interpolate('linear');

            self.slidingPath = self.svg.append("path")
                .attr('class', 'slidingPath')
                .attr("d", lineFunction(triangleData))

            var timeFormatWithTime = d3.time.format("%H:%M:%S");

            self.slidingText = self.svg.append("text")
                .attr('class', 'slidingText')
                .attr('x', xLoc)
                .attr('y', -emPixel)
                .style("text-anchor", "middle")
                .style('fill', 'white')
                .text(function(d) { return timeFormatWithTime(new Date(curtime)); });

            var drag = d3.behavior.drag()
                .on("drag", dragmove)
                .on("dragstart", function() {
                    $("#playIcon").addClass("glyphicon-pause");
                    $("#playIcon").removeClass("glyphicon-play");
                })
                .on("dragend", function() {
                    $("#playIcon").removeClass("glyphicon-pause");
                    $("#playIcon").addClass("glyphicon-play");
                })


            var timeMount = Config.get("topTime") - Config.get("bottomTime");

            // console.log(Config.get("topTime"));
            // console.log(timeMount)

            function dragmove(d) {
                self.model.set("play", false);
                var x = d3.event.x;
                if (x < 0) x = 0;
                if (x >= self.width) x = self.width;
                // d3.select(this)
                //     .attr("transform", "translate(" + x + "," + 0 + ")");

                var curTime = x / self.width * timeMount + Config.get("bottomTime");
                // console.log(curTime)


                // if (curTime >= Config.get("slideWindowR")) {

                //     Config.set("slideWindowL", curTime - Config.get("slidingwindowsize"))
                //     Config.set("slideWindowR", curTime)
                // } else if (curTime <= Config.get("slideWindowL")) {

                //     Config.set("slideWindowL", curTime)
                //     Config.set("slideWindowR", curTime + Config.get("slidingwindowsize"))
                // }

                Config.set("curTime", curTime);
            }

            self.slidingPath.call(drag);

            // var timeFormatWithDate = d3.time.format("%Y/%m/%d %H:%M");

            // self.slidingPath.on('mouseover', function(d) {
            //       var enTime = self.model.get('curtime')
            //       self.tip.show(timeFormatWithDate(new Date(enTime)))
            //     })
            //.on('mouseout', self.tip.hide)
        },

        updateSlidingPath: function(curT) {
            var self = this;
            var model = self.model
            var xLoc = self.xScale(curT)

            // var str = d3.select('.slidingPath').attr('d')
            // var origin = parseFloat(str.split(',')[0].split('M')[1])

            d3.select('.slidingPath')
                .attr("transform", "translate(" + xLoc + "," + 0 + ")");

        },

        updateSlidingWindow: function(curT) {

            var self = this;
            var model = self.model

            var curLoc = self.xScale(curT)

            if (curT >= Config.get("slideWindowR")) {

                Config.set("slideWindowL", curT - Config.get("slidingwindowsize"))
                Config.set("slideWindowR", curT)

                var left = self.xScale(new Date(curT - Config.get("slidingwindowsize")))

                var barWidth = curLoc - left

                d3.select("#timelineLeft .extent")
                    .transition()
                    .attr("width", function() {
                        return barWidth;
                    })
                    .attr("x", function(d, i) {
                        return left
                    })

                // d3.select("#timelineLeft .resize.e")
                //     .attr("transform", "translate(" + curLoc + "," + 0 + ")");

                // d3.select("#timelineLeft .resize.w")
                //     .attr("transform", "translate(" + left + "," + 0 + ")");

            } else if (curT < Config.get("slideWindowL")) {


                Config.set("slideWindowR", curT + Config.get("slidingwindowsize"))
                Config.set("slideWindowL", curT)
                var right = self.xScale(new Date(curT + Config.get("slidingwindowsize")))

                var barWidth = right - curLoc

                d3.select("#timelineLeft .extent")
                    .attr("width", function() {
                        return barWidth;
                    })
                    .attr("x", function(d, i) {
                        return curLoc
                    })

                // d3.select("#timelineLeft .resize.e")
                //     .attr("transform", "translate(" + right + "," + 0 + ")");

                // d3.select("#timelineLeft .resize.w")
                //     .attr("transform", "translate(" + curLoc + "," + 0 + ")");
            }



            self.brush.extent([new Date(Config.get("slideWindowL")), new Date(Config.get("slideWindowR"))]);

            // Config.set("slidingwindowsize",)
            // .attr("x", function(d,i) {
            //       return  self.xScale(new Date(self.model.get("curtime")-self.model.get("slidingwindowsize")));
            // })
            /*    .duration(10);*/
        },

        onClickTimePlay: function() {
            // var self = this;
            // self.model.set("play", !self.model.get("play"));
        },
        onClickRepeat: function() {
            // var self = this;
            // self.model.set("autoPlay", !self.model.get("autoPlay"));
        }
    });
});