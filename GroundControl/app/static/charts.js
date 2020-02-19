$(window).on('resize', function(){
  $(".smoothie-chart").each(function(){
    $(this)[0].width = $(".chart").width();
    $(this)[0].height = $(document).width()/12;
  });
});

$(document).ready(function(){
  $(".smoothie-chart").each(function(){
    $(this)[0].width = $(".chart").width();
    $(this)[0].height = $(document).width()/12;
  });
});


// Set up variables
var parsed = [];
var values = {'quat_w':'0', 'quat_x':'0', 'quat_y':'0', 'quat_z':'0',
              'gyro_x':'0', 'gyro_y':'0', 'gyro_z':'0',
              'mag_x':'0', 'mag_y':'0', 'mag_z':'0',
              'accel':'0', 'accel_x':'0', 'accel_y':'0', 'accel_z':'0',
              'Temperature':'0', 'Pressure':'0',
              'Altitude':'0', 'Humidity':'0',
              'photodiode':'0',
              'GPS_fix':'0', 'latitude':'0', 'latitude_direction':'0', 'longitude':'0', 'longitude_direction':'0',
              'speed':'0', 'angle':'0', 'gps_alt':'0', 'satellites':'0'
             };

// setup websocket with callbacks
var ws = new ReconnectingWebSocket('ws://localhost:8080/');

ws.onopen = function() {};

ws.onclose = function() {};

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
var ts_photodiode = new TimeSeries();
var ts_speed = new TimeSeries();
var ts_angle = new TimeSeries();
var ts_gps_alt = new TimeSeries();
var ts_satellites = new TimeSeries();

setInterval(function() {
  ts_accelnet.append(new Date().getTime(), values['accel']);
  }, 100);

setInterval(function() {
  ts_accelx.append(new Date().getTime(), values['accel_x']);
  }, 100);

setInterval(function() {
  ts_accely.append(new Date().getTime(), values['accel_y']);
  }, 100);

setInterval(function() {
  ts_accelz.append(new Date().getTime(), values['accel_z']);
  }, 100);

setInterval(function() {
  ts_gyrox.append(new Date().getTime(), values['gyro_x']);
  }, 100);

setInterval(function() {
  ts_gyroy.append(new Date().getTime(), values['gyro_y']);
  }, 100);

setInterval(function() {
  ts_gyroz.append(new Date().getTime(), values['gyro_z']);
  }, 100);


setInterval(function() {
  ts_magx.append(new Date().getTime(), values['mag_x']);
  }, 100);

setInterval(function() {
  ts_magy.append(new Date().getTime(), values['mag_y']);
  }, 100);


setInterval(function() {
  ts_magz.append(new Date().getTime(), values['mag_z']);
  }, 100);


setInterval(function() {
  ts_temp.append(new Date().getTime(), values['Temperature']);
  }, 100);


setInterval(function() {
  ts_humid.append(new Date().getTime(), values['Humidity']);
  }, 100);


setInterval(function() {
  ts_pressure.append(new Date().getTime(), values['Pressure']);
  }, 100);

var chart_accel = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'},
  horizontalLines:[{color:'#000000',lineWidth:1,value:0}]
  });

  chart_accel.addTimeSeries(ts_accelnet, {lineWidth: 2, strokeStyle: '#edcc87', tooltipLabel:'Accel', tooltipUnit:' m/s&sup2;'});
  chart_accel.addTimeSeries(ts_accelx, {lineWidth: 2, strokeStyle: '#c16069', tooltipLabel:'Accel X', tooltipUnit:' m/s&sup2;'});
  chart_accel.addTimeSeries(ts_accely, {lineWidth: 2, strokeStyle: '#86c0d1', tooltipLabel:'Accel Y', tooltipUnit:' m/s&sup2;'});
  chart_accel.addTimeSeries(ts_accelz, {lineWidth: 2, strokeStyle: '#80a062', tooltipLabel:'Accel Z', tooltipUnit:' m/s&sup2;'});

var chart_gyro = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11, tooltipFormatter: SmoothieChart.tooltipFormatter,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'}, horizontalLines:[{color:'#ffffff',lineWidth:1,value:0}]});

  chart_gyro.addTimeSeries(ts_gyrox, {lineWidth: 2, strokeStyle: '#c16069', tooltipLabel:'Gyro X', tooltipUnit:' rad/s'});
  chart_gyro.addTimeSeries(ts_gyroy, {lineWidth: 2, strokeStyle: '#86c0d1', tooltipLabel:'Gyro Y', tooltipUnit:' rad/s'});
  chart_gyro.addTimeSeries(ts_gyroz, {lineWidth: 2, strokeStyle: '#80a062', tooltipLabel:'Gyro Z', tooltipUnit:' rad/s'});

var chart_mag = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'}, horizontalLines:[{color:'#ffffff',lineWidth:1,value:0}]});

  chart_mag.addTimeSeries(ts_magx, {lineWidth: 2, strokeStyle: '#c16069', tooltipLabel:'Mag X', tooltipUnit:' &#181;T'});
  chart_mag.addTimeSeries(ts_magy, {lineWidth: 2, strokeStyle: '#86c0d1', tooltipLabel:'Mag Y', tooltipUnit:' &#181;T'});
  chart_mag.addTimeSeries(ts_magz, {lineWidth: 2, strokeStyle: '#80a062', tooltipLabel:'Mag Z', tooltipUnit:' &#181;T'});

var chart_temp = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'}, horizontalLines:[{color:'#ffffff',lineWidth:1,value:0}]});

  chart_temp.addTimeSeries(ts_temp, {lineWidth: 2, strokeStyle: '#bf616a', tooltipLabel:'Temp', tooltipUnit:' &#176;C'});

var chart_humid = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'}, horizontalLines:[{color:'#ffffff',lineWidth:1,value:0}]});

  chart_humid.addTimeSeries(ts_humid, {lineWidth: 2, strokeStyle: '#5e81ac', tooltipLabel:'Humid', tooltipUnit:' %'});

var chart_pressure = new SmoothieChart({tooltip: true, maxValueScale: 1.5, minValueScale: 1.5, millisPerPixel: 11,
  scaleSmoothing: 0.56, grid: {fillStyle: '#3b4253', strokeStyle: '#3b4253',verticalSections: 0},labels: {fillStyle: '#e5e9f0'}, horizontalLines:[{color:'#ffffff',lineWidth:1,value:0}]});

  chart_pressure.addTimeSeries(ts_pressure, {lineWidth: 2, strokeStyle: '#b58dae', tooltipLabel:'Pressure', tooltipUnit:' kPa'});

chart_accel.streamTo($("#chart-accel")[0], 75);
chart_gyro.streamTo($("#chart-gyro")[0], 75);
chart_mag.streamTo($("#chart-mag")[0], 75);
chart_temp.streamTo($("#chart-temp")[0], 75);
chart_humid.streamTo($("#chart-humid")[0], 75);
chart_pressure.streamTo($("#chart-pressure")[0], 75);
