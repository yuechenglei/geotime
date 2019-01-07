/**
 * Created by tangzhi.ye at 2015/11/24
 * model for default setting
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone'
], function(require, Mn, _, $, Backbone) {
    'use strict';

    return window.Config = new(Backbone.Model.extend({
        defaults: {
            "ratio": 2560.0 / 720.0,
            // "fixPotFilePath":"data/fixPots_format.csv",
            // "arrFilePath":"data/format/arr10.28.csv",
            // "depFilePath":"data/format/dep10.28.csv",
            // "airportFilePath":"data/airports.json",
            // "arrMonthFilePath":"data/pek_10_5am_9am_arrival.csv",
            // "depMonthFilePath":"data/pek_10_5am_9am_depature.csv",
            // "scheduleFilePath":"data/schedule.json",
            "currentViewZIndex": 1,
            'curTime': 'null',
            'lastRenderTime':'null',
            'bottomTime': 'null',
            'topTime': 'null',
            'slideWindowL': 'null',
            'slideWindowR': 'null',
            // "curtime": new Date(2016, 11, 17).getTime(),
            "curtimePath": new Date(2016, 11, 17).getTime(),
            // "oldcurtime":new Date(2016,11,17).getTime(),
            "slidingwindowsize": 10 * 60 * 1000,
            "timelineTopRange": [Date.parse(new Date(2017, 0, 2)), Date.parse(new Date(2017, 0, 3))],
            "flightTypeSelection": null,
            "filterCircle": false,
            "airportSelected": 'PEK',
            "currentCenterAirport": 'ZBAA',
            "filterPolygon": false,
            "filterShow": "filterRemove",
            "filterTrajShow": false,
            "brushFinish": true, //judge whether brush finished ß
            "brushFinish1": true, //judge whether brush finished ß 
            "brushEmpty": false,
            "curScale": 15,
            "emPixel": null,
            "colorMappingSelection": 'nomapping',
            "focusLocationArray": {
                "World": {
                    "scale": 3
                },
                "China": {
                    "scale": 4
                },
                "Beijing": {
                    "scale": 8
                },
                "PEK": {
                    "scale": 13
                }
            },
            "centerAirportArray": {
                "ZBAA": [40.076805, 116.588355],
                "ZBNY": [39.4652, 116.2312], //北京南苑机场
                "ZBSJ": [38.1651, 114.4150], //石家庄正定国际机场
                "ZBTJ": [39.0728, 117.2045], //天津滨海国际机场
            },
            "StartTotalFile": "20170102",
            "EndTotalFile": "20170103",
            "StartTimeRange": "20170102",
            "EndTimeRange": "20170102",
            "TimeRange": null,
        },
    }))();
});