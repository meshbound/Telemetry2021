var raw_data
var values = {"bme": {"temperature": "", "humidity": ""},

                   "ccs": {"co2": "", "tvoc": ""},

                   "baro": {"pressure": "", "altitude": ""},

                   "bno": {"quaternion": {"quat_w": "", "quat_x": "", "quat_y": "", "quat_z": ""},
                           "mag": {"mag_x": "", "mag_y": "", "mag_z": ""},
                           "gyroscope": {"gyro_x": "", "gyro_y": "", "gyro_z": ""},
                           "accelerometer": {"accel_x": "", "accel_y": "", "accel_z": ""}
                           },

                   "gps": {"time": {"hour": "", "min": "", "sec": "", "milli": "", "day": "", "month": "", "year": ""},
                           "connection": {"fix": "", "fix_quality": ""},
                           "positon": {"latitude": "", "lat": "", "longitude": "", "long": ""},
                           "info": {"speed": "", "angle": "", "altitude": "", "satellites": ""}
                           },
                   "data": {"current": 0, "average": 0}
                   }

function request_data() {
    var new_data;
    $.ajax({
        url: '/request',
        success: function (result) {
            new_data = result;
        },
        async: false,
    });
    //raw_data = new_data;
    values = new_data;
    //console.log(raw_data);
}

/*
function updateValues(){
  //parsed = event.data.split(',');

  // 0,1,22.19 BMP
  var bme = raw_data["!!"];
  values["Temperature"] = bme[];
  values["Humidity"] = bme[];

  // %%: "0,1,1.00,-0.04,0.04,0.00,7.25,18.19,-56.88,0.06,0.25,0.12,-0.75,-0.76,9.62"
  var bno = raw_data["%%"];
  if(bno.length > 2){
    values['quat_w'] = bno[3];
    values['quat_x'] = bno[4];
    values['quat_y'] = bno[5];
    values['quat_z'] = bno[6];
    values['mag_x'] = bno[7];
    values['mag_y'] = bno[8];
    values['mag_z'] = bno[9];
    values['gyro_x'] = bno[10];
    values['gyro_y'] = bno[11];
    values['gyro_z'] = bno[12];
    values['accel_x'] = bno[13];
    values['accel_y'] = bno[14];
    values['accel_z'] = bno[15];
    values['accel'] = Math.sqrt(bno[13]**2 + bno[14]**2 + bno[15]**2) - 9.8;
  }

  // @@: "0,1,0,0"
  var css = raw_data["@@"].split(',');
  if(css.length > 2){
    values['CO2'] = css[2];
    values['TVOC'] = css[3];
  }

  // ##: 0,1, '98936.75', '201.69']
  var baro = raw_data["##"].split(',');
  if(baro.length > 2){
    values['Pressure'] = baro[2];
    values['Altitude'] = baro[3];
  }
};
*/

var ts_accelnet = new TimeSeries();
var ts_accelx = new TimeSeries();
var ts_accely = new TimeSeries();
var ts_accelz = new TimeSeries();
var ts_gyrox = new TimeSeries();
var ts_gyroy = new TimeSeries();
var ts_gyroz = new TimeSeries();
var ts_magx = new TimeSeries();
var ts_magy = new TimeSeries();
var ts_magz = new TimeSeries();
var ts_temp = new TimeSeries();
var ts_humid = new TimeSeries();
var ts_alt = new TimeSeries();
var ts_pressure = new TimeSeries();
var ts_speed = new TimeSeries();
var ts_angle = new TimeSeries();
var ts_gps_alt = new TimeSeries();
var ts_satellites = new TimeSeries();

setInterval(function() {
  request_data();
  //updateValues();
  }, 100);

/*
setInterval(function() {
  ts_accelnet.append(new Date().getTime(), values['accel']);
  }, 100);
*/

setInterval(function() {
  ts_accelx.append(new Date().getTime(), values["bno"]["accelerometer"]["accel_x"]);
  }, 100);

setInterval(function() {
  ts_accely.append(new Date().getTime(), values["bno"]["accelerometer"]["accel_y"]);
  }, 100);

setInterval(function() {
  ts_accelz.append(new Date().getTime(), values["bno"]["accelerometer"]["accel_z"]);
  }, 100);

setInterval(function() {
  ts_gyrox.append(new Date().getTime(), values["bno"]["gyroscope"]["gyro_x"]);
  }, 100);

setInterval(function() {
  ts_gyroy.append(new Date().getTime(), values["bno"]["gyroscope"]["gyro_y"]);
  }, 100);

setInterval(function() {
  ts_gyroz.append(new Date().getTime(), values["bno"]["gyroscope"]["gyro_z"]);
  }, 100);


setInterval(function() {
  ts_magx.append(new Date().getTime(), values["bno"]["mag"]["mag_x"]);
  }, 100);

setInterval(function() {
  ts_magy.append(new Date().getTime(), values["bno"]["mag"]["mag_y"]);
  }, 100);


setInterval(function() {
  ts_magz.append(new Date().getTime(), values["bno"]["mag"]["mag_z"]);
  }, 100);


setInterval(function() {
  ts_temp.append(new Date().getTime(), values["bme"]["temperature"]);
  }, 100);


setInterval(function() {
  ts_humid.append(new Date().getTime(), values["bme"]["humidity"]);
  }, 100);

setInterval(function() {
  ts_alt.append(new Date().getTime(), values["baro"]["altitude"]);
  }, 100);


setInterval(function() {
  ts_pressure.append(new Date().getTime(), values["baro"]["pressure"]);
  }, 100);

setInterval(function() {
  ts_speed.append(new Date().getTime(), values['speed']);
  }, 100)

setInterval(function() {
  ts_angle.append(new Date().getTime(), values['angle']);
  }, 100)

setInterval(function() {
  ts_gps_alt.append(new Date().getTime(), values['gps_alt']*100);
  }, 100)

setInterval(function() {
  ts_satellites.append(new Date().getTime(), values['satellites']);
  }, 100);

var chart_accel = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'},
  horizontalLines:[{color:'#ffffff',lineWidth:1,value:0}]
  });

  chart_accel.addTimeSeries(ts_accelnet, {lineWidth: 2, strokeStyle: '#ebcb8b', tooltipLabel:'Accel', tooltipUnit:' m/s&sup2;'});
  chart_accel.addTimeSeries(ts_accelx, {lineWidth: 2, strokeStyle: '#c16069', tooltipLabel:'Accel X', tooltipUnit:' m/s&sup2;'});
  chart_accel.addTimeSeries(ts_accely, {lineWidth: 2, strokeStyle: '#86c0d1', tooltipLabel:'Accel Y', tooltipUnit:' m/s&sup2;'});
  chart_accel.addTimeSeries(ts_accelz, {lineWidth: 2, strokeStyle: '#80a062', tooltipLabel:'Accel Z', tooltipUnit:' m/s&sup2;'});

var chart_gyro = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11, tooltipFormatter: SmoothieChart.tooltipFormatter,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'}});

  chart_gyro.addTimeSeries(ts_gyrox, {lineWidth: 2, strokeStyle: '#c16069', tooltipLabel:'Gyro X', tooltipUnit:' rad/s'});
  chart_gyro.addTimeSeries(ts_gyroy, {lineWidth: 2, strokeStyle: '#86c0d1', tooltipLabel:'Gyro Y', tooltipUnit:' rad/s'});
  chart_gyro.addTimeSeries(ts_gyroz, {lineWidth: 2, strokeStyle: '#80a062', tooltipLabel:'Gyro Z', tooltipUnit:' rad/s'});

var chart_mag = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'}});

  chart_mag.addTimeSeries(ts_magx, {lineWidth: 2, strokeStyle: '#c16069', tooltipLabel:'Mag X', tooltipUnit:' &#181;T'});
  chart_mag.addTimeSeries(ts_magy, {lineWidth: 2, strokeStyle: '#86c0d1', tooltipLabel:'Mag Y', tooltipUnit:' &#181;T'});
  chart_mag.addTimeSeries(ts_magz, {lineWidth: 2, strokeStyle: '#80a062', tooltipLabel:'Mag Z', tooltipUnit:' &#181;T'});

var chart_env = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'}});

  chart_env.addTimeSeries(ts_temp, {lineWidth: 2, strokeStyle: '#bf616a', tooltipLabel:'Temp', tooltipUnit:' &#176;C'});
  chart_env.addTimeSeries(ts_humid, {lineWidth: 2, strokeStyle: '#5e81ac', tooltipLabel:'Humid', tooltipUnit:' %'});

var chart_alt = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'}});

  chart_alt.addTimeSeries(ts_alt, {lineWidth: 2, strokeStyle: '#bf616a', tooltipLabel:'Altitude', tooltipUnit:' m'});
  chart_alt.addTimeSeries(ts_pressure, {lineWidth: 2, strokeStyle: '#5e81ac', tooltipLabel:'Pressure', tooltipUnit:' kPa'});

var chart_gps = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'}});

  chart_gps.addTimeSeries(ts_speed, {lineWidth: 2, strokeStyle: '#c16069', tooltipLabel:'Speed', tooltipUnit:' m'});
  chart_gps.addTimeSeries(ts_angle, {lineWidth: 2, strokeStyle: '#86c0d1', tooltipLabel:'Angle', tooltipUnit:' m'});
  chart_gps.addTimeSeries(ts_gps_alt, {lineWidth: 2, strokeStyle: '#80a062', tooltipLabel:'GPS Alt', tooltipUnit:' m'});
  chart_gps.addTimeSeries(ts_satellites, {lineWidth: 2, strokeStyle: '#ebcb8b', tooltipLabel:'Satillites', tooltipUnit:' m'});

chart_accel.streamTo($("#chart-accel")[0], 75);
chart_gyro.streamTo($("#chart-gyro")[0], 75);
chart_mag.streamTo($("#chart-mag")[0], 75);
chart_env.streamTo($("#chart-env")[0], 75);
chart_alt.streamTo($("#chart-alt")[0], 75);
chart_gps.streamTo($("#chart-gps")[0], 75);


$(".smoothie-chart-canvas").each(function(){
  $(this)[0].width = $(".smoothie-chart-div").width();
  $(this)[0].height = $(".smoothie-chart-div").height();
});

jQuery(".odometer-center").fitText(0.4);
jQuery(".odometer-split").fitText(0.5);
jQuery(".odometer-split-label").fitText(0.9);
jQuery(".odometer-center-label").fitText(0.9);

var nav_on = {'accel-net':false, 'accel-x':false, 'accel-y':false, 'accel-z':false,
              'gyro-x':false, 'gyro-y':false, 'gyro-z':false,
              'mag-x':false, 'mag-y':false, 'mag-z':false,
              'temp':false, 'humid':false,
              'alt':false, 'pressure':false,
              'speed':false, 'angle':false, 'gps-alt':false, 'satellite':false,
              };

$(".sensor-nav .nav-link").on("click", function(){
  if ($(this).hasClass('active')){
    $(this).removeClass("active");
    nav_on[$(this).attr('id')] = true;
  }
  else {
    $(this).addClass("active");
    nav_on[$(this).attr('id')] = false;
  }

  ts_accelnet.disabled = nav_on['accel-net'];
  ts_accelx.disabled = nav_on['accel-x'];
  ts_accely.disabled = nav_on['accel-y'];
  ts_accelz.disabled = nav_on['accel-z'];
  ts_gyrox.disabled = nav_on['gyro-x'];
  ts_gyroy.disabled = nav_on['gyro-y'];
  ts_gyroz.disabled = nav_on['gyro-z'];
  ts_magx.disabled = nav_on['mag-x'];
  ts_magy.disabled = nav_on['mag-y'];
  ts_magz.disabled = nav_on['mag_z'];
  ts_temp.disabled = nav_on['temp'];
  ts_humid.disabled = nav_on['humid'];
  ts_alt.disabled = nav_on['alt'];
  ts_pressure.disabled = nav_on['pressure'];
  ts_speed.disabled = nav_on['speed'];
  ts_angle.disabled = nav_on['angle'];
  ts_gps_alt.disabled = nav_on['gps-alt'];
  ts_satellites.disabled = nav_on['satellite'];
});

var map = L.map('map').setView([34.72, -86.59], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(map);

var circle = L.circle([34.7267, -86.5902], {
  color: 'red',
  fillColor: '#f03',
  fillOpacity: 0.5,
  radius: 10
}).addTo(map)



var od_accelnet = new Odometer({el:$('div.odometer#odometer-net-acceleration')[0],value:0,format:'(,ddd).dd'});

var od_gyrox = new Odometer({el:$('div.odometer#odometer-gyroscopex')[0],value:0,format:'(,ddd).dd'});
var od_gyroy = new Odometer({el:$('div.odometer#odometer-gyroscopey')[0],value:0,format:'(,ddd).dd'});
var od_gyroz = new Odometer({el:$('div.odometer#odometer-gyroscopez')[0],value:0,format:'(,ddd).dd'});

var od_magx = new Odometer({el:$('div.odometer#odometer-magnometerx')[0],value:0,format:'(,ddd).dd'});
var od_magy = new Odometer({el:$('div.odometer#odometer-magnometery')[0],value:0,format:'(,ddd).dd'});
var od_magz = new Odometer({el:$('div.odometer#odometer-magnometerz')[0],value:0,format:'(,ddd).dd'});

var od_temp = new Odometer({el:$('div.odometer#odometer-temp')[0],value:0,format:'(,ddd).dd'});
var od_humid = new Odometer({el:$('div.odometer#odometer-humid')[0],value:0,format:'(,ddd).dd'});

var od_alt = new Odometer({el:$('div.odometer#odometer-alt')[0],value:0,format:'(,ddd).dd'});
var od_pressure = new Odometer({el:$('div.odometer#odometer-pressure')[0],value:0,format:'(,ddd).dd'});

var od_longitude = new Odometer({el:$('div.odometer#odometer-longitude')[0],value:0,format:'(,ddd).dd'});
var od_latitude = new Odometer({el:$('div.odometer#odometer-latitude')[0],value:0,format:'(,ddd).dd'});

setInterval(function() {od_accelnet.update(values["bno"]["accelerometer"]["accel_x"]);}, 1000);
setInterval(function() {od_gyrox.update(values["bno"]["gyroscope"]["gyro_x"]);}, 1000);
setInterval(function() {od_gyroy.update(values["bno"]["gyroscope"]["gyro_y"]);}, 1000);
setInterval(function() {od_gyroz.update(values["bno"]["gyroscope"]["gyro_z"]);}, 1000);
setInterval(function() {od_magx.update(values["bno"]["mag"]["mag_x"]);}, 1000);
setInterval(function() {od_magy.update(values["bno"]["mag"]["mag_y"]);}, 1000);
setInterval(function() {od_magz.update(values["bno"]["mag"]["mag_z"]);}, 1000);
setInterval(function() {od_temp.update(values["bme"]["temperature"]);}, 1000);
setInterval(function() {od_humid.update(values["bme"]["humidity"]);}, 1000);
setInterval(function() {od_alt.update(values["baro"]["altitude"]);}, 1000);
setInterval(function() {od_pressure.update(values["baro"]["pressure"]);}, 1000);
//setInterval(function() {od_longitude.update(values["gps"]["position"]["longitude"]);}, 1000);
//setInterval(function() {od_latitude.update(values["gps"]["position"]["latitude"]);}, 1000);