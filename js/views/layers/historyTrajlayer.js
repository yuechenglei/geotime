/**
 * Created by fenglu on 2017/2/27.
 */
define([
  'require',
  'marionette',
  'underscore',
  'jquery',
  'backbone',
  'config',
  "variables"
], function (require, Mn, _, $, Backbone, Config, Variables) {
  'use strict';
  var HistoryTrajLayer = function (map, id) {
    //this.model=model
    this.map = map;
    this.id = id;
    this.geometry = {}
    this.depShow = true;
    this.arrShow = true;
    this.trajectoryShow = false;
    this.beginTime = new Date(2016, 11, 15, 0).getTime();
    this.lineMaterial = {
      linewidth: Datacenter.get('width-slider-current-value'),
      opacity: 1,
      visible: true
    };
    //this.init(data);
  };

  HistoryTrajLayer.prototype = {
    init: function (_data) {
      this.overlay = L.canvasOverlay()
      // .params({data:_data})
      // .drawing(this.drawingOnCanvas)
        .containParent(this)
        .addTo(this.map);

      this.updateData(_data);
    },
    drawingOnCanvas: function (canvasOverlay,params) {
      var ctx = params.canvas.getContext('2d');
      var canvas = params.canvas;
      var self = params.containParent;

      var data = params.options.data;

      var arrTrajsArr = data['arrTrajs'];
      var depTrajsArr = data['depTrajs'];

      ctx.clearRect(0,0,canvas.width,canvas.height);

      //history traj
      if(self.trajectoryShow) {
        if(self.arrShow){
          arrTrajsArr.map(function(d,i){
            var dest = d.data.length - 1;
            var dot1 = canvasOverlay._map.latLngToContainerPoint(d.data[0].latlon);
            var dot2 = canvasOverlay._map.latLngToContainerPoint(d.data[dest].latlon);
            // console.log(i, d.data[dest].latlon);
            ctx.lineWidth = self.lineMaterial.linewidth;
            var prePos = d.data[0].latlon;

            // linear gradient from start to end of line
            ctx.strokeStyle = "rgba(209, 71, 69, 0.3)";

            ctx.beginPath();
            ctx.moveTo(dot1.x,dot1.y);
            for(var i=1;i<d.data.length;i++){
              var dot = canvasOverlay._map.latLngToContainerPoint(d.data[i].latlon);
              var pos = d.data[i].latlon;
              if(Math.abs (pos[1] - prePos[1]) > 180 ) {
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                ctx.moveTo(dot.x,dot.y);
              }
              else{
                ctx.lineTo(dot.x,dot.y);
              }
              prePos = pos;
            }
            ctx.stroke();
            ctx.closePath();
          });
        }

        if(self.depShow) {
          depTrajsArr.map(function(d,i){

            var dest = d.data.length - 1;
            var dot1 = canvasOverlay._map.latLngToContainerPoint(d.data[0].latlon);
            var dot2 = canvasOverlay._map.latLngToContainerPoint(d.data[dest].latlon);

            ctx.lineWidth = self.lineMaterial.linewidth;
            var prePos = d.data[0].latlon;

            // linear gradient from start to end of line
            ctx.strokeStyle = "rgba(41, 170, 227, 0.3)";

            ctx.beginPath();
            ctx.moveTo(dot1.x,dot1.y);

            for(var i=1;i<d.data.length;i++){
              var dot = canvasOverlay._map.latLngToContainerPoint(d.data[i].latlon);
              var pos = d.data[i].latlon;
              if(Math.abs (pos[1] - prePos[1]) > 180 ) {
                ctx.stroke();
                ctx.closePath();
                ctx.beginPath();
                ctx.moveTo(dot.x,dot.y);
              }
              else{
                ctx.lineTo(dot.x,dot.y);
              }
              prePos = pos;
            }
            ctx.stroke();
            ctx.closePath();
          });
        }
      }
    },
    updateData: function (data) {
      var curTime = Config.get('curtime');//右边界
      var slidingwindowsize = Config.get('slidingwindowsize');
      var startTime = curTime - slidingwindowsize;

      if (startTime < this.beginTime)
        startTime = this.beginTime;

      var arrDep = [ 'arrTrajs', 'depTrajs' ];

      var filterArr = {};
      filterArr[ 'arrTrajs' ] = [];
      filterArr[ 'depTrajs' ] = [];

      var historyTraj = {};
      historyTraj['arrTrajs'] = [];
      historyTraj['depTrajs'] = [];

      // var finalHistoryTraj = {};
      // finalHistoryTraj['arrTrajs'] = [];
      // finalHistoryTraj['depTrajs'] = [];

      // var finalTrailArr = {};
      // finalTrailArr[ 'arrTrajs' ] = [];
      // finalTrailArr[ 'depTrajs' ] = [];

      arrDep.forEach(function (n) {
        data[ n ].forEach(function (d) {
          var dataToPush = [];
          var st;
          //sort
          d.data.sort(function (a,b) {
            return a.Timestamp - b.Timestamp;
          });
          //<-20 +360
          for (var j = 0; j < d.data.length; j++) {
            if (d.data[ j ].latlon[ 1 ] < -20)
              d.data[ j ].latlon[ 1 ] += 360;
          }

          for (var j = 0; j < d.data.length; j++) {
            if (d.data[ j ].Timestamp >= startTime) {
              if (j > 0) st = j - 1;
              else st = j;
              break;
            }
          }

          for (var j = st; j < d.data.length; j++) {
            dataToPush.push(d.data[ j ]);
            if (d.data[ j ].Timestamp >= curTime)
              break;
          }
          filterArr[ n ].push({ trajID: d.trajID, data: $.extend(true, [], dataToPush) });
          historyTraj[n].push({ trajID: d.trajID, data: $.extend(true, [], d.data.slice(0, st+1)) });
        });
      });

      // arrDep.forEach(function (n) {
      //   filterArr[ n ].forEach(function (d) {
      //     //+-180
      //     var isCross = false;
      //     for (var j = 1; j < d.data.length; j++) {
      //       if (Math.abs(d.data[ j ].latlon[ 1 ] - d.data[ j - 1 ].latlon[ 1 ] >= 180)) {
      //         isCross = true;
      //         break;
      //       }
      //     }
      //     if(!isCross)
      //       trailArr[ n ].push({ trajID: d.trajID, data: $.extend(true, [], d.data) });
      //   });
      // });

      // finalTrailArr = $.extend(true, {}, trailArr);
      //interpolate
      arrDep.forEach(function (n) {
        filterArr[n].forEach(function (d,i) {
          if (d.data.length >= 2) {
            if (startTime >= d.data[ 0 ].Timestamp && startTime <= d.data[ 1 ].Timestamp) {
              var posT0 = interpolate(d.data[ 0 ], d.data[ 1 ], startTime);
              d.data[ 0 ] = posT0;
            }

            if (curTime >= d.data[ d.data.length - 2 ].Timestamp && curTime <= d.data[ d.data.length - 1 ].Timestamp) {
              var posT1 = interpolate(d.data[ d.data.length - 2 ], d.data[ d.data.length - 1 ], curTime);
              d.data[ d.data.length - 1 ] = posT1;
            }
          }
          // console.log(i, d.data[0].latlon)
        });
      });
      //interpolate for history traj
      arrDep.forEach(function (n) {
        historyTraj[ n ].forEach(function (d,i) {
          d.data[d.data.length-1] = filterArr[n][i].data[0];
          //+-180
          // var isCross = false;
          // for (var j = 1; j < d.data.length; j++) {
          //   if (Math.abs(d.data[ j ].latlon[ 1 ] - d.data[ j - 1 ].latlon[ 1 ] >= 180)) {
          //     isCross = true;
          //     break;
          //   }
          // }
          // if(!isCross)
          //   finalHistoryTraj[ n ].push({ trajID: d.trajID, data: $.extend(true, [], d.data) });
        });
      });
      // console.log(historyTraj);
      function interpolate (dataT0, dataT1, time) {
        var latScale = d3.scale.linear()
          .range([ dataT0.latlon[ 0 ], dataT1.latlon[ 0 ] ])
          .domain([ dataT0.Timestamp, dataT1.Timestamp ]);

        var lngScale = d3.scale.linear()
          .range([ dataT0.latlon[ 1 ], dataT1.latlon[ 1 ] ])
          .domain([ dataT0.Timestamp, dataT1.Timestamp ]);

        var obj = new Object();
        obj.latlon = [ latScale(time), lngScale(time) ];
        obj.Timestamp = time;
        return obj;
      }

      // this.renderTrail(finalTrailArr);
      this.overlay.params({data: historyTraj});
      this.overlay.drawing(this.drawingOnCanvas);
      this.overlay.redraw();

      // this.render(finalTrailArr);
    },
    updateHistoryTrajShow: function (trajectoryShow) {
      // console.log(oriPoints);
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
      this.arrShow = arrShow;
        this.overlay.redraw();
    },
    updateDepShow: function (depShow) {
      this.depShow = depShow;
        this.overlay.redraw();
    },
  };
  return HistoryTrajLayer;
});
