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
            self.data = Datacenter.get('monthSta')
            self.initTimeline('timelineSvgB');  
            self.updateTimeline(self.data);

            self.listenTo(Config, 'change:airportSelected', function(model,airportSelected){
                //切换机场会触发更新时间轴
                self.data = Datacenter.get('monthSta')
                var timelineTopRange = Config.get("timelineTopRange")
                self.updateTimeline(self.data);

                var timeMin = d3.min(self.data, function(d) { return d.time; })
                var timeMax = timeMin + (self.data.length-0.01)*24*3600*1000
                self.updateRange(timelineTopRange[0],timelineTopRange[1],timeMax, timeMin)
                self.updateSlidingWindow();
            });

            self.listenTo(Config, 'change:timelineTopRange', function(model,timelineTopRange){
                var timeMin = d3.min(self.data, function(d) { return d.time; })
                var timeMax = timeMin + (self.data.length-0.01)*24*3600*1000
                self.updateRange(timelineTopRange[0],timelineTopRange[1],timeMax, timeMin)
                self.updateSlidingWindow();
            });
            //var key = []

            // for(var i=0;i<data.length;i++){
            //     if(key.indexOf(data[i]['time'])==-1){
            //         key.push(data[i]['time'])
            //         dataFilter.push(data[i])
            //     }
            // }
            // data = dataFilter
            

            // for(var i =0 ;i< data.length;i++){
            //     data[i]['isClick'] = false
            // }   
        },
        initTimeline: function(content){
            var self = this;
            self.height=$("#"+content).outerHeight()
            self.width=$("#"+content).outerWidth()
        
            var emPixel = d3.select("#maindiv").style('font-size')
            emPixel = parseInt(emPixel.split('p')[0])
            
            self.emPixel = emPixel
            self.margin = {top: emPixel, right: 2*emPixel, bottom: 2*emPixel, left: 4*emPixel},
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
            self.yAxis = d3.svg.axis().scale(self.yScale)
                .orient("left").ticks(3);
            self.svg = d3.select("#"+content)
                .append("svg")
                .attr("class","timelineBot")
                .attr("width", self.width + self.margin.left + self.margin.right)
                .attr("height", self.height + self.margin.top + self.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");                
        },
        updateTimeline: function(data){
            var self = this;

            var timeMin = d3.min(data, function(d) { return d.time; })
            var timeMax = timeMin + (data.length-0.01)*24*3600*1000
            self.xScale.domain([timeMin, timeMax]);

            self.yScale.domain([0, d3.max(data, function(d) { return d.num; })]);

            self.intTimeScale = d3.scale.linear().domain([0,this.model.get('timelength')])
                                  .range([0,self.width])

            // Add the X Axis
            self.barWidth = self.width/data.length;


            d3.selectAll('.curveAxisbot text').remove()
            d3.selectAll('#timelineSvgB rect').remove()
            d3.selectAll('#timelineSvgB path').remove()



            // d3.selectAll('.curveAxisbot')
            // d3.selectAll('.curveAxisbot')
            
            // function adjustTextLabels(selection) {
            //     selection.selectAll('text')
            //         .data(['Dec 15',16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,'Jan 1',2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,'Feb 1',2,3,4,5,6,7,8,9,10,11,12,13,14])
            //         .attr('transform', 'translate(' + self.barWidth/2 + ',0)')
            //         .text(function(d){
            //             return d
            //         })
            // }

            // function adjustTextYearLabels(selection) {
            //     selection.selectAll('text')
            //         .data(['2016','','','','','','','','','','','','','','','','','2017','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','',''])
            //         .attr('transform', 'translate(' + self.barWidth/2 + ',10)')
            //         .text(function(d){
            //             return d
            //         })
            // }

            self.svg.append("g")
                .attr("class", "curveAxisbot")
                .attr("transform", "translate(0," + self.height + ")")
                .call(self.xAxis)
            // Add the Y Axis
            self.svg.append("g")
                .attr("class", "curveAxisbot")
                .call(self.yAxis)
               .append("text")
            var format = d3.time.format("%Y/%m/%d:%H:%M");
            
            var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                 return "<span style='color:black'>#arr: " + d.arrNum + ", #dep: " +d.depNum+ "</span>";
            })
            self.svg.call(tip);

            var arrBar = self.svg.selectAll(".arrbar")
                .data(data)
                .enter().append("rect")
                .attr("class", "arrbarbot")
                .attr("x", function(d) { return self.xScale(d.time); })
                .attr("y", function(d) { return self.yScale(d.arrNum); })
                .attr("width", self.barWidth*0.98)
                .attr("height", function(d) { return self.height - self.yScale(d.arrNum); })
                .style("fill",'rgb(209, 71, 69)')

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


                // .on("mouseover",function(d,i){
                //     d3.select(this).style("fill", "white").style("cursor","pointer")
                //     tip.show(d);
                // })
                // .on("mouseout",function(d,i){
                //     d3.selectAll(".bar").style("fill", "#636363")
                //     tip.hide();
                // })\
            var Bar = self.svg.selectAll(".monBar")
                .data(data)
                .enter().append("rect")
                .attr("class", "monBar")
                .attr("x", function(d) { return self.xScale(d.time); })
                .attr("y", function(d) { return self.yScale(d.num); })
                .attr("width", self.barWidth*0.98)
                .attr("height", function(d) { return self.height - self.yScale(d.num); })
                .on("mouseover",function(d,i){
                    d3.select(this)
                      .style("cursor","pointer")
                    // if(!self.isDragging)
                    //     tip.show(d);
                })
                .on("mouseout",function(d,i){
                    d3.selectAll(".monBar")                
                    tip.hide();
                })
                // .on("click", function(d,i){

                //     d3.selectAll(".monBar")
                //       .classed('click', false);
                //     d3.select(this)
                //       .classed('click', true);
                //    
                // })
                //将第一个bar高亮
                // d3.select('.monBar')
                //   .classed('click', true);


                var format = d3.time.format("%Y/%m/%d %H:%M");

                self.brush = d3.svg.brush()
                          .x(self.xScale)
                          .on("brush", function(){
                            var ext = self.brush.extent()
                            var brushStart=Date.parse(ext[0]);
                            var brushEnd=Date.parse(ext[1]);
                            brushStart = parseInt((brushStart/600000))*600000
                            brushEnd = parseInt((brushEnd/600000))*600000
                            // console.log(brushStart)
                            // console.log(brushEnd)
                            d3.selectAll(".d3-tip-top").remove()
                            var tipLabelTop = d3.tip()
                                              .attr('class', 'd3-tip-top')
                                              .offset([-8, 0])
                                              .html(function(d) {
                                                return d;
                                            })
                            self.svg.call(tipLabelTop)

                            self.updateRange(brushStart,brushEnd,timeMax, timeMin)


                            Config.set('brushFinish1',false)
                          })
                          .on("brushend", function(){
                            var ext = self.brush.extent()
                            var brushStart=Date.parse(ext[0]);
                            var brushEnd=Date.parse(ext[1]);
                            brushStart = parseInt((brushStart/600000))*600000
                            brushEnd = parseInt((brushEnd/600000))*600000                                                    
                            //d3.select("#timelineSvgB .brush").call((self.brush.empty()) ? self.brush.clear() : self.brush.extent([new Date(brushStart),new Date(brushEnd)]));                                          
                            if(self.brush.empty()){
                                var brushStart = parseInt((brushEnd/(24*60*60*1000)))*(24*60*60*1000)-8*60*60*1000
                                var brushEnd = brushStart + 24*60*60*1000
                                Config.set('timelineTopRange', [brushStart,brushEnd])
                                self.updateRange(brushStart,brushEnd,timeMax, timeMin)
                                
                            }
                            else{      
                                Config.set('timelineTopRange', [brushStart,brushEnd])
                            }
                            Config.set('brushFinish1',true) 
                          });

                self.brush.extent([new Date(Config.get("timelineTopRange")[0]), new Date(Config.get("timelineTopRange")[1])]);

                self.rect = self.svg.append("g")
                      .attr("class", "x brush")
                      .call(self.brush)
                
                var lineData = [{ "x": 0,   "y": 0}, { "x": 1,  "y": 0},{ "x": 1,  "y": self.height}, { "x": 0,  "y": self.height},{ "x": 0,  "y": 0},{ "x": 0,   "y": 0}, { "x": 2,  "y": 0},{ "x": 2,  "y": self.height}, { "x": 0,  "y": self.height},{ "x": 0,  "y": 0}];
                 
                 //This is the accessor function we talked about above
                var lineFunction = d3.svg.line()
                                         .x(function(d,i) { return i<1? -d.x : d.x; })
                                         .y(function(d) { return d.y; })
                                         .interpolate("linear");
                                 
                self.rect.selectAll(".resize").append("path")
                    .attr("transform", "translate("+-1+"," + 0 + ")")
                    .attr("d", function(d,i){
                        return lineFunction(lineData)
                    })
                self.rect.selectAll("rect")
                      .attr("y", 0)
                      .attr("height", self.height)

                self.svg.select("#timelineSvgB .x .brush")
                       .call(self.brush)

                var line = d3.svg.line()
                      .interpolate("cardinal")
                      .x(function(d,i) {return self.xScale(d.time);})
                      .y(function(d) {return d.num;})

                self.updateRange(Config.get("timelineTopRange")[0],Config.get("timelineTopRange")[1],timeMax, timeMin)
        },
        updateRange: function(brushStart, brushEnd, timeMax, timeMin){
            var self = this
            d3.selectAll('.rangePath').remove()

            var format = d3.time.format("%Y/%m/%d %H:%M");

            var line = d3.svg.line()
                      .interpolate("linear")
                      .x(function(d,i) {return self.xScale(d.time);})
                      .y(function(d) {return d.num;})
            
            var middle = (brushStart+brushEnd)/2

            var rightData = [{'time':timeMax, 'num': -self.emPixel}, {'time':timeMax, 'num':-self.emPixel/2},{'time':brushEnd, 'num':0}]
            var leftData = [{'time':timeMin, 'num':-self.emPixel}, {'time':timeMin, 'num':-self.emPixel/2},{'time':brushStart, 'num':0}]
            
            self.svg.append("path")
                  .attr('class','rangePath')
                  .attr("d", line(rightData))
                  
            self.svg.append("path")
                  .attr('class','rangePath')
                  .attr("d", line(leftData))

            d3.selectAll('.rangeText').remove()

            // self.svg.append("text") 
            //     .attr('class','rangeText')
            //     .attr("x", function(d) { return self.xScale(timeMin); })
            //     .attr("y", function(d) { return -2; })
            //     .text( function (d) { return format(new Date(brushStart)); })
            //     .style("text-anchor", "start")
            
            // self.svg.append("text")
            //     .attr('class','rangeText')
            //     .attr("x", function(d) { return self.xScale(timeMax); })
            //     .attr("y", function(d) { return -2; })
            //     .text( function (d) { return format(new Date(brushEnd)); })
            //     .style("text-anchor", "end")
        },
        updateSlidingWindow:function(){
            var self =this;
            var model = self.model      
            var sTime = new Date(Config.get('timelineTopRange')[0])
            var eTime = new Date(Config.get('timelineTopRange')[1])
            var right = self.xScale(eTime)
            var left = self.xScale(sTime)
            var barWidth = right - left
            d3.select("#timelineSvgB .extent")
              .attr("width", function() {     
                  return barWidth; 
              })
              .attr("x", function(d,i) {
                  return left
              })
            d3.select("#timelineSvgB .resize.e")
              .attr("transform", "translate(" + right + "," + 0 + ")")

            d3.select("#timelineSvgB .resize.w")
              .attr("transform", "translate(" + left + "," + 0 + ")")

            self.brush.extent([new Date(sTime), new Date(eTime)]);
            //self.brush.extent([new Date(model.get("curtime")), new Date(model.get("curtime")-model.get("slidingwindowsize"))]);
        },
       
    }, SVGBase));
});
