// ar.js
import * as THREE from "three";
import { MindARThree } from "mindar-image-three";

document.addEventListener("DOMContentLoaded", () => {
  initAR();
});

function initAR() {
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
    imageTargetSrc: "./assets/targets.mind", // твой таргет
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

  // anchor для маркера #0
  const anchor = mindarThree.addAnchor(0);

  // ТЕСТОВЫЙ КУБ, чтобы проверить маркер
  const testCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.3),
    new THREE.MeshNormalMaterial()
  );
  testCube.position.set(0, 0, 0);
  anchor.group.add(testCube);

  // события маркера
  anchor.onTargetFound = () => {
    console.log("TARGET FOUND");
    setHint("Маркер найден! Должен быть цветной куб.");
  };

  anchor.onTargetLost = () => {
    console.log("TARGET LOST");
    setHint("Маркер потерян. Наведи камеру на маркер ещё раз.");
  };

  // СТАРТ БЕЗ await
  setHint("Запрашиваем доступ к камере…");

  // просто вызываем start, но интерфейс обновляем сами
  mindarThree
    .start()
    .then(() => {
      console.log("MindAR start() resolved");
      // на айфоне промис может и не резолвиться, но если резолвится — обновим текст
      setHint("Камера запущена. Наведи на маркер.");
    })
    .catch((e) => {
      console.error("Ошибка запуска MindAR:", e);
      if (e && e.name === "NotAllowedError") {
        setHint("Нет доступа к камере. Разреши камеру в настройках браузера.");
      } else if (location.protocol !== "https:" && location.hostname !== "localhost") {
        setHint("Камера требует HTTPS.");
      } else {
        setHint("Не удалось запустить камеру (см. консоль).");
      }
    });

  // И СРАЗУ СЧИТАЕМ, ЧТО КАМЕРА ЗАПУЩЕНА, ЕСЛИ ПОЛЬЗОВАТЕЛЬ УЖЕ РАЗРЕШИЛ ДОСТУП
  // (это обходит зависший промис на iOS)
  setTimeout(() => {
    setHint("Камера запущена. Наведи на маркер.");
  }, 1000);

  // рендер-цикл
  renderer.setAnimationLoop(() => {
    testCube.rotation.y += 0.02;
    renderer.render(scene, camera);
  });

  window.addEventListener("resize", () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}
