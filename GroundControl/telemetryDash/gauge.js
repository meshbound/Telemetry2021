var values = readData();

var gauge_alt = $('#gauge_alt').epoch({
                    type: 'time.gauge',
                    value: 0.0,
                    fps: 60,
                    domain: [0,2100],
                    format: function(v) { return (v).toFixed(2) + ' ft'; }
                  });

var gauge_accelx = $('#gauge_accelx').epoch({
                    type: 'time.gauge',
                    value: 0.0,
                    fps: 60,
                    domain: [-5,5],
                    format: function(v) { return (v).toFixed(2) + ' g'; }
                  });

var gauge_accely = $('#gauge_accely').epoch({
                    type: 'time.gauge',
                    value: 0.0,
                    fps: 60,
                    domain: [-5,5],
                    format: function(v) { return (v).toFixed(2) + ' g'; }
                  });

var gauge_accelz = $('#gauge_accelz').epoch({
                    type: 'time.gauge',
                    value: 0.0,
                    fps: 60,
                    domain: [-5,5],
                    format: function(v) { return (v).toFixed(2) + ' g'; }
                  });

setInterval(function() {
  gauge_alt.update(values['Altitude'] * 3.2808);
}, 100);

setInterval(function() {
  gauge_accelx.update(values['accel_x'] / 9.81);
}, 100);

setInterval(function() {
  gauge_accely.update(values['accel_y'] / 9.81);
}, 1000);

setInterval(function() {
  gauge_accelz.update(values['accel_z'] / 9.81);
}, 100);
