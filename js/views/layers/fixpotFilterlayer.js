/**
 * Created by fenglu on 2017/5/26.
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'config',
    'datacenter',
    "variables",
], function (require, Mn, _, $, Backbone, Config, Datacenter, Variables) {
    'use strict';
    var FixpotFilterLayer = function (map, data, id) {
        this.map = map;
        this.id = id;
        this.data = data;
        // this.init(data);
    }

    FixpotFilterLayer.prototype = {
        init: function (options) {
            var self = this;

            this.fixpotFilterSvgOverlay = L.d3SvgOverlay(function (sel, proj) {});
            this.fixpotFilterSvgOverlay.addTo(this.map);

            // self.fixpotFilterDrawFunc();
        },

        fixpotCalculate: function () {
            var self = this;
            console.warn('fixpotCalculate')
            var proj = this.fixpotFilterSvgOverlay.projection;
            var curtime = Config.get('curtime');

            var trajDataHistogram = $.extend(true, [], Datacenter.get("trajDataHistogram"));
            var fixpot_total = $.extend(true, [], Datacenter.get("fixPots"));

            var fixpot_arrival = [ 'BOBAK', 'DOGAR', 'GITUM', 'KM', 'VYK' ];
            var fixpot_departure = [ 'LADIX', 'RENOB', 'SOSDI', 'TONIL', 'YV', 'CDY' ];
            var fixpot_array = { "arr": [], "dep": [] };

            fixpot_arrival.forEach(function (s) {
                fixpot_total.forEach(function (d) {
                    d.x = proj.latLngToLayerPoint(L.latLng(d.lat, d.lon)).x;
                    d.y = proj.latLngToLayerPoint(L.latLng(d.lat, d.lon)).y;
                    if (d.name == s) fixpot_array[ "arr" ].push(d);
                });
            });

            fixpot_departure.forEach(function (s) {
                fixpot_total.forEach(function (d) {
                    d.x = proj.latLngToLayerPoint(L.latLng(d.lat, d.lon)).x;
                    d.y = proj.latLngToLayerPoint(L.latLng(d.lat, d.lon)).y;
                    if (d.name == s) fixpot_array[ "dep" ].push(d);
                });
            });

            trajDataHistogram[ 'arrTrajs' ].forEach(function (traj) {
                traj.data.forEach(d => {
                    d.x = proj.latLngToLayerPoint(d.latlon).x;
                    d.y = proj.latLngToLayerPoint(d.latlon).y;
                });
            });

            trajDataHistogram[ 'depTrajs' ].forEach(function (traj) {
                traj.data.forEach(d => {
                    d.x = proj.latLngToLayerPoint(d.latlon).x;
                    d.y = proj.latLngToLayerPoint(d.latlon).y;
                });
            });

            Datacenter.fixpotPassingCal(fixpot_array, trajDataHistogram, curtime, 24);
        },

        fixpotFilterDrawFunc: function () {
            var self = this;
            var map = this.map;
            var proj = this.fixpotFilterSvgOverlay.projection;

            var traj_select, FP_select;
            var threshold = 1;

            data[ 'arrTrajs' ].forEach(function (d) {
                traj_select = d;
                fixpot_array[ "arr" ].forEach(function (k) {
                    FP_select = k;
                    var result = pass_this_fixpot(traj_select, FP_select);
                    if (result[ 'distance' ] < 20)
                        result_array[ "arr" ].push(result);
                });
            });

            data[ 'depTrajs' ].forEach(function (d) {
                traj_select = d;
                fixpot_array[ "dep" ].forEach(function (k) {
                    FP_select = k;
                    var result = pass_this_fixpot(traj_select, FP_select);
                    if (result[ 'distance' ] < 20)
                        result_array[ "dep" ].push(result);
                });
            });

            //筛选出经过指定fixpot的航班
            fixpot_arrival.forEach(function (s) {
                fixpot_filter_arrival[ s ] = [];
                result_array[ 'arr' ].forEach(function (d) {
                    if (d[ 'FP' ].name == s) {
                        fixpot_filter_arrival[ s ].push(d);
                    }
                });
            });

            fixpot_departure.forEach(function (s) {
                fixpot_filter_departure[ s ] = [];
                result_array[ 'dep' ].forEach(function (d) {
                    if (d[ 'FP' ].name == s) {
                        fixpot_filter_departure[ s ].push(d);
                    }
                });
            });

            var obj = { "arr": fixpot_filter_arrival, "dep": fixpot_filter_departure };
            Datacenter.set("fixpot_filter", obj);

            function pass_this_fixpot (traj_select, FP_select) {
                var distance_array = [];

                var fp_x = proj.latLngToLayerPoint(L.latLng(FP_select.lat, FP_select.lon)).x;
                var fp_y = proj.latLngToLayerPoint(L.latLng(FP_select.lat, FP_select.lon)).y;

                traj_select.data.forEach(function (d) {
                    var tr_x = proj.latLngToLayerPoint(d.latlon).x;
                    var tr_y = proj.latLngToLayerPoint(d.latlon).y;
                    var res = distance_two_points(fp_x, fp_y, tr_x, tr_y);
                    distance_array.push(res);
                });

                var min = 10000000, index1, index2;

                distance_array.forEach(function (d, i) {
                    if (d < min) {
                        min = d;
                        index1 = i;
                    }
                });

                if (index1 == 0) index2 = index1 + 1;
                else if (index1 == distance_array.length - 1) index2 = index1 - 1;
                else {
                    if (distance_array[ index1 - 1 ] < distance_array[ index1 + 1 ]) index2 = index1 - 1;
                    else index2 = index1 + 1;
                }

                var a_x = proj.latLngToLayerPoint(traj_select.data[ index1 ].latlon).x;
                var a_y = proj.latLngToLayerPoint(traj_select.data[ index1 ].latlon).y;
                var b_x = proj.latLngToLayerPoint(traj_select.data[ index2 ].latlon).x;
                var b_y = proj.latLngToLayerPoint(traj_select.data[ index2 ].latlon).y;

                var distance_final = distance_FP_traj(fp_x, fp_y, a_x, a_y, b_x, b_y);

                return distance_final;

                function distance_two_points (fp_x, fp_y, tr_x, tr_y) {
                    var calX = fp_x - tr_x;
                    var calY = fp_y - tr_y;
                    var distance = Math.pow((calX * calX + calY * calY), 0.5);
                    return distance;
                }

                function distance_FP_traj (fp_x, fp_y, a_x, a_y, b_x, b_y) {
                    var A, B, m;
                    var dis;
                    var cross = new Object;
                    var time_stamp;
                    var result = new Object;
                    var time_to_end;
                    var distance_to_end;
                    //求最近距离
                    if (a_x == b_x) {
                        dis = Math.abs(a_x - fp_x)
                    }
                    else {
                        A = (a_y - b_y) / (a_x - b_x);
                        B = a_y - A * a_x;
                        dis = Math.abs(A * fp_x + B - fp_y) / Math.sqrt(1 + A * A);
                    }
                    // 求两直线交点坐标
                    m = fp_x + A * fp_y;
                    cross.x = (m - A * B) / (A * A + 1);
                    cross.y = A * cross.x + B;

                    // 时间插值
                    var timeScale = d3.scale.linear()
                        .range([ traj_select.data[ index1 ].Timestamp, traj_select.data[ index2 ].Timestamp ])
                        .domain([ a_x, b_x ]);
                    time_stamp = timeScale(cross.x);
                    time_to_end = traj_select.eTime - timeScale(cross.x);
                    // distance_to_end = (traj_select.data[traj_select.data.length-1].x - cross.x)

                    result = { "select_traj": traj_select, "FP": FP_select, "distance": dis, "timestamp": time_stamp, "crosspoint": cross, "time_to_end": time_to_end };
                    return result;
                }
            }

        },

    }
    return FixpotFilterLayer;
});


