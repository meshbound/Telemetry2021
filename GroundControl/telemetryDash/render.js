//Navball code. Writes to the "navball" div
var values = {
  'quat_w': '0',
  'quat_x': '0',
  'quat_y': '0',
  'quat_z': '0',
  'gyro_x': '0',
  'gyro_y': '0',
  'gyro_z': '0',
  'mag_x': '0',
  'mag_y': '0',
  'mag_z': '0',
  'accel': '0',
  'accel_x': '0',
  'accel_y': '0',
  'accel_z': '0',
  'Temperature': '0',
  'Pressure': '0',
  'Altitude': '0',
  'Humidity': '0',
  'photodiode': '0',
  'GPS_fix': '0',
  'latitude': '0',
  'latitude_direction': '0',
  'longitude': '0',
  'longitude_direction': '0',
  'speed': '0',
  'angle': '0',
  'gps_alt': '0',
  'satellites': '0'
};
//Navball code. Writes to the "navball" div

var nav_q = new THREE.Quaternion();
nav_q.set(0, 0, 0, 0)

var nav_width = $("#navball").parent().width();
var nav_height = $("#navball").parent().height();


var nav_scene = new THREE.Scene();
var nav_camera = new THREE.PerspectiveCamera(45, nav_width / nav_height, 0.1, 1000);

var nav_canvas = document.createElement('canvas');
var nav_context = nav_canvas.getContext('webgl2');
var nav_renderer = new THREE.WebGLRenderer({
  canvas: nav_canvas,
  context: nav_context
});

var nav_geometry = new THREE.SphereBufferGeometry(1, 32, 32);
var nav_texture = new THREE.TextureLoader().load('dependancies/models/navball.png');
var nav_material = new THREE.MeshPhongMaterial({
  map: nav_texture
});
var nav_sphere = new THREE.Mesh(nav_geometry, nav_material);

nav_renderer.setSize(nav_width, nav_height);

document.getElementById("navball").appendChild(nav_renderer.domElement); // Attach to the navball div

nav_scene.add(nav_sphere);

// create a point light
var nav_light = new THREE.PointLight(0xFFFFFF, 0.9);

// set its position
nav_light.position.x = 500;
nav_light.position.y = 0;
nav_light.position.z = 0;

// add to the nav_scene
nav_scene.add(nav_light);


nav_camera.position.x = 5;
nav_camera.lookAt(0, 0, 0);


function rotateNavball() {
  if (Object.keys(values).length == 0) {
    nav_q.set(0, 0, 0, 0);
  } else {
    nav_q.set(values['quat_x'], values['quat_z'], -values['quat_y'], -values['quat_w']);
  }
  nav_q.normalize();
  nav_sphere.quaternion.slerp(nav_q, 1);
}

var nav_render = function() {
  requestAnimationFrame(nav_render);
  rotateNavball();
  nav_renderer.render(nav_scene, nav_camera);
};

nav_render();

var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(map);

var circle = L.circle([51.508, -0.11], {
  color: 'red',
  fillColor: '#f03',
  fillOpacity: 0.5,
  radius: 10
}).addTo(map)
