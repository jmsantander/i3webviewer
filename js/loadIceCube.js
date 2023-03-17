   // Marcos Santander 
   // University of Alabama - jmsantander@ua.edu
   // 2023

   import I3Detector from './icecube_viewer.js';
   import * as THREE from 'three';
   import { OrbitControls } from 'OrbitControls';

   let camera, scene, renderer;

   //const stats = Stats()
   //document.body.appendChild(stats.dom)

   init();
   animate();

  // Initialize the scene and load the UHECRs

  function init() {
    camera = new THREE.PerspectiveCamera( 60, 700 / 500., 0.1, 2000000 );

    camera.position.set( 1300, 0, 1300 );
    //camera.rotation.order = 'YXZ';

    scene = new THREE.Scene();
    //scene.add( camera );
    scene.background = new THREE.Color( 0xeeeeee );

    camera.lookAt( scene.position );

    //scene.add( new THREE.AmbientLight( 0xffffff, 1 ) );

    var pointLight = new THREE.PointLight( 0xffffff, 1 );
    camera.add(pointLight);
    scene.add(camera);

    //const size = 1000;
    //const divisions = 10;

    //const gridHelper = new THREE.GridHelper( size, divisions );
    //gridHelper.position.set(new THREE.Vector3( 0, 0.2, 0 ));
    //console.log(gridHelper.position);
    //scene.add( gridHelper );

    renderer = new THREE.WebGLRenderer({antialias:true});
    //renderer.setPixelRatio( window.devicePixelRatio );
    //renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;


    var container = document.getElementById( 'canvas' );
    //document.body.appendChild( container );
    var width = 800;
    var height = 533;
    renderer.setSize( width, height );
    renderer.setPixelRatio( window.devicePixelRatio );

    container.appendChild( renderer.domElement );


    //document.body.appendChild( renderer.domElement );

    // controls
    const controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set( 0, 0, 0 );
    controls.maxDistance = 5000;
    //controls.enableDamping = true;

    controls.update();

    window.addEventListener( 'resize', onWindowResize );
  }

  function onWindowResize() {
    //camera.aspect = window.innerWidth / window.innerHeight;
    //camera.updateProjectionMatrix();

    //renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
    //stats.update();
  }

  function render() {
    camera.updateMatrixWorld(); 
    renderer.render( scene, camera );
  }

  const i3 = new I3Detector('./xyz/i3_dom_positions.xyz', './xyz/i3_string_ends.xyz');
  i3.loadScene(camera, scene, renderer);
  //i3.plotI3Geometry('./xyz/i3_dom_positions.xyz');
  //i3.plotI3Event('./xyz/i3_event.xyz');
  //i3.playI3Event('./xyz/IC230306_pulse_times_positions.xyz');
  
  
  i3.playI3Event('./xyz/IC230306_pulse_times_positions.txt');
  //i3.playI3Event('./xyz/i3_event.xyz');

  //i3.playI3EventJSON('./xyz/numpyData.json');

  var playPauseButton = document.getElementById( 'playPauseButtonId' );


  // Start Button
  playPauseButton.onclick = function() {
    if (i3.getPlayStatus()) {
      i3.pause();
      document.querySelector('#playPauseButtonId').innerHTML = 'Play';
    }
    else {
      i3.play();
      document.querySelector('#playPauseButtonId').innerHTML = 'Pause';
    }
  }
