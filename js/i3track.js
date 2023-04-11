export class I3Track {

  constructor(filename) {
    this.theta;
    this.phi;
    this.x0;
    this.y0;
    this.z0;
    this.t0;
    this.speed;

    this.ready = this.readParticleFromFile(filename);
  };

  getThetaPhi() {
    return this.ready.then(() => {
      return [this.theta, this.phi];
    });
  };

  getPointOnTrack(t) {
    const c = 299792458.;
    var beta = 1.;

    var v0 = beta * c;

    return this.ready.then(() => {
      var xv = v0 * Math.cos(this.phi) * Math.sin(this.theta) * (t - this.t0) + this.x0;
      var yv = v0 * Math.sin(this.phi) * Math.sin(this.theta) * (t - this.t0) + this.y0;
      var zv = v0 * Math.cos(this.theta) * (t - this.t0) + this.z0;
      return [xv, yv, zv];
    });
  };

  readParticleFromFile(filename) {
    return fetch(filename)
      .then((response) => response.json())
      .then((json) => {
        this.theta = json['theta'];
        this.phi = json['phi'];
        this.x0 = json['x0'];
        this.y0 = json['y0'];
        this.z0 = json['z0'];
        this.t0 = json['t0'] / 1e9;
      });
  }

}

export default I3Track;
