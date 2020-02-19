//Navball code. Writes to the "navball" div

var values = readData();

var nav_q = new THREE.Quaternion();
nav_q.set(0,0,0,0)

var nav_scene = new THREE.Scene();
var nav_camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);

var nav_canvas = document.createElement('canvas');
var nav_context = nav_canvas.getContext('webgl2');
var nav_renderer = new THREE.WebGLRenderer({ canvas:nav_canvas, context: nav_context});

var nav_geometry = new THREE.SphereBufferGeometry( 1, 32, 32 );
var nav_texture = new THREE.TextureLoader().load( 'dependancies/models/navball.png' );
var nav_material = new THREE.MeshPhongMaterial({map: nav_texture});
var nav_sphere = new THREE.Mesh(nav_geometry, nav_material);

var nav_render_height = $(document).height()/2;
var nav_render_width = nav_render_height;

nav_renderer.setSize(window.innerWidth/2.1, window.innerHeight/2.1);

document.getElementById("navball").appendChild(nav_renderer.domElement); // Attach to the navball div

nav_scene.add(nav_sphere);

// create a point light
var nav_light = new THREE.PointLight( 0xFFFFFF, 0.9 );

// set its position
nav_light.position.x = 500;
nav_light.position.y = 0;
nav_light.position.z = 0;

// add to the nav_scene
nav_scene.add(nav_light);


nav_camera.position.x = 5;
nav_camera.lookAt( 0, 0, 0 );


function rotateNavball() {
  if (Object.keys(values).length == 0){
    nav_q.set(0,0,0,0);
  }
  else {
    nav_q.set(values['quat_x'], values['quat_z'], -values['quat_y'], -values['quat_w']);
  }
    nav_q.normalize();
    nav_sphere.quaternion.slerp(nav_q, 1);
}

var nav_render = function () {
  requestAnimationFrame(nav_render);
  rotateNavball();
  nav_renderer.render(nav_scene, nav_camera);
};

nav_render();
