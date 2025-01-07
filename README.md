# i3webviewer

*Marcos Santander, 2023, jmsantander@ua.edu*

This is a basic web-based viewer for IceCube events based on Three.JS

Each event should include two associated files: a "pulses" file, and a "particle" file. 

Pulses files should be written as an ASCII file with 5 columns for each hit DOM (pulses) in the following format:

* x 
* y 
* z 
* charge
* time

The pulses file is then placed in the <tt>./xyz/pulses4viz/</tt> folder. 

The "particle" file should contain directional and time parameters for the event from MC truth or a reco. Particle files are written as JSON files with the following format, with angles in radians, and positions in meters. 

<pre>
 {
  "theta": 1.5195243185640936,
  "phi": 5.866665289189254,
  "x0": 25.452789342940832,
  "y0": 229.69367836049514,
  "z0": -459.8218867995997,
  "t0": 10197.474274695829,
  "speed": 0.299792458,
  "time": "2023-04-01 16:14:18.907",
  "alerttype": "bronze",
  "runid": 137794,
  "eventid": 38132005
 }
</pre>

Both particle and pulses files to be read by JS should be included in the JSON file <tt>./xyz/pulses4viz/fileList.json</tt>. The format of this file is:

<pre>
 {
 "fileList": [
	"./xyz/pulses4viz/particle_bronze_137806_8756840.json",
	"./xyz/pulses4viz/particle_bronze_137794_38132005.json"
	]
}
</pre>


