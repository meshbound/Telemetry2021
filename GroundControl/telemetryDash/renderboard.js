// Renders rocket in "board_render" div

var values = readData();
console.log(values);

var board_render_q = new THREE.Quaternion();
board_render_q.set(0,0,0,0)

var board_render_scene = new THREE.Scene();
var board_render_camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
var board_render_controls = new THREE.OrbitControls( board_render_camera );

var board_render_canvas = document.createElement('canvas');
var board_render_context = board_render_canvas.getContext('webgl2');
var board_render_renderer = new THREE.WebGLRenderer({ canvas:board_render_canvas, context: board_render_context});

var board_render_fontLoader = new THREE.FontLoader();
var board_render_fontMaterialN = new THREE.MeshPhongMaterial({color: 0xc16069});
var board_render_fontMaterialS = new THREE.MeshPhongMaterial({color: 0x86c0d1});
var board_render_fontMaterialE = new THREE.MeshPhongMaterial({color: 0xa2bf8a});
var board_render_fontMaterialW = new THREE.MeshPhongMaterial({color: 0xedcc87});
var board_render_fontMaterialU = new THREE.MeshPhongMaterial({color: 0xd08770});
var board_render_fontMaterialD = new THREE.MeshPhongMaterial({color: 0xb58dae});

board_render_fontLoader.setPath('./');
board_render_fontLoader.load('ubuntu_mono_bold.json', function(font){
  var board_render_letterN = new THREE.TextGeometry('E', {font: font, size: 2, height:0.5, curveSegments: 12});
  var board_render_meshN = new THREE.Mesh(board_render_letterN, board_render_fontMaterialN);
  board_render_scene.add(board_render_meshN);
  board_render_meshN.rotation.y += 90*Math.PI/180;
  board_render_meshN.position.z += 1;
  board_render_meshN.position.x += 15;

  var board_render_letterS = new THREE.TextGeometry('W', {font: font, size: 2, height:0.5, curveSegments: 12});
  var board_render_meshS = new THREE.Mesh(board_render_letterS, board_render_fontMaterialS);
  board_render_scene.add(board_render_meshS);
  board_render_meshS.rotation.y += 90*Math.PI/180;
  board_render_meshS.position.z += 1;
  board_render_meshS.position.x -= 15;

  var board_render_letterE = new THREE.TextGeometry('S', {font: font, size: 2, height:0.5, curveSegments: 12});
  var board_render_meshE = new THREE.Mesh(board_render_letterE, board_render_fontMaterialE);
  board_render_scene.add(board_render_meshE);
  board_render_meshE.position.z += 15;

  var board_render_letterW = new THREE.TextGeometry('N', {font: font, size: 2, height:0.5, curveSegments: 12});
  var board_render_meshW = new THREE.Mesh(board_render_letterW, board_render_fontMaterialW);
  board_render_scene.add(board_render_meshW);
  board_render_meshW.position.z -= 15;

  var board_render_letterU = new THREE.TextGeometry('U', {font: font, size: 2, height:0.5, curveSegments: 12});
  var board_render_meshU = new THREE.Mesh(board_render_letterU, board_render_fontMaterialU);
  board_render_scene.add(board_render_meshU);
  board_render_meshU.rotation.x += 90*Math.PI/180;
  board_render_meshU.position.y += 15;

  var board_render_letterD = new THREE.TextGeometry('D', {font: font, size: 2, height:0.5, curveSegments: 12});
  var board_render_meshD = new THREE.Mesh(board_render_letterD, board_render_fontMaterialD);
  board_render_scene.add(board_render_meshD);
  board_render_meshD.rotation.x += 90*Math.PI/180;
  board_render_meshD.position.y -= 15;
});

var board_render_objLoader = new THREE.OBJLoader();
var board_render_mtlLoader = new THREE.MTLLoader();
var board_render_indicator;

board_render_mtlLoader.setPath('./');
board_render_mtlLoader.load('object.mtl', function(materials) {

  materials.preload();

  board_render_objLoader.setPath('./');
  board_render_objLoader.setMaterials(materials);
  board_render_objLoader.load('object.obj', function(object) {

    board_render_indicator = object;
    board_render_scene.add(object);
    board_render_indicator.position.y -= 0.5;

  });
});

board_render_renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("board_render").appendChild(board_render_renderer.domElement); // Attach to the board_render div

// create a point light
var board_render_pointLight = new THREE.AmbientLight( 0xFFFFFF );

// set its position
board_render_pointLight.position.x = 0;
board_render_pointLight.position.y = 0;
board_render_pointLight.position.z = -130;

// add to the board_render_scene
board_render_scene.add(board_render_pointLight);


board_render_camera.position.z = -50;
board_render_camera.position.x = 50
board_render_camera.position.y = 40
//board_render_camera.position.y += 90*Math.PI/180
board_render_camera.lookAt( 0, 0, 0 );
board_render_controls.update();


function rotateboard() {
    if (Object.keys(values).length == 0){
      board_render_q.set(0,0,0,0);
    }
    else {
      board_render_q.set(-values['quat_x'],-values['quat_z'],values['quat_y'],-values['quat_w'])//values['quat_x'],values['quat_z'],values['quat_y'],-values['quat_w']);
    }
    board_render_q.normalize();
    board_render_indicator.quaternion.slerp(board_render_q, 1);
}

var board_render_render = function () {
  requestAnimationFrame( board_render_render );
  board_render_controls.update();
  rotateboard();
  board_render_renderer.render(board_render_scene, board_render_camera);
};

board_render_render();
