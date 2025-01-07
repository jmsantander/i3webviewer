# i3webviewer

*Marcos Santander, 2023, jmsantander@ua.edu*

This is a basic web-based viewer for IceCube events based on Three.JS

Events should be written as an ASCII file with 5 columns for each hit DOM in the following format:

* x 
* y 
* z 
* charge
* time

Additionally, each event should have an associated "particle" with parameters from MC truth or reco. Particles are written as JSON files with the following format, with angles in radians, and positions in meters. 

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
