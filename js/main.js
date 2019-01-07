define('three', ["../bower_components/three/three"], function(THREE) {
    window.THREE = THREE;
    return THREE;
});

define('THREE_Text', ["../bower_components/three/three-text2d"], function(THREE_Text) {
    window.THREE_Text = THREE_Text;
    return THREE_Text;
});

define('TextTexture', ["../bower_components/three/TextTexture"], function(TextTexture) {
    window.TextTexture = TextTexture;
    return TextTexture;
});

require.config({
    shim: {
        'bootstrap': ['jquery'],
        'backbone': {
            deps: ['jquery', 'underscore']
        },
        'jqueryUI': {
            export: "$",
            deps: ['jquery']
        },
        // 'threeControl': {
        //     deps: ['Three']
        // },
        'cal-heatmap': {
            deps: ['d3']
        },
        "three": {
            exports: 'THREE'
        },
        "THREE_Text": {
            exports: 'THREE_Text'
        },
        "TextTexture": {
            exports: 'TextTexture'
        },

    },
    paths: {
        // libs loader
        'text': '../bower_components/text/text',
        'jquery': ['../bower_components/jquery/dist/jquery.min'],
        'jqueryUI': ['../bower_components/jquery-ui/jquery-ui'],
        'underscore': ['../bower_components/underscore/underscore-min'],
        'bootstrap': ['../bower_components/bootstrap/dist/js/bootstrap.min'],
        "bootstrapSwitch": ['../bower_components/bootstrap-switch/dist/js/bootstrap-switch.min'],
        'backbone': ['../bower_components/backbone/backbone-min'],
        'marionette': ['../bower_components/backbone.marionette/lib/backbone.marionette.min'],
        'backbone.relational': ['../bower_components/backbone-relational/backbone-relational'],
        'backbone.routefilter': '../bower_components/backbone.routefilter/dist/backbone.routefilter.min',
        'd3': ['../bower_components/d3/d3modify'],
        'd3Cloud': ['../bower_components/d3-cloud/build/d3.layout.cloud'],

        "three": ["../bower_components/three/three"],
        "threeStats": ["../bower_components/three/stats.min"],
        "threeTween": ["../bower_components/three/tween.min"],
        "threeDetector": ["../bower_components/three/Detector"],
        "threeControl": ["../bower_components/three/OrbitControls"],
        "TGALoader": ["../bower_components/three/TGALoader"],
        "OBJLoader": ["../bower_components/three/OBJLoader"],
        "MTLLoader": ["../bower_components/three/MTLLoader"],
        "ThreeMeshline": ["../bower_components/three/Three.meshline"],
        "THREE_Text": ["../bower_components/three/three-text2d"],
        "TextTexture": ["../bower_components/three/TextTexture"],


        "leaflet": ['../bower_components/leaflet/leaflet'],
        "leafletd3overlay": ["../bower_components/L.D3SvgOverlay.min"],
        "leafletcanvasoverlay": ["../bower_components/leaflet.CanvasOverlay"],
        'nprogress': ['../bower_components/nprogress/nprogress'],
        "tipsy": ["../bower_components/jquery.tipsy"],
        "colorbrewer": ["../bower_components/colorbrewer"],
        "timeutil": ['utils/timeutil'],
        "cal-heatmap": ["../bower_components/cal-heatmap.min"],
        "d3tip": ["../bower_components/d3.tip"],
        "timeSequenceBar": ["../bower_components/timeSequenceBar/time-sequence-bar"],
        // "d3-starplot": ["../bower_components/d3-starplot"],
        "box-plot": ["../bower_components/box"],
        "slider-bootstrap": ["../bower_components/bootstrap-slider"],
        "d3-queue": ["../bower_components/d3-queue/d3-queue"],
        // templates path
        'templates': '../templates',
        'datacenter': 'models/datacenter.model',
        'config': 'models/config.model',
        'variables': 'models/variables.model'
    }
});

// require(['app'], function (App) {
//     'use strict';
//     var app = new App();
//     app.start();
// });

require(['jquery', 'underscore', 'd3', "jqueryUI", "colorbrewer", "leaflet", "three", "timeutil", "cal-heatmap", "three", "threeStats", "threeTween", "threeDetector"], function($, _, d3) {
    'use strict';
    // console.log('colorbrewer');
    require(['backbone', 'bootstrap', "tipsy", "leafletd3overlay", "leafletcanvasoverlay", "threeControl", "d3Cloud", 'MTLLoader', 'OBJLoader', 'TGALoader', 'ThreeMeshline', 'THREE_Text', 'TextTexture'], function(Backbone, Bootstrap) {
        require(['app'], function(App) { // require.js shim不能与cdn同用,因此3层require,非amd module需要如此
            var app = new App();
            app.start();
        });
    });
});