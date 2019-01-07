/**
 * Created by tangzhi.ye at 2015/11/24
 * model for whole data mamagement
 */

define([
    'require',
    'd3',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'config',
    'variables',
    'd3-queue',
    "models/map.model",
    "models/timeline.model",
    // "models/timeComp.model",
    "models/information.model",
], function(require, d3, Mn, _, $, Backbone, Config, Variables, D3Queue, MapModel, TimelineModel, InformationModel) {
    'use strict';

    return window.Datacenter = new(Backbone.Model.extend({
        defaults: function() {
            return {
                "fixPots": null,
                "arrTrajs": null, // trajIdx, and trajArr
                "depTrajs": null,
                "trajData": null,
                "selected_fea": null,
                "trajDataHistogram": null,
                "trajDataNew": null,
                "buffData": null,
                "buffSt": null,
                "buffEn": null,
                "oldBuffSt": null,
                "oldBuffEn": null,
                "trajSta": null,
                "trajs": null,
                "airports": null,
                "airportsArr": null,
                "arrMonth": null,
                "depMonth": null,
                "schedule": null,
                "dayStaAll": null,
                "monthStaAll": null,
                "daySta": null,
                "monthSta": null,
                "dataGet": true,
                "aFlightGet": true,
                "filterCircleDataArray": null,
                // "SingleTrajFromTable": null,
                "filterCircleCDMData": null,
                "filterCirclePCData": null,
                "arrShow": true,
                "depShow": true,
                "cdmShow": false,
                "filterCirclePCDataUpdate": null,
                // "dimensionsArr":null,
                // "dimensionsDep":null,
                "arr_key_list": null,
                "dep_key_list": null,
                "arr_selected_trajID": [],
                "dep_selected_trajID": [],
                "selected_trajID": [],
                'slider_value': 30 * 60000,
                "projectionData": null,
                "leftChosenFeature": null,
                "rightChosenFeature": null,
                "callsignData": null,
                "emPixel": 10,
                "flightToSearch": null, //flightList上选中的航班号
                "cdmSearchBtn": false,
                "size-slider-current-value": 4,
                "width-slider-current-value": 2.5,
                "flightNow": null, //当前地图上选中的航班号
                "airportsShowTip": [],
                "fixpotsShowTip": [],
                "beijingfixpotsShowTip": [],
                "flight_timeline": null,
                "fixpot_filter": { "arr": {}, "dep": {} },
                "fixpot_filterDataArray": [],
                "fixptsHistogramShowVar": false,
                "curSelectedTrajData": {},
                "curDate": "2016-12-17",
                "origin_point_data": null,
                "filterFlightList": null,
                "airCompanyColorMap": null,
                "aircraftColorMap": null,
                "departureTimeColorMap": null,
                "gateTotalNum": 0,
                "flightNum": { 'totalNum': 0, 'arrNum': 0, 'depNum': 0 },
                "pointTotalNum": 0,
                "keyPointTotalNum": 0,
                "routeTotalNum": 0,
                "gatePositionData": null,
                "CDM_Data": null,
                "routePointData": null,
                "routeLineData": null,
                "selectRouteList": [],
                "selectPoint": null,
                "centerFlight": null,
                "relatedFlightInfo": [],
                "flightGraphData": null,
                "fixed_trajData": null,
                "ignoreGate": [],
                "wrongFlight": ["c3a2b5d"],
                // "wrongFlight": [ "c0d5d0a", "c0e8dd6", "c0d857a", "c0e6c26", "c0e0857","c0de396","c0def11","c0db974","c0dda0c","c0dee33" ]
                "depTrajData": null,
                "arrTrajData": null,
                "departureInfo": {},
                "depTrajsArr": null,
                "selectedFlight": [],
                "keyPointPass": null,
                "timeBeforeCenterSearch": null,
                "relatedLineData": null,
                "selected_keyPoints": [],
                //
                'readFixed_trajDataDef': null,
                'readDataDef': null,
            };
        },
        initialize: function() {
            var self = this;
            self.mapModel = new MapModel();
            self.timelineModel = new TimelineModel();
            self.informationModel = new InformationModel();

            self.readDataFromLocal();
            // self.readGatePositionData();
            // self.readRouteLineData();
            self.readRoutePointData();

            self.readFixed_trajDataDef = $.Deferred();
            self.readDataDef = $.Deferred();
            // self.set("readFixed_trajDataDef", self.readFixed_trajDataDef)

            //  $.when(self.readDataDef, self.readFixed_trajDataDef).done(function() {
            //     console.log("finish");
            //     // Variables.set("finishInit", true);

            //     Variables.set('loading', false);
            //     Variables.set("finishInit", true);

            // });

        },
        start: function() {
            var self = this;
            // console.warn('start')

            //  $.when(readFixed_trajDataDef, readDataDef).done(function() {
            //     // console.log(Datacenter.get("arrTrajs"));
            //     Variables.set("finishInit", true);
            // });

        },

        readGatePositionData: function() {
            var self = this;
            d3.json('./data/GatePositionData.json', function(data) {
                Datacenter.set('gatePositionData', data);
            });
        },

        readRoutePointData: function() {
            var self = this;

            d3.json('./data/newRoute.json', function(data) {
                Datacenter.set('gatePositionData', data.gateNode);
                // Datacenter.set('gateTotalNum', data.gateNode.length);
                Datacenter.set('routePointData', data);
                // Datacenter.set('keyPointTotalNum', data[ 'node' ].length);
                // Datacenter.set('routeTotalNum', data[ 'link' ].length);
            });
        },

        timeRangeLoop: function(sTime, eTime) {
            var self = this;
            var parseDate = d3.time.format("%Y%m%d").parse;
            var dateFormat = d3.time.format("%Y%m%d");

            var fileRangeArr = [];
            //加上一天的号码时间戳(1*24*60*60*1000)
            var sTimeStamp = parseDate(sTime).getTime(),
                eTimeStamp = parseDate(eTime).getTime();
            var curStamp = sTimeStamp;
            while (curStamp <= eTimeStamp) {
                fileRangeArr.push((dateFormat(new Date(curStamp))));
                curStamp += 1 * 24 * 60 * 60 * 1000;
            }
            return fileRangeArr;
        },

        readDataFromLocal: function() {
            var self = this;
            console.warn('readDataFromLocal');
            Variables.set('loading', true);
            // Variables.set("finishInit", false);

            var sTime = Config.get("StartTimeRange"),
                eTime = Config.get("EndTimeRange");

            var fileRangeArr = self.timeRangeLoop(sTime, eTime);
            var q = D3Queue.queue();

            fileRangeArr.forEach(function(f) {
                q.defer(d3.json, "./data/OriPoints_bind/" + f + "_bind2.json");
            });

            q.awaitAll(ready);

            function ready(error, results) {
                if (error) throw error;
                self.dataCleaning(results);
            }
        },

        dataCleaning: function(data) {
            var self = this;

            var arrPoint = [],
                depPoint = [],
                totalPoint = [];
            // console.log('origin data',data);
            data.forEach(function(daily) {
                daily.dep.forEach(function(d) {
                    if ($.inArray(d.trajID, self.get('wrongFlight')) != -1) return;
                    depPoint.push(d);
                    totalPoint.push(d);
                });
                daily.arr.forEach(function(d) {
                    if ($.inArray(d.trajID, self.get('wrongFlight')) != -1) return;
                    arrPoint.push(d);
                    totalPoint.push(d);
                });
            });
            var pointData = { 'arrPoints': arrPoint, 'depPoints': depPoint, 'totalPoint': totalPoint };

            self.totalNumCal(pointData);
        },

        totalNumCal: function(data) {
            var self = this;
            self.colorMap(data);
        },

        colorMap: function(data) {
            var self = this;

            var totalPoint = data['totalPoint'];

            var color1 = d3.scale.category20b();
            var color2 = d3.scale.category20b();
            var color3 = d3.scale.category20b();
            var parseTime = d3.time.format("%H");

            //航空公司
            var airCompanySet = new Set();

            totalPoint.forEach(function(d) {
                airCompanySet.add(d.callsign.replace(/[0-9]/ig, "")); //去掉数字
            });
            var airCompanyColorMap = {};
            airCompanySet.forEach(function(d) {
                airCompanyColorMap[d] = color1(d);
            });
            Datacenter.set('airCompanyColorMap', airCompanyColorMap);
            //机型
            var aircraftSet = new Set();

            totalPoint.forEach(function(d) {
                var this_aircraft = (d['aircraft'] == "" ? '-' : d['aircraft']['model']['code']);
                aircraftSet.add(this_aircraft);
            });
            var aircraftColorMap = {};
            aircraftSet.forEach(function(d) {
                aircraftColorMap[d] = color2(d);
            });
            Datacenter.set('aircraftColorMap', aircraftColorMap);
            //起飞时段
            var departureTimeColorMap = {};
            for (var hour = 0; hour < 24; hour++) {
                if (hour >= 0 && hour < 6) departureTimeColorMap[hour] = color3(0);
                if (hour >= 6 && hour < 12) departureTimeColorMap[hour] = color3(6);
                if (hour >= 12 && hour < 18) departureTimeColorMap[hour] = color3(12);
                if (hour >= 18 && hour < 24) departureTimeColorMap[hour] = color3(18);
            }
            departureTimeColorMap['-'] = color3(25);

            Datacenter.set('departureTimeColorMap', departureTimeColorMap);
            self.set("origin_point_data", data);


            // Variables.set('loading', false);
            Variables.set("finishInit", true);


            // self.readDataDef.resolve();


            // console.log('self.readDataDef', self.readDataDef)

        },

        convertSpeedUnit: function(speed, inputUnit, outputUnit) {
            if (inputUnit == "kt" && outputUnit == "m/s")
                return speed * 1.852 / 3.6;
            // return speed;

            if (inputUnit == "m/s" && outputUnit == "kt")
                return speed * 3.6 / 1.852;
            // return speed;
        },

        randomString: function(len) {
            len = len || 32;
            var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
            var maxPos = $chars.length;
            var pwd = '';
            for (var i = 0; i < len; i++) {
                pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return pwd;
        },

        changeToDate: function(timestamp) {
            var d = new Date(timestamp);
            var newDate = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
            return new Date(newDate).getTime()
        },

        removeAllView: function() {
            console.log('removeAllView');
            $('#traj_list_title').remove();
            $('#traj_list_table_div').remove();
            $('.OneFilterCircle_g').remove();
            $('.hdp_simple_svg').remove();
            $('.relatedLine_svg').remove();
            Config.set("filterTrajShow", false);
            Datacenter.set("filterFlightList", null);
            Datacenter.set('selected_trajID', []);
            Datacenter.set('centerFlight', null);
        },
        update_selected_trajID: function() {
            var self = this;
            var arrShow = self.get('arrShow')
            var depShow = self.get('depShow')

            var pcData = {
                'data': [],
                'feaSta': { 'Dep': {}, 'Arr': {}, 'Arr/Dep': {} },
                'features': [],
                'lineData': { 'Dep': {}, 'Arr': {}, 'Arr/Dep': {} }
            }
            var temp = self.deepCopy(self.get('filterCirclePCData'))
            console.log(temp)

            if (arrShow && depShow) {
                pcData = temp
            } else if (!arrShow && depShow) {
                //console.log('enter !arrShow && depShow')

                for (var i = 0; i < temp['data'].length; i++) {
                    if (temp['data'][i]['arr'] == 0) {
                        pcData['data'].push(temp['data'][i])
                    }
                }
                if (pcData['data'].length == 0) {
                    pcData = null
                } else {
                    pcData['feaSta']['Dep'] = temp['feaSta']['Dep']
                    for (var index in temp['feaSta']['Arr/Dep']) {

                        for (var j = 0; j < temp['feaSta']['Arr/Dep'][index].length; j++) {
                            temp['feaSta']['Arr/Dep'][index][j]['arrNum'] = 0
                            temp['feaSta']['Arr/Dep'][index][j]['num'] = temp['feaSta']['Arr/Dep'][index][j]['depNum']
                        }

                        pcData['feaSta']['Dep'][index] = temp['feaSta']['Arr/Dep'][index]
                    }

                    pcData['lineData']['Dep'] = temp['lineData']['Dep']
                    for (var index in temp['lineData']['Arr/Dep']) {
                        pcData['lineData']['Dep'][index] = temp['lineData']['Arr/Dep'][index]
                    }

                    for (var i = 0; i < temp['features'].length; i++) {
                        if (temp['features'][i]['arr'] == 0 || temp['features'][i]['arr'] == 2) {
                            pcData['features'].push(temp['features'][i])
                        }
                    }
                }

            } else if (arrShow && !depShow) {
                for (var i = 0; i < temp['data'].length; i++) {
                    if (temp['data'][i]['arr'] == 1) {
                        pcData['data'].push(temp['data'][i])
                    }
                }
                if (pcData['data'].length == 0) {
                    pcData = null
                } else {
                    pcData['feaSta']['Arr'] = temp['feaSta']['Arr']
                    for (var index in temp['feaSta']['Arr/Dep']) {

                        for (var j = 0; j < temp['feaSta']['Arr/Dep'][index].length; j++) {
                            temp['feaSta']['Arr/Dep'][index][j]['depNum'] = 0
                            temp['feaSta']['Arr/Dep'][index][j]['num'] = temp['feaSta']['Arr/Dep'][index][j]['arrNum']
                        }

                        pcData['feaSta']['Arr'][index] = temp['feaSta']['Arr/Dep'][index]
                    }

                    pcData['lineData']['Arr'] = temp['lineData']['Arr']
                    for (var index in temp['lineData']['Arr/Dep']) {
                        pcData['lineData']['Arr'][index] = temp['lineData']['Arr/Dep'][index]
                    }

                    for (var i = 0; i < temp['features'].length; i++) {
                        if (temp['features'][i]['arr'] == 1 || temp['features'][i]['arr'] == 2) {
                            pcData['features'].push(temp['features'][i])
                        }
                    }
                }

            } else if (!arrShow && !depShow) {
                pcData = null
            }

            self.set('filterCirclePCDataUpdate', pcData)
            // console.log('AAA',self.get('filterCirclePCDataUpdate'))
        },



    }))();
});