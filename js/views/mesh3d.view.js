/**
 * Created by chenglei.yue on 2016/12/28.
 */
define([
    'require',
    'marionette',
    'underscore',
    'jquery',
    'backbone',
    'config',
    "variables",
    'text!templates/map.tpl',
], function(require, Mn, _, $, Backbone, Config, Variables, Tpl) {
    'use strict';

    return Mn.ItemView.extend({

        tagName: 'div',

        template: function() {
            // return null;
        },

        attributes: {
            'style': 'width: 0%; height:0%;'
        },

        rayCaster: null,
        mouse: null,
        clickEvent: null,
        sprite: null,
        annotation: null,
        ctx: null,
        pointArray: null,
        group: null,
        trajGroup: null,
        particleSystem: null,
        arrowHelper: null,
        isFacing: false,
        isRotate: false,
        initialHelperRotate: null,
        camera: null,
        scene: null,
        renderer: null,
        maxAxisLen: null,
        timeAxisScale: null,
        origpos: null,
        origrot: null,
        timeX: null,
        timeY: null,
        dMaterial: null,
        aMaterial: null,
        zLen: null,

        initialize: function(options) {
            var self = this;
            window.map3d = this;
            console.log(window.map3d)
            options = options || {};
            // self.listenTo(Datacenter, 'change:selectID', function(model, selectID) {
            //     // self.updateNodeInfoPanel(selectID);
            // });
            //
            // self.listenTo(self.model, 'change:transform3d', function(model, transform3d) {
            //     self.transform3d();
            //     console.log("transform3d")
            // });
            //
            //
            // self.listenTo(self.model, 'change:transform3dTag', function(model, transform3dTag) {
            //     // self.transform3d();
            //     console.log(transform3dTag)
            // });
        },
        // render: function() {

        //     console.log("render finished!!!")
        //     return this;
        // },
        onShow: function() {
            var self = this;
            //yue addTo
            self.init();
            self.actionInit();
            // self.addTrack();
            //self.addDam();
            //self.addHarbour();

            $("#To2d").click(function() {

                self.transform2D();

                $("#building-div").addClass("hidden");
                $("#keyPoint-div").addClass("hidden");
                $("#viewDropdown-div").addClass("hidden");
                $("#camera-div").addClass("hidden");



            })
        },

        init: function() {

            var self = this;
            if (!Detector.webgl) Detector.addGetWebGLMessage();

            self.mouse = new THREE.Vector2();
            self.clickEvent = new THREE.Vector3();

            var scene = new THREE.Scene();
            self.scene = scene;
            var container = document.getElementById('container3d');
            var renderer = new THREE.WebGLRenderer({
                antialias: true
            });
            self.renderer = renderer;
            self.renderer.setClearColor(0x252525);

            self.container = container;
            renderer.setPixelRatio(window.devicePixelRatio);
            self.width = $("#map").width();
            self.height = $("#map").height();
            // renderer.setSize($("#container3d").width(), $("#container3d").height());
            renderer.setSize(self.width, self.height);
            // renderer.setSize(window.innerWidth, window.innerHeight);

            container.appendChild(renderer.domElement);
            // console.log('renderer.domElement', renderer.domElement)


            // camera
            // var camera = new THREE.OrthographicCamera($("#container3d").width() / -2, $("#container3d").width() / 2, $("#container3d").height() / 2, $("#container3d").height() / -2, -500, 1000);
            var camera = new THREE.OrthographicCamera(self.width / -2, self.width / 2, self.height / 2, self.height / -2, -10000, 10000);

            // camera = new THREE.PerspectiveCamera(40, self.width / self.height, 1, 10000);

            // const camera = new THREE.PerspectiveCamera( 60, self.width / self.height, 0.01, 10000 );
            // var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -500, 1000);

            camera.position.set(0, 900, 0);
            // camera.enablePan= true;
            // camera.lookAt(scene.position);

            self.timeX = -500
            self.timeY = 500

            self.camera = camera;
            scene.add(camera);


            // camera.up.set(0, 0, 1);
            // console.log(self.camera.position)
            // controls
            var controls = new THREE.OrbitControls(camera, renderer.domElement);

            // CameraControls.install( { THREE: THREE } );

            // const controls = new CameraControls( camera, renderer.domElement );

            controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
            controls.dampingFactor = 0.25;

            controls.screenSpacePanning = false;

            controls.minDistance = 900;
            controls.maxDistance = 3000

            controls.minZoom = 0.5
            controls.maxZoom = 8

            controls.maxPolarAngle = Math.PI / 2;

            self.controls = controls;


            var rayCaster = new THREE.Raycaster();
            rayCaster.params.Points.threshold = 5;

            self.rayCaster = rayCaster

            // scene.add(new THREE.AmbientLight(0x222222));
            scene.add(new THREE.AmbientLight(0xffffff));
            var light = new THREE.PointLight(0xffffff, 1);
            camera.add(light);
            // detailCamera.add(light);

            var stats = new Stats();
            self.stats = stats;
            stats.dom.style.top = "50px"
            // console.log(container)
            container.appendChild(stats.dom);

            var group = new THREE.Group();
            self.group = group;
            group.name = "group"
            scene.add(group);

            var trajGroup = new THREE.Group();
            self.trajGroup = trajGroup;
            trajGroup.name = "trajGroup"
            scene.add(trajGroup);

            self.annotation = document.querySelector(".annotation");

            var axisHelper = new THREE.AxisHelper(150);
            // axisHelper.geometry.center()
            // scene.add(axisHelper);

            var gridHelper = new THREE.GridHelper(600, 20, 0x808080, 0x808080);
            gridHelper.position.y = 450;
            gridHelper.position.x = 0;
            gridHelper.position.z = 300;
            // scene.add(gridHelper);

            //3D flight model test

            var loader = new THREE.TGALoader();

            // add box 1 - grey8 texture

            var texture1 = loader.load('../data/a380_01.tga');

            self.flightMaterial1 = new THREE.MeshPhongMaterial({
                color: 0x29AAE3,
                map: texture1,
                emissive: 0x29AAE3,
                transparent: true,
                opacity: .75
            });
            self.flightMaterial0 = new THREE.MeshPhongMaterial({
                color: 0xD14745,
                map: texture1,
                emissive: 0xD14745,
                transparent: true,
                opacity: .75
            });

            self.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
            // self.flightMaterial0 = new THREE.MeshPhongMaterial({color: 0xD14745, map: texture1});

            var loader = new THREE.OBJLoader();
            loader.load('../data/A380.obj', function(object) {

                // For any meshes in the model, add our material.
                object.traverse(function(node) {

                    if (node.isMesh) node.material = self.flightMaterial0;

                });
                object.scale.set(.004, .004, .004)
                object.name = 'icon'
                object.rotateX(Math.PI / 2);
                object.rotateY(Math.PI);
                self.flightObject0 = object

            });
            loader.load('../data/A380.obj', function(object) {

                // For any meshes in the model, add our material.
                object.traverse(function(node) {

                    if (node.isMesh) node.material = self.flightMaterial1;

                });
                object.scale.set(.004, .004, .004)
                object.name = 'icon'
                object.rotateX(Math.PI / 2);
                object.rotateY(Math.PI);
                self.flightObject1 = object

                // var object = self.flightObject1.clone();
                // object.position.set(0, 30, 0)
                // // object.rotateY(Math.PI);
                // console.log(Math.PI)
                // // object.rotateZ(Math.PI/2)
                // self.scene.add(object)

            });


            // var texture = new TextTexture({
            //     text: 'Carpe Diem' + '\n' + 'mesh',
            //     // fontFamily: '"Times New Roman", Times, serif',
            //     fontSize: 12,
            //     fontStyle: 'italic',
            //     fontWeight: 'bold',
            //     textAlign: 'left',
            // });

            // var material = new THREE.MeshBasicMaterial({ color: 0xffffff, alphaTest: 0.5, transparent: true, opacity: .8, map: texture });

            // var geometry = new THREE.PlaneGeometry(100, 100, 10);

            // self.meshmesh = new THREE.Mesh(geometry, material);
            // self.meshmesh.scale.set(1, 1 / material.map.imageAspect, 1);
            // self.meshmesh.position.set(0, 100, 0)

            // console.log('materials', material)

            // var edges = new THREE.EdgesHelper(self.meshmesh, 0xffffff);
            // edges.material.linewidth = 2;
            // edges.position.set(0, 100, 0)
            // self.edges = edges
            // self.edges.scale.set(1, 1 / material.map.imageAspect, 1);
            // self.group.add(edges);

            // // self.meshmesh.opacity = 0.1

            // self.group.add(self.meshmesh);


            // var toolTip = self.toolTip('Carpe Diem' + '\n' + 'mesh')

            // self.group.add(toolTip[0])
            // self.group.add(toolTip[1])


            const toolTipGroup = new THREE.Group();
            toolTipGroup.name = "toolTipGroup"
            self.toolTipGroup = toolTipGroup
            self.scene.add(toolTipGroup);


            // var vector = new THREE.Vector3(0, 1, 0);
            //
            // var geometry = new THREE.CylinderGeometry(2, 2, 20, 4, 4);
            // var mesh = new THREE.Mesh(geometry, self.flightMaterial0);
            // var axis = new THREE.Vector3(0, 1, 0);
            // mesh.quaternion.setFromUnitVectors(axis, vector.clone().normalize());
            // scene.add(mesh)


            // var geometry1 = new THREE.Geometry();
            // geometry1.vertices.push(new THREE.Vector3(0, 0, 0));
            // geometry1.vertices.push(new THREE.Vector3(-257,-107.5,109.2));
            //
            // var line1 = new THREE.Line(geometry1, self.flightMaterial1);
            //
            // scene.add(line1);


            self.origpos = new THREE.Vector3().copy(camera.position); // original position
            self.origrot = new THREE.Euler().copy(camera.rotation); // original rotation


            self.textArray = [];

            var resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);

            self.dMaterial = new MeshLineMaterial({
                //
                color: new THREE.Color(0x29AAE3),
                // linewidth : .002,
                useMap: false,
                // color: new THREE.Color( colors[ c ] ),
                opacity: 1,
                resolution: resolution,
                sizeAttenuation: !false,
                lineWidth: .0035,
            });

            self.aMaterial = new MeshLineMaterial({
                color: new THREE.Color(0xD14745),
                // linewidth : .002,
                useMap: false,
                // color: new THREE.Color( colors[ c ] ),
                opacity: 1,
                resolution: resolution,
                sizeAttenuation: !false,
                lineWidth: 0.0035,
            });


            self.timeMaterial = new MeshLineMaterial({
                color: new THREE.Color(0xd9d9d9),
                // linewidth : .002,
                useMap: false,
                // color: new THREE.Color( colors[ c ] ),
                opacity: 1,
                resolution: resolution,
                sizeAttenuation: !false,
                lineWidth: 0.0025,
            });

            self.pointLineMaterial = new MeshLineMaterial({
                color: new THREE.Color(0xd9d9d9),
                // linewidth : .002,
                useMap: false,
                // color: new THREE.Color( colors[ c ] ),
                opacity: .7,
                resolution: resolution,
                sizeAttenuation: !false,
                lineWidth: 0.0015,
            });



            self.textAlign = THREE_Text.textAlign;
            self.SpriteText2D = THREE_Text.SpriteText2D;





            var sprite = new self.SpriteText2D("SPRITE", {
                align: self.textAlign.left,
                font: '20px Arial',
                fillStyle: '#ffffff',
                antialias: true
            });
            sprite.position.set(0, 200, 0);
            // sprite.scale.set(1.5, 1.5, 1.5);
            // sprite.material.alphaTest = 0.2;
            // scene.add(sprite);

            document.addEventListener('mousedown', self.getClicked3DPoint.bind(this), false);
            self.animate()

        },


        getClicked3DPoint: function(event) {
            var self = this
            event.preventDefault();
            // console.log("mousedown")


            // mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);

            //create a blue LineBasicMaterial

            var material = new THREE.LineBasicMaterial({ color: 0xffffff });

            var rect = self.renderer.domElement.getBoundingClientRect();

            var mouse = new THREE.Vector2();



            mouse.x = ((event.clientX - rect.left) / (rect.width - rect.left)) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1;
            self.rayCaster.setFromCamera(mouse, self.camera);

            // console.log(self.groupIcon)
            // console.log(self.trajGroup)
            var intersectTraj = self.rayCaster.intersectObjects(self.trajGroup.children, true);

            if (intersectTraj.length > 0) {
                console.log(intersectTraj[0])
            }


            var intersectParticles = self.rayCaster.intersectObject(self.particles);
            if (intersectParticles.length > 0) {
                console.log(intersectParticles[0])

                var getLine = self.trajGroup.getObjectByName('line' + intersectParticles[0].index)

                if (typeof(getLine) != 'undefined') {
                    self.trajGroup.remove(getLine)
                    self.trajGroup.remove(self.trajGroup.getObjectByName('line1' + intersectParticles[0].index))
                } else {

                    var d = intersectParticles[0].point

                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(d);
                    geometry.vertices.push(new THREE.Vector3(d.x, 0, d.z));

                    var line = new MeshLine();
                    line.setGeometry(geometry);

                    var mesh = new THREE.Mesh(line.geometry, self.pointLineMaterial);

                    var geometry1 = new THREE.Geometry();
                    geometry1.vertices.push(d);
                    geometry1.vertices.push(new THREE.Vector3(self.timeX, d.y, -self.timeY));

                    var line1 = new MeshLine();
                    line1.setGeometry(geometry1);

                    var mesh1 = new THREE.Mesh(line1.geometry, self.pointLineMaterial);

                    mesh.name = 'line' + intersectParticles[0].index
                    mesh1.name = 'line1' + intersectParticles[0].index


                    self.trajGroup.add(mesh);
                    self.trajGroup.add(mesh1);
                }

            }


            var intersects = self.rayCaster.intersectObjects(self.groupIcon.children, true);

            // console.log(intersects[0])
            // console.log(intersects[0].point.z)

            if (intersects.length > 0 && !Datacenter.timelineModel.get('play')) {
                // console.log(intersects[0].object.parent)
                var d = intersects[0].object.parent.userData

                var toolTip = self.toolTipGroup.getObjectByName(d.trajID)

                // console.log(toolTip)

                if (typeof(toolTip) != 'undefined') {
                    // console.log('lll')
                    self.toolTipGroup.remove(toolTip)
                    self.toolTipGroup.remove(self.toolTipGroup.getObjectByName(d.trajID))
                } else {
                    var tip = self.toolTip('Callsign: ' + d.callsign + '\n' +
                        'FlightType: ' + d.flightType + '\n' +
                        'TrajID: ' + d.trajID
                        // 'callsign'+d.callsign 
                    )

                    // console.log('tip', tip)
                    var point = intersects[0].point

                    tip[0].geometry.computeBoundingBox();
                    var box = tip[0].geometry.boundingBox
                    var x = (box.max.x - box.min.x) / 2 + 10
                    var y = (box.max.y - box.min.y) / 2 * tip[0].scale.y + 30
                    var z = (box.max.z - box.min.z) / 2
                    // console.log(x)
                    // console.log(y)
                    // console.log(z)

                    tip[0].geometry.translate(x, -y, z);
                    tip[1].geometry.translate(x, -y, z);



                    tip[0].position.set(point.x, point.y, point.z)
                    tip[1].position.set(point.x, point.y, point.z)
                    tip[0].name = d.trajID
                    tip[1].name = d.trajID
                    self.toolTipGroup.add(tip[0])
                    self.toolTipGroup.add(tip[1])


                    //                 function getCenterPoint(mesh) {
                    //     var geometry = mesh.geometry;
                    //     geometry.computeBoundingBox();   
                    //     center = geometry.boundingBox.getCenter();
                    //     mesh.localToWorld( center );
                    //     return center;
                    // }



                    // console.log(self.toolTipGroup)

                }

                // clickEvent.x = intersects[0].point.x;
                // clickEvent.y = intersects[0].point.y;
                // clickEvent.z = intersects[0].point.z;

                // var lines = scene.getObjectByName("line");
                // scene.remove(lines);
                // var line1 = scene.getObjectByName("line1");
                // scene.remove(line1);

                // var geometry = particleSystem.geometry;
                // var attributes = geometry.attributes;

                // INTERSECTED = intersects[0].index;

                // // intersects[0].object.material.color.setHex( Math.random() * 0xffffff );

                // var point = particleSystem.geometry.vertices[INTERSECTED];
                // point.x += 1;



                // var geometry = new THREE.Geometry();
                // geometry.vertices.push(intersects[0].point);
                // geometry.vertices.push(new THREE.Vector3(intersects[0].point.x, intersects[0].point.y, 0));

                // var line = new THREE.Line(geometry, material);
                // line.name = "line"

                // var geometry1 = new THREE.Geometry();
                // geometry1.vertices.push(intersects[0].point);
                // geometry1.vertices.push(new THREE.Vector3(timeX, timeY, intersects[0].point.z));

                // var line1 = new THREE.Line(geometry1, material);
                // line1.name = "line1"

                // scene.add(line);
                // scene.add(line1);

                // annotation.style.opacity = 0.8;
                // sprite.material.opacity = 0.7;

                // var data = pointArray[intersects[0].index];


            }

        },

        actionInit: function() {
            var self = this

            $('#building-check').change(function() {

                // self.model.set("routeShow", this.checked);
                self.scene.remove(self.scene.getObjectByName('buildingGroup'))

                if (this.checked) {

                    const groupBuilding = new THREE.Group();
                    groupBuilding.name = "buildingGroup"
                    self.scene.add(groupBuilding);


                    // add building

                    var buildingM = new THREE.MeshPhongMaterial({
                        color: 0x525252,
                        emissive: 0x252525,
                        transparent: true,
                        opacity: .95
                    });

                    var mtlLoader = new THREE.MTLLoader();
                    mtlLoader.setPath('../data/');
                    mtlLoader.load('building.mtl', function(materials) {

                        materials.preload();
                        console.log(materials)
                        materials.materials.blinn1SG.color.setHex(0xbdbdbd);
                        var objLoader = new THREE.OBJLoader();
                        objLoader.setPath('../data/');
                        objLoader.load('building.obj', function(object) {

                            object.traverse(function(child) {
                                if (child instanceof THREE.Mesh) {
                                    child.material = buildingM;

                                }
                            });

                            object.position.set(-320, 0, 50)
                            // object.rotation.y = 0.5;
                            // console.log(object)
                            object.scale.set(0.2, 0.2, 0.2);
                            groupBuilding.add(object);

                        });

                    })


                    var objLoader = new THREE.OBJLoader();
                    objLoader.setPath('../data/');
                    objLoader.load('building.obj', function(object) {

                        object.traverse(function(child) {
                            if (child instanceof THREE.Mesh) {
                                child.material = buildingM;

                            }
                        });

                        object.position.set(-320, 0, 50)
                        // object.rotation.y = 0.5;
                        // console.log(object)
                        object.scale.set(0.2, 0.2, 0.2);
                        groupBuilding.add(object);

                    });

                    objLoader.load('bina2.obj', function(object) {

                        object.traverse(function(child) {
                            if (child instanceof THREE.Mesh) {
                                child.material = buildingM;

                            }
                        });

                        // console.log(object)

                        object.position.set(-320, 0, 80)
                        // object.rotation.y = 0.5;
                        object.scale.set(0.45, 0.45, 0.45);
                        groupBuilding.add(object);

                    });

                }

            });

            $('#orthCamera').click(function() {
                console.log('orth')

                var resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);


                self.dMaterial = new MeshLineMaterial({
                    //
                    color: new THREE.Color(0x29AAE3),
                    // linewidth : .002,
                    useMap: false,
                    // color: new THREE.Color( colors[ c ] ),
                    opacity: 1,
                    resolution: resolution,
                    sizeAttenuation: !false,
                    lineWidth: .0035,
                });

                self.aMaterial = new MeshLineMaterial({
                    color: new THREE.Color(0xD14745),
                    // linewidth : .002,
                    useMap: false,
                    // color: new THREE.Color( colors[ c ] ),
                    opacity: 1,
                    resolution: resolution,
                    sizeAttenuation: !false,
                    lineWidth: 0.0035,
                });


                self.timeMaterial = new MeshLineMaterial({
                    color: new THREE.Color(0xd9d9d9),
                    // linewidth : .002,
                    useMap: false,
                    // color: new THREE.Color( colors[ c ] ),
                    opacity: 1,
                    resolution: resolution,
                    sizeAttenuation: !false,
                    lineWidth: 0.0025,
                });

                self.pointLineMaterial = new MeshLineMaterial({
                    color: new THREE.Color(0xd9d9d9),
                    // linewidth : .002,
                    useMap: false,
                    // color: new THREE.Color( colors[ c ] ),
                    opacity: .7,
                    resolution: resolution,
                    sizeAttenuation: !false,
                    lineWidth: 0.0015,
                });


                var position = self.camera.position
                var rotation = self.camera.rotation
                // var scale = self.camera.scale
                //
                var zoom = self.controls.object.zoom
                var target = self.controls.target

                // self.camera = new THREE.PerspectiveCamera(60, self.width / self.height, 1, 10000);
                self.camera = new THREE.OrthographicCamera(self.width / -2, self.width / 2, self.height / 2, self.height / -2, -10000, 10000);

                // console.log(position)
                self.controls.minDistance = 500;
                self.controls.maxDistance = 2000

                self.controls.minZoom = 0.5
                self.controls.maxZoom = 8



                self.camera.position.copy(position);
                self.camera.rotation.copy(rotation);
                self.camera.zoom = zoom
                // self.camera.up.set(0, 0, 1);

                // self.camera.position.set(0, 0, 800);

                self.controls = new THREE.OrbitControls(self.camera, self.renderer.domElement);
                self.controls.maxPolarAngle = Math.PI / 2;
                self.controls.target = target


                window.map3d.rendererMap();
                window.map3d.renderAxisbyTime();

                window.map3d.scene.remove(window.map3d.scene.getObjectByName('airRoute'))
                window.map3d.rendererRoute()
                // map3d.renderCubes();
                // map3d.renderTrajectoriesbyTime();
                // map3d.renderAxisbyTime();


                window.map3d.renderTrajectoriesbyTime(Datacenter.get('filterArray'))
                window.map3d.renderIcon(Config.get('curTime'))




            })

            $('#persCamera').click(function() {
                console.log('pers')

                var resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);



                self.aMaterial = new MeshLineMaterial({
                    //
                    color: new THREE.Color(0xD14745),
                    // linewidth : .002,
                    useMap: false,
                    // color: new THREE.Color( colors[ c ] ),
                    opacity: 1,
                    resolution: resolution,
                    sizeAttenuation: !false,
                    lineWidth: 3,
                });

                self.dMaterial = new MeshLineMaterial({
                    color: new THREE.Color(0x29AAE3),
                    // linewidth : .002,
                    useMap: false,
                    // color: new THREE.Color( colors[ c ] ),
                    opacity: 1,
                    resolution: resolution,
                    sizeAttenuation: !false,
                    lineWidth: 3,
                });

                self.timeMaterial = new MeshLineMaterial({
                    color: new THREE.Color(0xd9d9d9),
                    // linewidth : .002,
                    useMap: false,
                    // color: new THREE.Color( colors[ c ] ),
                    opacity: 1,
                    resolution: resolution,
                    sizeAttenuation: !false,
                    lineWidth: 2,
                });

                self.pointLineMaterial = new MeshLineMaterial({
                    color: new THREE.Color(0xd9d9d9),
                    // linewidth : .002,
                    useMap: false,
                    // color: new THREE.Color( colors[ c ] ),
                    opacity: .7,
                    resolution: resolution,
                    sizeAttenuation: !false,
                    lineWidth: 2,
                });



                var position = self.camera.position
                var rotation = self.camera.rotation
                var zoom = self.camera.zoom
                var target = self.controls.target

                console.log(self.controls)


                self.camera = new THREE.PerspectiveCamera(60, self.width / self.height, 1, 10000);

                // console.log(position)

                self.camera.position.copy(position);
                self.camera.rotation.copy(rotation);
                self.camera.zoom = zoom
                // self.camera.up.set(0, 0, 1);

                console.log(self.camera)

                self.controls = new THREE.OrbitControls(self.camera, self.renderer.domElement);

                // self.controls.object.zoom = zoom
                self.controls.maxPolarAngle = Math.PI / 2;
                self.controls.target.copy(target)

                self.controls.minDistance = 500;
                self.controls.maxDistance = 4000

                self.controls.minZoom = 0.4
                self.controls.maxZoom = 2.5


                window.map3d.rendererMap();
                window.map3d.renderAxisbyTime();

                window.map3d.scene.remove(window.map3d.scene.getObjectByName('airRoute'))
                window.map3d.rendererRoute()
                // map3d.renderCubes();
                // map3d.renderTrajectoriesbyTime();
                // map3d.renderAxisbyTime();


                window.map3d.renderTrajectoriesbyTime(Datacenter.get('filterArray'))
                window.map3d.renderIcon(Config.get('curTime'))


            })

            $("#viewDropdown ul li").click(function(evt) {
                var view = evt.target.getAttribute("value");
                $("#viewDropdown button").html(view + ' <span class=\"caret\"></span>');
                // self.model.set("playspeed", +speed);

                var positionV, rotationV, zoomV, controlsV
                if (view == 'Top') {
                    positionV = { x: 0, y: 900, z: 0 }
                    zoomV = 1
                    rotationV = { x: -1.57, y: 0, z: -0.2 }
                    controlsV = { x: 0, y: 0, z: 0 }

                } else if (view == 'Middle') {
                    positionV = { x: -66.55, y: 619.05, z: 856.50 }
                    zoomV = 0.56
                    rotationV = { x: -0.51, y: -0.07, z: -0.04 }
                    // rotationV = { x: -1.57, y: 0, z: -0.05 }

                    controlsV = { x: 0.21, y: 179.58, z: 73.94 }

                } else {
                    positionV = { x: -71.82, y: 194.7, z: 1089.27 }
                    zoomV = .95
                    rotationV = { x: 0, y: 0, z: 4 }
                    controlsV = { x: -74.07, y: 194.7, z: 189.27 }
                }


                console.log(self.camera.rotation)
                console.log(self.camera.position)
                console.log(rotationV)
                console.log(rotationV)

                // self.camera.rotation.eulerOrder = 'ZYX';




                new TWEEN.Tween(self.camera.position)
                    .to(positionV, 1500)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .start()

                new TWEEN.Tween(self.camera.rotation)
                    .to(rotationV, 1500)
                    .easing(TWEEN.Easing.Quadratic.In)
                    // .onUpdate(function() {
                    //     // console.log(this.z);
                    //     // self.controls.object.rotation.z = this.z
                    //     // self.camera.updateProjectionMatrix()
                    // })
                    .start()

                var zoom = {
                    value: self.controls.object.zoom // from current zoom (no matter if it's more or less than 1)
                };

                var zoomEnd = {
                    value: zoomV // to the zoom of 1
                };

                var tweenZoomToReset = new TWEEN.Tween(zoom).to(zoomEnd, 1500); // duration of tweening is 0.5 second
                tweenZoomToReset.onUpdate(function() {
                    // console.log(zoom)
                    self.controls.object.zoom = zoom.value;
                });
                tweenZoomToReset.start();


                new TWEEN.Tween(self.controls.target)
                    .to(controlsV, 1500)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .start()

            })

        },

        toolTip: function(str) {

            var texture = new TextTexture({
                text: str,
                // fontFamily: '"Times New Roman", Times, serif',
                fontSize: 13,
                // fontStyle: 'italic',
                fontWeight: 'bold',
                textAlign: 'left',
            });

            var material = new THREE.MeshBasicMaterial({ color: 0xffffff, alphaTest: 0.5, transparent: true, opacity: .8, map: texture });

            var geometry = new THREE.PlaneGeometry(100, 100, 10);

            var mesh = new THREE.Mesh(geometry, material);

            mesh.scale.set(1, 1 / material.map.imageAspect, 1);
            // self.meshmesh.position.set(0, 100, 0)

            // console.log('materials', material)

            var edges = new THREE.EdgesHelper(mesh, 0xffffff);
            edges.material.linewidth = 2;
            // edges.position.set(0, 100, 0)
            edges.scale.set(1, 1 / material.map.imageAspect, 1);

            return [mesh, edges];

        },

        renderAxisbyTime: function() {
            var self = this;
            if (d3.select("#map3d").classed('hidden')) return;

            self.scene.remove(self.scene.getObjectByName('axisGroup'))

            const groupDot = new THREE.Group();
            groupDot.name = "axisGroup"
            self.scene.add(groupDot);

            var x = self.timeX,
                y = self.timeY;

            var zLen = 550

            self.zLen = zLen

            var from = new THREE.Vector3(x, 0, -y);
            var to = new THREE.Vector3(x, zLen, -y);

            var geometry1 = new THREE.Geometry();
            geometry1.vertices.push(from);
            geometry1.vertices.push(to);

            var line = new MeshLine();
            line.setGeometry(geometry1);

            var mesh = new THREE.Mesh(line.geometry, self.timeMaterial);

            // var line = new THREE.Line(geometry1, self.dMaterial);
            // line.name = "line1"

            groupDot.add(mesh);

            let geometry = new THREE.CylinderGeometry(0, 7, 20, 32, 1, false);
            // let material = new THREE.MeshPhongMaterial({color: 0xffffff, side:THREE.DoubleSide});
            var material = new THREE.MeshBasicMaterial({ color: 0xd9d9d9 });
            let cone = new THREE.Mesh(geometry, material);
            // cone.rotateX(Math.PI / 2);
            cone.position.set(x, zLen, -y);
            groupDot.add(cone);

            // console.log(Config.get('slideWindowL'))




            // var scale = d3.scale.linear()
            //     .domain([map.minTime, map.maxTime])
            //     .range([0, zLen]);


            var formatAll = d3.time.format("%Y/%m/%d");
            var format = d3.time.format("%H:%M");
            // xScale.domain([format.parse("2017/10/22"), format.parse("2017/10/30")]).nice();


            // var text = maxAxisLen / 5 * i;

            var sprite = new self.SpriteText2D('Time', {
                align: self.textAlign.left,
                font: '20px Arial',
                fillStyle: '#ffffff',
                antialias: true
            });
            sprite.position.set(x, zLen - 10, -y);
            // sprite.scale.set(1.5, 1.5, 1.5);
            // sprite.material.alphaTest = 0.2;
            groupDot.add(sprite);

            var dotMaterial = new THREE.PointsMaterial({ size: 3, sizeAttenuation: false });



            var timeLen = (Config.get('slideWindowR') - Config.get('slideWindowL')) / 5

            // console.log(timeLen)






            zLen -= 120

            self.zLen = zLen

            var sprite = new self.SpriteText2D(formatAll(new Date(Config.get('slideWindowR'))), {
                align: self.textAlign.left,
                font: '18px Arial',
                fillStyle: '#ffffff',
                antialias: true
            });

            sprite.name = 'timeAxisLabel'
            sprite.position.set(x, zLen + 80, -y);

            groupDot.add(sprite)

            for (var i = 0; i <= 5; i++) {

                var content = new Date(+Config.get('slideWindowL') + i * timeLen);
                // console.log(content)
                // console.log(new Date(1477499600000))

                var sprite = new self.SpriteText2D(format(content), {
                    align: self.textAlign.left,
                    font: '18px Arial',
                    fillStyle: '#ffffff',
                    antialias: true
                });


                sprite.position.set(x, zLen / 5 * i + 20, -y);
                sprite.name = 'timeAxisLabel'
                groupDot.add(sprite)


                var dotGeometry = new THREE.Geometry();
                dotGeometry.vertices.push(new THREE.Vector3(x, zLen / 5 * i + 20, -y));
                var dot = new THREE.Points(dotGeometry, dotMaterial);
                dot.name = "timelineDot"
                groupDot.add(dot);

            }

            // for (var i = 1; i <= 5; i++) {
            //
            //     var content = new Date(+map.minTime * 1000 + i * timeLen);
            //     // console.log(content)
            //     // console.log(new Date(1477499600000))
            //
            //     var text = self.createTextLabel();
            //     text.setHTML(format(content));
            //     text.setPosition(x, y - 60, zLen / 5 * i - 60);
            //     // console.log(330 / 5 * i)
            //     self.container.appendChild(text.element);
            //     textArray.push(text);
            //
            //     var dotGeometry = new THREE.Geometry();
            //     dotGeometry.vertices.push(new THREE.Vector3(x, y, zLen / 5 * i));
            //     var dot = new THREE.Points(dotGeometry, dotMaterial);
            //     dot.name = "timelineDot"
            //     groupDot.add(dot);
            // }

            // console.log(self.scene.getObjectByName("timelineDot"))
            // self.textArray.forEach(function(d, i) {
            //     d.updatePosition(self.camera, self.container);
            // });


        },

        addGatePoints: function(ifShow) {
            var self = this

            // console.log('gatePositionData', Datacenter.get('gatePositionData'))

            self.scene.remove(self.scene.getObjectByName('gateGroup'))

            if (ifShow) {

                const gateGroup = new THREE.Group();
                gateGroup.name = "gateGroup"
                self.scene.add(gateGroup);

                var data = Datacenter.get('gatePositionData')

                var dotMaterial = new THREE.PointsMaterial({ size: 4, sizeAttenuation: false, color: 0xfec44f });


                data.forEach(function(d, i) {

                    var dotGeometry = new THREE.Geometry();

                    var position0 = window.map.map.latLngToContainerPoint(L.latLng(d.lat, d.lon));
                    var point0 = new THREE.Vector3(position0.x - .5 * self.width, 6, (position0.y - .5 * self.height));
                    dotGeometry.vertices.push(point0);
                    var dot = new THREE.Points(dotGeometry, dotMaterial);
                    gateGroup.add(dot);

                })

            }

        },

        addGatePointLabels: function(ifShow) {
            var self = this;

            self.scene.remove(self.scene.getObjectByName('gatelabelGroup'))

            if (ifShow) {

                const gatelabelGroup = new THREE.Group();
                gatelabelGroup.name = "gatelabelGroup"
                self.scene.add(gatelabelGroup);

                var data = Datacenter.get('gatePositionData')

                var dotMaterial = new THREE.PointsMaterial({ size: 4, sizeAttenuation: false, color: 0xfec44f });


                data.forEach(function(d, i) {

                    var position0 = window.map.map.latLngToContainerPoint(L.latLng(d.lat, d.lon));
                    var point0 = new THREE.Vector3(position0.x - .5 * self.width, 20, (position0.y - .5 * self.height));

                    var sprite = new self.SpriteText2D(d.id, {
                        align: self.textAlign.left,
                        font: '10px Arial',
                        fillStyle: '#fec44f',
                        antialias: true
                    });

                    sprite.position.copy(point0);

                    gatelabelGroup.add(sprite)


                })

            }

        },

        createLabel: function(text, x, y, z) {
            var self = this
            // size = arguments[4] || 30
            // color = arguments[5] || '#ffffff'

            var PIXEL_RATIO = (function() {
                var ctx = document.createElement("canvas").getContext("2d"),
                    dpr = window.devicePixelRatio || 1,
                    bsr = ctx.webkitBackingStorePixelRatio ||
                    ctx.mozBackingStorePixelRatio ||
                    ctx.msBackingStorePixelRatio ||
                    ctx.oBackingStorePixelRatio ||
                    ctx.backingStorePixelRatio || 1;

                return dpr / bsr;
            })();


            var createHiDPICanvas = function(w, h, ratio) {
                if (!ratio) {
                    ratio = PIXEL_RATIO;
                }
                var can = document.createElement("canvas");
                can.width = w * ratio;
                can.height = h * ratio;
                can.style.width = w + "px";
                can.style.height = h + "px";
                can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
                return can;
            }

            // var canvas = createHiDPICanvas(20, 10),
            var canvas = document.createElement("canvas"),
                ctx = canvas.getContext('2d');

            ctx.font = "30px Arial";
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, 50, 50);


            // canvas contents will be used for a texture
            var texture1 = new THREE.Texture(canvas)
            texture1.needsUpdate = true;

            var material1 = new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide });
            material1.transparent = true;
            var mesh1 = new THREE.Mesh(
                new THREE.PlaneGeometry(canvas.width, canvas.height),
                material1
            );
            mesh1.position.set(x, y, z);

            return mesh1;
        },

        rendererMap: function() {
            var self = this;

            var textureLoader = new THREE.TextureLoader();

            // var imgW = self.width > 1280 ? 1280 : self.width;
            // var imgH = self.height > 1280 ? 1280 : self.height;
            var imgW = 1024;
            var imgH = 1024;

            textureLoader.crossOrigin = '';
            // console.log(window.map.map.getZoom())

            self.group.remove(self.group.getObjectByName("mapPlane"))


            var zoom = window.map.map.getZoom()
            var img = new THREE.MeshLambertMaterial({
                map: textureLoader.load('https://api.mapbox.com/v4/mapbox.dark/' + window.map.centerLL.lng + ',' + window.map.centerLL.lat + ',' + zoom + '/' + imgW + 'x' + imgH + '.png?access_token=pk.eyJ1IjoieWV0YW5nemhpIiwiYSI6ImNpajFrdmJ1aDAwYnF0b2x6cDA2bndybjgifQ.g9phAioL8kT5ik4jGg6kNQ'),
                side: THREE.DoubleSide,
            });

            // plane
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(imgW, imgH), img);
            plane.rotation.set(-Math.PI / 2, 0, 0);

            plane.opacity = 0.1
            plane.overdraw = true;
            plane.name = 'mapPlane'

            // var mouseOffset = $('#mapid').offset();
            // console.log(mouseOffset)
            // plane.position.y += mouseOffset.top;

            self.group.add(plane);

            // console.log(self.scene)


            // var axisHelper = new THREE.AxisHelper(50);
            // // axisHelper.geometry.center()
            // scene.add(axisHelper);

            //add the ROUTE

            // console.log(Datacenter.get('routePointData'))

        },

        rendererRoute: function(routeShow) {

            var self = this;

            if (routeShow) {

                var gateGroup = new THREE.Group();
                gateGroup.name = "airRoute"
                self.scene.add(gateGroup);

                var routeMaterial = new MeshLineMaterial({
                    color: new THREE.Color(0x969696),
                    // linewidth : .002,
                    useMap: false,
                    // color: new THREE.Color( colors[ c ] ),
                    opacity: 1,
                    resolution: self.resolution,
                    sizeAttenuation: !false,
                    lineWidth: 0.004,
                });

                Datacenter.get('routePointData').link.forEach(function(d) {
                    var geometry = new THREE.Geometry();
                    var position0 = window.map.map.latLngToContainerPoint(L.latLng(d.src.lat, d.src.lon));
                    var position1 = window.map.map.latLngToContainerPoint(L.latLng(d.dst.lat, d.dst.lon));
                    var point0 = new THREE.Vector3(position0.x - 0.5 * self.width, 5, (position0.y - 0.5 * self.height));
                    var point1 = new THREE.Vector3(position1.x - 0.5 * self.width, 5, (position1.y - 0.5 * self.height));
                    geometry.vertices.push(point0);
                    geometry.vertices.push(point1);

                    var line = new MeshLine();
                    line.setGeometry(geometry);

                    var mesh = new THREE.Mesh(line.geometry, routeMaterial);
                    gateGroup.add(mesh);

                })

            } else {
                self.scene.remove(self.scene.getObjectByName('airRoute'))

            }

        },

        transform2D: function() {

            var self = this;

            if (d3.select("#mapBackground").classed('hidden')) {

                $("#timeline").css({ 'background-color': '#111' });
                $("#ProjectTitle").css({ 'background-color': '#111' });

                var tween1 = $.Deferred();
                var tween2 = $.Deferred();
                var tween3 = $.Deferred();
                var tween4 = $.Deferred();

                // var controls = self.controls;
                // controls.reset()

                var tweenPositionToReset = new TWEEN.Tween(self.camera.position)
                    .to({ x: self.origpos.x, y: self.origpos.y, z: self.origpos.z }, 1500)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .start()
                // .onComplete(function() {
                //     tween1.resolve();
                // });
                var tweenRotationToReset = new TWEEN.Tween(self.camera.rotation)
                    .to({ x: self.origrot.x, y: self.origrot.y, z: self.origrot.z }, 1500)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .start()
                //.onComplete(function() {
                //     tween3.resolve();
                // });


                tweenPositionToReset.onComplete(function() {
                    tween1.resolve();
                });

                tweenRotationToReset.onComplete(function() {
                    tween2.resolve();
                });

                var zoom = {
                    value: self.controls.object.zoom // from current zoom (no matter if it's more or less than 1)
                };
                var zoomEnd = {
                    value: 1 // to the zoom of 1
                };
                var tweenZoomToReset = new TWEEN.Tween(zoom).to(zoomEnd, 1500); // duration of tweening is 0.5 second
                tweenZoomToReset.onUpdate(function() {
                    // console.log(zoom)
                    self.controls.object.zoom = zoom.value;
                });
                tweenZoomToReset.start();


                new TWEEN.Tween(self.controls.target)
                    .to({ x: 0, y: 0, z: 0 }, 1500)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .start()
                    .onComplete(function() {

                        tween4.resolve();
                    });

                tweenZoomToReset.onComplete(function() {
                    tween3.resolve();
                });

                $.when(tween1, tween2, tween3, tween4).done(function() {

                    $("#map3d").addClass("hidden");
                    $("#mapBackground").removeClass("hidden");

                    window.map.animationlayer.updateData();
                    window.map.animationlayer.renderCircle(Config.get('curTime'))


                    // self.controls.reset();

                });

            }

        },

        renderIcon: function(curT) {
            var self = this;
            if (d3.select("#map3d").classed('hidden')) return;

            self.scene.remove(self.scene.getObjectByName('groupIcon'))

            const groupIcon = new THREE.Group();
            groupIcon.name = "groupIcon"
            self.scene.add(groupIcon);

            self.groupIcon = groupIcon

            var data = Datacenter.get('filterArray');

            if (curT > Config.get('slideWindowR'))
                curT = Config.get('slideWindowR')
            else if (curT < Config.get('slideWindowL'))
                curT = Config.get('slideWindowL')

            // console.log(data)


            data.forEach(function(d, i) {

                var projPoint, curTime;
                var rightIndex = d.filterTraj.findIndex(function(arr) {
                    return arr.timestamp >= curT
                })
                // console.log('rightIndex', rightIndex)
                // console.log('curT', curT)
                // console.log('d.filterTraj[0].timestamp', d.filterTraj[0].timestamp)
                if (rightIndex > 0) {
                    var interpolateObj = interpolate(d.filterTraj[rightIndex - 1], d.filterTraj[rightIndex], curT)
                    curTime = interpolateObj.timestamp
                    projPoint = (L.latLng(interpolateObj.lat, interpolateObj.lon))
                } else if (rightIndex == 0 && d.filterTraj[0].timestamp == curT) {
                    projPoint = (L.latLng(d.filterTraj[0].lat, d.filterTraj[0].lon))
                    curTime = d.filterTraj[0].timestamp
                } else if (d.type == 1 && rightIndex < 0) {
                    rightIndex = d.filterTraj.length - 1
                    projPoint = (L.latLng(d.filterTraj[rightIndex].lat, d.filterTraj[rightIndex].lon))
                    curTime = d.filterTraj[rightIndex].timestamp

                }

                if (rightIndex > 0 || (rightIndex == 0 && d.filterTraj[0].timestamp == curT)) {

                    if (rightIndex == 0)
                        rightIndex = 1

                    var position = window.map.map.latLngToContainerPoint(L.latLng(d.filterTraj[rightIndex].lat, d.filterTraj[rightIndex].lon));
                    var point = new THREE.Vector3((position.x - 0.5 * self.width), self.hScale(curTime), (position.y - 0.5 * self.height));

                    var position0 = window.map.map.latLngToContainerPoint(L.latLng(d.filterTraj[rightIndex - 1].lat, d.filterTraj[rightIndex - 1].lon));
                    var point0 = new THREE.Vector3((position0.x - 0.5 * self.width), self.hScale(curTime), (position0.y - 0.5 * self.height));

                    var rotate = 0


                    // console.log(d)
                    if (typeof(d.filterTraj[rightIndex].id) != 'undefined' && d.filterTraj[rightIndex].id.substr(0, 1) == 'g' && d.type == 0) {
                        // console.log(d.filterTraj[0].id)
                        rotate = Math.PI
                    }

                    var dx = (point.x - point0.x),
                        dy = (point.z - point0.z);
                    // var theta = Math.atan2(dy, dx) - Math.PI / 2 + rotate + 0.1;

                    var theta = Math.PI / 2 - Math.atan2(dy, dx);

                    // console.log(theta)

                    // var angle = (((theta * 180) / Math.PI)) % 360;
                    // angle = (angle < 0) ? (360 + angle + rotate) : (angle + rotate);

                    // console.log()

                    if (d.type == 1) {
                        var object = self.flightObject0.clone();
                        object.position.copy(point)
                        object.rotateZ(theta)
                        object.name = d.trajID
                        object.userData = d

                        // console.log(object)
                        groupIcon.add(object)

                    } else {
                        var object = self.flightObject1.clone();
                        object.position.copy(point)
                        object.rotateZ(theta)
                        object.name = d.trajID
                        object.userData = d
                        groupIcon.add(object)
                    }



                }


            })


            // console.log(groupIcon)

            // var rightIndex = d.filterTraj.findIndex(function (arr) {
            //                 return arr.timestamp >= curT
            //             })


            //             // console.log('rightIndex', rightIndex)
            //             // console.log('curT', curT)
            //             // console.log('d.filterTraj[0].timestamp', d.filterTraj[0].timestamp)
            //             if (rightIndex > 0) {
            //                 var interpolateObj = self.interpolate(d.filterTraj[rightIndex - 1], d.filterTraj[rightIndex], curT)
            //                 d.projPoint = proj.latLngToLayerPoint(L.latLng(interpolateObj.lat, interpolateObj.lon))
            //             }
            //             d.rightIndex = rightIndex
            //             if (rightIndex == 0)
            //                 return d.filterTraj[0].timestamp == curT;

            //             if (d.type == 1 && rightIndex < 0) {
            //                 d.rightIndex = d.filterTraj.length - 1
            //                 d.projPoint = proj.latLngToLayerPoint(L.latLng(d.filterTraj[d.rightIndex].lat, d.filterTraj[d.rightIndex].lon))
            //                 return true
            //             }
            //             return rightIndex > 0;



            function interpolate(dataT0, dataT1, time) {
                var latScale = d3.scale.linear()
                    .range([dataT0.lat, dataT1.lat])
                    .domain([dataT0.timestamp, dataT1.timestamp]);

                var lngScale = d3.scale.linear()
                    .range([dataT0.lon, dataT1.lon])
                    .domain([dataT0.timestamp, dataT1.timestamp]);

                var speedScale = d3.scale.linear()
                    .range([dataT0.speed, dataT1.speed])
                    .domain([dataT0.timestamp, dataT1.timestamp]);

                var obj = new Object();
                obj.lat = latScale(time)
                obj.lon = lngScale(time)
                obj.speed = speedScale(time)
                // obj.callsign = callsign
                // obj.trajID = trajID
                obj.id = dataT0.id
                obj.timestamp = time;

                return obj;
            }


        },

        renderTrajectoriesbyTime: function(trajArray) {
            var self = this;
            // console.log(trajArray)
            // console.log(self.scene)

            if (d3.select("#map3d").classed('hidden')) return;

            // if (self.scene.getObjectByName("arrTraj") !== undefined){
            //
            //     console.log('A', self.scene.getObjectByName("arrTraj") )
            //     self.scene.getObjectByName("arrTraj").children.forEach(function (d, i) {
            //         self.scene.remove(self.scene.children[i]);
            //     })
            //
            // }
            //
            // if (self.scene.getObjectByName("depTraj") !== undefined)
            //     self.scene.getObjectByName("depTraj").children.forEach(function (d, i) {
            //         self.scene.remove(self.scene.children[i]);
            //     })

            // console.log('timelineTopRange', Config.get('timelineTopRange'))

            // var hScale = d3.scale.linear()
            //     .domain(Config.get('timelineTopRange'))
            //     .range([20, self.zLen]);

            var dotMaterial = new THREE.PointsMaterial({ size: 5, sizeAttenuation: false });
            var pointArray = new Array()

            self.pointArray = pointArray

            var dotGeometry = new THREE.Geometry();


            var hScale = d3.scale.linear()
                .domain([Config.get('slideWindowL'), Config.get('slideWindowL') + Config.get('slidingwindowsize')])
                .range([20, self.zLen]);

            self.hScale = hScale

            for (var i = self.trajGroup.children.length - 1; i >= 0; i--) {
                self.trajGroup.remove(self.trajGroup.children[i]);
            }

            // console.log(self.scene.getObjectByName('particles'))

            self.scene.remove(self.scene.getObjectByName('particles'))

            // console.log(self.scene)

            //remove the trajs

            trajArray.forEach(function(d) {

                var Geometry = new THREE.Geometry();

                var len = d.filterTraj.length - 1
                d.filterTraj.forEach(function(d, i) {
                    // if (d.Timestamp < map.maxTime && d.Timestamp > map.minTime) {


                    // var latlng = d.Position.split(",")

                    // var point = new THREE.Vector3((+latlng[1] - map.centerLL.lng) * map.lenPerLong, (+latlng[0] - map.centerLL.lat) * map.lenPerLati, +d.Altitude / meterPerLati * map.lenPerLati);

                    // if (+latlng[0] >= map.maxBound.lat && +latlng[0] <= map.minBound.lat && +latlng[1] <= map.maxBound.lng && +latlng[1] >= map.minBound.lng) {
                    var position = window.map.map.latLngToContainerPoint(L.latLng(d.lat, d.lon));
                    var point = new THREE.Vector3((position.x - 0.5 * self.width), hScale(d.timestamp), (position.y - 0.5 * self.height));


                    if (!d.isKeyPoint && i < len) {
                        dotGeometry.vertices.push(point);
                        // // altitudeArray.push
                        pointArray.push(d);


                    }

                    Geometry.vertices.push(point);

                    // }
                    // }

                })


                if (Geometry.vertices.length > 0) {

                    var line = new MeshLine();
                    line.setGeometry(Geometry);
                    if (d.type === 1) {
                        var mesh = new THREE.Mesh(line.geometry, self.aMaterial);
                        mesh.userData = d.filterTraj
                        mesh.name = 'arrTraj'

                    } else {
                        var mesh = new THREE.Mesh(line.geometry, self.dMaterial);
                        mesh.userData = d.filterTraj
                        mesh.name = 'depTraj'

                    }
                    self.trajGroup.add(mesh);
                }

            })


            var positions = new Float32Array(dotGeometry.vertices.length * 3);
            var colors = new Float32Array(dotGeometry.vertices.length * 3);
            var sizes = new Float32Array(dotGeometry.vertices.length);
            var opacitys = new Float32Array(dotGeometry.vertices.length);

            var PARTICLE_SIZE = 20;

            var vertex;
            var color;

            var opacityLinear = d3.scale.linear()
                .domain(d3.extent(pointArray, function(d) {
                    return d.speed
                }))
                .range([1, 0.2]);

            var sizeLinear = d3.scale.linear()
                .domain(d3.extent(pointArray, function(d) {
                    return d.speed
                }))
                .range([800, 1600]);

            for (var i = 0, l = dotGeometry.vertices.length; i < l; i++) {

                vertex = dotGeometry.vertices[i];
                vertex.toArray(positions, i * 3);

                color = new THREE.Color(0xd9d9d9);
                color.toArray(colors, i * 3);


                sizes[i] = sizeLinear(pointArray[i].speed);
                opacitys[i] = opacityLinear(pointArray[i].speed);

            }

            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
            geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
            // geometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

            //

            var material = new THREE.ShaderMaterial({

                uniforms: {
                    color: { value: new THREE.Color(0xffffff) },
                    texture: { value: new THREE.TextureLoader().load("../data/disc.png") }
                },
                vertexShader: document.getElementById('vertexshader').textContent,
                fragmentShader: document.getElementById('fragmentshader').textContent,
                transparent: true,
                alphaTest: 0.2

            });

            //

            var particles = new THREE.Points(geometry, material);
            particles.name = 'particles'

            self.particles = particles

            particles.visible = self.model.get('keyPointShow')
            self.scene.add(particles);

            // console.log(self.scene)
            // var material = new MeshLineMaterial({
            //     color: new THREE.Color(0xd9d9d9),
            //     // linewidth : .002,
            //     useMap: false,
            //     // color: new THREE.Color( colors[ c ] ),
            //     opacity: .8,
            //     resolution: self.resolution,
            //     sizeAttenuation: !false,
            //     lineWidth: 0.002,
            // });

            // dotGeometry.vertices.forEach(function(d, i) {

            //     var geometry = new THREE.Geometry();
            //     geometry.vertices.push(d);
            //     geometry.vertices.push(new THREE.Vector3(d.x, 0, d.z));

            //     var line = new MeshLine();
            //     line.setGeometry(geometry);

            //     var mesh = new THREE.Mesh(line.geometry, material);

            //     var geometry1 = new THREE.Geometry();
            //     geometry1.vertices.push(d);
            //     geometry1.vertices.push(new THREE.Vector3(self.timeX, d.y, -self.timeY));

            //     var line1 = new MeshLine();
            //     line1.setGeometry(geometry1);

            //     var mesh1 = new THREE.Mesh(line1.geometry, material);


            //     self.trajGroup.add(mesh);
            //     self.trajGroup.add(mesh1);

            // })


        },

        animate: function() {
            var self = this;

            requestAnimationFrame(window.map3d.animate);
            // console.log(window.meshgeo.group)
            window.map3d.stats.update();
            window.map3d.controls.update();
            window.map3d.camera.updateProjectionMatrix();

            window.map3d.renderAll();


        },
        renderAll: function() {
            var self = this;
            TWEEN.update();

            // self.camera.rotation.y+=0.1



            // self.meshmesh.lookAt(self.camera.position);
            // self.edges.lookAt(self.camera.position);



            self.toolTipGroup.children.forEach(function(d, i) {
                if (self.camera.position.y < 850)
                    d.lookAt(self.camera.position);
                var icon = self.groupIcon.getObjectByName(d.name)
                if (typeof(icon) != 'undefined') {

                    // d.geometry.computeBoundingBox();
                    // var box = d.geometry.boundingBox
                    // var x = (box.max.x - box.min.x) / 2
                    // var y = (box.max.y - box.min.y) / 2 * d.scale.y
                    // var z = (box.max.z - box.min.z) / 2

                    // d.position.set(icon.position.x + x, icon.position.y - y, icon.position.z + z)
                    if (icon.position.y > 30)
                        d.position.copy(icon.position)
                    else
                        d.position.set(icon.position.x, icon.position.y + 30, icon.position.z)


                } else {
                    self.toolTipGroup.remove(d)
                }

            })

            // self.group.rotation.y+=0.01;
            // self.group.position.x+=30;

            // self.axisCamera.position.copy(self.camera.position);
            // self.axisCamera.position.sub(self.controls.target);
            // self.axisCamera.lookAt(self.axisScene.position);
            //
            // self.textCompass.updatePosition(self.axisCamera, self.axisContainer)

            self.renderer.render(self.scene, self.camera);

            $("#info5").text("x: " + self.camera.position.x.toFixed(2) + " y: " + self.camera.position.y.toFixed(2) + " z: " + self.camera.position.z.toFixed(2))
            $("#info6").text("x: " + self.controls.target.x.toFixed(2) + " y: " + self.controls.target.y.toFixed(2) + " z: " + self.controls.target.z.toFixed(2))
            // $("#info6").text(self.camera.bottom)
            $("#info7").text("x: " + self.camera.rotation.x.toFixed(2) + " y: " + self.camera.rotation.y.toFixed(2) + " z: " + self.camera.rotation.z.toFixed(2))
            $("#info8").text(self.camera.zoom.toFixed(5))


        },


    });
});