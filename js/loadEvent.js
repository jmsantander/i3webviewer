import I3Detector from './i3detector.js';
import I3Loader from './i3loader.js';

const loader = new I3Loader();
loader.animate();

const i3 = new I3Detector('./xyz/i3_dom_positions.xyz', './xyz/i3_string_ends.xyz');
i3.loadScene(loader.camera, loader.scene, loader.renderer);

i3.loadI3Track(i3event.particle);
i3.playI3Event(i3event.pulses);


function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().substr(-2);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`;
}

function getTitle(data) {
  return "IC" + formatDate(data.time) + "-" + data.alerttype + " (Run: " + data.runid + ", Event: " + data.eventid + ")";
}

fetch(i3event.particle)
      .then(response => response.json())
      .then(data => {
        //console.log(data);
        $('#title').html(getTitle(data));
        $('#subtitle').html("Time: " + data.time);
        // Do something with the JSON data
    })
.catch(error => console.error(error)); 


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
