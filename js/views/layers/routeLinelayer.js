/**
 * Created by fenglu on 2017/10/31.
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'config',
    "variables",
], function (require, Mn, _, $, Backbone, Config, Variables) {
    'use strict';
    var RouteLineLayer = function (map, model, id) {
        this.map = map;
        this.mapModel = model;
        this.id = id;
        this.strokeWidth = 3;
        this.labelSize = 0.9;
        this.distanceThreshold = 2;
        this.routeShow = false;
        this.wrongFlight = [];
        this.arrDep = [ 'depPoints', 'arrPoints' ]
        // this.init(data);
    };

    RouteLineLayer.prototype = {
        init: function (_data) {
            var self = this;

            this.overlay = L.canvasOverlay()
            // .params({data:_data})
            // .drawing(this.drawingOnCanvas)
                .containParent(this)
                .addTo(this.map);

            // this.RoutelineSvgOverlay = L.d3SvgOverlay(function (sel, proj) {
            //     sel.selectAll(".routeLine_stroke").style("stroke-width", self.strokeWidth / proj.scale);
            // });
            // this.RoutelineSvgOverlay.addTo(this.map);

            this.updateData(_data);
            this.findPassingRoutes();
        },
        drawingOnCanvas: function (canvasOverlay, params) {
            var self = this;

            var ctx = params.canvas.getContext('2d');
            var canvas = params.canvas;
            var self = params.containParent;

            var data = params.options.trajData;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (self.routeShow) {

                console.log("drawingOnCanvas")
                data.link.forEach(function (d, i) {
                    var dot1 = canvasOverlay._map.latLngToContainerPoint([ d.src.lat, d.src.lon ]);
                    var dot2 = canvasOverlay._map.latLngToContainerPoint([ d.dst.lat, d.dst.lon ]);
                    ctx.lineWidth = 3;

                    ctx.beginPath();
                    ctx.moveTo(dot1.x, dot1.y);
                    ctx.lineTo(dot2.x, dot2.y);

                    // if (d.id == 'r234' || d.id == 'r103')
                    //     ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
                    // else
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                    ctx.stroke();
                    ctx.closePath();
                });
            }
        },
        findPassingRoutes: function () {
            var self = this;
            var trajData_total = Datacenter.get('origin_point_data');
            var routePointData = Datacenter.get('routePointData');
            if (trajData_total == null || routePointData == null)
                return;

            trajData_total = $.extend(true, {}, Datacenter.get('origin_point_data'));

            //将轨迹数据绑定到路网，建立新的轨迹数据
            self.arrDep.forEach(function (n) {
                trajData_total[ n ].forEach(function (d, i) {
                    d.fixed_pos = [];
                    if (d.keyPointList.length == 0 || d.passingRouteList.length == 0) return;

                    d.fixed_pos = $.map(d.keyPointList, function (p) {
                        var pointInfo = $.grep(routePointData[ 'node' ], function (n) {
                            return n.id == p;
                        })[ 0 ];
                        return { 'id': pointInfo.id, 'lat': pointInfo.lat, 'lon': pointInfo.lon };
                    });
                });
            })

            self.bindRoute(trajData_total);
            self.interpolateKeyPoint(trajData_total);
            self.passFlightForEachKeyPoint(trajData_total);
            trajData_total.totalPoint = trajData_total.depPoints.concat(trajData_total.arrPoints);

            Datacenter.set('fixed_trajData', trajData_total);
            // console.log("hhhhhhhhhhhhhhhhhhh")
            // console.log("Datacenter.get('readFixed_trajDataDef')",Datacenter.get('readFixed_trajDataDef'))
            // Datacenter.get('readFixed_trajDataDef').resolve();
        },
        bindRoute: function (trajData_total) {
            var self = this;
            var routePointData = Datacenter.get('routePointData');

            //采样点位置修正，使其修正到路径上
            self.arrDep.forEach(function (n) {
                trajData_total[ n ].forEach(function (d, i) {
                    var new_pos = [];
                    d.new_pos_add = [];
                    var startPoint = false;

                    if (d.passingRouteList.length + 1 != d.keyPointList.length) return;

                    //建立采样点所属route的对象数组
                    var curRouteIndex = 0;
                    d.passingRouteList.forEach(function (r) {
                        new_pos.push({ 'rid': r, 'points': [] });
                    })

                    d.pos.forEach(function (p, j) {
                        //nearestRoute异常，则返回
                        if ($.inArray(p.nearestRoute, d.passingRouteList) == -1) return;
                        //nearestRoute不遵循passingRouteList的顺序，则返回
                        if (p.nearestRoute == new_pos[ curRouteIndex ].rid) {}
                        else {
                            var findMatch = false;
                            for (var ii = curRouteIndex + 1; ii < new_pos.length; ii++) {
                                if (p.nearestRoute == new_pos[ ii ].rid) {
                                    findMatch = true;
                                    curRouteIndex = ii;
                                    break;
                                }
                            }
                            if (!findMatch) return;
                        }

                        var thisRoute = $.grep(routePointData[ 'link' ], function (l) {
                            return l.id == p.nearestRoute;
                        })[ 0 ];

                        self.GetLinePara(thisRoute);

                        var point = self.overlay._map.latLngToContainerPoint(L.latLng(p.loc[ 1 ], p.loc[ 0 ]));
                        var fixed_point = self.distanceSamplePointToRoute_forBind(point, thisRoute);

                        if (fixed_point.crossingPointInRoute) {
                            if (n == 'depPoints') {
                                // 从第一个速度大于0的采样点开始记录
                                if (p.speed > 0 && startPoint == false) startPoint = true;

                                if (startPoint == true) {
                                    var new_p = {
                                        'isKeyPoint': false,
                                        'nearestRoute': p.nearestRoute,
                                        'speed': p.speed,
                                        'timestamp': p.timestamp,
                                        'lat': fixed_point.crossingPoint.lat,
                                        'lon': fixed_point.crossingPoint.lon
                                    };
                                    new_pos[ curRouteIndex ].points.push(new_p);
                                }
                            }
                            if (n == 'arrPoints') {
                                // 从第一个速度大于0的采样点开始记录
                                if (p.speed == 0 && startPoint == false) startPoint = true;

                                if (startPoint == false) {
                                    var new_p = {
                                        'isKeyPoint': false,
                                        'nearestRoute': p.nearestRoute,
                                        'speed': p.speed,
                                        'timestamp': p.timestamp,
                                        'lat': fixed_point.crossingPoint.lat,
                                        'lon': fixed_point.crossingPoint.lon
                                    };
                                    new_pos[ curRouteIndex ].points.push(new_p);
                                }
                            }
                        }
                    });

                    //插入keyPoint
                    d.passingRouteList.forEach(function (r, j) {
                        var new_p = {
                            'isKeyPoint': true,
                            'id': d.fixed_pos[ j ].id,
                            'lat': d.fixed_pos[ j ].lat,
                            'lon': d.fixed_pos[ j ].lon
                        };
                        d.new_pos_add.push(new_p);
                        new_pos[ j ].points.forEach(function (p) {
                            d.new_pos_add.push(p);
                        })
                    })
                    var new_p2 = {
                        'isKeyPoint': true,
                        'id': d.fixed_pos[ d.fixed_pos.length - 1 ].id,
                        'lat': d.fixed_pos[ d.fixed_pos.length - 1 ].lat,
                        'lon': d.fixed_pos[ d.fixed_pos.length - 1 ].lon
                    };
                    d.new_pos_add.push(new_p2);
                });
            })

        },
        interpolateKeyPoint: function (trajData_total) {
            var self = this;
            var routePointData = Datacenter.get('routePointData');

            trajData_total.depPoints.forEach(function (d, i) {
                // if (i >= 0) return;
                if (d.new_pos_add.length == 0) return;

                var inter_pos = [];

                //计算速度（单位为米／秒），以及相邻点之间的距离
                d.new_pos_add.forEach(function (n, j) {
                    if (!n.isKeyPoint) {
                        n.speed_m = Datacenter.convertSpeedUnit(n.speed, "kt", "m/s");
                    }
                    if (j < d.new_pos_add.length - 1) {
                        n.dis_to_next = self.getFlatternDistance(d.new_pos_add[ j ].lat, d.new_pos_add[ j ].lon, d.new_pos_add[ j + 1 ].lat, d.new_pos_add[ j + 1 ].lon);
                        // if(d.trajID == 'c3a2b5d') console.log(j, n.dis_to_next)
                    }
                });

                //找到第一个采样点和最后一个采样点的位置
                var firstPoint, lastPoint;

                for (var ii = 0; ii < d.new_pos_add.length; ii++) {
                    if (d.new_pos_add[ ii ].isKeyPoint == false) {
                        firstPoint = ii;
                        break;
                    }
                }
                for (var ii = d.new_pos_add.length - 1; ii >= 0; ii--) {
                    if (d.new_pos_add[ ii ].isKeyPoint == false) {
                        lastPoint = ii;
                        break;
                    }
                }

                if (firstPoint == undefined || lastPoint == undefined) return;

                //第一个keyPoint做插值（按照匀加速运动）
                if (d.new_pos_add[ 0 ].isKeyPoint == true) {
                    d.new_pos_add[ 0 ].speed = 0;
                    d.new_pos_add[ 0 ].speed_m = 0;
                    var dis = 0;
                    for (var jj = 0; jj < firstPoint; jj++) {
                        dis += d.new_pos_add[ jj ].dis_to_next;
                    }
                    var delta_t = (2 * dis / d.new_pos_add[ firstPoint ].speed_m) * 1000;
                    d.new_pos_add[ 0 ].timestamp = d.new_pos_add[ firstPoint ].timestamp - delta_t;
                }

                //前面的采样点，以及采样点之间的keyPoint做插值
                var p1_index = 0, p2_index = 0;

                while (p1_index < lastPoint) {
                    var key_array = [];
                    var total_dis = 0;
                    inter_pos.push(d.new_pos_add[ p1_index ]);

                    // 找到距离最近的两个采样点，并收集它们之间的keyPoint
                    for (var pp = p1_index + 1; pp <= lastPoint; pp++) {
                        total_dis += d.new_pos_add[ pp - 1 ].dis_to_next;
                        if (d.new_pos_add[ pp ].isKeyPoint) {
                            key_array.push(d.new_pos_add[ pp ]);
                        }
                        else {
                            p2_index = pp;
                            break;
                        }
                    }
                    // 找到每个keyPoint到p1 p2的距离
                    key_array.forEach(function (k, k_index) {
                        if (k_index == 0) {
                            k.dis1 = d.new_pos_add[ p1_index ].dis_to_next;
                            k.dis2 = total_dis - k.dis1;
                        }
                        else {
                            k.dis1 = key_array[ k_index - 1 ].dis1 + key_array[ k_index - 1 ].dis_to_next;
                            k.dis2 = total_dis - k.dis1;
                        }
                    })
                    //插值
                    var inter_array = self.interpolationAlgorithm(d.trajID, d.new_pos_add[ p1_index ], d.new_pos_add[ p2_index ], key_array, total_dis);
                    inter_array.forEach(function (a) {
                        inter_pos.push(a);
                    })

                    p1_index = p2_index;
                }

                inter_pos.push(d.new_pos_add[ lastPoint ]);

                //采样点后面的keyPoint做插值（按照匀速运动）
                if (lastPoint < d.new_pos_add.length - 1) {
                    var dis2;
                    for (var ii = lastPoint + 1; ii < d.new_pos_add.length; ii++) {
                        d.new_pos_add[ ii ].speed = d.new_pos_add[ ii - 1 ].speed;
                        d.new_pos_add[ ii ].speed_m = d.new_pos_add[ ii - 1 ].speed_m;
                        dis2 = d.new_pos_add[ ii - 1 ].dis_to_next;

                        if (d.new_pos_add[ ii ].speed_m > 0)
                            var delta_t = (dis2 / d.new_pos_add[ ii ].speed_m) * 1000;
                        else
                            var delta_t = 5 * 1000;//人为设置的值
                        d.new_pos_add[ ii ].timestamp = d.new_pos_add[ ii - 1 ].timestamp + delta_t;

                        inter_pos.push(d.new_pos_add[ ii ]);
                    }
                }

                //加ID
                var findFirst = false;
                var curID;
                inter_pos.some(function (d, i) {
                    if(d.isKeyPoint) {
                        if(findFirst) return true;
                        if(!findFirst) findFirst = true;
                        curID = d.id;
                    }
                    else {
                        if(curID != undefined) d.id = curID;
                    }
                })

                //替换
                d.new_pos_add = $.extend(true, [], inter_pos);
            });
            trajData_total.arrPoints.forEach(function (d, i) {
                // if (i > 0) return;
                if (d.new_pos_add.length == 0) return;

                var inter_pos = [];

                //计算速度（单位为米／秒），以及相邻点之间的距离
                d.new_pos_add.forEach(function (n, j) {
                    if (!n.isKeyPoint) {
                        n.speed_m = Datacenter.convertSpeedUnit(n.speed, "kt", "m/s");
                    }
                    if (j < d.new_pos_add.length - 1) {
                        n.dis_to_next = self.getFlatternDistance(d.new_pos_add[ j ].lat, d.new_pos_add[ j ].lon, d.new_pos_add[ j + 1 ].lat, d.new_pos_add[ j + 1 ].lon);
                    }
                });

                //找到第一个采样点和最后一个采样点的位置
                var firstPoint, lastPoint;

                for (var ii = 0; ii < d.new_pos_add.length; ii++) {
                    if (d.new_pos_add[ ii ].isKeyPoint == false) {
                        firstPoint = ii;
                        break;
                    }
                }
                for (var ii = d.new_pos_add.length - 1; ii >= 0; ii--) {
                    if (d.new_pos_add[ ii ].isKeyPoint == false) {
                        lastPoint = ii;
                        break;
                    }
                }

                if (firstPoint == undefined || lastPoint == undefined) return;

                //采样点前面的keyPoint做插值（按照匀速运动）
                var dis2;
                for (var ii = firstPoint - 1; ii >= 0; ii--) {
                    d.new_pos_add[ ii ].speed = d.new_pos_add[ ii + 1 ].speed;
                    d.new_pos_add[ ii ].speed_m = d.new_pos_add[ ii + 1 ].speed_m;
                    dis2 = d.new_pos_add[ ii ].dis_to_next;

                    if (d.new_pos_add[ ii ].speed_m > 0)
                        var delta_t = (dis2 / d.new_pos_add[ ii ].speed_m) * 1000;
                    else
                        var delta_t = 5 * 1000;//人为设置的值
                    d.new_pos_add[ ii ].timestamp = d.new_pos_add[ ii + 1 ].timestamp - delta_t;
                    inter_pos.unshift(d.new_pos_add[ ii ]);
                }

                //最后一个keyPoint做插值（按照匀加速运动）
                if (d.new_pos_add[ d.new_pos_add.length - 1 ].isKeyPoint == true) {
                    d.new_pos_add[ d.new_pos_add.length - 1 ].speed = 0;
                    d.new_pos_add[ d.new_pos_add.length - 1 ].speed_m = 0;
                    var dis = 0;
                    for (var jj = lastPoint; jj < d.new_pos_add.length - 1; jj++) {
                        dis += d.new_pos_add[ jj ].dis_to_next;
                    }
                    var delta_t = (2 * dis / d.new_pos_add[ lastPoint ].speed_m) * 1000;
                    d.new_pos_add[ d.new_pos_add.length - 1 ].timestamp = d.new_pos_add[ lastPoint ].timestamp + delta_t;
                }

                //采样点之间的keyPoint做插值
                var p1_index = firstPoint, p2_index = firstPoint;

                while (p1_index < lastPoint) {
                    var key_array = [];
                    var total_dis = 0;
                    inter_pos.push(d.new_pos_add[ p1_index ]);

                    // 找到距离最近的两个采样点，并收集它们之间的keyPoint
                    for (var pp = p1_index + 1; pp <= lastPoint; pp++) {
                        total_dis += d.new_pos_add[ pp - 1 ].dis_to_next;
                        if (d.new_pos_add[ pp ].isKeyPoint) {
                            key_array.push(d.new_pos_add[ pp ]);
                        }
                        else {
                            p2_index = pp;
                            break;
                        }
                    }
                    // 找到每个keyPoint到p1 p2的距离
                    key_array.forEach(function (k, k_index) {
                        if (k_index == 0) {
                            k.dis1 = d.new_pos_add[ p1_index ].dis_to_next;
                            k.dis2 = total_dis - k.dis1;
                        }
                        else {
                            k.dis1 = key_array[ k_index - 1 ].dis1 + key_array[ k_index - 1 ].dis_to_next;
                            k.dis2 = total_dis - k.dis1;
                        }
                    })

                    //插值
                    var inter_array = self.interpolationAlgorithm(d.trajID, d.new_pos_add[ p1_index ], d.new_pos_add[ p2_index ], key_array, total_dis);
                    inter_array.forEach(function (a) {
                        inter_pos.push(a);
                    })

                    p1_index = p2_index;
                }
                inter_pos.push(d.new_pos_add[ lastPoint ]);

                //后面的采样点做插值
                total_dis = 0;
                key_array = [];
                for (var pp = lastPoint + 1; pp < d.new_pos_add.length; pp++) {
                    total_dis += d.new_pos_add[ pp - 1 ].dis_to_next;
                    if (d.new_pos_add[ pp ].isKeyPoint && pp != d.new_pos_add.length - 1) {
                        key_array.push(d.new_pos_add[ pp ]);
                    }
                }
                // 找到每个keyPoint到p1 p2的距离
                key_array.forEach(function (k, k_index) {
                    if (k_index == 0) {
                        k.dis1 = d.new_pos_add[ p1_index ].dis_to_next;
                        k.dis2 = total_dis - k.dis1;
                    }
                    else {
                        k.dis1 = key_array[ k_index - 1 ].dis1 + key_array[ k_index - 1 ].dis_to_next;
                        k.dis2 = total_dis - k.dis1;
                    }
                })

                //插值
                inter_array = self.interpolationAlgorithm(d.trajID, d.new_pos_add[ lastPoint ], d.new_pos_add[ d.new_pos_add.length - 1 ], key_array, total_dis);
                inter_array.forEach(function (a) {
                    inter_pos.push(a);
                })
                inter_pos.push(d.new_pos_add[ d.new_pos_add.length - 1 ]);

                //替换
                d.new_pos_add = $.extend(true, [], inter_pos);
            });
        },
        passFlightForEachKeyPoint: function (trajData_total) {
            var self = this;
            var keyPointPass = {};

            trajData_total.depPoints.forEach(function (f) {
                var keyPointFilter = f.new_pos_add.filter(function (d) { return d.isKeyPoint; });
                var keyLen = keyPointFilter.length;
                keyPointFilter.forEach(function (kk, ii) {
                    if (!(kk.id in keyPointPass)) keyPointPass[ kk.id ] = [];
                    var obj = {
                        'trajID': f.trajID,
                        'arrDep': 'dep',
                        'callsign': f.callsign,
                        'timestamp': kk.timestamp,
                        'lastKey': ii == 0 ? null : keyPointFilter[ ii - 1 ].id,
                        'nextKey': ii == keyLen - 1 ? null : keyPointFilter[ ii + 1 ].id
                    };
                    keyPointPass[ kk.id ].push(obj);
                })
            })

            trajData_total.arrPoints.forEach(function (f) {
                var keyPointFilter = f.new_pos_add.filter(function (d) { return d.isKeyPoint; });
                var keyLen = keyPointFilter.length;
                keyPointFilter.forEach(function (kk, ii) {
                    if (!(kk.id in keyPointPass)) keyPointPass[ kk.id ] = [];
                    var obj = {
                        'trajID': f.trajID,
                        'arrDep': 'arr',
                        'timestamp': kk.timestamp,
                        'callsign': f.callsign,
                        'lastKey': ii == 0 ? null : keyPointFilter[ ii - 1 ].id,
                        'nextKey': ii == keyLen - 1 ? null : keyPointFilter[ ii + 1 ].id
                    };
                    keyPointPass[ kk.id ].push(obj);
                })
            })

            //按照时间戳排序
            for (var key in keyPointPass) {
                keyPointPass[ key ].sort(function (a, b) {
                    var x = a.timestamp, y = b.timestamp;
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                });
            }

            Datacenter.set('keyPointPass', keyPointPass);
        },
        calAcceleration: function (trajData_total) {
            var self = this;

            // var centerFlight = {'trajID': 'c0bd1de', 'callsign': 'CCA0879'},
            //     relatedFlight = [
            //         {'trajID': 'c0bd07a', 'callsign': 'CCA0933'},
            //         {'trajID': 'c0bd107', 'callsign': 'CCA0939'}
            //     ];

            // centerFlight = trajData_total.depPoints.find(function (d) { return d.trajID == centerFlight.trajID; });
            //
            // var relatedFlight = relatedFlight.map(function (d) {
            //     return trajData_total.depPoints.find(function (dd) { return dd.trajID == d.trajID; });
            // })
            //
            // var stopPoints = centerFlight.new_pos_add.filter(function (d) { return d.speed == 0; });
            // var timeRange = [stopPoints[1].timestamp, stopPoints[2].timestamp];
            //
            // relatedFlight.forEach(function (d) {
            //     d.new_pos_add = d.new_pos_add.filter(function (dd) {
            //         return dd.timestamp >= timeRange[0] && dd.timestamp <= timeRange[1];
            //     });
            // })
            //
            // console.warn(relatedFlight);

            // trajData_total.depPoints.forEach(function (d, i) {
            //     var len = d.new_pos_add.length;
            //     d.new_pos_add.forEach(function (d2, j) {
            //         if (j < len - 1)
            //             d2.acceleration_m = (d.new_pos_add[ j + 1 ].speed_m - d2.speed_m) / ((d.new_pos_add[ j + 1 ].timestamp - d2.timestamp) / 1000);
            //         else
            //             d2.acceleration_m = 0;
            //     })
            // })
        },
        interpolationAlgorithm: function (trajID, p1, p2, key_array, D) {
            var self = this;
            var res_array = [];
            // console.log(p1, p2, D, key_array);

            //异常检测
            if (p1.timestamp == p2.timestamp && p1.lat == p2.lat && p1.lon == p2.lon) return res_array;

            p1.dis1 = 0;
            p1.dis2 = D;
            p2.dis1 = D;
            p2.dis2 = 0;

            var v1 = p1.speed_m, v2 = p2.speed_m, t1 = p1.timestamp / 1000, t2 = p2.timestamp / 1000,
                delta_T = t2 - t1;//单位：秒

            var dis_thres = (v1 * delta_T) / 4 + (v2 * delta_T) / 4;

            if (dis_thres <= D) {
                //存储数组,keypoint相对于midPoint的位置
                var key_front = [], key_mid = [], key_behind = [];

                //midPoint
                var vm = (4 * D / delta_T - v1 - v2) / 2;
                var D1 = (vm + v1) * delta_T / 4, D2 = (vm + v2) * delta_T / 4;
                var tm = t1 + delta_T / 2;

                //相应的直线方程
                var line1 = { 'x1': 0, 'x2': delta_T / 2, 'y1': v1, 'y2': vm },
                    line2 = { 'x1': delta_T / 2, 'x2': delta_T, 'y1': vm, 'y2': v2 };
                self.inter_GetLinePara(line1);
                self.inter_GetLinePara(line2);//ax+by+c = 0, y = (-a/b)x+(-c/b)

                //计算每个keyPoint
                key_array.forEach(function (k) {
                    var time_ans, speed_m_ans, delta_tk;

                    if (k.dis1 < D1) {
                        var para1 = line1.a / line1.b,
                            para2 = (line1.c / line1.b) - v1,
                            para3 = 2 * k.dis1;

                        var res = self.equation(para1, para2, para3);

                        if (res.x1 >= 0 && res.x1 <= delta_T / 2)
                            delta_tk = res.x1;
                        else if (res.x2 >= 0 && res.x2 <= delta_T / 2)
                            delta_tk = res.x2;
                        if (delta_tk == undefined)
                            console.log('wrong1', res.x1, res.x2);

                        time_ans = t1 + delta_tk;
                        speed_m_ans = (-1 * line1.a * delta_tk - line1.c) / line1.b;

                        k.speed_m = speed_m_ans;
                        k.speed = Datacenter.convertSpeedUnit(k.speed_m, "m/s", "kt");
                        k.timestamp = time_ans * 1000;

                        key_front.push(k);
                    }

                    else if (k.dis1 == D1) {
                        time_ans = tm;
                        speed_m_ans = vm;

                        k.speed_m = speed_m_ans;
                        k.speed = Datacenter.convertSpeedUnit(k.speed_m, "m/s", "kt");
                        k.timestamp = time_ans * 1000;

                        key_mid.push(k);
                    }

                    else {
                        var para1 = line2.a / line2.b,
                            para2 = (line2.c / line2.b) - v2 - (line2.a * delta_T / line2.b),
                            para3 = (v2 - (line2.c / line2.b)) * delta_T - 2 * k.dis2;

                        var res = self.equation(para1, para2, para3);

                        if (res.x1 >= delta_T / 2 && res.x1 <= delta_T)
                            delta_tk = res.x1;
                        else if (res.x2 >= delta_T / 2 && res.x2 <= delta_T)
                            delta_tk = res.x2;
                        if (delta_tk == undefined)
                            console.log('wrong2', res.x1, res.x2);

                        time_ans = t1 + delta_tk;
                        speed_m_ans = (-1 * line2.a * delta_tk - line2.c) / line2.b;

                        k.speed_m = speed_m_ans;
                        k.speed = Datacenter.convertSpeedUnit(k.speed_m, "m/s", "kt");
                        k.timestamp = time_ans * 1000;

                        key_behind.push(k)
                    }
                });
                //把它们分别插入
                key_front.forEach(function (k) {
                    res_array.push(k);
                });
                //将中值点是否插入
                if (key_mid.length > 0) {
                    key_mid.forEach(function (k) {
                        res_array.push(k);
                    });
                }
                //midPoint>>>>
                // else {
                //     var neighbor1, neighbor2;
                //
                //     if (key_front.length > 0) neighbor1 = key_front[ key_front.length - 1 ];
                //     else neighbor1 = p1;
                //
                //     if (key_behind.length > 0) neighbor2 = key_behind[ 0 ];
                //     else neighbor2 = p2;
                //
                //     var scale_lat = d3.scale.linear()
                //         .domain([ 0, neighbor1.dis_to_next ])
                //         .range([ neighbor1.lat, neighbor2.lat ]);
                //
                //     var scale_lon = d3.scale.linear()
                //         .domain([ 0, neighbor1.dis_to_next ])
                //         .range([ neighbor1.lon, neighbor2.lon ]);
                //
                //     // console.warn(D1 - neighbor1.dis1, scale_lat(D1 - neighbor1.dis1), neighbor1.dis_to_next)
                //
                //     var mid = {
                //         'isKeyPoint': false,
                //         'isMid': true,
                //         'lat': scale_lat(D1 - neighbor1.dis1),
                //         'lon': scale_lon(D1 - neighbor1.dis1),
                //         'speed_m': vm,
                //         'speed': Datacenter.convertSpeedUnit(vm, "m/s", "kt"),
                //         'timestamp': tm * 1000
                //     };
                //     res_array.push(mid)
                // }
                //midPoint>>>>
                key_behind.forEach(function (k) {
                    res_array.push(k);
                })

                return res_array;
            }

            //dis_thres > D
            else {
                //存储数组,keypoint相对于midPoint的位置
                var key_front = [], key_mid = [], key_behind = [];

                //midPoint
                var delta_tm = 2 * D / (v1 + v2),
                    D1 = v1 * delta_tm / 2, D2 = v2 * delta_tm / 2,
                    tm1 = t1 + delta_tm, tm2 = t2 - delta_tm,
                    vm1 = 0, vm2 = 0;

                //相应的直线方程
                var line1 = { 'x1': 0, 'x2': delta_tm, 'y1': v1, 'y2': vm1 },
                    line2 = { 'x1': delta_T - delta_tm, 'x2': delta_T, 'y1': vm2, 'y2': v2 };
                self.inter_GetLinePara(line1);
                self.inter_GetLinePara(line2);//ax+by+c = 0, y = (-a/b)x+(-c/b)

                //计算每个keyPoint
                key_array.forEach(function (k) {
                    var time_ans, speed_m_ans, delta_tk;

                    if (k.dis1 < D1) {
                        var para1 = line1.a / line1.b,
                            para2 = (line1.c / line1.b) - v1,
                            para3 = 2 * k.dis1;

                        var res = self.equation(para1, para2, para3);

                        if (res.x1 >= 0 && res.x1 <= delta_tm)
                            delta_tk = res.x1;
                        else if (res.x2 >= 0 && res.x2 <= delta_tm)
                            delta_tk = res.x2;
                        if (delta_tk == undefined)
                            console.log('wrong3', res.x1, res.x2);

                        time_ans = t1 + delta_tk;
                        speed_m_ans = (-1 * line1.a * delta_tk - line1.c) / line1.b;

                        // console.log(time_ans, speed_m_ans)

                        k.speed_m = speed_m_ans;
                        k.speed = Datacenter.convertSpeedUnit(k.speed_m, "m/s", "kt");
                        k.timestamp = time_ans * 1000;

                        key_front.push(k);
                    }

                    else if (k.dis1 == D1) {
                        time_ans = tm2;
                        speed_m_ans = vm2;

                        k.speed_m = speed_m_ans;
                        k.speed = Datacenter.convertSpeedUnit(k.speed_m, "m/s", "kt");
                        k.timestamp = time_ans * 1000;

                        key_mid.push(k);
                    }

                    else {
                        var para1 = line2.a / line2.b,
                            para2 = (line2.c / line2.b) - v2 - (line2.a * delta_T / line2.b),
                            para3 = (v2 - (line2.c / line2.b)) * delta_T - 2 * k.dis2;

                        var res = self.equation(para1, para2, para3);

                        if (res.x1 >= delta_T - delta_tm && res.x1 <= delta_T)
                            delta_tk = res.x1;
                        else if (res.x2 >= delta_T - delta_tm && res.x2 <= delta_T)
                            delta_tk = res.x2;
                        if (delta_tk == undefined) {
                            console.log('wrong4', trajID, res.x1, res.x2);
                        }

                        time_ans = t1 + delta_tk;
                        speed_m_ans = (-1 * line2.a * delta_tk - line2.c) / line2.b;

                        // console.log(time_ans);

                        k.speed_m = speed_m_ans;
                        k.speed = Datacenter.convertSpeedUnit(k.speed_m, "m/s", "kt");
                        k.timestamp = time_ans * 1000;

                        key_behind.push(k)
                    }
                });
                //把它们分别插入
                key_front.forEach(function (k) {
                    res_array.push(k);
                });
                //将中值点是否插入
                if (key_mid.length > 0) {
                    //midPoint>>>>
                    // var mid1 = {
                    //     'isKeyPoint': false,
                    //     'isMid': true,
                    //     'lat': key_mid[0].lat,
                    //     'lon': key_mid[0].lon,
                    //     'speed_m': vm1,
                    //     'speed': Datacenter.convertSpeedUnit(vm1, "m/s", "kt"),
                    //     'timestamp': tm1 * 1000
                    // };
                    //
                    // res_array.push(mid1);
                    //midPoint>>>>

                    key_mid.forEach(function (k) {
                        res_array.push(k);
                    });
                }
                //midPoint>>>>
                // else {
                //     var neighbor1, neighbor2;
                //
                //     if (key_front.length > 0) neighbor1 = key_front[ key_front.length - 1 ];
                //     else neighbor1 = p1;
                //
                //     if (key_behind.length > 0) neighbor2 = key_behind[ 0 ];
                //     else neighbor2 = p2;
                //
                //     var scale_lat = d3.scale.linear()
                //         .domain([ 0, neighbor1.dis_to_next ])
                //         .range([ neighbor1.lat, neighbor2.lat ]);
                //
                //     var scale_lon = d3.scale.linear()
                //         .domain([ 0, neighbor1.dis_to_next ])
                //         .range([ neighbor1.lon, neighbor2.lon ]);
                //
                //     // console.warn(D1 - neighbor1.dis1, scale_lat(D1 - neighbor1.dis1), neighbor1.dis_to_next)
                //
                //     var mid1 = {
                //         'isKeyPoint': false,
                //         'isMid': true,
                //         'lat': scale_lat(D1 - neighbor1.dis1),
                //         'lon': scale_lon(D1 - neighbor1.dis1),
                //         'speed_m': vm1,
                //         'speed': Datacenter.convertSpeedUnit(vm1, "m/s", "kt"),
                //         'timestamp': tm1 * 1000
                //     };
                //     var mid2 = {
                //         'isKeyPoint': false,
                //         'isMid': true,
                //         'lat': scale_lat(D1 - neighbor1.dis1),
                //         'lon': scale_lon(D1 - neighbor1.dis1),
                //         'speed_m': vm2,
                //         'speed': Datacenter.convertSpeedUnit(vm2, "m/s", "kt"),
                //         'timestamp': tm2 * 1000
                //     };
                //
                //     res_array.push(mid1);
                //     res_array.push(mid2);
                // }
                //midPoint>>>>

                key_behind.forEach(function (k) {
                    res_array.push(k);
                })

                return res_array;
            }

            // var scale_speed = d3.scale.linear()
            //     .domain([ 0, D ])
            //     .range([ v1, v2 ]);
            //
            // var scale_time = d3.scale.linear()
            //     .domain([ 0, D ])
            //     .range([ t1, t2 ]);
            //
            // key_array.forEach(function (k) {
            //     k.speed_m = scale_speed(k.dis1);
            //     k.speed = Datacenter.convertSpeedUnit(k.speed_m, "m/s", "kt");
            //     k.timestamp = scale_time(k.dis1)* 1000;
            //     res_array.push(k);
            // });

            // res_array.sort(compare1);

            // function compare1 (value1, value2) {
            //     if (value1.timestamp > value2.timestamp) {
            //         return 1;
            //     } else if (value1.timestamp < value2.timestamp) {
            //         return -1;
            //     } else {
            //         return 0;
            //     }
            // }

            // return res_array;
        },
        equation: function (a, b, c) {
            var self = this;

            var t, x1, x2;
            t = b * b - 4 * a * c;
            if (t < 0) {
                console.log("方程的根不存在！");
            }
            else {
                x1 = (-1 * b + Math.sqrt(t)) / (2 * a);
                x2 = (-1 * b - Math.sqrt(t)) / (2 * a);
                return { 'x1': x1, 'x2': x2 };
            }
        },
        interpolationFindNearestRoute: function (p1, p2, passingRouteList) {
            var self = this;
            var routePointData = Datacenter.get('routePointData');
            routePointData = $.extend(true, {}, routePointData);

            if (!p1.isKeyPoint) {
                return p1.nearestRoute;
            }

            else if (!p2.isKeyPoint) {
                return p2.nearestRoute;
            }

            else {
                var a1 = routePointData.Connect_node[ p1.id ].map(function (a) {
                        return a.connectLink;
                    }),
                    a2 = routePointData.Connect_node[ p2.id ].map(function (a) {
                        return a.connectLink;
                    });
                var thisRoute = _.intersection(a1, a2);
                thisRoute = _.intersection(thisRoute, passingRouteList);
                if (thisRoute.length > 1) {
                    console.warn('?????', p1.id, p2.id, trajData);
                }
                return thisRoute[ 0 ];
            }
        },
        calRouteList: function (trajData) {
            var self = this;
            //数据
            var routePointData = Datacenter.get('routePointData');
            if (routePointData == null) return;
            routePointData = $.extend(true, {}, routePointData);
            var ignoreGate = Datacenter.get('ignoreGate');
            //函数全局变量
            var thisGate;
            var keyPointList = [], passingRouteList = [];
            var nearRouteList = {};
            var hasUndefinedPoint = false, totalUndefined = false;

            //没有采样点，提前返回
            if (trajData.pos.length == 0) {
                var newObj = { 'trajID': trajData.trajID, 'keyPointList': [], 'passingRouteList': [] };
                return newObj;
            }

            //找到起始停机位和路径
            if (trajData.gate != undefined)
                thisGate = 'g' + trajData.gate;
            else {
                var min_dis = 100000000000;
                var nearest_gate;
                routePointData.node.forEach(function (n) {
                    if (n.id[ 0 ] == 'g') {
                        var thisGate = {};
                        thisGate.x = self.overlay._map.latLngToContainerPoint(L.latLng(n.lat, n.lon)).x;
                        thisGate.y = self.overlay._map.latLngToContainerPoint(L.latLng(n.lat, n.lon)).y;
                        var pos0 = {};
                        pos0.x = self.overlay._map.latLngToContainerPoint(L.latLng(trajData.pos[ 0 ].loc[ 1 ], trajData.pos[ 0 ].loc[ 0 ])).x;
                        pos0.y = self.overlay._map.latLngToContainerPoint(L.latLng(trajData.pos[ 0 ].loc[ 1 ], trajData.pos[ 0 ].loc[ 0 ])).y;

                        var this_dis = self.distancePointToPoint(pos0, thisGate);
                        if (min_dis > this_dis) {
                            min_dis = this_dis;
                            nearest_gate = n.id;
                        }
                    }
                });
                thisGate = nearest_gate;
            }

            //无效的gate，提前返回
            if ($.inArray(thisGate, ignoreGate) != -1) {
                var newObj = { 'trajID': trajData.trajID, 'keyPointList': [], 'passingRouteList': [] };
                return newObj;
            }

            //停机位及其关联路径
            var firstRoute = self.searchBasedOnPoint(thisGate)[ 0 ];

            passingRouteList.push(firstRoute);
            keyPointList.push(thisGate);

            //根据路径的关联关系寻找航班的移动轨迹
            trajData.pos.forEach(function (d, i) {
                d.x = self.overlay._map.latLngToContainerPoint(L.latLng(d.loc[ 1 ], d.loc[ 0 ])).x;
                d.y = self.overlay._map.latLngToContainerPoint(L.latLng(d.loc[ 1 ], d.loc[ 0 ])).y;
                d.nearRoutes = self.findNearRoutes(d);
                d.nearRoutes.forEach(function (r) {//记录各route的出现次数
                    if (nearRouteList[ r ] == undefined)
                        nearRouteList[ r ] = 1;
                    else
                        nearRouteList[ r ]++;
                });
            });

            //将符合筛选条件的轨迹加入passingRouteList
            trajData.pos.forEach(function (d, i) {
                //删除其他gate的连线
                d.nearRoutes = $.grep(d.nearRoutes, function (r) {
                    var tmp = $.grep(routePointData[ 'link' ], function (l) {
                        return l.id == r;
                    })[ 0 ];
                    return !((tmp.src.id[ 0 ] == 'g' || tmp.dst.id[ 0 ] == 'g') && r != firstRoute);
                });

                //数据清理之后的nearRoutes，如果找不到nearRoute的处理
                if (d.nearRoutes.length == 0) {
                    if (i > 0)
                        d.nearestRoute = trajData.pos[ i - 1 ].nearestRoute;
                }

                if (d.nearRoutes.length == 1) {
                    d.nearestRoute = d.nearRoutes[ 0 ];
                    var thisLen = passingRouteList.length;
                    if (thisLen == 0 || passingRouteList[ thisLen - 1 ] != d.nearestRoute) {
                        passingRouteList.push(d.nearestRoute);
                    }
                }

                if (d.nearRoutes.length > 1) {
                    d.nearRoutes.some(function (r, ii) {
                        var thisLen = passingRouteList.length;

                        if ($.inArray(r, passingRouteList) != -1) {
                            d.nearestRoute = r;
                            if (thisLen == 0 || passingRouteList[ thisLen - 1 ] != r)
                                passingRouteList.push(r);

                            return true;
                        }
                        else {
                            if (nearRouteList[ r ] > 2) {
                                d.nearestRoute = r;
                                passingRouteList.push(r);

                                return true;
                            }
                        }
                    });

                    //若找不到符合上述条件的，则加入距离最近的点
                    if (d.nearestRoute == undefined) {
                        var minDis = 1000000000;
                        var nearest_route;
                        d.nearRoutes.forEach(function (r) {
                            var routeInfo = $.grep(routePointData.link, function (l) { return l.id == r; })[ 0 ];
                            self.GetLinePara(routeInfo);
                            var thisDis = self.distanceSamplePointToRoute(d, routeInfo);

                            if (thisDis < minDis) {
                                minDis = thisDis;
                                nearest_route = r;
                            }
                        });
                        var Len2 = passingRouteList.length;
                        if (Len2 == 0 || passingRouteList[ Len2 - 1 ] != nearest_route) {
                            passingRouteList.push(nearest_route);
                        }
                        d.nearestRoute = nearest_route;
                    }
                }

                if (d.nearestRoute == undefined)
                    hasUndefinedPoint = true;
            });

            //仍然有一些奇怪的点没有找到nearestRoute，则加入与它们最邻近的点
            if (hasUndefinedPoint) {
                trajData.pos.some(function (d, i) {
                    if (d.nearestRoute == undefined) {
                        if (i > 0) {
                            for (var kk = i - 1; kk >= 0; kk--) {
                                if (trajData.pos[ kk ].nearestRoute != undefined) {
                                    d.nearestRoute = trajData.pos[ kk ].nearestRoute;
                                    break;
                                }
                            }

                        }
                        if (d.nearestRoute == undefined && i < trajData.pos.length) {
                            var kk = i + 1;
                            for (var kk = i + 1; kk < trajData.pos.length; kk++) {
                                if (trajData.pos[ kk ].nearestRoute != undefined) {
                                    d.nearestRoute = trajData.pos[ kk ].nearestRoute;
                                    break;
                                }
                            }
                        }
                    }

                })
            }

            //如果有遗漏的路径，则添加进去
            var passingRouteList_new = [];
            for (var index = 0; index < passingRouteList.length - 1; index++) {
                var thisPoint_obj = self.searchBasedOnRoute(passingRouteList[ index ], passingRouteList[ index + 1 ]);
                passingRouteList_new.push(passingRouteList[ index ]);
                //发现遗漏的路径
                if (thisPoint_obj == undefined) {
                    var missingRoutes = self.missingRouteSearch(trajData, thisGate, firstRoute, passingRouteList[ index ], passingRouteList[ index + 1 ]);
                    for (var i2 = 1; i2 < missingRoutes.length - 1; i2++) {
                        passingRouteList_new.push(missingRoutes[ i2 ]);
                    }
                }
            }
            passingRouteList_new.push(passingRouteList[ passingRouteList.length - 1 ]);
            passingRouteList = $.extend(true, [], passingRouteList_new);

            //根据找到的route查询connectPoints
            for (var index = 0; index < passingRouteList.length - 1; index++) {
                var thisPoint_obj = self.searchBasedOnRoute(passingRouteList[ index ], passingRouteList[ index + 1 ]);
                keyPointList.push(thisPoint_obj.connectPoint);
            }

            var newObj = { 'trajID': trajData.trajID, 'keyPointList': keyPointList, 'passingRouteList': passingRouteList };
            return newObj;
        },
        distancePointToPoint: function (p1, p2) {
            var self = this;

            if (p1.x == p2.x && p1.y == p2.y)
                return 0;

            var x = p1.x - p2.x;
            var y = p1.y - p2.y;
            var dis = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            return dis;
        },
        searchBasedOnPoint: function (keyPoint) {
            var self = this;
            var routePointData = Datacenter.get('routePointData');
            if (routePointData == null) return;

            routePointData = $.extend(true, {}, routePointData);

            var array = $.extend(true, [], routePointData[ 'Connect_node' ][ keyPoint ]);
            return array;
        },
        findNearRoutes: function (samplePoint) {
            var self = this;
            var routePointData = Datacenter.get('routePointData');
            if (routePointData == null) return;

            routePointData = $.extend(true, {}, routePointData);

            var routeList = [];
            routePointData.link.forEach(function (thisLink) {
                self.GetLinePara(thisLink);
                var thisDistance = self.distanceSamplePointToRoute(samplePoint, thisLink);
                if (thisDistance < self.distanceThreshold)
                    routeList.push(thisLink.id);
            });
            return routeList;
        },
        distanceSamplePointToRoute: function (samplePoint, thisLink) {
            var self = this;

            var distance = (Math.abs(thisLink.a * samplePoint.x + thisLink.b * samplePoint.y + thisLink.c)) / Math.sqrt(Math.pow(thisLink.a, 2) + Math.pow(thisLink.b, 2));
            var cross_x = (thisLink.b * thisLink.b * samplePoint.x - thisLink.a * thisLink.b * samplePoint.y - thisLink.a * thisLink.c) / (
                thisLink.a * thisLink.a + thisLink.b * thisLink.b);
            var cross_y = (thisLink.a * thisLink.a * samplePoint.y - thisLink.a * thisLink.b * samplePoint.x - thisLink.b * thisLink.c) / (
                thisLink.a * thisLink.a + thisLink.b * thisLink.b);
            if (cross_x >= Math.min(thisLink.x1, thisLink.x2) && cross_x <= Math.max(thisLink.x1, thisLink.x2) &&
                cross_y >= Math.min(thisLink.y1, thisLink.y2) && cross_y <= Math.max(thisLink.y1, thisLink.y2)
            )
                return distance;
            else {
                var endPoint1 = { 'x': thisLink.x1, 'y': thisLink.y1 };
                var endPoint2 = { 'x': thisLink.x2, 'y': thisLink.y2 };
                return Math.min(self.distancePointToPoint(samplePoint, endPoint1), self.distancePointToPoint(samplePoint, endPoint2));
            }
        },
        distanceSamplePointToRoute_forBind: function (samplePoint, thisLink) {
            var self = this;

            var crossingPointInRoute = false;
            var cross_x = (thisLink.b * thisLink.b * samplePoint.x - thisLink.a * thisLink.b * samplePoint.y - thisLink.a * thisLink.c) / (
                thisLink.a * thisLink.a + thisLink.b * thisLink.b);
            var cross_y = (thisLink.a * thisLink.a * samplePoint.y - thisLink.a * thisLink.b * samplePoint.x - thisLink.b * thisLink.c) / (
                thisLink.a * thisLink.a + thisLink.b * thisLink.b);
            if (cross_x >= Math.min(thisLink.x1, thisLink.x2) && cross_x <= Math.max(thisLink.x1, thisLink.x2) &&
                cross_y >= Math.min(thisLink.y1, thisLink.y2) && cross_y <= Math.max(thisLink.y1, thisLink.y2)
            )
                crossingPointInRoute = true;
            var crossingPoint = {
                'lat': self.overlay._map.containerPointToLatLng([ cross_x, cross_y ]).lat,
                'lon': self.overlay._map.containerPointToLatLng([ cross_x, cross_y ]).lng
            };
            var obj = { 'crossingPointInRoute': crossingPointInRoute, 'crossingPoint': crossingPoint };
            return obj;
        },
        searchBasedOnRoute: function (route1, route2) {
            var self = this;
            var routePointData = Datacenter.get('routePointData');
            if (routePointData == null) return;

            routePointData = $.extend(true, {}, routePointData);

            var array = $.extend(true, [], routePointData[ 'Connect_link' ][ route1 ]);
            var point = $.grep(array, function (n) { return n.connectLink == route2; })[ 0 ];
            //可能会有遗漏的route，找不到返回undefined
            return point;
        },
        missingRouteSearch: function (trajData, thisGate, firstRoute, route1, route2) {
            var self = this;
            var routePointData = Datacenter.get('routePointData');
            if (routePointData == null) return;

            routePointData = $.extend(true, {}, routePointData);
            if (route1 == undefined || route2 == undefined)
                console.warn(route1, route2, trajData);

            var thisTrajData = $.extend(true, {}, trajData);
            var gate1 = $.grep(routePointData.node, function (n) {
                return n.id == thisGate;
            })[ 0 ];
            var gateObj = { 'loc': [ gate1.lon, gate1.lat ], 'nearestRoute': firstRoute };
            thisTrajData.pos.unshift(gateObj);

            var route1_loc = $.grep(routePointData.link, function (l) {
                return l.id == route1;
            })[ 0 ];
            var route2_loc = $.grep(routePointData.link, function (l) {
                return l.id == route2;
            })[ 0 ];

            var lat_list = [ route1_loc.src.lat, route1_loc.dst.lat, route2_loc.src.lat, route2_loc.dst.lat ],
                lon_list = [ route1_loc.src.lon, route1_loc.dst.lon, route2_loc.src.lon, route2_loc.dst.lon ];

            var latRange = d3.extent(lat_list),
                lonRange = d3.extent(lon_list);

            //Find important sample point
            var route1_st, route1_ed, route2_st, route2_ed;
            var hasFindAns = false;

            for (var ii = 0; ii < thisTrajData.pos.length - 1; ii++) {
                if (thisTrajData.pos[ ii ].nearestRoute == route1 && thisTrajData.pos[ ii + 1 ].nearestRoute != route1) {
                    route1_ed = ii;
                    for (var jj = route1_ed + 1; jj < thisTrajData.pos.length; jj++) {
                        if (thisTrajData.pos[ jj ].nearestRoute == route2) {
                            route2_st = jj;
                            break;
                        }
                    }
                    break;
                }
            }

            for (var ii = route1_ed; ii >= 0; ii--) {
                if (thisTrajData.pos[ ii ].nearestRoute != route1) {
                    route1_st = ii + 1;
                    break;
                }
            }

            if (route1_st == undefined)
                route1_st = 0;

            for (var ii = route2_st; ii < thisTrajData.pos.length; ii++) {
                if (thisTrajData.pos[ ii ].nearestRoute != route2) {
                    route2_ed = ii - 1;
                    break;
                }
            }

            if (route2_ed == undefined)
                route2_ed = thisTrajData.pos.length - 1;

            var Obj_r1_st = self.overlay._map.latLngToContainerPoint(L.latLng(thisTrajData.pos[ route1_st ].loc[ 1 ], thisTrajData.pos[ route1_st ].loc[ 0 ]));
            var Obj_r1_ed = self.overlay._map.latLngToContainerPoint(L.latLng(thisTrajData.pos[ route1_ed ].loc[ 1 ], thisTrajData.pos[ route1_ed ].loc[ 0 ]));
            var Obj_r2_st = self.overlay._map.latLngToContainerPoint(L.latLng(thisTrajData.pos[ route2_st ].loc[ 1 ], thisTrajData.pos[ route2_st ].loc[ 0 ]));
            var Obj_r2_ed = self.overlay._map.latLngToContainerPoint(L.latLng(thisTrajData.pos[ route2_ed ].loc[ 1 ], thisTrajData.pos[ route2_ed ].loc[ 0 ]));

            var currentArray = [], pathArray = [], result = [], visitedRoute = new Set(), qualifiedRoute = new Set();
            var pathObj = { 'routeName_path': route1, 'linkPoint_path': null };
            var obj = {
                'routeName': route1,
                'fatherName': null,
                'linkPoint': null,
                'path': []
            };
            obj.path.push(pathObj);
            currentArray.push(obj);

            for (var i = 1; i <= 10; i++) {
                var temp = [];

                currentArray.some(function (r) {
                    if (r.routeName == route2) {
                        var path = $.extend(true, [], r.path);
                        var resPathObj = self.calDistance(path, Obj_r1_st, Obj_r1_ed, Obj_r2_st, Obj_r2_ed);

                        if (resPathObj.dis < 100 && resPathObj.isInRightDirection == true) {
                            resPathObj.path.forEach(function (eachP) {
                                result.push(eachP.routeName_path);
                            });
                            hasFindAns = true;
                            return true;
                        }

                        pathArray.push(resPathObj);

                        if (pathArray.length > 15) return true;
                    }
                    else {
                        var tmp2 = $.extend(true, [], routePointData[ 'Connect_link' ][ r.routeName ]);
                        tmp2.forEach(function (t) {

                            if (!visitedRoute.has(t.connectLink)) {
                                visitedRoute.add(t.connectLink);

                                var linkInfo = $.grep(routePointData.link, function (l) {
                                    return l.id == t.connectLink;
                                })[ 0 ];

                                var thisRoute_latRange = d3.extent([ linkInfo.src.lat, linkInfo.dst.lat ]),
                                    thisRoute_lonRange = d3.extent([ linkInfo.src.lon, linkInfo.dst.lon ]);

                                if ((!(thisRoute_latRange[ 1 ] < latRange[ 0 ] ||
                                    thisRoute_latRange[ 0 ] > latRange[ 1 ] ||
                                    thisRoute_lonRange[ 1 ] < lonRange[ 0 ] ||
                                    thisRoute_lonRange[ 0 ] > lonRange[ 1 ])) &&
                                    (linkInfo.src.id[ 0 ] != 'g' && linkInfo.dst.id[ 0 ] != 'g')) {
                                    qualifiedRoute.add(t.connectLink);
                                }
                            }

                            if (qualifiedRoute.has(t.connectLink)) {

                                var isInFatherList = $.grep(r.path, function (pp) {
                                    return pp.routeName_path == t.connectLink;
                                });

                                if ((t.connectLink != r.fatherName && t.connectPoint != r.linkPoint) &&
                                    (isInFatherList.length == 0)) {

                                    var thisPath = $.extend(true, [], r.path);
                                    thisPath.push({ 'routeName_path': t.connectLink, 'linkPoint_path': t.connectPoint });

                                    obj = {
                                        'routeName': t.connectLink,
                                        'fatherName': r.routeName,
                                        'linkPoint': t.connectPoint,
                                        'path': thisPath
                                    };

                                    temp.push(obj);
                                }
                            }
                        })
                    }
                });

                if (hasFindAns) break;

                currentArray = $.extend(true, [], temp);
            }

            if (hasFindAns)
                return result;

            pathArray.sort(self.compare("dis"));

            pathArray.some(function (pp) {
                if (pp.isInRightDirection == true) {
                    pp.path.forEach(function (eachP) {
                        result.push(eachP.routeName_path);
                    });
                    return true;
                }
            });

            if (result.length == 0) {
                if (pathArray.length > 0) {
                    pathArray[ 0 ].path.forEach(function (eachP) {
                        result.push(eachP.routeName_path);
                    })
                }
                else {
                    result = self.missingRouteSearch2(route1, route2);
                }
            }

            return result;
        },
        calDistance: function (p, Obj_r1_st, Obj_r1_ed, Obj_r2_st, Obj_r2_ed) {
            var self = this;
            var routePointData = Datacenter.get('routePointData');
            if (routePointData == null) return;

            routePointData = $.extend(true, {}, routePointData);

            var tmp_path = $.extend(true, [], p);
            var dis = 0;

            var thisNode0 = $.grep(routePointData.node, function (rr) {
                return rr.id == tmp_path[ 1 ].linkPoint_path;
            })[ 0 ];
            tmp_path[ 1 ].x = self.overlay._map.latLngToContainerPoint(L.latLng(thisNode0.lat, thisNode0.lon)).x;
            tmp_path[ 1 ].y = self.overlay._map.latLngToContainerPoint(L.latLng(thisNode0.lat, thisNode0.lon)).y;

            for (var ii = 2; ii < p.length; ii++) {
                var thisNode = $.grep(routePointData.node, function (rr) {
                    return rr.id == tmp_path[ ii ].linkPoint_path;
                })[ 0 ];
                tmp_path[ ii ].x = self.overlay._map.latLngToContainerPoint(L.latLng(thisNode.lat, thisNode.lon)).x;
                tmp_path[ ii ].y = self.overlay._map.latLngToContainerPoint(L.latLng(thisNode.lat, thisNode.lon)).y;

                dis += self.distancePointToPoint(tmp_path[ ii ], tmp_path[ ii - 1 ]);

            }

            var dis1_part2 = self.distancePointToPoint(Obj_r1_ed, tmp_path[ 1 ]),
                dis2_part2 = self.distancePointToPoint(Obj_r2_st, tmp_path[ tmp_path.length - 1 ]);

            dis += dis1_part2;
            dis += dis2_part2;

            var dis1_total = self.distancePointToPoint(Obj_r1_st, tmp_path[ 1 ]),
                dis1_part1 = self.distancePointToPoint(Obj_r1_st, Obj_r1_ed),
                dis2_total = self.distancePointToPoint(Obj_r2_ed, tmp_path[ tmp_path.length - 1 ]),
                dis2_part1 = self.distancePointToPoint(Obj_r2_st, Obj_r2_ed);

            var diff1 = Math.abs(dis1_part1 + dis1_part2 - dis1_total),
                diff2 = Math.abs(dis2_part1 + dis2_part2 - dis2_total);

            var isInRightDirection = false;

            if (diff1 < 15 && diff2 < 15) {
                isInRightDirection = true;
            }

            return { 'path': p, 'dis': dis, 'isInRightDirection': isInRightDirection };
        },
        missingRouteSearch2: function (route1, route2) {
            var self = this;
            var routePointData = Datacenter.get('routePointData');
            if (routePointData == null) return;

            routePointData = $.extend(true, {}, routePointData);

            var totalArray = [], currentArray = [], lastRouteArray = [], temp = [];
            lastRouteArray.push(route1);
            temp = $.extend(true, [], routePointData[ 'Connect_link' ][ route1 ]);
            temp.forEach(function (d) {
                var obj = { 'currentRoute': route1, 'nextRoute': d.connectLink };
                totalArray.push(obj);
                currentArray.push(obj);
            });
            var hasRoute2 = $.grep(currentArray, function (r) {
                return r.nextRoute == route2;
            });
            var ii = 0;
            while (hasRoute2.length == 0 && ii < 10) {
                var currentArray_new = [], lastRouteArray_new = [];

                currentArray.forEach(function (r) {
                    temp = $.extend(true, [], routePointData[ 'Connect_link' ][ r.nextRoute ]);

                    temp.forEach(function (d) {
                        if ($.inArray(d.connectLink, lastRouteArray) == -1) {
                            var obj = { 'currentRoute': r.nextRoute, 'nextRoute': d.connectLink };
                            totalArray.push(obj);
                            currentArray_new.push(obj);
                            lastRouteArray_new.push(r.nextRoute);
                        }
                    });
                });
                currentArray = $.extend(true, [], currentArray_new);
                lastRouteArray = $.extend(true, [], lastRouteArray_new);
                hasRoute2 = $.grep(currentArray, function (r) {
                    return r.nextRoute == route2;
                });
                ii++;
            }
            //如果找到了路径
            var final_route = [];
            final_route.push(route2);
            var start = route2;
            var jj = 0;
            while (start != route1 && jj < 30) {
                var thisRoute = $.grep(totalArray, function (r) {
                    return start == r.nextRoute;
                })[ 0 ];

                final_route.push(thisRoute.currentRoute);
                start = thisRoute.currentRoute;
                jj++;
            }

            var ans = [];
            for (var ii = final_route.length - 1; ii >= 0; ii--) {
                ans.push(final_route[ ii ]);
            }
            return ans;
        },
        GetLinePara: function (thisLink) {
            var self = this;
            // console.log(thisLink);
            thisLink.x1 = self.overlay._map.latLngToContainerPoint(L.latLng(thisLink.src.lat, thisLink.src.lon)).x;
            thisLink.y1 = self.overlay._map.latLngToContainerPoint(L.latLng(thisLink.src.lat, thisLink.src.lon)).y;
            thisLink.x2 = self.overlay._map.latLngToContainerPoint(L.latLng(thisLink.dst.lat, thisLink.dst.lon)).x;
            thisLink.y2 = self.overlay._map.latLngToContainerPoint(L.latLng(thisLink.dst.lat, thisLink.dst.lon)).y;

            thisLink.a = thisLink.y1 - thisLink.y2;
            thisLink.b = thisLink.x2 - thisLink.x1;
            thisLink.c = thisLink.x1 * thisLink.y2 - thisLink.x2 * thisLink.y1;
        },
        inter_GetLinePara: function (thisLink) {
            var self = this;

            thisLink.a = thisLink.y1 - thisLink.y2;
            thisLink.b = thisLink.x2 - thisLink.x1;
            thisLink.c = thisLink.x1 * thisLink.y2 - thisLink.x2 * thisLink.y1;
        },
        getRad: function (d) {
            return d * Math.PI / 180.0;
        },
        getFlatternDistance: function (lat1, lng1, lat2, lng2) {
            var self = this;

            if (lat1 == lat2 && lng1 == lng2)
                return 0;

            var EARTH_RADIUS = 6378137.0;    //单位M

            var radLat1 = self.getRad(lat1);
            var radLat2 = self.getRad(lat2);

            var a = radLat1 - radLat2;
            var b = self.getRad(lng1) - self.getRad(lng2);

            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
            s = s * EARTH_RADIUS;
            s = Math.round(s * 10000) / 10000.0;

            return s;
        },
        compare: function (propertyName) {
            return function (object1, object2) {
                var value1 = object1[ propertyName ];
                var value2 = object2[ propertyName ];
                if (value2 < value1) {
                    return 1;
                } else if (value2 > value1) {
                    return -1;
                } else {
                    return 0;
                }
            }
        },
        updateData: function (_data) {
            var self = this;
            if (_data == null)
                return;

            Datacenter.set('gateTotalNum', _data.gateNode.length);
            Datacenter.set('keyPointTotalNum', _data[ 'node' ].length);
            Datacenter.set('routeTotalNum', _data[ 'link' ].length);

            this.overlay.params({ trajData: _data });
            this.overlay.drawing(this.drawingOnCanvas);
            // console.log()
            this.overlay.redraw();
            // self.render(_data);
        },
        updateRouteShow: function (routeShow) {
            this.routeShow = routeShow;
            this.overlay.redraw();
        },
        render: function (data) {
            var self = this;
            var sel = this.RoutelineSvgOverlay.selection;
            var proj = this.RoutelineSvgOverlay.projection;
            var routeShow = self.mapModel.get('routeShow');

            sel.selectAll(".routeLine").remove();

            var potGs = sel.selectAll('.routeLine')
                .data(data[ 'link' ])
                .enter().append("g")
                .attr("class", "routeLine")
                .classed('hidden', !routeShow);

            potGs.each(function (d) {
                var x1 = proj.latLngToLayerPoint(L.latLng(d.src.lat, d.src.lon)).x;
                var y1 = proj.latLngToLayerPoint(L.latLng(d.src.lat, d.src.lon)).y;
                var x2 = proj.latLngToLayerPoint(L.latLng(d.dst.lat, d.dst.lon)).x;
                var y2 = proj.latLngToLayerPoint(L.latLng(d.dst.lat, d.dst.lon)).y;

                d.x1 = x1;
                d.y1 = y1;
                d.x2 = x2;
                d.y2 = y2;
            });

            var eachRoute = potGs.append("line")
                .attr("class", "routeLine_stroke")
                .attr("x1", function (d) { return d.x1; })
                .attr("y1", function (d) { return d.y1; })
                .attr("x2", function (d) { return d.x2; })
                .attr("y2", function (d) { return d.y2; })
                .style("stroke-width", self.strokeWidth / proj.scale)
                .style("stroke", function (d) {
                    // if(d.id == 'r103' || d.id == 'r238')
                    //     return 'white';
                    // else
                    return 'grey';
                })
                .style('stroke-opacity', 0.3)
                .style('cursor', 'pointer')
                .on("click", function (d) {
                    console.warn(d.id);
                });

        },
        highlightLine: function (selectPoint) {
            var self = this;
            // var sel = this.RoutelineSvgOverlay.selection;
            // var proj = this.RoutelineSvgOverlay.projection;
            //
            // var routePointData = Datacenter.get('routePointData');
            // var routeList = [];
            // routeList = routePointData.Connect_node[ selectPoint ];
            //
            // sel.selectAll(".routeLine_stroke")
            //     .style('stroke', function (d) {
            //         var index = $.inArray(d.id, routeList);
            //         if (index != -1) return 'pink';
            //         else return 'grey';
            //     });
        },
        highlightRoutes: function () {
            var self = this;
            // var sel = this.RoutelineSvgOverlay.selection;
            // var fixed_trajData = Datacenter.get('fixed_trajData');
            //
            // var selected_passingRouteList = $.grep(fixed_trajData.depPoints, function (d) {
            //     return d.trajID == "c0e070c";
            // })[0];
            //
            // sel.selectAll(".routeLine_stroke")
            //     .style('stroke', function (d) {
            //         if ($.inArray(d.id, selected_passingRouteList.passingRouteList) != -1) return 'white';
            //         else return 'grey';
            //     })
            //     .style('stroke-opacity', function (d) {
            //         if ($.inArray(d.id, selected_passingRouteList.passingRouteList) != -1) return 0.8;
            //         else return 0.3;
            //     });
        },
    };

    return RouteLineLayer;
});


