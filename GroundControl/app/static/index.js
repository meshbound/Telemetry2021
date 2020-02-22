var raw_data
var values = {'quat_w':'0', 'quat_x':'0', 'quat_y':'0', 'quat_z':'0',
              'gyro_x':'0', 'gyro_y':'0', 'gyro_z':'0',
              'mag_x':'0', 'mag_y':'0', 'mag_z':'0',
              'accel':'0', 'accel_x':'0', 'accel_y':'0', 'accel_z':'0',
              'Temperature':'0', 'Pressure':'0',
              'Altitude':'0', 'Humidity':'0',
              'GPS_fix':'0', 'latitude':'0', 'latitude_direction':'0', 'longitude':'0', 'longitude_direction':'0',
              'speed':'0', 'angle':'0', 'gps_alt':'0', 'satellites':'0'
             };

function request_data() {
    var new_data;
    $.ajax({
        url: '/request',
        success: function (result) {
            new_data = result;
        },
        async: false,
    });
    raw_data = new_data;
    console.log(raw_data);
}

function updateValues(){
  //parsed = event.data.split(',');

  // 0,1,22.19 BMP
  var bmp = raw_data["!!"].split(',');
  if(bmp.length > 2){
    values['Temperature'] = bmp[2];
    values['Humidity'] = '0';
  }
  // %%: "0,1,1.00,-0.04,0.04,0.00,7.25,18.19,-56.88,0.06,0.25,0.12,-0.75,-0.76,9.62"
  var bno = raw_data["%%"].split(',');
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

  /*
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
  */
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
var ts_speed = new TimeSeries();
var ts_angle = new TimeSeries();
var ts_gps_alt = new TimeSeries();
var ts_satellites = new TimeSeries();

setInterval(function() {
  request_data();
  updateValues();
  }, 100);

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
  ts_alt.append(new Date().getTime(), values['Altitude']);
  }, 100);


setInterval(function() {
  ts_pressure.append(new Date().getTime(), values['Pressure']);
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

setInterval(function() {od_accelnet.update(values['accel']);}, 1000);
setInterval(function() {od_gyrox.update(values['gyro_x']);}, 1000);
setInterval(function() {od_gyroy.update(values['gyro_y']);}, 1000);
setInterval(function() {od_gyroz.update(values['gyro_z']);}, 1000);
setInterval(function() {od_magx.update(values['mag_x']);}, 1000);
setInterval(function() {od_magy.update(values['mag_y']);}, 1000);
setInterval(function() {od_magz.update(values['mag_z']);}, 1000);
setInterval(function() {od_temp.update(values['Temperature']);}, 1000);
setInterval(function() {od_humid.update(values['Humidity']);}, 1000);
setInterval(function() {od_alt.update(values['Altitude']);}, 1000);
setInterval(function() {od_pressure.update(values['Pressure']);}, 1000);
setInterval(function() {od_longitude.update(values['longitude']);}, 1000);
setInterval(function() {od_latitude.update(values['latitude']);}, 1000);