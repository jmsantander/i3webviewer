// Draw the IceCube detector

//import * as THREE from './build/three.module.js';
//import { XYZLoader } from './js/jsm/loaders/XYZLoader.js';
import { XYZLoader } from 'https://unpkg.com/three@0.150.1/examples/jsm/loaders/XYZLoader.js';
import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';

export class I3Detector {

    constructor(filename, i3stringfile) {
        this.filename = filename;

        this.camera;
        this.scene;
        this.renderer;

        this.playFlag = false;
        this.clock;

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
            linewidth: 3
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

    getI3ParticleTrack(t, x0, y0, z0, t0, beta, theta, phi) {
        const degree = Math.PI / 180.;
        const c = 299792458.;
        var beta = 1.;

        var v0 = beta * c;
        var xv = v0 * Math.cos(phi * degree) * Math.sin(theta*degree) * (t-t0) + x0;
        var yv = v0 * Math.sin(phi * degree) * Math.sin(theta*degree) * (t-t0) + y0;
        var zv = v0 * Math.cos(theta * degree) * (t-t0) + z0;
        return [xv, yv, zv];
    }


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


    playI3Event(filename) {
        var loader = new THREE.FileLoader();
        var self = this;

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



            self.clock = new THREE.Clock();
            var timePadding = 1000;
            var tstart = tmin[4] - timePadding;
            var tend   = tmax[4] + timePadding;
            var ti = tstart;

            var delta = 0;
            var speed = 2000;

            // Setting up the hit DOM spheres

            var sphmaterial = new THREE.MeshLambertMaterial({ });  

            //var sphmaterial = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors});          
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

            /*
            var x0 = 5.20183586e+02;
            var y0 = 4.79645335e+01;
            var z0 = -2.76325293e+02;
            var tref = 9.98326425e-06;
            var beta0  = 8.59717137e-01;
            var theta0 = 6.12972746e+01;
            var phi0   = 1.48859226e+02;
            */


            var x0 = 1.04440247e+03;
            var y0 = -2.48253428e+02;
            var z0 = -4.96898832e+02;
            var tref = 7.58525043e-06;
            var beta0  = 4.38318448e-01;
            var theta0 = 5.60210311e+01;
            var phi0   = 1.67442576e+02;


            var startPointOnTrack = self.getI3ParticleTrack(ti / 1e9, x0, y0, z0, tref, beta0, theta0, phi0);
            const geometry = new THREE.BufferGeometry();
            const MAX_POINTS = 5200;

            var positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point

            for (let j = 0; j < MAX_POINTS; j++) {
                positions[3*j] = startPointOnTrack[0]; 
                positions[3*j + 1] = startPointOnTrack[2];
                positions[3*j + 2] = startPointOnTrack[1];
            }

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

                    $('#timer').html(Math.round(ti));

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
                    

                    var pointOnTrack = self.getI3ParticleTrack(ti / 1e9, x0, y0, z0, tref, beta0, theta0, phi0);

                    linePositions[ indexl++ ] = pointOnTrack[0];
                    linePositions[ indexl++ ] = pointOnTrack[2];
                    linePositions[ indexl++ ] = pointOnTrack[1];

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
                        
                        for (let j = 0; j < MAX_POINTS; j++) {
                            positions[3*j] = startPointOnTrack[0]; 
                            positions[3*j + 1] = startPointOnTrack[2];
                            positions[3*j + 2] = startPointOnTrack[1];
                            line.geometry.attributes.position.needsUpdate = true;          
                            line.geometry.computeBoundingSphere();
                        }
                        

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


    playI3EventJSON(filename) {
        var self = this;
        self.clock = new THREE.Clock();

        fetch(filename)
            .then((response) => response.json())
            .then((json) => {

            // Start and end times

            var tmax = Math.max.apply(Math, json['i3event']['time']);
            var tmin = Math.max.apply(Math, json['i3event']['time']);

            
            var timePadding = 2000;
            var tstart = tmin - timePadding;
            var tend   = tmax + timePadding;
            var ti = tstart;

            var delta = 0;
            var speed = 3000;

            // Setting up the hit DOM spheres

            var sphmaterial = new THREE.MeshLambertMaterial({ });  

            const isphgeo = new THREE.SphereGeometry( 1 );
            const instancedSphere = new THREE.InstancedMesh(isphgeo, sphmaterial, 2500);

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

            /*
            var x0 = 5.20183586e+02;
            var y0 = 4.79645335e+01;
            var z0 = -2.76325293e+02;
            var tref = 9.98326425e-06;
            var beta0  = 8.59717137e-01;
            var theta0 = 6.12972746e+01;
            var phi0   = 1.48859226e+02;
            */


            var x0 = 1.04440247e+03;
            var y0 = -2.48253428e+02;
            var z0 = -4.96898832e+02;
            var tref = 3.58525043e-06;
            var beta0  = 4.38318448e-01;
            var theta0 = 5.60210311e+01;
            var phi0   = 1.67442576e+02;



            var startPointOnTrack = self.getI3ParticleTrack(ti / 1e9, x0, y0, z0, tref, beta0, theta0, phi0);
            const geometry = new THREE.BufferGeometry();
            const MAX_POINTS = 5200;

            var positions = new Float32Array( MAX_POINTS * 3 ); // 3 vertices per point

            for (let j = 0; j < MAX_POINTS; j++) {
                positions[3*j] = startPointOnTrack[0]; 
                positions[3*j + 1] = startPointOnTrack[2];
                positions[3*j + 2] = startPointOnTrack[1];
            }

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

                    $('#timer').html(Math.round(ti));

                    var elem = document.getElementById("myBar");

                    var barWidth = Math.round((ti - tstart) * 100. / (tend - tstart));
                    elem.style.width = barWidth + "%";

                    var dom = 0;
                    let ids = []

                    // Draw hit DOMs

                    for (let k = 0; k < json['i3event']['x'].length; k++) {
                        if (ti > json['i3event']['time'][k]) {
                          const x = json['i3event']['x'][k];
                          const y = json['i3event']['y'][k];
                          const z = json['i3event']['z'][k]
                          var radius = json['i3event']['charge'][k]* 10;
                          var hue = (json['i3event']['time'][k] - tmin)/(tmax - tmin);

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

                    var pointOnTrack = self.getI3ParticleTrack(ti / 1e9, x0, y0, z0, tref, beta0, theta0, phi0);

                    linePositions[ indexl++ ] = pointOnTrack[0];
                    linePositions[ indexl++ ] = pointOnTrack[2];
                    linePositions[ indexl++ ] = pointOnTrack[1];

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

                        for (let j = 0; j < MAX_POINTS; j++) {
                            positions[3*j] = startPointOnTrack[0]; 
                            positions[3*j + 1] = startPointOnTrack[2];
                            positions[3*j + 2] = startPointOnTrack[1];
                            line.geometry.attributes.position.needsUpdate = true;          
                            line.geometry.computeBoundingSphere();
                        }

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
        }
        );
    }
   
} // end of class 





export default I3Detector;
