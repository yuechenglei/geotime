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
        },
        initialize: function(){
            var self = this;

            // self.listenTo(self,"change:settingMsg", function(model, settingMsg){
            //     self.set("localsettingID",null);
            //     self.updateSettingMsg();
            // });
            // self.listenTo(self,"change:localsettingID", function(model, localsettingID) {
            //     self.updateSettingMsg();
            // })
            // self.listenTo(self,"change:parameterControlShow", function(model, parameterControlShow){
            //     self.updateSettingMsg();
            // });

        },

    });
});
