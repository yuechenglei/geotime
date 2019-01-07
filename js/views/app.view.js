/**
 * Created by aji on 15/7/13.
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
    'views/map.view',
    'views/timeline.view',
    'views/mesh3d.view',
    'text!templates/app.tpl',
], function (require, d3, Mn, _, $, Backbone, Datacenter, Config, Variables, MapView, TimelineView, Map3DView, Tpl) {

    'use strict';

    return Mn.LayoutView.extend({

        tagName: 'div',

        template: _.template(Tpl),

        attributes: {
            'style': 'width: 100%; height:100%;'
        },
        regions: {
            'map': '#map',
            'timeline': '#timeline',
            'mesh3d': '#container3d',
            // 'speedLine': '#speedLine_content',
            // 'relatedLine': '#relatedLine_content',
            // 'HDP': '#HDP_view_content'
        },

        initialize: function (options) {
            var self = this;
            self.finishLoad = false;
            self.showed = false;
            self.num = 0;
            options = options || {};
            $(document).ready(function () {
                console.log('ready!!!');
                self.updateLayout();
                //监听窗口大小的变化
                $(window).resize(function () {
                    self.updateLayout();
                });

                self.listenTo(Variables, 'change:finishInit', function (model, finishInit) {

                    self.finishLoad = true;
                    Variables.set("loading", !finishInit);

                    if (self.showed)
                        self.loaded();

                    Datacenter.start();
                });

                self.listenTo(Variables, 'change:loading', function (model, loading) {
                    if (loading) {
                        //添加加载
                        $("#loading").removeClass("hidden");
                    }
                    else {
                        //去除加载
                        $("#loading").addClass("hidden");
                    }
                });

                // Datacenter.start();
            });
        },

        onShow: function () {
            var self = this;
            self.showed = true;
            if (self.finishLoad) {
                self.loaded();
            }
            $(".ui-widget-content").css("background", "#000000");
        },

        updateLayout: function () {
            var winHeight = $(window).height();
            var winWidth = $(window).width();

            var threshold = 64 / 31;
            var now_ratio = winWidth / winHeight;

            //console.log('winWidth', winWidth)
            // if (now_ratio < threshold) {
            //   console.log('小屏');
            //
            //   $('body').css('overflow', 'scroll');
            //   $('#maindiv').css('width', '200%');
            //   $('#traj_list_div').css('width', '15%');
            //   // $('#overview_view').css('left', '62%')
            //   //   .css('width', '4%');
            //   // $('#parellel_view').css('left', '65%')
            //   //   .css('right', '32%');
            //   $('#HDP_view').css('width', '15%');
            //   // $('#sm_view').css('width', '32%');
            //   // $('#CDM_Gantta').css('width', '32%');
            //   // $('#ranking_view').css('width', '17%');
            //   // $('#calendarHeatmap').css('width', '15%');
            // }

            // else {
            //   console.log('大屏');
            //
            //   $('body').css('overflow', 'hidden');
            //   $('#maindiv').css('width', '100%');
            //   $('#traj_list_div').css('width', '25%');
            //   // $('#overview_view').css('left', '59%')
            //   //   .css('width', '4%');
            //   // $('#parellel_view').css('left', '63%')
            //   //   .css('right', '32%');
            //   $('#HDP_view').css('width', '25%');
            //   // $('#sm_view').css('width', '32%');
            //   // $('#CDM_Gantta').css('width', '32%');
            //   // $('#ranking_view').css('width', '17%');
            //   // $('#calendarHeatmap').css('width', '15%');
            // }
            //
            // console.log('winWidth', winWidth)

            if (winWidth < 2000) {
                $('body').css("font-size", '15px')
                Config.set('emPixel', 12)
            }
            else if (winWidth < 3000) {
                $('body').css("font-size", '15px')
            }
            else if (winWidth < 4000) {
                $('body').css("font-size", '25px')
            }
            else if (winWidth < 5000) {
                $('body').css("font-size", '30px')
            }
            else if (winWidth < 6000) {
                $('body').css("font-size", '35px')
            }
            else if (winWidth < 7000) {
                $('body').css("font-size", '40px')
            }
            else if (winWidth < 8000) {
                $('body').css("font-size", '45px')
            }
            else if (winWidth < 9000) {
                $('body').css("font-size", '50px')
            }
            var emPixel = d3.select("#maindiv").style('font-size');
            emPixel = parseInt(emPixel.split('p')[ 0 ]);
            Datacenter.set('emPixel', emPixel);
            Config.set('emPixel', emPixel);
        },

        loaded: function () {
            var self = this;
            console.log('loaded');

             //adjust ratio
            // var mainDiv = $("#maindiv");
            // var h = mainDiv.height();
            // var w = mainDiv.width();
            // var rh = w / Config.get("ratio");
            // var rw = h * Config.get("ratio");
            // if(rh <= h) {
            //     $("#maindiv").css("height", rh + "px");
            //     $("#maindiv").css("width", w + "px");

            // }
            // else {
            //     $("#maindiv").css("height", h + "px");
            //     $("#maindiv").css("width", rw + "px");

            // }

            // window.NProgress.done();
            var self = this;

            self.mapview = new MapView({ model: Datacenter.mapModel });
            self.showChildView('map', self.mapview);

            self.mesh3Dview = new Map3DView({ model: Datacenter.mapModel });
            self.showChildView('mesh3d', self.mesh3Dview);

            // self.hdpView = new HDPView();
            // self.showChildView('HDP',  self.hdpView);

            // self.speedLineView = new SpeedLineView();
            // self.showChildView('speedLine',  self.speedLineView);

            // self.relatedLineView = new RelatedLineView();
            // self.showChildView('relatedLine',  self.relatedLineView);

            self.timelineview = new TimelineView({model:Datacenter.timelineModel});
            self.showChildView('timeline',  self.timelineview);

            $(function () {
                $(".ui-widget-content").draggable({
                    start: function () {
                        var currentViewZIndex = Config.get("currentViewZIndex") + 1
                        $(this).css("z-index", currentViewZIndex);
                        Config.set("currentViewZIndex", currentViewZIndex)
                    },
                    cancel: ".view_content"
                });

                // $('.view_title').addEventListener('mousedown', mouseDown, false);
                // window.addEventListener('mouseup', mouseUp, false);

                $(".ui-widget-content").resizable({
                    //"n, e, s, w, ne, se, sw, nw"
                    handles: 'all',
                    helper: "ui-resizable-helper",
                    ghost: true,
                    grid: 10,
                    start: function () {
                        var currentViewZIndex = Config.get("currentViewZIndex") + 1
                        $(this).css("z-index", currentViewZIndex);
                        Config.set("currentViewZIndex", currentViewZIndex)
                    }
                });

                $(".ui-widget-content").on('resize', _.debounce(function () {
                    var view_name = $(this).attr("id")
                    // switch(view_name){
                    //   case "overview_parellel_view":
                    // }
                    var selected_trajID = Datacenter.get("selected_trajID")
                    Datacenter.trigger("resize_view", { id: view_name });
                    Datacenter.set("selected_trajID", selected_trajID)

                }, 250));

                // var resizeTimer;
                // $(".ui-widget-content").on('resize', function(e) {
                //   clearTimeout(resizeTimer);
                //   resizeTimer = setTimeout(function() {
                //   }, 500);

                // });
                // $(".view_title").click(function(){
                //   $(this).siblings('.view_content').slideToggle();
                // });

                // class="view_btn"

                // $(".view_btn").click(function(){
                //   $(this).parent().find(".view_content").slideToggle();
                // });

                $(".view_btn").click(function () {
                    var $view = $(this).parent().parent()
                    var $title = $view.find(".view_title")
                    var $content = $view.find(".view_content")

                    if ($content.is(':visible')) {
                        $content.slideUp();
                        $view.css("visibility", "hidden")
                        $title.css("visibility", "visible")

                    } else {
                        $content.slideDown();
                        //$content.css("visibility","visible")
                        $view.css("visibility", "visible")
                    }
                });

                // $("#traj_list_title").click(function(){
                //   $("#traj_list_table_div").slideToggle();
                // });

                // $('#CDM_Gantta_btn').click(function () {
                //   $('#CDM_Gantta_content').slideToggle();
                // });

                // $('#ranking_view_btn').click(function () {
                //   $('#ranking_view_content').slideToggle();
                // });

                // $('#traj_list_div_btn').click(function () {
                //   $('#traj_list_div_content').slideToggle();
                // });

                // $('#HDP_view_btn').click(function () {
                //   $('#HDP_view_content').slideToggle();
                // });

                // $('#calendarHeatmap_btn').click(function () {
                //   $('#calendarHeatmap_content').slideToggle();
                // });

                // $('#sm_view_btn').click(function () {
                //   $('#sm_view_content').slideToggle();
                // });
            });
            //self.timeCompview = new TimeCompView({model:Datacenter.timeCompModel});
            //self.showChildView('timeComp',  self.timeCompview);

            //self.informationview = new InformationView({model:Datacenter.informationModel});
            //self.showChildView('information',  self.informationview);

        }
    });
});
