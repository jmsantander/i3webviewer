import { XYZLoader } from './js/jsm/loaders/XYZLoader.js';
import * as THREE from './build/three.module.js';


// Function to load an ASCII file with X,Y,Z values
// Usage: utils.loadXYZFile(scene, './xyz/gcr_1EeV.xyz', 0x00ffff);

export function loadXYZFile(scene, filename, color) {
    const loader = new XYZLoader();
    loader.load( filename, function ( geometry ) {
      const vertexColors = ( geometry.hasAttribute( 'color' ) === true );
      const material = new THREE.PointsMaterial( { size: 0.2, vertexColors: vertexColors, color: color} );
      const points = new THREE.Points( geometry, material );
      //const line = new THREE.Line( geometry, material );
      //scene.add(line);

      scene.add( points );
    } );
}