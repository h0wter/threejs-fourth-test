import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Stats from "stats.js";
import waterFragmentShader from "./shaders/water/fragment.glsl";
import waterVertexShader from "./shaders/water/vertex.glsl";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const CAMERA_POSITION = 5;

const gltfLoader = new GLTFLoader();

const objectsToIntersect = [];

gltfLoader.load("/models/ground.glb", (gltf) => {
  const mesh = gltf.scene.children[0];
  mesh.isFloor = true;

  const box = new THREE.Box3();
  box.setFromObject(mesh);

  scene.add(mesh);
  objectsToIntersect.push(mesh);
});

/**
 * Debug
 */
const gui = new GUI();
const debugObject = {};

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
]);

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({
    color: "#777777",
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
// scene.add(floor);

/**
 * Water
 */
// Geometry
// const waterGeometry = new THREE.PlaneGeometry(140, 140, 2048, 2048);
const waterGeometry = new THREE.PlaneGeometry(140, 140, 2048, 2048);

// Colors
debugObject.depthColor = "#186691";
debugObject.surfaceColor = "#9bd8ff";
// debugObject.depthColor = "#4f7a92";
// debugObject.surfaceColor = "#9fc7e0";

gui.addColor(debugObject, "depthColor").onChange(() => {
  waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
});
gui.addColor(debugObject, "surfaceColor").onChange(() => {
  waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
});

const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: {
    uTime: { value: 0 },

    uBigWavesElevation: { value: 0.066 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },

    uSmallWavesElevation: { value: 0.07 },
    uSmallWavesFrequency: { value: 1.5 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallIterations: { value: 4 },

    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.085 },
    uColorMultiplier: { value: 0.9 },
  },
});

gui
  .add(waterMaterial.uniforms.uBigWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uBigWavesElevation");
gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "x")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyX");
gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, "y")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyY");
gui
  .add(waterMaterial.uniforms.uBigWavesSpeed, "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uBigWavesSpeed");

gui
  .add(waterMaterial.uniforms.uSmallWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uSmallWavesElevation");
gui
  .add(waterMaterial.uniforms.uSmallWavesFrequency, "value")
  .min(0)
  .max(30)
  .step(0.001)
  .name("uSmallWavesFrequency");
gui
  .add(waterMaterial.uniforms.uSmallWavesSpeed, "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uSmallWavesSpeed");
gui
  .add(waterMaterial.uniforms.uSmallIterations, "value")
  .min(0)
  .max(5)
  .step(1)
  .name("uSmallIterations");

gui
  .add(waterMaterial.uniforms.uColorOffset, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uColorOffset");
gui
  .add(waterMaterial.uniforms.uColorMultiplier, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uColorMultiplier");

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.position.y = 2;
water.rotation.x = -Math.PI * 0.5;
scene.add(water);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1, CAMERA_POSITION, 10);
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;
const pointerControls = new PointerLockControls(camera, canvas);
const motionControl = {
  moveForward: false,
  moveRight: false,
  moveBackward: false,
  moveLeft: false,
  canJump: true,
};
const pointerControlsVelocity = new THREE.Vector3();
const direction = new THREE.Vector3();

canvas.addEventListener("click", () => {
  pointerControls.lock();
});

pointerControls.addEventListener("lock", () => {
  console.log("locked");
});

pointerControls.addEventListener("unlock", () => {
  console.log("un-locked");
});

scene.add(pointerControls.getObject());

document.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "KeyW":
      motionControl.moveForward = true;
      break;
    case "KeyD":
      motionControl.moveRight = true;
      break;
    case "KeyS":
      motionControl.moveBackward = true;
      break;
    case "KeyA":
      motionControl.moveLeft = true;
      break;
    case "Space":
      if (motionControl.canJump) {
        pointerControlsVelocity.y += 50;
        motionControl.canJump = false;
      }
      break;
  }
});

document.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "KeyW":
      motionControl.moveForward = false;
      break;
    case "KeyD":
      motionControl.moveRight = false;
      break;
    case "KeyS":
      motionControl.moveBackward = false;
      break;
    case "KeyA":
      motionControl.moveLeft = false;
      break;
  }
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;
const raycaster = new THREE.Raycaster(
  new THREE.Vector3(),
  new THREE.Vector3(0, -1, 0)
);

const tick = () => {
  stats.begin();

  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  waterMaterial.uniforms.uTime.value = elapsedTime;

  // Update controls
  // controls.update();
  // if (pointerControls.isLocked === true) {
  //   let distanceToGround = CAMERA_POSITION;
  //   let groundY = null;

  //   raycaster.ray.origin.copy(pointerControls.getObject().position);

  //   const intersections = raycaster.intersectObjects(objectsToIntersect, false);

  //   if (intersections.length > 0) {
  //     distanceToGround =
  //       pointerControls.getObject().position.y - intersections[0].point.y;
  //     groundY = intersections[0].point.y;
  //   } else {
  //     distanceToGround = pointerControls.getObject().position.y;
  //   }

  //   pointerControlsVelocity.x -= pointerControlsVelocity.x * 10.0 * deltaTime;
  //   pointerControlsVelocity.z -= pointerControlsVelocity.z * 10.0 * deltaTime;

  //   direction.z =
  //     Number(motionControl.moveForward) - Number(motionControl.moveBackward);
  //   direction.x =
  //     Number(motionControl.moveRight) - Number(motionControl.moveLeft);
  //   direction.normalize();

  //   if (motionControl.moveForward || motionControl.moveBackward) {
  //     pointerControlsVelocity.z -= direction.z * 200.0 * deltaTime;
  //   }
  //   if (motionControl.moveLeft || motionControl.moveRight) {
  //     pointerControlsVelocity.x -= direction.x * 200.0 * deltaTime;
  //   }

  //   if (distanceToGround > CAMERA_POSITION) {
  //     pointerControlsVelocity.y -= 9.8 * 12 * deltaTime;
  //   }

  //   pointerControls.moveRight(-pointerControlsVelocity.x * deltaTime);
  //   pointerControls.moveForward(-pointerControlsVelocity.z * deltaTime);
  //   pointerControls.getObject().position.y +=
  //     pointerControlsVelocity.y * deltaTime;

  //   console.log(pointerControls.getObject().position.y, CAMERA_POSITION);
  //   if (distanceToGround < CAMERA_POSITION) {
  //     pointerControlsVelocity.y = 0;
  //     pointerControls.getObject().position.y = groundY
  //       ? groundY + CAMERA_POSITION
  //       : CAMERA_POSITION;
  //     motionControl.canJump = true;
  //   }
  // }

  if (pointerControls.isLocked === true) {
    let distanceToGround = CAMERA_POSITION;
    let groundY = null;

    raycaster.ray.origin.copy(pointerControls.getObject().position);

    const intersections = raycaster.intersectObjects(objectsToIntersect, false);

    if (intersections.length > 0) {
      distanceToGround =
        pointerControls.getObject().position.y - intersections[0].point.y;
      groundY = intersections[0].point.y;

      if (motionControl.canJump) {
        pointerControls.getObject().position.y = groundY + CAMERA_POSITION;
      }
    } else {
      distanceToGround = pointerControls.getObject().position.y;
    }

    pointerControlsVelocity.x -= pointerControlsVelocity.x * 10.0 * deltaTime;
    pointerControlsVelocity.z -= pointerControlsVelocity.z * 10.0 * deltaTime;

    direction.z =
      Number(motionControl.moveForward) - Number(motionControl.moveBackward);
    direction.x =
      Number(motionControl.moveRight) - Number(motionControl.moveLeft);
    direction.normalize();

    if (motionControl.moveForward || motionControl.moveBackward) {
      pointerControlsVelocity.z -= direction.z * 200.0 * deltaTime;
    }
    if (motionControl.moveLeft || motionControl.moveRight) {
      pointerControlsVelocity.x -= direction.x * 200.0 * deltaTime;
    }

    if (distanceToGround > CAMERA_POSITION) {
      pointerControlsVelocity.y -= 9.8 * 12 * deltaTime;
    }

    pointerControls.moveRight(-pointerControlsVelocity.x * deltaTime);
    pointerControls.moveForward(-pointerControlsVelocity.z * deltaTime);
    pointerControls.getObject().position.y +=
      pointerControlsVelocity.y * deltaTime;

    if (pointerControls.getObject().position.y < groundY + CAMERA_POSITION) {
      pointerControlsVelocity.y = 0;
      pointerControls.getObject().position.y = groundY + CAMERA_POSITION;
      motionControl.canJump = true;
    }
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);

  stats.end();
};

tick();
