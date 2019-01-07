/**
 Created by chengleiyue on 07/04/2017
 * model for map data
 */

define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone'
], function(require, Mn, _, $, Backbone) {
    'use strict';

    return Backbone.Model.extend({
        defaults: {
            // "carIdPath": null, //whether loading page show
            // "carPathCoord": null,
            // "carIdSensor": null,
            // "legendData": [{ "n": "Ranger-base", "c": "#795548" }, { "n": "Ranger-stop", "c": "#03A9F4" }, { "n": "General-gate", "c": "#FF9800" }, { "n": "Entrance", "c": "#E91E63" }, { "n": "Camping", "c": "#673AB7" }, { "n": "Gate", "c": "#8BC34A" }],
            // 'sensorToTimeStamp': null,
            // 'carIcon': null,
            // "timeLineBottomSlide": null,

            // "timeTrajData": null,

            // timeline
            "play": false,
            "playspeed": 20,
            'carIDTag': null,

        },

        callback: function() {
            var now = _.now();
            var diff = now - this.before;
            this.before = now;
            // this.set('current', _.now());

            if (this.get('play')) {
                var newtime = Config.get('curTime') + diff * this.get('playspeed');
                //console.log("#####")
                //console.log(new Date(this.get("basetime") + this.get("timelength")))
                //this.get("basetime") + this.get("timelength")
                if (newtime > Config.get('topTime')) {
                    console.log("callback")
                    this.set("play", false);
                    Config.set('curTime', Config.get('topTime'));
                } else
                    Config.set('curTime', newtime);

            }
            this.timer = window.requestAnimationFrame(this.callback);
        },

        pause: function() {
            window.cancelAnimationFrame(this.timer);
            this.timer = null;
        },
        play: function() {
            if (this.timer) window.cancelAnimationFrame(this.timer);
            this.before = _.now();
            this.timer = window.requestAnimationFrame(this.callback);
        },
        initialize: function(options) {
            _.bindAll(this, 'play', 'callback', 'pause');
            this.timer = window.requestAnimationFrame(this.callback);
            this.on('change:play', function(model, play) {
                // console.log('play', play)
                if (!play) {
                    model.pause();
                    $("#playIcon").removeClass("glyphicon-pause")
                    $("#playIcon").addClass("glyphicon-play")
                } else {
                    model.play();
                    $("#playIcon").addClass("glyphicon-pause")
                    $("#playIcon").removeClass("glyphicon-play")
                }
            });
        },






    })
});