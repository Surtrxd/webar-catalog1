// public/js/main.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";

const { MindARThree } = window.MINDAR.IMAGE;

document.addEventListener("DOMContentLoaded", () => {
  initAR();
});

async function initAR() {
  const container = document.querySelector("#ar-container");

  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: "/targets.mind",   // твой .mind файл
  });

  const { renderer, scene, camera } = mindarThree;

  // свет
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(0, 1, 1);
  scene.add(dir);

  // якорь по первому таргету
  const anchor = mindarThree.addAnchor(0);

  const loader = new GLTFLoader();

  loader.load(
    "/models/outfit.glb",   // путь к твоей модели
    (gltf) => {
      const model = gltf.scene;

      // подстрой под себя
      model.scale.set(0.3, 0.3, 0.3);
      model.position.set(0, -0.5, 0);
      model.rotation.set(0, 0, 0);

      anchor.group.add(model);
    },
    undefined,
    (error) => {
      console.error("Ошибка загрузки модели:", error);
    }
  );

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}
