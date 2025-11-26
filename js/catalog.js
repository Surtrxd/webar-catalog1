// public/js/catalog.js
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".try-on-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".item");
      const outfitId = item.dataset.id;

      // Переходим на AR-страницу с параметром выбранного образа
      window.location.href = `ar.html?outfit=${encodeURIComponent(outfitId)}`;
    });
  });
});
