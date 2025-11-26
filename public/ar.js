// public/ar.js
import * as THREE from "three";
import { MindARThree } from "mindar-image-three";

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
    imageTargetSrc: "./assets/target.mind", // ИМЯ ДОЛЖНО СОВПАДАТЬ С ФАЙЛОМ
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

  // ТЕСТОВЫЙ КУБ
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.3),
    new THREE.MeshNormalMaterial()
  );
  cube.position.set(0, 0, 0);
  anchor.group.add(cube);

  anchor.onTargetFound = () => {
    console.log("TARGET FOUND");
    setHint("Маркер найден! Видишь куб на нём.");
  };

  anchor.onTargetLost = () => {
    console.log("TARGET LOST");
    setHint("Маркер потерян. Наведи ещё раз.");
  };

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
    cube.rotation.y += 0.02;
    renderer.render(scene, camera);
  });

  window.addEventListener("resize", () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
});
