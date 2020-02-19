// Renders rocket in "rocket_render" div

var values = readData();

var rocket_render_q = new THREE.Quaternion();
rocket_render_q.set(0,0,0,0)

var rocket_render_scene = new THREE.Scene();
var rocket_render_camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);

var rocket_render_canvas = document.createElement('canvas');
var rocket_render_context = rocket_render_canvas.getContext('webgl2');
var rocket_render_renderer = new THREE.WebGLRenderer({ canvas:rocket_render_canvas, context: rocket_render_context});

var rocket_render_objLoader = new THREE.OBJLoader();
var rocket_render_mtlLoader = new THREE.MTLLoader();
var rocket_render_indicator;

rocket_render_mtlLoader.setPath('./');
rocket_render_mtlLoader.load('rocket.mtl', function(materials) {

  materials.preload();

  rocket_render_objLoader.setPath('./');
  rocket_render_objLoader.setMaterials(materials);
  rocket_render_objLoader.load('rocket.obj', function(object) {

    rocket_render_indicator = object;
    rocket_render_scene.add(object);
    rocket_render_indicator.position.y -= 0.5;

  });
});

var rocket_render_width = $("#rocket-render-div").width();
var rocket_render_height = $(document).height()/4;

rocket_render_renderer.setSize(rocket_render_width, rocket_render_height);
document.getElementById("rocket_render").appendChild(rocket_render_renderer.domElement); // Attach to the rocket_render div

// create a point light
var rocket_render_pointLight = new THREE.AmbientLight( 0xFFFFFF );

// set its position
rocket_render_pointLight.position.x = 0;
rocket_render_pointLight.position.y = 0;
rocket_render_pointLight.position.z = -130;

// add to the rocket_render_scene
rocket_render_scene.add(rocket_render_pointLight);


rocket_render_camera.position.z = -20;
//rocket_render_camera.position.x = 10
//rocket_render_camera.position.y = 10
//rocket_render_camera.position.y += 90*Math.PI/180
rocket_render_camera.lookAt( 0, 0, 0 );


function rotateRocket() {
    if (Object.keys(values).length == 0){
      rocket_render_q.set(0,0,0,0);
    }
    else {
      rocket_render_q.set(-values['quat_x'],-values['quat_z'],values['quat_y'],-values['quat_w'])//values['quat_x'],values['quat_z'],values['quat_y'],-values['quat_w']);
    }
    rocket_render_q.normalize();
    rocket_render_indicator.quaternion.slerp(rocket_render_q, 1);
}

var rocket_render_render = function () {
  requestAnimationFrame( rocket_render_render );
  rotateRocket();
  rocket_render_renderer.render(rocket_render_scene, rocket_render_camera);
};

rocket_render_render();
