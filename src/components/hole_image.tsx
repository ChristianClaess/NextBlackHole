"use client";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three/webgpu";
import {
  uniform,
  normalize,
  positionWorld,
  cameraPosition,
} from "three/tsl";

import {createShader } from "./BH_image";

const initHole = async (): Promise<{
  scene: THREE.Scene;
  renderer: THREE.WebGPURenderer;
}> => {
  const uniforms = {
    starsEnabled: uniform(1.0),
    starBackgroundColor: uniform(new THREE.Color("#000000")),
    starDensity: uniform(0.29),
    starSize: uniform(0.9),
    starBrightness: uniform(1.0),

    cameraPosition: uniform(new THREE.Vector3(0, 5, 20)),
    cameraTarget: uniform(new THREE.Vector3(0, 0, 0)),
    resolution: uniform(
      new THREE.Vector2(window.innerWidth, window.innerHeight)
    ),

    blackHoleMass: uniform(1.0),
    stepSize: uniform(0.5),
    gravitationalLensing: uniform(1.0),
  };

  const renderer = new THREE.WebGPURenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  uniforms.resolution.value.set(
  renderer.domElement.width,   // drawing buffer size (includes DPR)
  renderer.domElement.height
);
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 5, 20);

  // Inverted sphere (skybox)
  const geometry = new THREE.SphereGeometry(100, 64, 64);
  geometry.scale(-1, 1, 1);

  // Ray direction from camera → world position
  const rayDir = normalize(positionWorld.sub(cameraPosition));

  const material = new THREE.MeshBasicNodeMaterial();
  material.colorNode = createShader(uniforms);

  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  await renderer.init();

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.target.set(0, 0, 0);
  controls.update();

  renderer.setAnimationLoop(() => {
    controls.update();

    uniforms.cameraPosition.value.copy(camera.position);
    uniforms.cameraTarget.value.copy(controls.target);

    renderer.render(scene, camera);
  });

  return { scene, renderer };
};

export default initHole;
