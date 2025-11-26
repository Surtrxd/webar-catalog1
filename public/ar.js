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

  console.log("=== AR INIT START ===");

  // === ИНИЦИАЛИЗАЦИЯ MINDAR ===
  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: "./assets/target.mind", // ВАЖНО: точный путь и имя файла
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

  // === ЯКОРЬ ДЛЯ ПЕРВОГО ТАРГЕТА ===
  const anchor = mindarThree.addAnchor(0);

  // === ЗАГРУЗКА МОДЕЛИ МАНЕКЕНА / ОДЕЖДЫ ===
  const loader = new GLTFLoader();
  let mannequin = null;

  loader.load(
  "./assets/mannequin_statue.glb",
  (gltf) => {
    mannequin = gltf.scene;
    mannequin.scale.set(0.35, 0.35, 0.35);
    mannequin.position.set(0, -0.2, 0);
    mannequin.rotation.set(0, 0, 0);

    anchor.group.add(mannequin);
    console.log("Манекен загружен");
    setHint("Камера запущена. Наведи на маркер.");
  },
  undefined,
  (err) => {
    console.error("Ошибка загрузки mannequin_statue.glb:", err);
    setHint("Не удалось загрузить модель (проверь путь и имя файла).");
  }
);


  // события маркера (опционально, но удобно)
  anchor.onTargetFound = () => {
    console.log("TARGET FOUND");
    setHint("Маркер найден! Двигай телефон вокруг манекена.");
  };

  anchor.onTargetLost = () => {
    console.log("TARGET LOST");
    setHint("Маркер потерян. Наведи камеру на маркер ещё раз.");
  };

  // === СТАРТ КАМЕРЫ И MINDAR ===
  setHint("Запрашиваем доступ к камере…");

  try {
    await mindarThree.start();
    console.log("MindAR запущен");
    // если модель уже успела загрузиться — подсказка уже поменялась на текст из loader.load
    if (!mannequin) {
      setHint("Камера запущена. Наведи на маркер.");
    }
  } catch (e) {
    console.error("Ошибка запуска MindAR:", e);
    if (e && e.name === "NotAllowedError") {
      setHint("Нет доступа к камере. Разреши камеру в настройках браузера.");
    } else if (location.protocol !== "https:" && location.hostname !== "localhost") {
      setHint("Камера требует HTTPS. Открой сайт по https или через Render.");
    } else {
      setHint("Не удалось запустить камеру (см. консоль).");
    }
    return;
  }

  // === АНИМАЦИЯ ===
  renderer.setAnimationLoop(() => {
    if (mannequin) {
      mannequin.rotation.y += 0.01; // лёгкое вращение, чтобы было живо
    }
    renderer.render(scene, camera);
  });

  // ресайз
  window.addEventListener("resize", () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});
