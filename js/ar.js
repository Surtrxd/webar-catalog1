// public/js/ar.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js";

const { MindARThree } = window.MINDAR.IMAGE;

// Конфиг образов: какой файл и как его позиционировать
const OUTFITS = {
  dress1: {
    name: "Платье 1",
    model: "/models/dress1.glb",
    scale: [0.3, 0.3, 0.3],
    position: [0, -0.5, 0],
    rotation: [0, 0, 0],
  },
  dress2: {
    name: "Платье 2",
    model: "/models/dress2.glb",
    scale: [0.3, 0.3, 0.3],
    position: [0, -0.5, 0],
    rotation: [0, 0, 0],
  },
  // добавишь остальные
};

function getSelectedOutfitId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("outfit");
}

document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("back-btn");
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  const outfitId = getSelectedOutfitId();
  const outfit = OUTFITS[outfitId];

  if (!outfit) {
    alert("Не выбран образ для примерки");
    window.location.href = "index.html";
    return;
  }

  initAR(outfit);
});

async function initAR(outfit) {
  const container = document.querySelector("#ar-container");

  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: "/mindar/targets.mind",
  });

  const { renderer, scene, camera } = mindarThree;

  // Свет
  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(light);

  // Якорь для маркера 0
  const anchor = mindarThree.addAnchor(0);

  // Загрузка модели одежды (по желанию сюда же можно манекен)
  const loader = new GLTFLoader();

  loader.load(
    outfit.model,
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(...outfit.scale);
      model.position.set(...outfit.position);
      model.rotation.set(...outfit.rotation);
      anchor.group.add(model);
    },
    undefined,
    (err) => {
      console.error("Ошибка загрузки модели", err);
    }
  );

  // (опционально) сюда же можно загрузить манекен:
  // loader.load("/models/mannequin.glb", ...)

  await mindarThree.start();

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}
