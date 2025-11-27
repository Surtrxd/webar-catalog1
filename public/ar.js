// public/ar.js
import * as THREE from "three";
import { MindARThree } from "mindar-image-three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#container");
  const hint = document.querySelector("#hint");

  const setHint = (text) => {
    if (hint) hint.textContent = text;
    console.log("[HINT]", text);
  };

  console.log("=== AR INIT START ===");
  console.log("location:", location.href);

  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: "./assets/targets.mind", // ИМЯ ДОЛЖНО СОВПАДАТЬ С ФАЙЛОМ
    // если файл называется targets.mind — поменяй на "./assets/targets.mind"
  });

  const { renderer, scene, camera } = mindarThree;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);

  // свет
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.8);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(0, 1, 1);
  scene.add(dir);

  // anchor для первого таргета (index 0 в .mind)
  const anchor = mindarThree.addAnchor(0);
  const loader = new GLTFLoader();
  let mannequin = null;

  loader.load(
    "./assets/mannequin_statue.glb",
    (gltf) => {
      console.log("Модель манекена загружена");
      mannequin = gltf.scene;
      mannequin.scale.set(0.35, 0.35, 0.35);
      mannequin.position.set(0, -0.2, 0);
      anchor.group.add(mannequin);
    },
    undefined,
    (err) => {
      console.error("Ошибка загрузки mannequin.glb:", err);
      setHint("Не удалось загрузить модель (см. консоль).");
    }
  );


  setHint("Запрашиваем доступ к камере…");

  mindarThree
    .start()
    .then(() => {
      console.log("MindAR started");
      setHint("Камера запущена. Наведи на маркер.");
    })
    .catch((e) => {
      console.error("Ошибка запуска MindAR:", e);
      setHint("Не удалось запустить камеру (см. консоль).");
    });

  renderer.setAnimationLoop(() => {
  if (mannequin) {
    mannequin.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
});


  window.addEventListener("resize", () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});
