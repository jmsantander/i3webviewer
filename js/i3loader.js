// Marcos Santander 
// University of Alabama - jmsantander@ua.edu
// 2023

import I3Detector from './i3detector.js';
import I3Track from './i3track.js';

import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';


export class I3Loader {
  constructor() {
    this.camera;
    this.scene;
    this.renderer;

    this.onWindowResize = this.onWindowResize.bind(this);
    this.init();
  }

  // Initialize the scene and load the UHECRs

  init() {
    this.camera = new THREE.PerspectiveCamera( 60, 0.7, 0.1, 2000000 );

    this.camera.position.set( 1200, 0, 1200 );
    //camera.rotation.order = 'YXZ';

    this.scene = new THREE.Scene();
    //scene.add( camera );
    this.scene.background = new THREE.Color( 0xeeeeee );

    this.camera.lookAt( this.scene.position );

    //scene.add( new THREE.AmbientLight( 0xffffff, 1 ) );

    var pointLight = new THREE.PointLight( 0xffffff, 1 );
    this.camera.add(pointLight);
    this.scene.add(this.camera);

    //const size = 1000;
    //const divisions = 10;

    //const gridHelper = new THREE.GridHelper( size, divisions );
    //gridHelper.position.set(new THREE.Vector3( 0, 0.2, 0 ));
    //console.log(gridHelper.position);
    //scene.add( gridHelper );

    this.renderer = new THREE.WebGLRenderer({ antialias:true, autoClear: false });
    //renderer.setPixelRatio( window.devicePixelRatio );
    //renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.shadowMap.enabled = true;



    var container = document.getElementById( 'canvas' );
    //document.body.appendChild( container );
    //var width = 800;
    //var height = 533;
    //this.renderer.setSize( width, height );
    this.renderer.setViewport(0, 0, container.offsetWidth, container.offsetHeight);


    this.renderer.setSize(container.offsetWidth, container.offsetHeight); 

    this.renderer.setPixelRatio( window.devicePixelRatio );
    container.appendChild( this.renderer.domElement );

    // controls
    const controls = new OrbitControls( this.camera, this.renderer.domElement );
    controls.target.set( 0, 0, 0 );
    controls.maxDistance = 5000;
    //controls.enableDamping = true;
    controls.update();

    window.addEventListener( 'resize', this.onWindowResize );
  }

  onWindowResize() {
    var container = document.getElementById( 'canvas' );
    //this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.aspect = container.offsetWidth / container.offsetHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.offsetWidth, container.offsetHeight); 

  }

  animate() {
    requestAnimationFrame( this.animate.bind(this) );
    this.render();
    //stats.update();
  }

  render() {
    this.camera.updateMatrixWorld(); 
    this.renderer.render( this.scene, this.camera );
  }

}


export default I3Loader;


