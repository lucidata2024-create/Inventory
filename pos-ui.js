// assets/js/pos-ui.js
// POS UI – compatibil cu Firebase Inventory (NO LuciData)

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("simulatePosBtn");
  const modal = document.getElementById("posModal");

  if (!btn || !modal) return;

  btn.onclick = () => {
    modal.classList.remove("hidden");
    populatePosSelectors();
  };

  document.getElementById("closePosSim").onclick = () => {
    modal.classList.add("hidden");
  };

  document.getElementById("runPosSim").onclick = runPosSimulation;
});

/* =========================
   POPULATE SELECTORS
========================= */

function populatePosSelectors() {
  const storeSel = document.getElementById("posStore");
  const skuSel = document.getElementById("posSku");

  storeSel.innerHTML = "";
  skuSel.innerHTML = "";

  // INVENTORY este menținut live de inventory.js
  if (!window.INVENTORY || !Array.isArray(window.INVENTORY)) {
    console.warn("POS UI: INVENTORY indisponibil");
    return;
  }

  [...new Set(window.INVENTORY.map(i => i.storeId))].forEach(storeId => {
    storeSel.innerHTML += `<option value="${storeId}">${storeId}</option>`;
  });

  [...new Set(window.INVENTORY.map(i => i.sku))].forEach(sku => {
    skuSel.innerHTML += `<option value="${sku}">${sku}</option>`;
  });
}

/* =========================
   RUN POS SIMULATION
========================= */

function runPosSimulation() {
  const storeId = document.getElementById("posStore").value;
  const sku = document.getElementById("posSku").value;
  const qty = parseInt(document.getElementById("posQty").value, 10);

  if (!storeId || !sku || qty <= 0) {
    alert("Date POS invalide");
    return;
  }

  if (!window.POSSimulator) {
    alert("POS Simulator indisponibil");
    return;
  }

  // 🔔 Trimite eveniment POS
  window.POSSimulator.simulateSale({
    storeId,
    sku,
    quantity: qty
  });

  document.getElementById("posModal").classList.add("hidden");
}

