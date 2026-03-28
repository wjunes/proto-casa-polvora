(function () {
  function handleMessage(e) {
    if (!e.data || typeof e.data !== "object") return;
    if (e.data.type === "polvorina-close") {
      try {
        var modalEl = document.getElementById("polvorinaModal");
        if (!modalEl) return;
        var modalInstance =
          bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modalInstance.hide();
      } catch (err) {
        console.warn(
          "No se pudo cerrar el modal Polvorina via postMessage",
          err,
        );
      }
    }
  }
  window.addEventListener("message", handleMessage, false);
})();
