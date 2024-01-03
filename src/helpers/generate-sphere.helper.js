import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import CANNON from "cannon";

const SPHERE_RADIUS = 0.5;

const cubeTextureLoader = new THREE.CubeTextureLoader();
const gltfLoader = new GLTFLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
]);

let group = new THREE.Group();
let angryBirdMesh = null;

gltfLoader.load("/models/angry-bird.glb", (gltf) => {
  angryBirdMesh = gltf.scene;
  const boxBeforeScale = new THREE.Box3();
  const box = new THREE.Box3();

  boxBeforeScale.setFromObject(angryBirdMesh);
  let sizeBeforeScale = new THREE.Vector3();
  boxBeforeScale.getSize(sizeBeforeScale);
  // const maxSize = Math.max(
  //   sizeBeforeScale.x,
  //   sizeBeforeScale.y,
  //   sizeBeforeScale.z
  // );
  // angryBirdMesh.scale.setScalar(1 / (maxSize / 1));
  angryBirdMesh.scale.set(
    1 / (sizeBeforeScale.x / 1),
    1 / (sizeBeforeScale.y / 1),
    1 / (sizeBeforeScale.z / 1)
  );
  //After Scale

  box.setFromObject(angryBirdMesh);

  const offsetX = Math.abs(box.max.x) - Math.abs(box.min.x);
  const offsetY = Math.abs(box.max.y) - Math.abs(box.min.y);
  const offsetZ = Math.abs(box.max.z) - Math.abs(box.min.z);

  angryBirdMesh.position.set(-offsetX / 2, -offsetY / 2, -offsetZ / 2);

  group.add(angryBirdMesh);
});

const geometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32);

const material = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});

const sphereShape = new CANNON.Sphere(SPHERE_RADIUS);

const generateSphere = (position) => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.position.copy(position);

  const meshClone = angryBirdMesh.clone();
  meshClone.position.copy(position);

  const body = new CANNON.Body({
    mass: 5,
    shape: sphereShape,
  });
  body.position.copy(position);

  const box = new THREE.Box3();

  box.setFromObject(meshClone);
  // console.log(box.max.x - box.min.x);
  // console.log(box.max.y - box.min.y);
  // console.log(box.max.z - box.min.z);

  return { mesh: group, body };
};

export { generateSphere };
