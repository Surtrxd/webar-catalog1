// ar.js
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MindARThree } from "mindar-image-three";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector("#container");
  const hint = document.querySelector("#hint");

  const setHint = (text) => {
    if (hint) hint.textContent = text;
    console.log("[HINT]", text);
  };

  // === ИНИЦИАЛИЗАЦИЯ MINDAR ===
  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: "./assets/target.mind",   // путь к таргету!
  });

  const { renderer, scene, camera } = mindarThree;

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);

  // === СВЕТ ===
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.8);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(0, 1, 1);
  scene.add(dir);

  // === ЯКОРЬ ДЛЯ МАРКЕРА 0 ===
  const anchor = mindarThree.addAnchor(0);

  // === ЗАГРУЗКА МОДЕЛИ МАНЕКЕНА / ПЛАТЬЯ ===
  const loader = new GLTFLoader();
  let mannequin = null;

  loader.load(
    "./assets/mannequin.glb",   // СЮДА файл твоей модели
    (gltf) => {
      mannequin = gltf.scene;

      // подстрой под свою модель
      mannequin.scale.set(0.35, 0.35, 0.35);
      mannequin.position.set(0, -0.2, 0);
      mannequin.rotation.set(0, 0, 0);

      anchor.group.add(mannequin);
      console.log("Манекен загружен");
      setHint("Наведи камеру на маркер.");
    },
    undefined,
    (err) => {
      console.error("Ошибка загрузки mannequin.glb:", err);
      setHint("Не удалось загрузить модель (см. консоль).");
    }
  );

  // события маркера (по желанию)
  anchor.onTargetFound = () => {
    console.log("TARGET FOUND");
    setHint("Маркер найден! Двигай телефон вокруг манекена.");
  };

  anchor.onTargetLost = () => {
    console.log("TARGET LOST");
    setHint("Маркер потерян. Наведи камеру на изображение ещё раз.");
  };

  // === СТАРТ КАМЕРЫ ===
  await mindarThree.start();
  console.log("MindAR запущен");
  setHint("Камера запущена. Наведи на маркер.");

  // === АНИМАЦИЯ ===
  renderer.setAnimationLoop(() => {
    // если хочешь лёгкое вращение манекена:
    if (mannequin) {
      mannequin.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
  });

  // ресайз
  window.addEventListener("resize", () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});
