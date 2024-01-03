import * as THREE from "three";
import CANNON from "cannon";

const cubeTextureLoader = new THREE.CubeTextureLoader();

const environmentMapTexture = cubeTextureLoader.load([
  "/textures/environmentMaps/0/px.png",
  "/textures/environmentMaps/0/nx.png",
  "/textures/environmentMaps/0/py.png",
  "/textures/environmentMaps/0/ny.png",
  "/textures/environmentMaps/0/pz.png",
  "/textures/environmentMaps/0/nz.png",
]);

//Mesh

const BOX_GEOMETRY = {
  x: 1,
  y: 1,
  z: 3,
};

const geometry = new THREE.BoxGeometry(
  BOX_GEOMETRY.x,
  BOX_GEOMETRY.y,
  BOX_GEOMETRY.z
);
const material = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
  //   wireframe: true,
});

//Physic shape

const shape = new CANNON.Box(
  new CANNON.Vec3(
    BOX_GEOMETRY.x * 0.5,
    BOX_GEOMETRY.y * 0.5,
    BOX_GEOMETRY.z * 0.5
  )
);

const generateBlock = (position) => {
  const { x, y, z, isRotated } = position;

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.position.set(x, y, z);

  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(x, y, z),
    shape: shape,
  });

  if (isRotated) {
    body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, -1, 0), Math.PI * 0.5);
  }

  return { mesh, body };
};

export { generateBlock };
