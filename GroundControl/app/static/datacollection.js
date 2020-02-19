//Initialization and data processing
function readData(){
  // Set up variables
  var parsed = [];
  var values = {};

  // setup websocket with callbacks
  var ws = new ReconnectingWebSocket('ws://localhost:8080/');

  ws.onopen = function() {

  };

  ws.onclose = function() {

  };

  ws.onmessage = function(event) {
    parsed = event.data.split(',');

    switch (parsed[0]) {
      case "%%":
        values['quat_w'] = parsed[3];
        values['quat_x'] = parsed[4];
        values['quat_y'] = parsed[5];
        values['quat_z'] = parsed[6];
        values['mag_x'] = parsed[7];
        values['mag_y'] = parsed[8];
        values['mag_z'] = parsed[9];
        values['gyro_x'] = parsed[10];
        values['gyro_y'] = parsed[11];
        values['gyro_z'] = parsed[12];
        values['accel_x'] = parsed[13];
        values['accel_y'] = parsed[14];
        values['accel_z'] = parsed[15];
        values['accel'] = Math.sqrt(parsed[13]**2 + parsed[14]**2 + parsed[15]**2) - 9.8;
        break;
      case "!!":
        values['Temperature'] = parsed[3];
        values['Pressure'] = parsed[4];
        values['Altitude'] = parsed[5];
        values['Humidity'] = parsed[6];
        break;
      case "&&":
        values['photodiode'] = parsed[3];
        break;
      case "$$":
        values['GPS_fix'] = parsed[10];
        values['latitude'] = parsed[12];
        values['latitude_direction'] = parsed[13];
        values['longitude'] = parsed[14];
        values['longitude_direction'] = parsed[15];
        values['speed'] = parsed[16];
        values['angle'] = parsed[17];
        values['gps_alt'] = parsed[18];
        values['satellites'] = parsed[19];
        break;
      case "??":
        break;
      case "@@":
        values['CO2'] = parsed[3];
        values['TVOC'] = parsed[4];
        break;
      default:
        break;
    };
  };
  return values;
};
