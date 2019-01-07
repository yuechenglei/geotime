/**
 * Created by tangzhi.ye at 2016/1/5
 * model for map view
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
            layers: {}, // key is layer id;
            filterArray: null,

            // map element
            fixPotShow: false,
            beijingfixpotShow: false,
            arrShow: true,
            depShow: true,
            airportShow: false,
            fixedTrajShow: false,
            airplaneShow: true,
            samplePointShow: false,
            trajectoryShow: false,
            gateShow: false,
            gateLabelShow: false,
            keyPointShow: true,
            keyPointLabelShow: false,
            routeShow: false,
            routeList_Taxing: {},
            //control panel
            displayControlShow: true,
            displayTimelineShow: true,
            data: [],
            PEK: [40.076805, 116.588355],

            layerProjection: 1

        },
        initialize: function() {
            var self = this;
        },

    });
});