define([
    'require',
    "d3",
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    'variables',
    'views/svg-base.addon',
    'd3tip',
], function(require, d3,Mn, _, $, Backbone,Datacenter,Config, Variables,SVGBase,d3tip) {
    'use strict';
    return Mn.ItemView.extend(_.extend({
        tagName: 'div',
        template: false,
        attributes:{
            'style' : 'width: 100%; height:100%;',
            'id': "timeBar"
        },
        events:{
        },
        initialize: function(options)
        {
            var self = this;
            self.isDragging = false; 
            self.identifier = 'daysta'
        },
        onShow: function()
        {
            var self = this;
            var curtime = Config.get('curtime')
            // self.data = Datacenter.get('daySta')

            var timelineTopRange = Config.get('timelineTopRange')
            var sTime = timelineTopRange[0]
            var eTime = timelineTopRange[1]

            self.tip = d3.tip()
                    .attr('class', 'Gantta-d3-tip')
                    .attr('id', 'curtimePathTip')
                    .offset([ -10, 0 ])
                    .html(function (d) {
                      return d
                    })

            var data = self.dataFilter(sTime, eTime)

            self.initTimeline('timelineSvg');
            self.updateTimeline(data);
            self.initSlidingWindow();
            self.initSlidingPath();
            

            self.listenTo(Config, 'change:airportSelected', function(model,airportSelected){
                //切换机场会触发更新时间轴
                var timelineTopRange = Config.get('timelineTopRange')
                var sTime = timelineTopRange[0]
                var eTime = timelineTopRange[1]

                console.log('sTime1',new Date(sTime))  
                console.log('eTime1',new Date(eTime))  
                var data = self.dataFilter(sTime, eTime)

                self.updateTimeline(data);
                self.initSlidingWindow();
                self.initSlidingPath();
            });


            self.listenTo(Config, 'change:timelineTopRange', function(model,timelineTopRange){
                self.model.set("play",false);
                sTime = timelineTopRange[0]
                eTime = timelineTopRange[1]
                data = self.dataFilter(sTime, eTime)

                console.log('sTime1',new Date(sTime))  
                console.log('eTime1',new Date(eTime))  

                if(sTime<=eTime){
                    self.updateTimeline(data);
                    Config.set("curtimePath",sTime)    
                    Config.set('curtime', sTime)
                    self.initSlidingWindow();
                    self.initSlidingPath();
                }
                self.model.set('timelength', eTime - sTime)
            });

            self.listenTo(Config, 'change:curtime', function(model, curtime){
                Config.set("curtimePath",curtime)
                self.updateSlidingWindow();
                self.updateSlidingPath();
                self.updateSlidingPathText();
            });

            self.listenTo(Config, 'change:curtimePath', function(model, curtimePath){
                //self.model.set("curtimePath",curtimePath)
                self.updateSlidingPath();
                self.updateSlidingPathText();
            });

            self.listenTo(Config, 'change:slidingwindowsize', function(model, slidingwindowsize){
                self.model.set('slidingwindowsize',slidingwindowsize)
            });

            self.listenTo(self.model, 'change:slidingwindowsize', function(model, slidingwindowsize){
                Config.set("slidingwindowsize",slidingwindowsize)
                self.updateSlidingWindow();
                self.updateSlidingPath();
                $("#slidingWindowSizeDropdown button").html(slidingwindowsize/(1000*60) + 'Min <span class=\"caret\"></span>');
            });
        },
        dataFilter: function(sTime, eTime){
            var self = this;
            var data = Datacenter.get('daySta')
            //var data = self.allData
            var filterData=[]
            var flag = false

            for(var i = 0; i<data.length; i++){
                if(data[i].time>=sTime&&data[i].time<eTime){
                    filterData.push(data[i])
                }
            }
            return filterData
        },
        updateData: function(){
            var self = this
            self.updateTimeline(data);
            self.initSlidingWindow();
            self.initSlidingPath();
        },
        initTimeline: function(content){
            var self = this;
            self.height=$("#"+content).outerHeight()
            self.width=$("#"+content).outerWidth()
            
            var emPixel = d3.select("#maindiv").style('font-size')
            self.emPixel = emPixel
            emPixel = parseInt(emPixel.split('p')[0])
           
            self.margin = {top: 2*emPixel, right: 2*emPixel, bottom: 1.5*emPixel, left: 4*emPixel},
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

                    if(i==0||i==ticks.length-1){
                        //i==1||i==ticks.length-2
                        return ""
                    }
                    else{
                        if (d.getFullYear()-ticks[i - 1].getFullYear()!=0) {
                            return timeFormatYear(d);
                        }
                        else if(d.getMonth()-ticks[i - 1].getMonth()!=0){
                            return timeFormatMonth(d);
                        }
                        else if(d.getDay()-ticks[i - 1].getDay()!=0){
                            return timeFormatMonth(d);
                        }
                        else{
                            return timeFormatHour(d);
                        }
                    }
                    // if (i > 0 && ticks[i - 1].getDay() === d.getDay()) {
                    //   return timeFormatWithoutDate(d);
                    // } else {
                    //   return timeFormatWithDate(d);
                    // }
                })
                // .ticks(2)
                //.ticks(24)
                // .tickFormat(function(d, i) {
                //     console.log('haha',d)
                //     var ticks = self.xAxis.scale().ticks();
                //     if (i > 0 && ticks[i - 1].getDay() === d.getDay()) {
                //       return timeFormatWithoutDate(d);
                //     } else {
                //       return timeFormatWithDate(d);
                //     }
                // })

            self.yAxis = d3.svg.axis().scale(self.yScale)
                .orient("left").ticks(3);

            // var legendSvg = d3.select("#timeline")
            //     .append("svg")
            //     .attr("class","legend")
            //     .attr("width", self.width + self.margin.left + self.margin.right)
            //     .attr("height", self.height + self.margin.top + self.margin.bottom)
            //     .append("g")
            //     .attr("transform", "translate(" + self.margin.left + self.width+ "," + self.margin.top + ")");
           

            self.svg = d3.select("#"+content)
                .append("svg")
                .attr("class","timelineTop")
                .attr("width", self.width + self.margin.left+self.margin.right)
                .attr("height", self.height + self.margin.top + self.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");  
        },

        updateTimeline: function(data){
            var self = this;
            d3.selectAll('#timelineSvg rect').remove()
            d3.selectAll('.bar').remove()
            d3.selectAll('.arrbar').remove()
            d3.selectAll('.depbar').remove()
            d3.selectAll('.dayBar').remove()
            d3.selectAll('.curveAxis').remove()
            d3.selectAll('#timelineSvg .x.brush').remove()
            // Scale the range of the data

            var timeMin = d3.min(data, function(d) { return d.time; })
            var timeMax = d3.max(data, function(d) { return d.time; }) +11*60*1000

            //console.log('max',new Date(timeMax))

            self.xScale.domain([timeMin, timeMax]);
            self.yScale.domain([0, d3.max(data, function(d) { return d.num; })]);

            self.intTimeScale = d3.scale.linear().domain([0,this.model.get('timelength')])
                                  .range([0,self.width])

            var timeFormatWithDate = d3.time.format("%Y/%m/%d %H:%M");
            var sTime = Config.get('timelineTopRange')[0]
            var eTime = Config.get('timelineTopRange')[1]
            // Add the X Axis

            var nowAxis = self.svg.append("g")
                .attr("class", "curveAxis")
                .attr("transform", "translate(0," + self.height + ")")
                .call(self.xAxis)

            nowAxis.append("text")
                .attr("x", self.width)
                .attr("dy", "1.5em")
                .style("text-anchor", "end")
                .text(timeFormatWithDate(new Date(eTime)));

            nowAxis.append("text")
                .attr("x", 0)
                .attr("dy", "1.5em")
                .style("text-anchor", "start")
                .text(timeFormatWithDate(new Date(sTime)));

            // Add the Y Axis
            self.svg.append("g")
                .attr("class", "curveAxis")
                .call(self.yAxis)
                .append("text")

            var format = d3.time.format("%Y/%m/%d:%H:%M");
            self.barWidth=self.width/data.length;

            // var tip = d3.tip()
            //   .attr('class', 'd3-tip')
            //   .offset([-10, 0])
            //   .html(function(d) {
            //      return "<span style='color:black'>#arr: " + d.arrNum + ", #dep: " +d.depNum+ "</span>";
            // })
            self.svg.call(self.tip);


            var dataLabel =['arr','dep','trajArr','trajDep','cdmArr','cdmDep']
          
            //console.log('dataLabel', dataLabel)
            // self.svg.selectAll(".legendBar")
            //     .data(dataLabel)
            //     .enter().append("rect")
            //     .attr("class", "legendBar")
            //     .attr("x", function(d) { 
            //         console.log('dataLabel',d)
            //         return  10
            //     })
            //     .attr("y", function(d,i) { 
            //         return i*10
            //     })
            //     .attr("width", 5)
            //     .attr("height", 5)
            //     .style("fill",'red')
                // .append("text")
                // .attr("x", self.width+10)
                // .attr("dy", "10px")
                // .style("text-anchor", "start")
                // .text("time");


            var arrBar = self.svg.selectAll(".arrbar")
                .data(data)
                .enter().append("rect")
                .attr("class", "arrbarbot")
                .attr("x", function(d) { return self.xScale(d.time); })
                .attr("y", function(d) { return self.yScale(d.arrNum); })
                .attr("width", self.barWidth*0.98)
                .attr("height", function(d) { return self.height - self.yScale(d.arrNum); })
                .style("fill",'rgb(209, 71, 69)')


            //d.arrNum+d.arrTrajNum+d.arrCDMNum+d.depNum+d.depTrajNum+d.depCDMNum

            var arrTrajBar = self.svg.selectAll(".arrbar")
                .data(data)
                .enter().append("rect")
                .attr("class", "arrbarbot")
                .attr("x", function(d) { return self.xScale(d.time); })
                .attr("y", function(d) { return self.yScale(d.arrNum+d.arrTrajNum); })
                .attr("width", self.barWidth*0.98)
                .attr("height", function(d) { return self.height - self.yScale(d.arrTrajNum); })
                .style("fill",'#fb6a4a')
                //.style('opacity',0.6)

            var arrCDMBar = self.svg.selectAll(".arrbar")
                .data(data)
                .enter().append("rect")
                .attr("class", "arrbarbot")
                .attr("x", function(d) { return self.xScale(d.time); })
                .attr("y", function(d) { return self.yScale(d.arrNum+d.arrTrajNum+d.arrCDMNum); })
                .attr("width", self.barWidth*0.98)
                .attr("height", function(d) { return self.height - self.yScale(d.arrCDMNum); })
                .style("fill",'#fcae91')
                //.style('opacity',0.3)



            var depBar = self.svg.selectAll(".depbar")
                .data(data)
                .enter().append("rect")
                .attr("class", "depbarbot")
                .attr("x", function(d) { return self.xScale(d.time); })
                .attr("y", function(d) { return self.yScale(d.arrNum+d.arrTrajNum+d.arrCDMNum+d.depNum); })
                .attr("width", self.barWidth*0.98)
                .attr("height", function(d) { return self.height - self.yScale(d.depNum); })
                .style("fill",'rgb(41, 170, 227)')
                .on('mouseover',function(d){
                    console.log(d.depNum)
                })


            var depTrajBar = self.svg.selectAll(".depbar")
                .data(data)
                .enter().append("rect")
                .attr("class", "depbarbot")
                .attr("x", function(d) { return self.xScale(d.time); })
                .attr("y", function(d) { return self.yScale(d.arrNum+d.arrTrajNum+d.arrCDMNum+d.depNum+d.depTrajNum); })
                .attr("width", self.barWidth*0.98)
                .attr("height", function(d) { return self.height - self.yScale(d.depTrajNum); })
                .style("fill",'#9ecae1')
                //.style('opacity',0.6)

            var depCDMBar = self.svg.selectAll(".depbar")
                .data(data)
                .enter().append("rect")
                .attr("class", "depbarbot")
                .attr("x", function(d) { return self.xScale(d.time); })
                .attr("y", function(d) { return self.yScale(d.num); })
                .attr("width", self.barWidth*0.98)
                .attr("height", function(d) { return self.height - self.yScale(d.depCDMNum); })
                .style("fill",'#c6dbef')

            // var arrBar = self.svg.selectAll(".arrbar")
            //     .data(data)
            //     .enter().append("rect")
            //     .attr("class", "arrbar")
            //     .attr("x", function(d) { return self.xScale(d.time); })
            //     .attr("y", function(d) { return self.yScale(d.arrNum); })
            //     .attr("width", self.barWidth*0.9)
            //     .attr("height", function(d) { return self.height - self.yScale(d.arrNum); })

            // var depBar = self.svg.selectAll(".depbar")
            //     .data(data)
            //     .enter().append("rect")
            //     .attr("class", "depbar")
            //     .attr("x", function(d) { return self.xScale(d.time); })
            //     .attr("y", function(d) { return self.yScale(d.num); })
            //     .attr("width", self.barWidth*0.9)
            //     .attr("height", function(d) { return self.height - self.yScale(d.depNum); })
    
                // .on("mouseover",function(d,i){
                //     d3.select(this).style("fill", "white").style("cursor","pointer")
                //     tip.show(d);
                // })
                // .on("mouseout",function(d,i){
                //     d3.selectAll(".bar").style("fill", "#636363")
                //     tip.hide();
                // })
            var Bar = self.svg.selectAll(".dayBar")
                .data(data)
                .enter().append("rect")
                .attr("class", "dayBar")
                .attr("x", function(d) { return self.xScale(d.time); })
                .attr("y", function(d) { return self.yScale(d.num); })
                .attr("width", self.barWidth*0.9)
                .attr("height", function(d) { return self.height - self.yScale(d.num); })
                // .on("mouseover",function(d,i){
                //     //if(!self.isDragging)
                //      //   tip.show(d);
                // })
                // .on("mouseout",function(d,i){
                //     tip.hide();
                // })
                // .append("svg:title")
                // .text(function(d){
                //     return d.num
                // })
                //click event
                self.brush = d3.svg.brush()
                          .x(self.xScale)
                          .on("brush", function(){
                            self.model.set("play",false);
                            var ext = self.brush.extent()
                            var brushStart=Date.parse(ext[0]);
                            var brushEnd=Date.parse(ext[1]);
                            brushStart = parseInt((brushStart/60000))*60000
                            brushEnd = parseInt((brushEnd/60000))*60000
                            var winSize = brushEnd - brushStart

                            if(brushStart != brushEnd){
                                self.model.set("slidingwindowsize", winSize)
                                Config.set("curtime", brushEnd);
                            }
                            Config.set('brushFinish',false)
                            // console.log(self.brush.empty())
                            // console.log(new Date(brushStart))
                            // console.log(new Date(brushEnd))

                            // if(self.brush.empty()){
                                

                            //     var end = parseInt((brushEnd/600000))*600000 + 10*60*1000
                            //     var winSize = 10*60*1000
                            //     self.model.set("slidingwindowsize", winSize)
                            //     self.model.set("curtime", end);
                            //     console.log(111111111)
                            //     console.log('top:empty')
                            //     console.log('empty:',new Date(end))
                            //     console.log('empty:',winSize)
                            // }
                            //else{
                                
                            //}
                            

                            // d3.selectAll(".d3-tip-top").remove()
                            // var tipLabelTop = d3.tip()
                            //   .attr('class', 'd3-tip-top')
                            //   .offset([-8, 0])
                            //   .html(function(d) {
                            //     return d;
                            // })

                            // self.svg.call(tipLabelTop)
                            // d3.selectAll("#timelineSvg .extent")
                            //   .on('mouseover', function(d){
                            //     d3.selectAll(".d3-tip-top").style("opacity","1")
                            //     tipLabelTop.show("AAAA")
                            //   })
                            //   .on('mouseout', function(d){
                            //     d3.selectAll(".d3-tip-top").style("opacity","0.6")
                            //   })



                          })
                          .on("brushend", function(){
                            var ext = self.brush.extent()
                            var brushStart=Date.parse(ext[0]);
                            var brushEnd=Date.parse(ext[1]);
                            brushStart = parseInt((brushStart/60000))*60000
                            brushEnd = parseInt((brushEnd/60000))*60000                    
                            
                            if(brushStart == brushEnd){
                                var end = parseInt((brushEnd/600000))*600000 + 10*60*1000
                                var winSize = 10*60*1000
                                $("#slidingWindowSizeDropdown button").html(10 + 'Min <span class=\"caret\"></span>');
                                self.model.set("slidingwindowsize", winSize)
                                d3.select("#timelineSvg .brush").call((self.brush.empty()) ? self.brush.clear() : self.brush.extent([new Date(end - winSize),new Date(end)]));
                            }                       
                            brushEnd=Date.parse(ext[1]);
                            brushEnd = parseInt((brushEnd/60000))*60000
                            Config.set("curtime",brushEnd)
                            Config.set('brushFinish',true)
                          });

                self.brush.extent([new Date(Config.get('curtime')-self.model.get('slidingwindowsize')), new Date(Config.get('curtime'))]);


                //console.warn('brush: ',self.brush.extent())

                self.rect = self.svg.append("g")
                      .attr("class", "x brush")
                      .call(self.brush)
            
                var lineData = [{ "x": 0,   "y": 0}, { "x": 1,  "y": 0},{ "x": 1,  "y": self.height}, { "x": 0,  "y": self.height},{ "x": 0,  "y": 0},{ "x": 0,   "y": 0}, { "x": 2,  "y": 0},{ "x": 2,  "y": self.height}, { "x": 0,  "y": self.height},{ "x": 0,  "y": 0}];
                var lineFunction = d3.svg.line()
                                         .x(function(d,i) { return i<1? -d.x : d.x; })
                                         .y(function(d) { return d.y; })
                                         .interpolate("linear");
                                 
                self.rect.selectAll("#timelineSvg .resize").append("path")
                    .attr("transform", "translate("+-1+"," + 0 + ")")
                    .attr("d", function(d,i){
                        return lineFunction(lineData)
                    })

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
        onBrush: function(){
            console.log("**********")
            console.log(self.brush)
        },
        updatePos:function(){

        },
        initSlidingPath: function(){
            var self = this;
            var model = self.model
            var curtime = Config.get('curtime')
            var xLoc = self.xScale(curtime)
            d3.selectAll(".slidingPath").remove();

            var emPixel = Config.get('emPixel')

            var triangleData = [{ "x": xLoc,"y": 0}, { "x": xLoc+0.4*emPixel,"y": -0.8*emPixel},{ "x": xLoc-0.4*emPixel,"y": -0.8*emPixel}, { "x": xLoc,"y": 0},{ "x": xLoc,"y": self.height},{ "x": xLoc,"y": 0}];
            var lineFunction = d3.svg.line()
                                     .x(function(d,i) { return d.x })
                                     .y(function(d) { return d.y; })
                                     .interpolate("linear");
                             
            var lineFunction = d3.svg.line()
              .x(function(d) { return d.x; })
              .y(function(d) { return d.y; })
              .interpolate('linear');

            self.slidingPath = self.svg.append("path")
                .attr('class','slidingPath')
                .attr("d", lineFunction(triangleData))

            var timeFormatWithTime = d3.time.format("%H:%M:%S");

            self.slidingText = self.svg.append("text")
                .attr('class','slidingText')
                .attr('x',xLoc)
                .attr('y',-emPixel)
                .style("text-anchor", "middle")
                .style('fill','white')
                .text(function(d) { return timeFormatWithTime(new Date(curtime)); });
            
            var dragBehavior = d3.behavior.drag()
                .on("dragstart",function() {
                    self.model.set("play",false);
                })
                .on("drag", function(d,i) {
                    var dx = d3.event.dx;
                    var dTime = parseInt(self.intTimeScale.invert(dx));

                    curtime += dTime;

                    var eTime = Config.get('curtime')
                    var sTime = eTime - model.get('slidingwindowsize')
                    if(curtime<sTime){
                        curtime = sTime
                    }
                    else if(curtime>eTime){
                        curtime = eTime
                    }
                    model.setcurtimePath(curtime);

                    var xMove = self.xScale(curtime)

                    //console.log('dTime',dTime)


                    // d3.select(this)
                    //   .attr("transform", "translate(" + xMove + "," + 0 + ")");
                });

            self.slidingPath.call(dragBehavior);

            var timeFormatWithDate = d3.time.format("%Y/%m/%d %H:%M");

            // self.slidingPath.on('mouseover', function(d) {
            //       var enTime = self.model.get('curtime')
            //       self.tip.show(timeFormatWithDate(new Date(enTime)))
            //     })
                    //.on('mouseout', self.tip.hide)
        },

        updateSlidingPathText:function(){
            var self = this
            var timeFormatWithTime = d3.time.format("%H:%M:%S");
            var curtimePath = Config.get("curtimePath")
            var xLoc = self.xScale(new Date(curtimePath))
            d3.selectAll('.slidingText')
              .text(function(d) { return timeFormatWithTime(new Date(curtimePath)); })
              .attr('x',xLoc)
              //.attr("transform", "translate(" + xLoc + "," + 0 + ")");
        },
        updateSlidingPath:function(){
            var self =this;
            var model = self.model
            var xLoc = self.xScale(new Date(Config.get("curtimePath")))      

            var str = d3.select('.slidingPath').attr('d')
            var origin = parseFloat(str.split(',')[0].split('M')[1]) 

            d3.select('.slidingPath')
                      .attr("transform", "translate(" + (xLoc-origin) + "," + 0 + ")");

            // var dragBehavior = d3.behavior.drag()
            //     .on("drag", function(d,i) {
            //         var dx = d3.event.dx;
            //         var dTime = parseInt(self.intTimeScale.invert(dx));

            //        // console.log(new Date(curtime))
            //         curtime += dTime;

            //         var eTime = model.get('curtime')
            //         var sTime = eTime - model.get('slidingwindowsize')
            //         if(curtime<sTime){
            //             curtime = sTime
            //         }
            //         else if(curtime>eTime){
            //             curtime = eTime
            //         }
            //         model.setcurtimePath(curtime);

            //         var xMove = self.xScale(dTime)

            //         // d3.select(this)
            //         //   .attr("transform", "translate(" + xMove + "," + 0 + ")");
            //     });

            // self.slidingPath.call(dragBehavior);

        },
        initSlidingWindow: function(){
            var self = this;
            var model = self.model
            var curtime = Config.get('curtime')
      
            // self.dragBehavior = d3.behavior.drag()
            //     .on("dragstart",function() {
            //         model.set("play",false);
            //         //self.isDragging = true;
            //     })
            //     .on("drag",function() {
            //         var dx = d3.event.dx;
            //         var dTime = parseInt(self.intTimeScale.invert(dx));
            //         var curtime = model.get("curtime");
            //         curtime += dTime;
            //         model.setcurtime(curtime);
            //     })
            //     .on("dragend",function() {
            //         //self.isDragging = false;
            //     });
            // d3.selectAll(".slidingWindow").remove();
            // self.slidingWindow = self.svg.append("g").attr("class",'slidingWindow');
            // self.slidingWindow.call(self.dragBehavior);
        },
        updateSlidingWindow:function(){
            var self =this;
            var model = self.model

            var right = self.xScale(new Date(Config.get("curtime")))
            var left = self.xScale(new Date(Config.get("curtime")-model.get("slidingwindowsize")))
            var barWidth = right - left

            d3.select("#timelineSvg .extent")
              .attr("width", function() {     
                  return barWidth; 
              })
              .attr("x", function(d,i) {
                  return left
              })
            d3.select("#timelineSvg .resize.e")
              .attr("transform", "translate(" + right + "," + 0 + ")");

            d3.select("#timelineSvg .resize.w")
              .attr("transform", "translate(" + left + "," + 0 + ")"); 

            self.brush.extent([new Date(Config.get("curtime")), new Date(Config.get("curtime")-model.get("slidingwindowsize"))]);
              // .attr("x", function(d,i) {
              //       return  self.xScale(new Date(self.model.get("curtime")-self.model.get("slidingwindowsize")));
              // })
          /*    .duration(10);*/
        },
        setData:function(v_data){
            var self = this;

            if(v_data.id !== self.identifier) return;
            self.updateData()
        },
    }, SVGBase));
});

// calData: function(arr,dep,minute){
//             var total = arr.concat(dep);
//             total.forEach(function(d) {
//                 d.sTime = parseInt(d.sTime)*1000;
//                 d.eTime = parseInt(d.eTime)*1000;
//             });
//             total.sort(function(x,y){return x['sTime']-y['sTime']})
//             var sTime = total[0].sTime;
//             var eTime = total[total.length-1].sTime;
//             sTime = Date.parse(new Date("2016-10-28 00:00:00"))
//             eTime = Date.parse(new Date("2016-10-29 00:05:00"))
//             var data = [];
//             var interval;
//             var sum
//             var arrNum
//             var depNum
//             var i=0
//             var j=0
//             for(;i<total.length;i++){
//                 if(total[i].sTime>=sTime){
//                     break
//                 }
//             }

//             //console.log(total)
//             for(var time= sTime; time<eTime;){
                
//                 interval=time+minute*60*1000;
              
//                 sum=0
//                 arrNum = 0
//                 depNum = 0
//                 for(;i<total.length;i++){
//                     if(total[i].arr!=0)
//                         continue
//                     if(total[i].sTime<=interval){
//                         arrNum+=1
//                     }
//                     else{
//                         break
//                     }
//                 }

//                 for(j=0;j<total.length;j++){
//                     if(total[j].arr!=1)
//                         continue
//                     if(total[j].eTime<=interval&&total[j].eTime>=time){
//                         depNum+=1
//                     }
//                 }
//                 sum = arrNum+depNum
//                 data.push({'time':new Date(time), 'arrNum': arrNum, 'depNum': depNum, 'num': sum});
//                 //console.log(data)
//                 time = interval
//             }
//             data[data.length-1].num=0
//             return data
//         },
