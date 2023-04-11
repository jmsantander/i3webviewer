// Draw the IceCube detector

import * as THREE from 'three';
import { XYZLoader } from 'XYZLoader';
import { Line2 } from 'Line2';
import { LineMaterial } from 'LineMaterial';
import { LineGeometry } from 'LineGeometry';



import I3Track from './i3track.js';


export class I3Detector {

    constructor(filename, i3stringfile) {
        this.filename = filename;

        this.camera;
        this.scene;
        this.renderer;

        this.playFlag = false;
        this.clock = new THREE.Clock();

        this.i3track;

        this.loadI3Geometry(filename, i3stringfile);
    }

    loadScene(camera, scene, renderer) {
        console.log("Loading scene");
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
    }

    pause() {
        console.log("Animation paused");
        this.playFlag = false;
        this.clock.stop();
    }

    play() {
        this.playFlag = true;
        this.clock.start();
    }

    getPlayStatus() {
        return this.playFlag;
    }

    loadI3Track(filename) {
        this.i3track = new I3Track(filename);
    }

    loadI3Geometry(filename, i3stringfile) {
        var self = this;

        // Draw DOMs

        var geometry = new THREE.BufferGeometry();
        var sphmaterial = new THREE.MeshStandardMaterial();
        sphmaterial.color.setHex('0xaaaaaa');
        const sphgeo = new THREE.SphereGeometry( 1.5 );

        const loader = new XYZLoader();
        loader.load( filename, function ( geometry ) {

          const point = new THREE.Vector3();

          for (let i = 0; i < geometry.getAttribute('position').count;i++) {
            point.fromBufferAttribute(geometry.getAttribute('position'), i);
            var sphere = new THREE.Mesh( sphgeo, sphmaterial );
            sphere.position.set(point.x, point.z, point.y);
            self.scene.add( sphere );
          }

        } );


        // Draw string lines

        var floader = new THREE.FileLoader();
        var lineMaterial = new THREE.LineBasicMaterial( { 
            color: 0xaaaaaa,
            linewidth: 0.5
        } );

        floader.load(
            // resource URL
            i3stringfile,

            // onLoad callback
            function ( data ) {
                var lines = data.split("\n");
                for (let j = 0; j < lines.length; j++) {
                    var tokens = lines[j].split("\t");
                    if (lines[j].length > 0) {
                        var xstart = parseFloat(tokens[0]);
                        var ystart = parseFloat(tokens[1]);
                        var zstart = parseFloat(tokens[2]);
                        var xend   = parseFloat(tokens[3]);
                        var yend   = parseFloat(tokens[4]);
                        var zend   = parseFloat(tokens[5]);

                        const points = [];
                        points.push( new THREE.Vector3( xstart, zstart, ystart ) );
                        points.push( new THREE.Vector3(   xend,   zend,   yend ) );
                        const geometry = new THREE.BufferGeometry().setFromPoints( points );
                        var line = new THREE.Line(geometry, lineMaterial);
                        self.scene.add( line );

                    }
                }   
        });        

    };


    plotI3Event(filename) {
        var loader = new THREE.FileLoader();
        var self = this;

        var geometry = new THREE.BufferGeometry();
    

        loader.load(
        // resource URL
        filename,

        // onLoad callback
        function ( data ) {
            var i3event = [];

            // output the text to the console
            var lines = data.split("\n");
            for (let j = 0; j < lines.length; j++) {
                var tokens = lines[j].split(" ");
                if (lines[j].length > 0) {
                    var dom = [
                        parseFloat(tokens[0]),
                        parseFloat(tokens[1]),
                        parseFloat(tokens[2]),
                        parseFloat(tokens[3]),
                        parseFloat(tokens[4])
                    ];
                    i3event.push(dom);
                }
            }

            const tmax = i3event.reduce((max, t) => {
                return t[4] > max[4] ? t : max;
            });

            const tmin = i3event.reduce((max, t) => {
                return t[4] < max[4] ? t : max;
            });

            for (let k = 0; k < i3event.length; k++) {

                    var radius = parseFloat(i3event[k][3]) * 2;
                    var hue = (parseFloat(i3event[k][4]) - tmin[4])/(tmax[4] - tmin[4]);
                    var sphmaterial = new THREE.MeshStandardMaterial();
                    sphmaterial.color.setHSL(hue, 1, 0.5);

                    const sphgeo = new THREE.SphereGeometry( radius );
                    var sphere = new THREE.Mesh( sphgeo, sphmaterial );
                    sphere.position.set(parseFloat(i3event[k][0]), parseFloat(i3event[k][2]), parseFloat(i3event[k][1]));
                    //sphere.castShadow = true; //default is false
                    //sphere.receiveShadow = false; //default
                    self.scene.add( sphere );

            }        
        },

        // onProgress callback
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        // onError callback
        function ( err ) {
            console.error( 'An error happened' );
        }
        );
    }


    readI3Event(filename){
        return new Promise((resolve) => {
            let i3event = [];
            const loader = new THREE.FileLoader();

            loader.load(filename,
                function (data) {
                    for (let row of data.split('\n')) {
                        var tokens = row.split(" ");
                        if (row.length > 0) {
                            var dom = [
                                parseFloat(tokens[0]),
                                parseFloat(tokens[1]),
                                parseFloat(tokens[2]),
                                parseFloat(tokens[3]),
                                parseFloat(tokens[4])
                            ];
                            i3event.push(dom);
                        }

                    }
                    resolve(i3event)
                },
                function (xhr) { console.log(('Loading data : ' + xhr.loaded / xhr.total * 100) + '% loaded') },
                function (err) { console.error(err) }
            );
        })
    }


    async playI3Event(filename) {
        var loader = new THREE.FileLoader();
        var self = this;

        loader.load(

        filename,

        // onLoad callback
        function ( data ) {
            var i3event = [];

            // output the text to the console
            var lines = data.split("\n");
            for (let j = 0; j < lines.length; j++) {
                var tokens = lines[j].split(" ");
                if (lines[j].length > 0) {
                    var dom = [
                        parseFloat(tokens[0]),
                        parseFloat(tokens[1]),
                        parseFloat(tokens[2]),
                        parseFloat(tokens[3]),
                        parseFloat(tokens[4])
                    ];
                    i3event.push(dom);
                }
            }

            // Start and end times

            const tmax = i3event.reduce((max, t) => {
                return t[4] > max[4] ? t : max;
            });

            const tmin = i3event.reduce((max, t) => {
                return t[4] < max[4] ? t : max;
            });

            const qmax = i3event.reduce((max, t) => {
                return t[3] > max[3] ? t : max;
            });

            const qmin = i3event.reduce((max, t) => {
                return t[3] < max[3] ? t : max;
            });



            //self.clock = new THREE.Clock();
            var timePadding = 4000;
            var tstart = tmin[4] - timePadding;
            var tend   = tmax[4] + timePadding;
            var ti = tstart;

            var delta = 0;
            var speed = 2000;

            // Setting up the hit DOM spheres

            var sphmaterial = new THREE.MeshLambertMaterial({ });  
            const isphgeo = new THREE.SphereGeometry( 1 );
            const instancedSphere = new THREE.InstancedMesh(isphgeo, sphmaterial, 5160);

            // Thanks, ChatGPT for catching this one!
            for (let i = 0; i < instancedSphere.count; i++) {
                const color = new THREE.Color();
                instancedSphere.setColorAt(i, color);
            }

            instancedSphere.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            self.scene.add(instancedSphere);
            
            const matrix = new THREE.Matrix4();

            // Line parameters
            
            var lineMaterial = new THREE.LineBasicMaterial( { 
                color: "magenta",
                linewidth: 3
            } );

            const coneGeometry = new THREE.ConeGeometry(15, 40, 32);
            const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff });
            const cone = new THREE.Mesh(coneGeometry, coneMaterial);
            self.scene.add(cone);

            self.i3track.getThetaPhi().then(ThetaPhi => {            
                const xAxis = new THREE.Vector3(1, 0, 0);
                const yAxis = new THREE.Vector3(0, 1, 0);
                cone.rotateOnWorldAxis(xAxis, ThetaPhi[0]);
                cone.rotateOnWorldAxis(yAxis, Math.PI/2. -ThetaPhi[1]);

            });


            //const axesHelper = new THREE.AxesHelper(400);
            //self.scene.add(axesHelper);


            const geometry = new THREE.BufferGeometry();
            const MAX_POINTS = 5200;

            var positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point

            self.i3track.getPointOnTrack(ti/1e9).then(startPointOnTrack => {
                for (let j = 0; j < MAX_POINTS; j++) {
                    positions[3*j] = startPointOnTrack[0]; 
                    positions[3*j + 1] = startPointOnTrack[2];
                    positions[3*j + 2] = startPointOnTrack[1];

                    cone.position.set(startPointOnTrack[0], startPointOnTrack[2], startPointOnTrack[1]);
                }
            });

            geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            const drawCount = 2; // draw the first 2 points, only
            geometry.setDrawRange( 0, drawCount );

            const material = new THREE.LineBasicMaterial( { color: "magenta" } );
            const line = new THREE.Line( geometry, material );
            self.scene.add( line );

            const linePositions = line.geometry.attributes.position.array;
            let indexl = 0;



            function render() {

                requestAnimationFrame(render);
 
                if (self.playFlag) {

                    //requestAnimationFrame(render);

                    delta = self.clock.getDelta();
                    ti += delta * speed;

                    // Update the time in the HTML

                    $('#timer').html(Math.round(ti/10.) + " ns");

                    var elem = document.getElementById("myBar");

                    var barWidth = Math.round((ti - tstart) * 100. / (tend - tstart));
                    elem.style.width = barWidth + "%";

                    var dom = 0;
                    let ids = [];

                    // Draw hit DOMs

                    for (let k = 0; k < i3event.length; k++) {
                        if (ti > i3event[k][4]) {
                          const x = i3event[k][0];
                          const y = i3event[k][1];
                          const z = i3event[k][2];
                          //var radius = i3event[k][3] * 3;
                          var radius = 9 * Math.pow(i3event[k][3], 0.3) + 0.5
                          //var radius = 20 * (Math.log10(i3event[k][3]) - Math.log10(qmin[3])) / (Math.log10(qmax[3]) - Math.log10(qmin[3])) + 0.5


                          var hue = (i3event[k][4] - tmin[4])/(tmax[4] - tmin[4]);

                          const color = new THREE.Color();
                          color.setHSL(hue, 1, 0.5);
                          
                          matrix.makeScale(radius, radius, radius);
                          matrix.setPosition(x, z, y);

                          instancedSphere.setColorAt(dom, color);
                          instancedSphere.setMatrixAt(dom, matrix);
                          ids.push(dom);
                          
                          instancedSphere.instanceColor.needsUpdate = true;
                          instancedSphere.instanceMatrix.needsUpdate = true;

                          dom++;
                        }                        
                    }


                    // Draw animated line

                    self.i3track.getPointOnTrack(ti/1e9).then(pointOnTrack => {
                        linePositions[ indexl++ ] = pointOnTrack[0];
                        linePositions[ indexl++ ] = pointOnTrack[2];
                        linePositions[ indexl++ ] = pointOnTrack[1];

                        cone.position.set(pointOnTrack[0], pointOnTrack[2], pointOnTrack[1]);
                    });

                    line.geometry.setDrawRange( 0, indexl );
                    line.geometry.attributes.position.needsUpdate = true;          
                    line.geometry.computeBoundingSphere();
                    

                    // Loop

                    if (ti > tend) {
                        console.log("Animation ended");
                        ti = tstart;
                        indexl = 0;
                        dom = 0;

                        let dummy = new THREE.Object3D();
                        
                        self.i3track.getPointOnTrack(ti/1e9).then(startPointOnTrack => {
                            for (let j = 0; j < MAX_POINTS; j++) {
                                positions[3*j] = startPointOnTrack[0]; 
                                positions[3*j + 1] = startPointOnTrack[2];
                                positions[3*j + 2] = startPointOnTrack[1];
                                line.geometry.attributes.position.needsUpdate = true; 
                                line.geometry.computeBoundingSphere();

                                cone.position.set(startPointOnTrack[0], startPointOnTrack[2], startPointOnTrack[1]);
                            }
                        });
        

                        for (let k = 0; k < ids.length; k++) {
                            instancedSphere.getMatrixAt(ids[k], matrix);
                            matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
                            dummy.scale.setScalar(0.);
                            dummy.updateMatrix();
                            instancedSphere.setMatrixAt(ids[k], dummy.matrix);
                            instancedSphere.instanceMatrix.needsUpdate = true;
                        }
                    }
                    
                
                }

            } 

            render();
        },

        // onProgress callback
        function ( xhr ) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        // onError callback
        function ( err ) {
            console.error( 'An error happened' );
        }
        );

    }

   
} // end of class 


export default I3Detector;

