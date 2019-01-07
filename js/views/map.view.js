/**
 * Created by tangzhi.ye on 2016/1/5.
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'config',
    "variables",
    "slider-bootstrap",
    'text!templates/map.tpl',
    "views/layers/trajlayer",
    "views/layers/trajlayerTotal",
    "views/layers/gatePositionlayer",
    "views/layers/airportlayer",
    "views/layers/historyTrajlayer",
    "views/layers/filterlayer",
    "views/layers/polyFilterlayer",
    "views/layers/fixpotFilterlayer",
    "views/layers/routePointlayer",
    "views/layers/routeLinelayer",
    "views/layers/fixed_trajlayer",
    "views/layers/animationlayer",
    'datacenter',
], function(require, Mn, _, $, Backbone, Config, Variables, SliderBootstrap, Tpl, Trajlayer, TrajlayerTotal, GatePositionlayer, Airportlayer, HistoryTrajlayer, Filterlayer, PolyFilterlayer, FixpotFilterlayer, RoutePointlayer, RouteLinelayer, Fixed_trajlayer, AnimationLayer, Datacenter) {
    'use strict';

    return Mn.ItemView.extend({

        tagName: 'div',

        template: function() {
            return _.template(Tpl);
        },

        attributes: {
            'style': 'width: 100%; height:100%;'
        },

        init_system: false,
        filteredData: [],
        arr_filterData: [],
        dep_filterData: [],
        list_table_key: ['A_D', 'Flight', 'Aircraft', 'Schedule', 'Actual', 'Airport', 'Delay'],
        arr_dep: ['depTrajs', 'arrTrajs'],

        initialize: function(options) {
            var self = this;

            window.map = this;
            self.identifier = 'curtimedata';

            options = options || {};

            self.bounds0 = [
                [40.077333, 116.568095],
                [40.076333, 116.571095]
            ];

            var curtime = Config.get('curtime');
            // console.log('%%%%%%');

            self.model.set("filterShow", "filterRemove");
            self.model.set("filterTrajShow", false);

            self.listenTo(self.model, 'change:displayControlShow', function(model, displayControlShow) {
                self.updateControlPanel();
            });

            self.listenTo(self.model, 'change:displayTimelineShow', function(model, displayTimelineShow) {
                self.updateTimelinePanel();
            });

            self.listenTo(self.model, 'change:gateShow', function(model, gateShow) {
                d3.selectAll(".gatePoint").classed("hidden", !gateShow);

                window.map3d.addGatePoints(gateShow)
            });

            self.listenTo(self.model, 'change:gateLabelShow', function(model, gateLabelShow) {
                d3.selectAll(".gatePoint_Label").classed("hidden", !gateLabelShow);

                window.map3d.addGatePointLabels(gateLabelShow)
            });

            self.listenTo(self.model, 'change:keyPointShow', function(model, keyPointShow) {
                d3.selectAll(".routePoint").classed("hidden", true);
                window.map3d.particles.visible = keyPointShow


            });

            self.listenTo(self.model, 'change:keyPointLabelShow', function(model, keyPointLabelShow) {
                d3.selectAll(".routePoint_Label").classed("hidden", !keyPointLabelShow);
            });

            self.listenTo(self.model, 'change:routeShow', function(model, routeShow) {
                // d3.selectAll(".routeLine").classed("hidden", !routeShow);

                // console.log('routeShow',routeShow)
                var routeLinelayer = self.model.get("layers")['routeLinelayer'];
                routeLinelayer.updateRouteShow(routeShow);

                window.map3d.rendererRoute(routeShow);


            });

            self.listenTo(self.model, 'change:airportShow', function(model, airportShow) {
                d3.selectAll(".airport").classed("hidden", !airportShow);
                d3.selectAll(".airport_tip_g").classed("hidden", !airportShow);
            });

            self.listenTo(self.model, 'change:arrShow', function(model, arrShow) {
                Datacenter.set('arrShow', arrShow);

                var trajlayer = self.model.get("layers")['trajlayer'];
                trajlayer.updateArrShow(arrShow);
                var trajlayerTotal = self.model.get("layers")['trajlayerTotal'];
                trajlayerTotal.updateArrShow(arrShow);
                var fixed_trajlayer = self.model.get("layers")['fixed_trajlayer'];
                fixed_trajlayer.updateArrShow(arrShow);
                self.update_filteredData();

                self.animationlayer.updateData()
                self.animationlayer.renderCircle(Config.get('lastRenderTime'))
                window.map3d.renderIcon(Config.get('lastRenderTime'))
            });

            self.listenTo(self.model, 'change:depShow', function(model, depShow) {
                Datacenter.set('depShow', depShow);

                var trajlayer = self.model.get("layers")['trajlayer'];
                trajlayer.updateDepShow(depShow);
                var trajlayerTotal = self.model.get("layers")['trajlayerTotal'];
                trajlayerTotal.updateDepShow(depShow);
                var fixed_trajlayer = self.model.get("layers")['fixed_trajlayer'];
                fixed_trajlayer.updateDepShow(depShow);
                self.update_filteredData();

                self.animationlayer.updateData()
                self.animationlayer.renderCircle(Config.get('lastRenderTime'))
                window.map3d.renderIcon(Config.get('lastRenderTime'))
            });

            self.listenTo(self.model, 'change:fixedTrajShow', function(model, fixedTrajShow) {
                var fixed_trajlayer = self.model.get("layers")['fixed_trajlayer'];
                fixed_trajlayer.updateFixedTrajShow(fixedTrajShow);
            });

            self.listenTo(self.model, 'change:airplaneShow', function(model, airplaneShow) {
                var animationlayer = self.model.get("layers")['animationlayer'];
                animationlayer.updateAirplaneShow(airplaneShow);
            });

            self.listenTo(self.model, 'change:samplePointShow', function(model, samplePointShow) {
                var trajlayerTotal = self.model.get("layers")['trajlayerTotal'];
                trajlayerTotal.updateOriPointsShow(samplePointShow);
            });

            self.listenTo(self.model, 'change:trajectoryShow', function(model, trajectoryShow) {
                var trajlayer = self.model.get("layers")['trajlayer'];
                trajlayer.updateHistoryTrajShow(trajectoryShow);
            });

            self.listenTo(Config, 'change:filterShow', function(model, filterShow) {
                self.updateCursor(filterShow);

                var filterlayer = self.model.get("layers")['filterlayer'];
                filterlayer.updateFilterShow(filterShow);

                // var polyFilterlayer = self.model.get("layers")['polyFilterlayer'];
                // polyFilterlayer.updateFilterShow(filterShow);
                //清除右边所有视图
                if (filterShow == 'filterDeleteAll') {
                    Datacenter.removeAllView();
                }
            });

            self.listenTo(Datacenter, 'change:filterFlightList', function(model, filterFlightList) {
                // console.warn('change:filterFlightList', filterFlightList);

                var trajlayerTotal = self.model.get("layers")['trajlayerTotal'];
                trajlayerTotal.updateFilterTraj();
                var trajlayer = self.model.get("layers")['trajlayer'];
                trajlayer.updateFilterTraj();
                var fixed_trajlayer = self.model.get("layers")['fixed_trajlayer'];
                fixed_trajlayer.updateFilterTraj();
                self.get_filter_data();

                // var curTime = Config.get('curTime')

                // self.animationlayer.renderTraj(Datacenter.get('filterArray'));
                // self.animationlayer.renderCircle(curTime - 15000);
            });

            self.listenTo(Datacenter, 'change:gateTotalNum', function(model, gateTotalNum) {
                $('#gateTotalNum').html('Gate&nbsp;<span class="badge gate_total_num_badge">' + gateTotalNum + '</span>')
            });

            self.listenTo(Datacenter, 'change:flightNum', function(model, flightNum) {
                $('#flightNum').html('Flight&nbsp;<span class="badge flight_total_num_badge">' + flightNum.totalNum + '</span>' +
                    '&nbsp;<span class="badge flight_dep_num_badge">' + flightNum.depNum + '</span>' +
                    '&nbsp;<span class="badge flight_arr_num_badge">' + flightNum.arrNum + '</span>')
            });

            self.listenTo(Datacenter, 'change:pointTotalNum', function(model, pointTotalNum) {
                $('#pointTotalNum').html('Sample Point&nbsp;<span class="badge point_total_num_badge">' + pointTotalNum + '</span>')
            });

            self.listenTo(Datacenter, 'change:keyPointTotalNum', function(model, keyPointTotalNum) {
                $('#keyPointTotalNum').html('Key Point&nbsp;<span class="badge keyPoint_total_num_badge">' + keyPointTotalNum + '</span>')
            });

            self.listenTo(Datacenter, 'change:routeTotalNum', function(model, routeTotalNum) {
                $('#routeTotalNum').html('Route&nbsp;<span class="badge route_num_badge">' + routeTotalNum + '</span>')
                $('#gateTotalNum').html('Gate&nbsp;<span class="badge gate_total_num_badge">' + Datacenter.get('gateTotalNum') + '</span>')
            });

            self.listenTo(Config, 'change:StartTimeRange', function(moddel, StartTimeRange) {
                Datacenter.readDataFromLocal();
            });

            self.listenTo(Config, 'change:EndTimeRange', function(moddel, EndTimeRange) {
                Datacenter.readDataFromLocal();
            });
        },
        onShow: function() {
            var self = this;

            self.updateScale();
            self.initMap();
            self.initLayers();
            self.updateTimetext();
            self.initControlPanel();
            self.initTimelinePanel();
            self.initAirportPanel();

            self.listenTo(Config, 'change:curTime', function(model, curtime) {
                // self.updateTimetext();
                // Datacenter.removeAllView();
                // console.log('curtime', curtime)
                // self.animationlayer.updateData()
                self.animationlayer.renderCircle(curtime)
                window.map3d.renderIcon(curtime)
            });

            self.listenTo(Config, 'change:slidingwindowsize', function(model, slidingwindowsize) {
                // self.updateTimetext();
                // Datacenter.removeAllView();
                self.animationlayer.updateData()
                self.animationlayer.renderCircle(Config.get('curTime'))
                window.map3d.renderIcon(Config.get('curTime'))
                window.map3d.renderAxisbyTime()


                if (slidingwindowsize % 60000 == 0)
                    var time = slidingwindowsize / 60000 + 'min'
                else
                    var time = Math.round(slidingwindowsize / 1000) + 's'

                $("#winSizeDropdown button").html(time + ' <span class=\"caret\"></span>');
            });

            self.listenTo(Config, 'change:slideWindowL', function(model, slideWindowL) {
                self.animationlayer.updateData()
                self.animationlayer.renderCircle(Config.get('curTime'))
                window.map3d.renderIcon(Config.get('curTime'))
                window.map3d.renderAxisbyTime()

                if (!self.init_system) {
                    Datacenter.removeAllView();
                    // console.warn('232');
                    self.init_system = true;
                }

                if (slideWindowL > Config.get('centerFlightMaxTime') && Datacenter.get('centerFlight') != null) {
                    console.log("slideWindowL set Center null")
                    Datacenter.set('centerFlight', null)
                    Datacenter.set('relatedflightList', null)
                    Datacenter.set('selected_trajID', [])
                }
            });

            self.listenTo(Config, 'change:slideWindowR', function(model, slideWindowR) {
                // console.log(slideWindowR)
                // console.log(Config.get('centerFlightMinTime'))
                // console.log(Config.get('curTime'))
                if (slideWindowR < Config.get('centerFlightMinTime') && Datacenter.get('centerFlight') != null) {

                    console.log("slideWindowR set Center null")
                    Datacenter.set('centerFlight', null)
                    Datacenter.set('relatedflightList', null)
                    Datacenter.set('selected_trajID', [])
                }
            });

            // self.listenTo(Datacenter, 'change:filterArray', function(model, filterArray) {
            //     // self.animationlayer.updateData()
            //     self.animationlayer.renderCircle(Config.get('curTime'))
            // });
            self.listenTo(Datacenter, 'change:selected_trajID', function(model, selected_trajID) {
                // console.log(selected_trajID)
                self.highlight_tr();
                var trajlayerTotal = self.model.get("layers")['trajlayerTotal'];
                trajlayerTotal.updateFilterTraj();
                var trajlayer = self.model.get("layers")['trajlayer'];
                trajlayer.updateFilterTraj();
                var fixed_trajlayer = self.model.get("layers")['fixed_trajlayer'];
                fixed_trajlayer.updateFilterTraj();

                // console.log(self.animationlayer.animationOverlay.projection)
                d3.selectAll('.bindLine').style('stroke-width', 2 / self.animationlayer.animationOverlay.projection.scale)


                var curTime = Config.get('curTime')

                self.animationlayer.renderTraj(Datacenter.get('filterArray'));
                self.animationlayer.renderCircle(Config.get('lastRenderTime'));

                // if (selected_trajID.length != 0) {
                //     // d3.selectAll('.bindLine').attr('opacity', .5)
                //     d3.selectAll('.bindLine').style('stroke', '#999')

                //     selected_trajID.forEach(function(d, i) {
                //         // d3.selectAll('.' + d).style('stroke-width', 3.5 / self.animationlayer.animationOverlay.projection.scale)
                //         // d3.selectAll('.' + d).attr('opacity', 1)
                //         d3.selectAll('.' + d).each(function(d, i) {
                //             var gradient = d3.select(this).attr("id")
                //             d3.select(this).style('stroke', gradient)
                //         })
                //     })
                // } else {
                //     // d3.selectAll('.bindLine').attr('opacity', 1)

                //     d3.selectAll('.bindLine').each(function(d, i) {
                //         var gradient = d3.select(this).attr("id")
                //         d3.select(this).style('stroke', gradient)
                //     })
                // }

            });

            self.listenTo(Datacenter, 'change:beijingfixpotsShowTip', function(model, beijingfixpotsShowTip) {
                // var trajlayer = self.model.get("layers")['trajlayer'];
                // trajlayer.updateFixpotFilter();
            });

            self.listenTo(Datacenter, 'change:fixpot_filter', function(model, fixpot_filter) {
                // var trajlayer = self.model.get("layers")['trajlayer'];
                // trajlayer.updateFixpotFilter();
            });
        },
        updateTimetext: function() {
            var timestamp = Config.get("curtime")
            var dateStr = timeuitl.formateDate(timestamp);
            var timeStr = timeuitl.formateTime(timestamp);
            $(this.$el).find("#mapDate").html(dateStr);
            $(this.$el).find("#mapTime").html(timeStr);

            var dateStr = timeuitl.formateDate(timestamp);
            var timeStart = timeuitl.formateTime(timestamp - Config.get('slidingwindowsize'));
            var timeEnd = timeuitl.formateTime(timestamp);

            $("#currentDate").html(dateStr);
            $("#currentSTime").html(timeStart);
            $("#currentETime").html(timeEnd);

        },
        _clickHandler: function(e) {
            var self = this;
        },
        initMap: function() {
            var self = this;
            var latlng = L.latLng(40.072805, 116.593355); //location of Beijing
            // var latlng = L.latLng(40.096805,116.588355);
            self.svgLayers = {}; // key is md5 or traj laycontainer

            self.map = L.map('mapBackground', {
                center: latlng,
                zoom: Config.get("curScale"),
                attributionControl: false, //不显示右下角的标记
                zoomControl: true, //不显示放大缩小的按钮
                minZoom: 2,
                maxBounds: [
                    [-90, -20],
                    [90, 340]
                ]
            });
            self.model.set("map", self.map);

            // var accessToken = 'pk.eyJ1IjoieWV0YW5nemhpIiwiYSI6ImNpajFrdmJ1aDAwYnF0b2x6cDA2bndybjgifQ.g9phAioL8kT5ik4jGg6kNQ';
            // var accessToken = 'pk.eyJ1IjoieXVlY2hlbmciLCJhIjoiY2pleHh4d3pyMDBvdTJxbXhiZzljY2s2aiJ9.do4lcR7cKF4B9vdMqUgQKQ';
            // var style = "dark"; // emerald,light,dark
            // var tileLayer = L.tileLayer('https://api.mapbox.com/v4/mapbox.' + style + '/{z}/{x}/{y}.png?access_token=' + accessToken);
            // var tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png');

            // tileLayer.addTo(self.map);

            var tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {

                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

            }).addTo(self.map);

            self.map.scrollWheelZoom.disable();

            self.map.on("moveend", function() {

                self.updateParaPanel();


            });

            self.updateParaPanel();

            self.map.on('zoomend', function() {
                // drawGrid();
                self.model.set('layerProjection', self.animationlayer.animationOverlay.projection.scale)

                // var curTime = Config.get('curTime')
                // self.animationlayer.renderTraj(Datacenter.get('filterArray'));
                // self.animationlayer.renderCircle(curTime - 1);


                var curTime = Config.get('curTime')

                self.animationlayer.renderTraj(Datacenter.get('filterArray'));
                self.animationlayer.renderCircle(Config.get('lastRenderTime'));

                // var selected_trajID = Datacenter.get('selected_trajID')

                // if (selected_trajID.length != 0) {
                //     // d3.selectAll('.bindLine').attr('opacity', .5)
                //     d3.selectAll('.bindLine').style('stroke', '#999')

                //     selected_trajID.forEach(function(d, i) {
                //         // d3.selectAll('.' + d).style('stroke-width', 3.5 / self.animationlayer.animationOverlay.projection.scale)
                //         // d3.selectAll('.' + d).attr('opacity', 1)
                //         d3.selectAll('.' + d).each(function(d, i) {
                //             var gradient = d3.select(this).attr("id")
                //             d3.select(this).style('stroke', gradient)
                //         })
                //     })
                // } else {
                //     // d3.selectAll('.bindLine').attr('opacity', 1)

                //     d3.selectAll('.bindLine').each(function(d, i) {
                //         var gradient = d3.select(this).attr("id")
                //         d3.select(this).style('stroke', gradient)
                //     })
                // }
            });

            // self.map.on("click", function(){

            //     Datacenter.set("selected_trajID", new Array())

            // })

        },
        initLayers: function() {
            var self = this;

            self.gatePositionlayer = new GatePositionlayer(self.map, self.model, "gatePositionlayer");
            self.gatePositionlayer.init(Datacenter.get('gatePositionData'));
            self.model.get("layers")['gatePositionlayer'] = self.gatePositionlayer;

            self.routeLinelayer = new RouteLinelayer(self.map, self.model, "routeLinelayer");
            self.routeLinelayer.init(Datacenter.get('routePointData'));
            self.model.get("layers")['routeLinelayer'] = self.routeLinelayer;

            self.fixed_trajlayer = new Fixed_trajlayer(self.map, self.model, "fixed_trajlayer");
            self.fixed_trajlayer.init(Datacenter.get('fixed_trajData'));
            self.model.get("layers")['fixed_trajlayer'] = self.fixed_trajlayer;

            self.animationlayer = new AnimationLayer(self.map, self.model, "animationlayer");
            self.animationlayer.init();
            self.model.get("layers")['animationlayer'] = self.animationlayer;


            self.routePointlayer = new RoutePointlayer(self.map, self.model, "routePointlayer");
            self.routePointlayer.init(Datacenter.get('routePointData'));
            self.model.get("layers")['routePointlayer'] = self.routePointlayer;

            var trajData = Datacenter.get('trajData');

            // self.historyTrajlayer = new HistoryTrajlayer(self.map, "historyTrajlayer");
            self.trajlayerTotal = new TrajlayerTotal(self.map, "trajlayerTotal");
            self.trajlayer = new Trajlayer(self.map, "trajlayer");

            var timeStart = new Date(2016, 11, 15, 0).getTime();
            var timeEnd = new Date(2016, 11, 15, 1).getTime();

            self.listenTo(Datacenter, 'change:origin_point_data', function(model, origin_point_data) {
                self.trajlayer.updateData(origin_point_data);
                self.trajlayerTotal.updateData(origin_point_data);
                self.routeLinelayer.findPassingRoutes();
            });

            self.listenTo(Datacenter, 'change:gatePositionData', function(model, gatePositionData) {
                self.gatePositionlayer.updateData(gatePositionData);
            });

            self.listenTo(Datacenter, 'change:routePointData', function(model, routePointData) {
                console.warn('change:routePointData');
                self.routeLinelayer.updateData(routePointData);
                self.routePointlayer.updateData(routePointData);
                self.routeLinelayer.findPassingRoutes();
            });

            self.listenTo(Datacenter, 'change:selectPoint', function(model, selectPoint) {
                self.routeLinelayer.highlightLine(selectPoint);
            });

            self.listenTo(Datacenter, 'change:selected_trajID', function(model, selected_trajID) {
                self.routeLinelayer.highlightRoutes();
                self.routePointlayer.highlightPoints();
            });

            self.listenTo(Datacenter, 'change:fixed_trajData', function(model, fixed_trajData) {
                console.warn('change:fixed_trajData');
                self.fixed_trajlayer.updateData(fixed_trajData);
                self.routeLinelayer.highlightRoutes();
                self.routePointlayer.highlightPoints();
            });

            self.listenTo(Datacenter, 'change:centerFlight', function(model, centerFlight) {
                console.warn("centerFlight", centerFlight)
                self.updateCurTimeToCenterFlight(centerFlight);
                self.fixed_trajlayer.calRelatedFlights(centerFlight);

                var curTime = Config.get('curTime')

                self.animationlayer.updateData();
                self.animationlayer.renderTraj(Datacenter.get('filterArray'));
                self.animationlayer.renderCircle(curTime);
            });

            var origin_point_data = Datacenter.get('origin_point_data');
            // self.historyTrajlayer.init(trajDataNew);
            self.trajlayerTotal.init(origin_point_data);
            self.trajlayer.init(origin_point_data);

            self.listenTo(Config, 'change:colorMappingSelection', function(model, colorMappingSelection) {
                console.warn("change:colorMappingSelection");
                var trajlayerTotal = self.model.get("layers")['trajlayerTotal'];
                trajlayerTotal.updateFilterTraj();
                var trajlayer = self.model.get("layers")['trajlayer'];
                trajlayer.updateFilterTraj();
                var fixed_trajlayer = self.model.get("layers")['fixed_trajlayer'];
                fixed_trajlayer.updateFilterTraj();
                self.get_filter_data();
            });

            self.listenTo(Config, 'change:focusLocation', function(model, focusLocation) {
                self.updateFocusLocation(focusLocation);
            });

            self.listenTo(Config, 'change:currentCenterAirport', function(model, currentCenterAirport) {
                d3.select('#CenterAirport').html(currentCenterAirport);
                self.updateCenterAirport(currentCenterAirport);
            });

            self.listenTo(Datacenter, 'change:flightGraphData', function(model, flightGraphData) {
                // self.get_RelatedFlight_data();
            });

            // self.model.get("layers")['historyTrajlayer'] = self.historyTrajlayer;
            self.model.get("layers")['trajlayerTotal'] = self.trajlayerTotal;
            self.model.get("layers")['trajlayer'] = self.trajlayer;

            var airports = Datacenter.get("airportsArr");
            var airportData = { "airports": airports };
            var airportOption = {
                "zoomDraw": true, // redraw after zoom
                "airports": Datacenter.get("airportsArr"),
                "map": self.map,
                "model": self.model,
            };
            self.airportlayer = new Airportlayer(self.map, airportOption, "airportlayer", Datacenter.timelineModel);
            self.airportlayer.init(airportOption);
            self.model.get("layers")['airportlayer'] = self.airportlayer;
            var airportShow = self.model.get("airportShow");

            d3.selectAll(".leaflet-marker-pane").classed("hidden", !airportShow);
            d3.selectAll(".leaflet-shadow-pane").classed("hidden", !airportShow);
            //circle filter
            self.filterlayer = new Filterlayer(self.map, "filterlayer");
            self.filterlayer.init();
            self.model.get("layers")['filterlayer'] = self.filterlayer;
            // //polygon filter
            //           self.polyFilterlayer = new PolyFilterlayer(self.map, "polyFilterlayer");
            //           self.polyFilterlayer.init();
            //           self.model.get("layers")['polyFilterlayer'] = self.polyFilterlayer;
            // //fixpot filter
            //           self.fixpotFilterlayer = new FixpotFilterlayer(self.map, "fixpotFilterlayer");
            //           self.fixpotFilterlayer.init();
            //           self.model.get("layers")['fixpotFilterlayer'] = self.fixpotFilterlayer;
        },
        initControlPanel: function() {
            var self = this;

            $('.leaflet-control-zoom-in').click(function() {
                d3.selectAll('#focusLocationBtnGroup label').classed('active', false);
                Config.set("curScale", self.map._zoom + 1);
            });
            $('.leaflet-control-zoom-out').click(function() {
                d3.selectAll('#focusLocationBtnGroup label').classed('active', false);
                Config.set("curScale", self.map._zoom - 1);
            });
            $('#FixptsHistogramShow').click(function() {
                var fixptsHistogramShowVar = Datacenter.get("fixptsHistogramShowVar");
                fixptsHistogramShowVar = !fixptsHistogramShowVar;
                d3.select('#fixptsHistogram_real').classed('hidden', fixptsHistogramShowVar);
                Datacenter.set("fixptsHistogramShowVar", fixptsHistogramShowVar);
            });
            $(self.$el).find("#displayControlTitle").click(function() {
                var displayControlShow = self.model.get("displayControlShow");
                displayControlShow = !displayControlShow;
                self.model.set("displayControlShow", displayControlShow);
            });

            if (self.model.get("fixedTrajShow"))
                d3.select("#fixedTraj-check").attr("checked", "checked");

            if (self.model.get("airplaneShow"))
                d3.select("#airplane-check").attr("checked", "checked");

            if (self.model.get("samplePointShow"))
                d3.select("#samplePoint-check").attr("checked", "checked");

            if (self.model.get("routeShow"))
                d3.select("#route-check").attr("checked", "checked");

            if (self.model.get("keyPointShow"))
                d3.select("#keyPoint-check").attr("checked", "checked");

            $("#flightTypeBtnGroup label").click(function(evt) {
                var arr_dep = evt.target.getAttribute("value");
                if (arr_dep == 'depFlight')
                    self.model.set('depShow', !Datacenter.get('depShow'));
                if (arr_dep == 'arrFlight')
                    self.model.set('arrShow', !Datacenter.get('arrShow'));
                // console.warn('flightTypeBtnGroup click!!', arr_dep);
            });

            // $('#arrShow-check').change(function() {
            //     self.model.set("arrShow", this.checked);
            // });
            // $('#depShow-check').change(function() {
            //     console.log(this.checked);
            //     self.model.set("depShow", this.checked);
            // });
            $('#fixedTraj-check').change(function() {
                self.model.set("fixedTrajShow", this.checked);
            });
            $('#airplane-check').change(function() {
                self.model.set("airplaneShow", this.checked);
            });
            $('#samplePoint-check').change(function() {
                self.model.set("samplePointShow", this.checked);
            });
            $('#trajectory-check').change(function() {
                self.model.set("trajectoryShow", this.checked);
            });
            $('#gate-check').change(function() {
                self.model.set("gateShow", this.checked);
            });
            $('#gateLabel-check').change(function() {
                self.model.set("gateLabelShow", this.checked);
            });

            $('#keyPoint-check').change(function() {
                self.model.set("keyPointShow", this.checked);
            });

            $('#keyPointLabel-check').change(function() {
                self.model.set("keyPointLabelShow", this.checked);
            });

            $('#route-check').change(function() {
                self.model.set("routeShow", this.checked);
            });

            $("#To3d").click(function() {

                if (d3.select("#map3d").classed('hidden')) {


                    //change style

                    $("#timeline").css({ 'background-color': '#252525' });
                    $("#ProjectTitle").css({ 'background-color': '#252525' });

                    // console.log("to3d")

                    var width = $("#mapid").width();
                    var height = $("#mapid").height();

                    self.minBound = self.map.containerPointToLatLng(new L.Point(0, 0));
                    self.maxBound = self.map.containerPointToLatLng(new L.Point(width, height));

                    // for (var i = map3d.group.children.length - 1; i >= 0; i--) {
                    //     map3d.group.remove(map3d.group.children[i]);
                    // }
                    // d3.selectAll(".text-label").remove()


                    $("#mapBackground").addClass("hidden");
                    $("#map3d").removeClass("hidden");
                    $("#building-div").removeClass("hidden");
                    $("#keyPoint-div").removeClass("hidden");
                    $("#viewDropdown-div").removeClass("hidden");
                    $("#camera-div").removeClass("hidden");




                    window.map3d.rendererMap();
                    window.map3d.renderAxisbyTime();

                    window.map3d.scene.remove(window.map3d.scene.getObjectByName('airRoute'))
                    window.map3d.rendererRoute()
                    // map3d.renderCubes();
                    // map3d.renderTrajectoriesbyTime();
                    // map3d.renderAxisbyTime();


                    window.map3d.renderTrajectoriesbyTime(Datacenter.get('filterArray'))
                    window.map3d.renderIcon(Config.get('curTime'))

                }

            })

            // $("#To2d").click(function () {
            //     if(d3.select("#mapBackground").classed('hidden')) {
            //
            //         $("#timeline").css({'background-color':'#111'});
            //         $("#ProjectTitle").css({'background-color':'#111'});
            //
            //         $("#map3d").addClass("hidden");
            //         $("#mapBackground").removeClass("hidden");
            //     }
            // })



            var parseDate = d3.time.format("%Y%m%d").parse;
            var dateFormat = d3.time.format("%Y-%m-%d");
            var dateFormat2 = d3.time.format("%Y%m%d");
            var sliderStep = 1 * 24 * 60 * 60 * 1000;

            // console.log(parseDate(Config.get('StartTotalFile')).getTime())
            //
            // var sliderRange = new SliderBootstrap('#slider-range', {
            //     range: true,
            //     min: parseDate(Config.get('StartTotalFile')).getTime(),
            //     max: parseDate(Config.get('EndTotalFile')).getTime(),
            //     step: sliderStep,
            //     value: [parseDate(Config.get('StartTimeRange')).getTime(), parseDate(Config.get('EndTimeRange')).getTime()],
            //     tooltip: 'hide',
            // });
            //
            // sliderRange.on('slide', function() {
            //         $("#timeRangeText").html(dateFormat(new Date(sliderRange.getValue()[0])) + " ~ " + dateFormat(new Date(sliderRange.getValue()[1])));
            //     })
            //     .on('slideStop', function() {
            //         Config.set('StartTimeRange', dateFormat2(new Date(sliderRange.getValue()[0])));
            //         Config.set('EndTimeRange', dateFormat2(new Date(sliderRange.getValue()[1])));
            //     });

            // $("#timeRangeText").html(dateFormat(new Date(sliderRange.getValue()[0])) + " ~ " + dateFormat(new Date(sliderRange.getValue()[1])));
            //
            // $("#filterBtnGroup label").click(function(evt) {
            //     var filterShow = evt.target.getAttribute("value");
            //     Config.set("filterShow", filterShow);
            // });

            // $("#colorMappingGroup input").click(function(evt) {
            //     var colorMappingSelection = evt.target.getAttribute("id");
            //     Config.set("colorMappingSelection", colorMappingSelection);
            // });

            $("#callsignSelectedBtn").click(function(evt) {
                var callsign = $("#callsignSelectedValue").val();
                if (!callsign) return;

                if (Datacenter.get('centerFlight') == null)
                    Datacenter.set('timeBeforeCenterSearch', Config.get('curTime'));

                var fixed_trajData = Datacenter.get('fixed_trajData');
                var thisTrajData = $.grep(fixed_trajData.totalPoint, function(d) {
                    return d.callsign == callsign;
                });
                if (thisTrajData.length == 0) return;
                var thisTrajID = null;
                for (var ii = 0; ii < thisTrajData.length; ii++) {
                    if (thisTrajData[ii].pos.length == 0)
                        continue;
                    else {
                        thisTrajID = thisTrajData[ii].trajID;
                        break;
                    }
                }
                if (thisTrajID != null) {
                    Datacenter.removeAllView();
                    console.warn('680');
                    Datacenter.set('centerFlight', thisTrajID);
                }
            });

            $("#callsignSelectRemoveBtn").click(function(evt) {
                var centerFlight = Datacenter.get('centerFlight');
                if (centerFlight != null) {
                    Datacenter.removeAllView();
                    console.warn('689');
                    var timeBeforeCenterSearch = Datacenter.get('timeBeforeCenterSearch');
                    Config.set('curTime', timeBeforeCenterSearch);
                    $('#callsignSelectedValue').val('');
                }
            });

            $("#focusLocationBtnGroup label").click(function(evt) {
                var location = evt.target.getAttribute("value");
                Config.set("focusLocation", location);
            });

            $("#resetFixpotSelection").click(function(evt) {
                Datacenter.set("beijingfixpotsShowTip", []);
                d3.selectAll('.beijingfixpot_tip_border').classed("hidden", function(d) {
                    var tmp2 = Datacenter.get("beijingfixpotsShowTip");
                    var beijingfixpotsShowTip = $.extend(true, [], tmp2);

                    var index = $.inArray(d.name, beijingfixpotsShowTip);
                    if (index == -1) { return true; } else { return false; }
                });
            });
        },
        updateParaPanel: function() {
            var self = this;

            var lt = self.map.latLngToContainerPoint(L.latLng(self.bounds0[0][0], self.bounds0[0][1]));
            var br = self.map.latLngToContainerPoint(L.latLng(self.bounds0[1][0], self.bounds0[1][1]));

            self.lenPerLati = (br.y - lt.y) / (self.bounds0[0][0] - self.bounds0[1][0]);
            self.lenPerLong = (br.x - lt.x) / (self.bounds0[1][1] - self.bounds0[0][1]);

            var width = $("#map").width();
            var height = $("#map").height();


            self.centerLL = self.map.containerPointToLatLng(new L.Point(width / 2, height / 2));
            // console.log(self.centerLL)
            $("#info1").text("lat: " + self.centerLL.lat.toFixed(3) + " lng: " + self.centerLL.lng.toFixed(3))
            $("#info2").text(self.map.getZoom())
            $("#info3").text(self.lenPerLati.toFixed(3))
            $("#info4").text(self.lenPerLong.toFixed(3))
            // console.log("move")

        },
        initTimelinePanel: function() {
            var self = this;

            $(self.$el).find("#displayTimelineTitle").click(function() {

                var displayTimelineShow = self.model.get("displayTimelineShow");

                displayTimelineShow = !displayTimelineShow;
                self.model.set("displayTimelineShow", displayTimelineShow);
            });

            // $('#fixpot-check').change(function() {
            //     self.model.set("fixPotShow",this.checked);
            // });
            $('#gate-check').change(function() {
                self.model.set("gateShow", this.checked);
            });
            $('#beijing-fixpot-check').change(function() {
                self.model.set("beijingfixPotShow", this.checked);
            });
            $('#airport-check').change(function() {
                self.model.set("airportShow", this.checked);
            });
            $('#samplePoint-check').change(function() {
                self.model.set("samplePointShow", this.checked);
            });
        },
        initAirportPanel: function() {
            var self = this;
        },
        get_filter_data: function() {
            var self = this;

            var selected_trajID = Datacenter.get('selected_trajID');
            var fixed_trajData = Datacenter.get('fixed_trajData')['totalPoint'];
            var filterFlightList = Datacenter.get('filterFlightList');

            if (filterFlightList == null) return;

            var new_selected_trajID = _.intersection(filterFlightList, selected_trajID);
            Datacenter.set('selected_trajID', new_selected_trajID);

            var colorMappingSelection = Config.get('colorMappingSelection');
            var colorMap;

            if (colorMappingSelection == 'aircraft')
                colorMap = Datacenter.get('aircraftColorMap');
            else if (colorMappingSelection == 'aircompany')
                colorMap = Datacenter.get('airCompanyColorMap');
            else if (colorMappingSelection == 'departuretime')
                colorMap = Datacenter.get('departureTimeColorMap');

            var parseTime = d3.time.format("%Y/%m/%d %H:%M");

            self.arr_filterData = [];
            self.dep_filterData = [];

            filterFlightList.forEach(function(d, i) {
                var thisTraj = $.extend({}, true, fixed_trajData.find(function(dd) { return dd.trajID == d; }));

                if (thisTraj != undefined) {
                    var obj = {};

                    if (colorMappingSelection == 'nomapping')
                        obj['A_D'] = (thisTraj['arrdir'] == 0 ? 'depTrajs' : 'arrTrajs');

                    else if (colorMappingSelection == 'aircraft')
                        obj['A_D'] = (thisTraj['aircraft'] == "" ? colorMap['-'] : colorMap[thisTraj['aircraft']['model']['code']]);

                    else if (colorMappingSelection == 'aircompany')
                        obj['A_D'] = colorMap[thisTraj.callsign.replace(/[0-9]/ig, "")];

                    else if (colorMappingSelection == 'departuretime') {
                        var parse = d3.time.format("%H");
                        var actualTime = ((!('time' in thisTraj) || thisTraj['time'] == "") ? '-' : thisTraj['time']['real']['departure']['$numberLong']);
                        var departureHour = ((!('time' in thisTraj) || thisTraj['time'] == "") ? '-' : parse(new Date(parseInt(actualTime))));
                        obj['A_D'] = colorMap[departureHour];
                    }

                    obj['trajID'] = thisTraj['trajID'];
                    obj['Flight'] = thisTraj['callsign'];

                    obj['Aircraft'] = (!('aircraft' in thisTraj) || thisTraj['aircraft'] == "") ? '-' : thisTraj['aircraft']['model']['code'];

                    var scheduleTime = ((!('time' in thisTraj) || thisTraj['time'] == "") ? '-' : thisTraj['time']['schedule']['departure']['$numberLong']);
                    obj['Schedule'] = ((!('time' in thisTraj) || thisTraj['time'] == "") ? '-' : scheduleTime == undefined ? '-' : parseTime(new Date(parseInt(scheduleTime))));

                    var actualTime = ((!('time' in thisTraj) || thisTraj['time'] == "") ? '-' : thisTraj['time']['real']['departure']['$numberLong']);
                    obj['Actual'] = ((!('time' in thisTraj) || thisTraj['time'] == "") ? '-' : actualTime == undefined ? '-' : parseTime(new Date(parseInt(actualTime))));

                    obj['Airport'] = ((!('destination' in thisTraj) || thisTraj['destination'] == "") ? '-' : thisTraj['destination']['code']['icao']);

                    var delay = ((!('time' in thisTraj) || thisTraj['time'] == "") ? '-' : scheduleTime == undefined && actualTime == undefined ? '-' : parseInt((parseInt(actualTime) - parseInt(scheduleTime)) / 1000 / 60));
                    obj['Delay'] = delay + '\'';

                    // console.warn(obj);

                    if (thisTraj['arrdir'] == 1)
                        self.arr_filterData.push(obj);
                    else
                        self.dep_filterData.push(obj);
                } else {
                    console.warn('????', d);
                }
            })

            // fixed_trajData.forEach(function(d,i) {
            //     if ($.inArray(d.trajID, filterFlightList) != -1) {
            //         var obj = {};
            //
            //         if(colorMappingSelection == 'nomapping')
            //             obj['A_D'] = (d['arrdir'] == 0 ? 'depTrajs' : 'arrTrajs');
            //
            //         else if (colorMappingSelection == 'aircraft')
            //             obj['A_D'] = (d['aircraft'] == "" ? colorMap['-'] : colorMap[d['aircraft']['model']['code']]);
            //
            //         else if (colorMappingSelection == 'aircompany')
            //             obj['A_D'] = colorMap[d.callsign.replace(/[0-9]/ig, "")];
            //
            //         else if (colorMappingSelection == 'departuretime') {
            //             var parse = d3.time.format("%H");
            //             var actualTime = ((!('time' in d) || d['time'] == "") ? '-' : d['time']['real']['departure']['$numberLong']);
            //             var departureHour = ((!('time' in d) || d['time'] == "") ? '-' : parse(new Date(parseInt(actualTime))));
            //             obj['A_D'] = colorMap[departureHour];
            //         }
            //
            //         obj['trajID'] = d['trajID'];
            //         obj['Flight'] = d['callsign'];
            //
            //         obj['Aircraft'] = (!('aircraft' in d) || d['aircraft'] == "") ? '-' : d['aircraft']['model']['code'];
            //
            //         var scheduleTime = ((!('time' in d) || d['time'] == "") ? '-' : d['time']['schedule']['departure']['$numberLong']);
            //         obj['Schedule'] = ((!('time' in d) || d['time'] == "") ? '-' : scheduleTime == undefined ? '-' : parseTime(new Date(parseInt(scheduleTime))));
            //
            //         var actualTime = ((!('time' in d) || d['time'] == "") ? '-' : d['time']['real']['departure']['$numberLong']);
            //         obj['Actual'] = ((!('time' in d) || d['time'] == "") ? '-' : actualTime == undefined ? '-' : parseTime(new Date(parseInt(actualTime))));
            //
            //         obj['Airport'] = ((!('destination' in d) || d['destination'] == "") ? '-' : d['destination']['code']['icao']);
            //
            //         var delay = ((!('time' in d) || d['time'] == "") ? '-' : scheduleTime == undefined && actualTime == undefined ? '-' : parseInt((parseInt(actualTime) - parseInt(scheduleTime)) / 1000 / 60));
            //         obj['Delay'] = delay + '\'';
            //
            //         if (d['arrdir'] == 1)
            //             self.arr_filterData.push(obj);
            //         else
            //             self.dep_filterData.push(obj);
            //     }
            //     else {
            //         // console.warn(d);
            //     }
            // });

            self.sort_table('Flight');
        },
        get_RelatedFlight_data: function() {
            var self = this;

            var selected_trajID = Datacenter.get('selected_trajID');
            var fixed_trajData = Datacenter.get('fixed_trajData')['totalPoint'];
            var flightGraphData = Datacenter.get('flightGraphData');

            if (flightGraphData == null) return;

            var flightList = flightGraphData.flightGraphNode.map(function(d) { return d.name; });

            var new_selected_trajID = _.intersection(flightList, selected_trajID);
            Datacenter.set('selected_trajID', new_selected_trajID);

            var colorMappingSelection = Config.get('colorMappingSelection');
            var colorMap;

            if (flightGraphData == null) {
                $('#traj_list_title').remove();
                $('#traj_list_table_div').remove();
                return;
            }

            if (colorMappingSelection == 'aircraft')
                colorMap = Datacenter.get('aircraftColorMap');
            else if (colorMappingSelection == 'aircompany')
                colorMap = Datacenter.get('airCompanyColorMap');
            else if (colorMappingSelection == 'departuretime')
                colorMap = Datacenter.get('departureTimeColorMap');

            var parseTime = d3.time.format("%Y/%m/%d %H:%M");
            self.arr_filterData = [], self.dep_filterData = [];

            fixed_trajData.forEach(function(d) {
                var isRelated = flightGraphData.flightGraphNode.findIndex(x => x.name == d.trajID);
                if (isRelated != -1) {
                    var obj = {};

                    if (colorMappingSelection == 'nomapping')
                        obj['A_D'] = (d['arrdir'] == 0 ? 'depTrajs' : 'arrTrajs');
                    if (colorMappingSelection == 'aircraft')
                        obj['A_D'] = ((!('aircraft' in d) || d['aircraft'] == "") ? colorMap['-'] : colorMap[d['aircraft']['model']['code']]);
                    else if (colorMappingSelection == 'aircompany')
                        obj['A_D'] = colorMap[d.callsign.replace(/[0-9]/ig, "")];
                    else if (colorMappingSelection == 'departuretime') {
                        var parse = d3.time.format("%H");
                        var actualTime = ((!('time' in d) || d['time'] == "") ? '-' : d['time']['real']['departure']['$numberLong']);
                        var departureHour = ((!('time' in d) || d['time'] == "") ? '-' : parse(new Date(parseInt(actualTime))));
                        obj['A_D'] = colorMap[departureHour];
                    }

                    obj['trajID'] = d['trajID'];
                    obj['Flight'] = d['callsign'];
                    obj['Aircraft'] = (!('aircraft' in d) || d['aircraft'] == "") ? '-' : d['aircraft']['model']['code'];

                    var scheduleTime = ((!('time' in d) || d['time'] == "") ? '-' : d['time']['schedule']['departure']['$numberLong']);
                    obj['Schedule'] = ((!('time' in d) || d['time'] == "") ? '-' : parseTime(new Date(parseInt(scheduleTime))));

                    var actualTime = ((!('time' in d) || d['time'] == "") ? '-' : d['time']['real']['departure']['$numberLong']);
                    obj['Actual'] = ((!('time' in d) || d['time'] == "") ? '-' : parseTime(new Date(parseInt(actualTime))));

                    obj['Airport'] = ((!('destination' in d) || d['destination'] == "") ? '-' : d['destination']['code']['icao']);

                    var delay = ((!('time' in d) || d['time'] == "") ? '-' : parseInt((parseInt(actualTime) - parseInt(scheduleTime)) / 1000 / 60));
                    obj['Delay'] = delay + '\'';

                    if (d['arrdir'] == 1)
                        self.arr_filterData.push(obj);
                    else
                        self.dep_filterData.push(obj);
                }
            });
            self.sort_table('Flight');
        },
        sort_table: function(sortAttribute) {
            var self = this;
            var parseDate = d3.time.format("%Y/%m/%d %H:%M").parse;

            if (sortAttribute == 'Delay') {
                self.arr_filterData.sort(function(a, b) {
                    if (a[sortAttribute] == '-')
                        return 1;
                    if (b[sortAttribute] == '-')
                        return -1;

                    var delay_a = +a[sortAttribute].split('\'')[0],
                        delay_b = +b[sortAttribute].split('\'')[0];
                    return delay_b - delay_a;
                });
                self.dep_filterData.sort(function(a, b) {
                    if (a[sortAttribute] == '-')
                        return 1;
                    if (b[sortAttribute] == '-')
                        return -1;

                    var delay_a = +a[sortAttribute].split('\'')[0],
                        delay_b = +b[sortAttribute].split('\'')[0];
                    return delay_b - delay_a;
                });
            }

            if (sortAttribute == 'A_D' || sortAttribute == 'Flight' || sortAttribute == 'Aircraft' || sortAttribute == 'Airport') {
                self.arr_filterData.sort(function(a, b) {
                    if (a[sortAttribute] == '-')
                        return 1;
                    if (b[sortAttribute] == '-')
                        return -1;

                    var delay_a = a[sortAttribute],
                        delay_b = b[sortAttribute];
                    if (delay_b < delay_a)
                        return 1;
                    else
                        return -1;
                });
                self.dep_filterData.sort(function(a, b) {
                    if (a[sortAttribute] == '-')
                        return 1;
                    if (b[sortAttribute] == '-')
                        return -1;

                    var delay_a = a[sortAttribute],
                        delay_b = b[sortAttribute];
                    if (delay_b < delay_a)
                        return 1;
                    else
                        return -1;
                });
            }

            if (sortAttribute == 'Schedule' || sortAttribute == 'Actual') {
                self.arr_filterData.sort(function(a, b) {
                    if (a[sortAttribute] == '-')
                        return 1;
                    if (b[sortAttribute] == '-')
                        return -1;

                    var delay_a = parseDate(a[sortAttribute]).getTime(),
                        delay_b = parseDate(b[sortAttribute]).getTime();
                    return delay_a - delay_b;
                });

                self.dep_filterData.sort(function(a, b) {
                    if (a[sortAttribute] == '-')
                        return 1;
                    if (b[sortAttribute] == '-')
                        return -1;

                    var delay_a = parseDate(a[sortAttribute]).getTime(),
                        delay_b = parseDate(b[sortAttribute]).getTime();
                    return delay_a - delay_b;
                });
            }

            self.update_filteredData();
        },
        update_filteredData: function() {
            var self = this;
            var arrShow = Datacenter.get('arrShow'),
                depShow = Datacenter.get('depShow');

            if (arrShow && depShow)
                self.filteredData = self.dep_filterData.concat(self.arr_filterData);
            else if (!arrShow && depShow)
                self.filteredData = self.dep_filterData;
            else if (arrShow && !depShow)
                self.filteredData = self.arr_filterData;
            else
                self.filteredData = [];

            self.traj_list_table();

        },
        traj_list_table: function() {
            var self = this;
            // var filterCircleCDMData = Datacenter.get('filterCircleCDMData');
            var timer = 0;
            var delay = 100;
            var prevent = false;
            var airCompanyColorMap = Datacenter.get('airCompanyColorMap');
            var centerFlight = Datacenter.get('centerFlight');

            $('#traj_list_title').remove();
            $('#traj_list_table_div').remove();

            // console.log(obj);

            if (self.filteredData.length == 0)
                return;

            var title = d3.select('#traj_list_div_content').append('div')
                .attr('id', 'traj_list_title')
                .html('</span>&nbsp;<span class="badge dep_num_badge">' + self.dep_filterData.length +
                    '</span>&nbsp;<span class="badge arr_num_badge">' + self.arr_filterData.length + '</span>'
                );

            var table_div = d3.select('#traj_list_div_content').append('div')
                .attr('id', 'traj_list_table_div');

            var table = d3.select('#traj_list_table_div').append('table')
                .attr('id', 'traj_list_table')
                .attr('border', '1');

            var thead = table.append('thead');
            var tbody = table.append('tbody');

            // append the header row
            thead.append('tr')
                .selectAll('th')
                .data(self.list_table_key).enter()
                .append('th')
                .attr('class', 'traj_list_table_th')
                .html(function(column) {
                    if (column == 'A_D')
                        return '<i class="fa fa-plane" aria-hidden="true"></i>';
                    return column;
                })
                .on('click', function(d) {
                    self.sort_table(d);
                });

            // create a row for each object in the data
            var rows = tbody.selectAll('tr')
                .data(self.filteredData)
                .enter()
                .append('tr')
                .attr("class", "traj_list_table_tr")
                .style('color', function(d) {
                    if (d.trajID == centerFlight) return 'white';
                })
                .on("click", function(d) {
                    var ele = this;
                    timer = setTimeout(function() {
                        if (!prevent) {
                            doClickAction(d, ele);
                        }
                        prevent = false;
                    }, delay);
                })
                .on('mouseenter', function(d) {
                    highlightThisFlight(d);
                })
                .on('mouseout', function(d) {
                    cancelHighlightThisFlight(d, this);
                })
                .on("dblclick", function(d) {
                    clearTimeout(timer);
                    prevent = true;
                    doDoubleClickAction(d);
                });

            var ifExit = 0;

            function highlightThisFlight(d) {
                var selected_trajID = Datacenter.get('selected_trajID');
                var now_ID_array = $.extend(true, [], selected_trajID);
                var index = $.inArray(d['trajID'], selected_trajID);
                // console.log('index', index)
                if (index == -1) {
                    now_ID_array.push(d['trajID']);
                    Datacenter.set('selected_trajID', now_ID_array);
                    ifExit = 0
                } else
                    ifExit = 1

            }

            function cancelHighlightThisFlight(d, thisEle) {
                var selected_trajID = Datacenter.get('selected_trajID');
                var now_ID_array = $.extend(true, [], selected_trajID);
                var index = $.inArray(d['trajID'], selected_trajID);

                if (ifExit == 0 && index != -1) {
                    now_ID_array.splice(index, 1);
                    Datacenter.set('selected_trajID', now_ID_array);
                }


            }

            function doClickAction(d, thisEle) {
                console.log('click')
                var selected_trajID = Datacenter.get('selected_trajID');
                var now_ID_array = $.extend(true, [], selected_trajID);
                var index = $.inArray(d['trajID'], now_ID_array);

                if (!d3.select(thisEle).classed('clicked') && ifExit == 0) {
                    if (index == -1)
                        now_ID_array.push(d['trajID']);
                    d3.select(thisEle).classed('clicked', true);
                    ifExit = 1
                } else {
                    now_ID_array.splice(index, 1);
                    d3.select(thisEle).classed('clicked', false);
                    ifExit = 0
                }
                Datacenter.set('selected_trajID', now_ID_array);


            }

            function doDoubleClickAction(d) {
                $('#callsignSelectedValue').val(d.Flight);
                var callsign = d.Flight;
                if (!callsign) return;

                if (Datacenter.get('centerFlight') == null)
                    Datacenter.set('timeBeforeCenterSearch', Config.get('curTime'));
                var fixed_trajData = Datacenter.get('fixed_trajData');
                var thisTrajData = $.grep(fixed_trajData.totalPoint, function(d) {
                    return d.callsign == callsign;
                });
                console.log('dblclick', thisTrajData)

                if (thisTrajData.length == 0) return;

                var thisTrajID = null;
                for (var ii = 0; ii < thisTrajData.length; ii++) {
                    if (thisTrajData[ii].pos.length == 0)
                        continue;
                    else {
                        thisTrajID = thisTrajData[ii].trajID;
                        break;
                    }
                }
                if (thisTrajID != null) {
                    Datacenter.removeAllView();
                    Datacenter.set('centerFlight', thisTrajID);
                }
            }

            // create a cell in each row for each column
            var cells = rows.selectAll('td')
                .data(function(row) {
                    return self.list_table_key.map(function(column) {
                        return { column: column, value: row[column] };
                    });
                })
                .enter()
                .append('td')
                .attr("class", "trajs_panel_td")
                .html(function(d) {
                    // console.log(d);
                    if (d.column == 'A_D')
                        if (Config.get('colorMappingSelection') == 'nomapping') {
                            if (d.value == 'depTrajs')
                                return '<i class="fa fa-plane" aria-hidden="true" style="color:rgb(41, 170, 227)"></i>';
                            if (d.value == 'arrTrajs')
                                return '<i class="fa fa-plane" aria-hidden="true" style="color: rgb(209, 71, 69)"></i>';
                        }
                    else
                        return '<i class="fa fa-plane" aria-hidden="true" style="color: ' + d.value + '"></i>';

                    return d.value;
                });

            //reset button
            d3.select('#reset_highlight').on('click', function() {
                Datacenter.set('selected_trajID', []);
                self.traj_list_table();
            });

            self.highlight_tr();
        },
        highlight_tr: function() {
            var self = this;
            var array = Datacenter.get('selected_trajID');

            d3.selectAll('.traj_list_table_tr').classed('active', function(d) {
                var this_trajID = $.inArray(d['trajID'], array);
                if (this_trajID == -1) return false;
                else return true;
            });
            self.update_badge_show();

        },
        update_badge_show: function() {
            var self = this;
            var arrShow = Datacenter.get('arrShow'),
                depShow = Datacenter.get('depShow');

            if (arrShow && depShow) {
                d3.select('.dep_num_badge').classed('hidden', false);
                d3.select('.arr_num_badge').classed('hidden', false);
            } else if (!arrShow && depShow) {
                d3.select('.dep_num_badge').classed('hidden', false);
                d3.select('.arr_num_badge').classed('hidden', true);
            } else if (arrShow && !depShow) {
                d3.select('.dep_num_badge').classed('hidden', true);
                d3.select('.arr_num_badge').classed('hidden', false);
            }

            // self.update_tr_order();
        },
        // update_tr_order: function () {
        //     var selected_trajID = Datacenter.get('selected_trajID');
        //     if (selected_trajID.length == 0)
        //         return;
        //
        //     $('.traj_list_table_tr.active').insertBefore(d3.select('.traj_list_table_tr'));
        // },
        updateCurTimeToCenterFlight: function(centerFlight) {
            var self = this;
            if (centerFlight == null) return;

            var fixed_trajData = Datacenter.get('fixed_trajData');
            var centerFlight_trajData = $.extend(true, {}, fixed_trajData.depPoints.find(function(n) { return n.trajID == centerFlight; }));
            var centerFlightMaxTime = centerFlight_trajData.new_pos_add[centerFlight_trajData.new_pos_add.length - 1].timestamp;
            // var centerFlightMaxTime = centerFlight_trajData.new_pos_add[centerFlight_trajData.new_pos_add.length - 1].timestamp;
            var curTime = centerFlight_trajData.new_pos_add[0].timestamp;

            // console.log('centerFlight curTime', curTime);
            Config.set('centerFlightMinTime', curTime);
            Config.set('centerFlightMaxTime', centerFlightMaxTime);
            // console.log('slidingwindowsize curTime', Config.get("slidingwindowsize"));
            Config.set('slideWindowR', curTime + Config.get("slidingwindowsize"));
            Config.set('curTime', curTime + Config.get("slidingwindowsize"));


            // console.log('centerFlightMinTime', Config.get('centerFlightMinTime'))


        },
        updateControlPanel: function() {
            var self = this;
            var displayControlShow = self.model.get("displayControlShow");
            if (displayControlShow) {
                $(self.$el).find("#displayControl").slideDown("slow");
            } else {
                $(self.$el).find("#displayControl").slideUp("slow");
            }
        },
        updateTimelinePanel: function() {
            var self = this;
            var displayTimelineShow = self.model.get("displayTimelineShow");
            if (displayTimelineShow) {
                $(self.$el).find("#displayTimeline").slideDown("slow");
            } else {
                $(self.$el).find("#displayTimeline").slideUp("slow");
            }

        },
        updateFocusLocation: function(focusLocation) { //放大／缩小地图到某个机场的快捷键
            var self = this;

            var focusLocationArray = Config.get("focusLocationArray");
            var centerAirportArray = Config.get("centerAirportArray");
            var center = centerAirportArray[Config.get("currentCenterAirport")];
            var scale = focusLocationArray[focusLocation]["scale"];
            Config.set("curScale", scale);
            self.map.setView(center, scale, { animate: true });
        },
        updateCenterAirport: function(currentCenterAirport) {
            var self = this;

            var centerAirportArray = Config.get("centerAirportArray");
            var center = centerAirportArray[currentCenterAirport];
            var scale = Config.get("curScale");

            self.map.setView(center, scale, { animate: true });
        },
        updateScale: function() {
            // this.stationRScale = d3.scale.sqrt().clamp(true)
            //                                     .domain([0,10])
            //                                     .range([4*this.model.get("influenceStationRRatio")
            //                                         ,20*this.model.get("influenceStationRRatio")]);
        },
        updateCursor: function(filterShow) {
            var filterSVG = d3.select('.leaflet-overlay-pane svg');
            console.log(filterShow);

            if (filterShow == "filterRemove" || filterShow == "filterForbid" || filterShow == "filterDeleteAll") {
                filterSVG.style("cursor", "-webkit-grab")
                    .on("mousedown", function() {
                        d3.select(this).style("cursor", "-webkit-grabbing");
                    })
                    .on("mouseup", function() {
                        d3.select(this).style("cursor", "-webkit-grab");
                    });
            } else {
                filterSVG.style("cursor", "crosshair");
            }
        },
        filterDataCurtime: function(curtime, dataOld) {
            var self = this;
            var data = [];

            dataOld.forEach(function(d) {
                if (curtime >= d['sTime'] && curtime < d['eTime']) {
                    // data.push({'trajID':d.trajID,'data':d.data})
                    data.push(d);
                }
            });
            return data;
        },
        filterDataStart: function(timeStart, timeEnd, dataOld) {
            var self = this
            var data = self.deepCopy(dataOld)
            var filter = {}
            var trajArr = []
            var trajIdx = {}
            var record = []

            data['trajArr'].forEach(function(d) {
                var time = String(d['sTime'] / 1000)
                if (time >= timeStart && time < timeEnd) {
                    trajArr.push(d)
                }
            });
            for (var i = 0; i < trajArr.length; i++) {
                trajIdx[trajArr[i]['trajID']] = i
            }
            filter = { 'trajIdx': trajIdx, 'trajArr': trajArr }
            return filter;
        },
        filterData: function(timeStart, timeEnd, dataOld) {
            var self = this
            var data = self.deepCopy(dataOld)
            var filter = {}
            var trajArr = []
            var trajIdx = {}
            var record = []
            data['trajArr'].forEach(function(d) {
                record = []
                d['data'].forEach(function(item) {
                    if (item['Timestamp'] >= timeStart && item['Timestamp'] < timeEnd) {
                        record.push(self.deepCopy(item))
                    }
                })
                if (record.length != 0) {
                    trajArr.push(self.deepCopy(d))
                    var TimeStamp = []
                    record.forEach(function(index) {
                        TimeStamp.push(index['TimeStamp'])
                    })
                    trajArr[trajArr.length - 1]['data'] = record
                    trajArr[trajArr.length - 1]['sTime'] = parseInt(TimeStamp[0]) * 1000
                    trajArr[trajArr.length - 1]['eTime'] = TimeStamp[TimeStamp.length - 1]

                }
            });
            for (var i = 0; i < trajArr.length; i++) {
                trajIdx[trajArr[i]['trajID']] = i
            }
            filter = { 'trajIdx': trajIdx, 'trajArr': trajArr }
            return filter;
        },
        deepCopy: function(obj) {
            var str, newobj = obj.constructor === Array ? [] : {};
            if (typeof obj !== 'object') {
                return
            } else if (window.JSON) {
                str = JSON.stringify(obj), //系列化对象
                    newobj = JSON.parse(str); //还原
            } else {
                for (var i in obj) {
                    newobj[i] = typeof obj[i] === 'object' ?
                        cloneObj(obj[i]) : obj[i];
                }
            }
            return newobj;
        },
    });
});