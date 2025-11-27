// public/ar.js
import * as THREE from "three";
import { MindARThree } from "mindar-image-three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#container");
  const hint = document.querySelector("#hint");
  const menu = document.querySelector("#outfit-menu");
  const buttonsContainer = document.querySelector("#outfit-buttons");

  const setHint = (text) => {
    if (hint) hint.textContent = text;
    console.log("[HINT]", text);
  };

  console.log("=== AR INIT START ===");
  console.log("location:", location.href);

  // === КОНФИГ ОБРАЗОВ ===
  // Здесь подставишь свои реальные пути/скейлы под модели
  const OUTFITS = {
    base: {
      file: "./assets/manequin_statue.glb",
      scale: [0.35, 0.35, 0.35],
      position: [0, -0.2, 0],
      rotation: [0, 0, 0],
    },
    casual: {
      file: "./assets/basketball_jacket.glb",
      scale: [0.35, 0.35, 0.35],
      position: [0, -0.2, 0],
      rotation: [0, 0, 0],
    },
    formal: {
      file: "./assets/suit.glb",
      scale: [0.35, 0.35, 0.35],
      position: [0, -0.2, 0],
      rotation: [0, 0, 0],
    },
    dress: {
      file: "./assets/dress_of_a_poor_woman_-_victorian_era.glb",
      scale: [0.35, 0.35, 0.35],
      position: [0, -0.2, 0],
      rotation: [0, 0, 0],
    },
  };

  // текущее состояние
  const loader = new GLTFLoader();
  const outfitModels = {}; // {id: THREE.Object3D}
  let currentOutfitId = "base";

  // === ИНИЦИАЛИЗАЦИЯ MINDAR ===
  const mindarThree = new MindARThree({
    container,
    imageTargetSrc: "./assets/targets.mind", // у тебя именно так
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

  // anchor для первого таргета
  const anchor = mindarThree.addAnchor(0);

  // === ФУНКЦИИ ДЛЯ ОДЕЖДЫ ===

  const setActiveOutfit = (id) => {
    currentOutfitId = id;
    Object.entries(outfitModels).forEach(([key, model]) => {
      model.visible = key === id;
    });

    // подсветка кнопок
    if (buttonsContainer) {
      buttonsContainer.querySelectorAll(".outfit-btn").forEach((btn) => {
        if (btn.dataset.outfit === id) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    console.log("Текущий образ:", id);
  };

  const loadOutfitIfNeeded = (id) => {
    if (outfitModels[id]) {
      // уже загружен, просто переключаемся
      setActiveOutfit(id);
      return;
    }

    const config = OUTFITS[id];
    if (!config) {
      console.warn("Нет конфига для образа", id);
      return;
    }

    console.log("Загружаем образ", id, "из", config.file);
    loader.load(
      config.file,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(...config.scale);
        model.position.set(...config.position);
        model.rotation.set(...config.rotation);

        model.visible = false; // временно, включим в setActiveOutfit
        anchor.group.add(model);
        outfitModels[id] = model;

        setActiveOutfit(id);
      },
      undefined,
      (err) => {
        console.error("Ошибка загрузки образа", id, err);
        setHint("Не удалось загрузить модель образа (см. консоль).");
      }
    );
  };

  // === СОБЫТИЯ МАРКЕРА ===
  anchor.onTargetFound = () => {
    console.log("TARGET FOUND");
    setHint("Маркер найден! Выбери образ в меню.");
    if (menu) menu.style.display = "block";
  };

  anchor.onTargetLost = () => {
    console.log("TARGET LOST");
    setHint("Маркер потерян. Наведи камеру на маркер ещё раз.");
    if (menu) menu.style.display = "none";
  };

  // === ОБРАБОТЧИКИ КНОПОК МЕНЮ ===
  if (buttonsContainer) {
    buttonsContainer.querySelectorAll(".outfit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.outfit;
        loadOutfitIfNeeded(id);
      });
    });
  }

  // === СТАРТ КАМЕРЫ ===
  setHint("Запрашиваем доступ к камере…");

  mindarThree
    .start()
    .then(() => {
      console.log("MindAR started");
      setHint("Камера запущена. Наведи на маркер.");
      // заранее грузим базовый образ
      loadOutfitIfNeeded("base");
    })
    .catch((e) => {
      console.error("Ошибка запуска MindAR:", e);
      setHint("Не удалось запустить камеру (см. консоль).");
    });

  // === РЕНДЕР ===
  renderer.setAnimationLoop(() => {
    const activeModel = outfitModels[currentOutfitId];
    if (activeModel) {
      activeModel.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
  });

  window.addEventListener("resize", () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});
