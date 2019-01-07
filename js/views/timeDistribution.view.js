/**
 * Created by fenglu on 2018/1/18.
 */
define([
    'require',
    'd3',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'datacenter',
    'config',
    'variables',
    'd3tip',
    'views/svg-base.addon'
    // 'text!templates/HDP_view.tpl',
], function (require, d3, Mn, _, $, Backbone, Datacenter, Config, Variables, d3tip, SVGBase) {
    'use strict'
    return Mn.ItemView.extend({
        tagName: 'div',
        template: false,
        attributes: {
            'style': 'width: 100%; height: 100%;',
            'id': 'timeDistribution_view_backbone'
        },
        events: {},

        initialize: function (options) {
            var self = this
            self.listenTo(Datacenter, 'resize_view', function (command) {
                if (command.id == 'timeDistribution_view') {
                    self.render()
                }
            })
            self.listenTo(Datacenter, 'change:selected_trajID', function (model, selected_trajID) {
                self.render()
            })
        },
        onShow: function () {
            var self = this
            console.log('timeDistribution_view_backbone')
            self.render()
        },
        render: function () {
            var self = this;

            self.selected_trajID = Datacenter.get('selected_trajID')
            self.trajData = Datacenter.get('fixed_trajData')

            if (self.selected_trajID.length != 1 || self.trajData == null) return

            self.selected_trajID.forEach(function (traj) {
                self.thisTraj = self.trajData.depPoints.find(function (d) {
                    return d.trajID == traj
                })
            })
        }
    })
})
