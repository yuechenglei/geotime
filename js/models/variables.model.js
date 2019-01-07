/**
 * Created by tangzhi.ye at 2015/11/24
 * model for interaction
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone'
], function(require, Mn, _, $, Backbone) {
    'use strict';

    return window.Variables = new (Backbone.Model.extend({
        defaults: {
            "finishInit":false,
            "loading":true, //whether loading page show
        },
    }))();
});
