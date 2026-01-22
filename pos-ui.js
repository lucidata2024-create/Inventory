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

function populatePosSelectors() {
  const storeSel = document.getElementById("posStore");
  const skuSel = document.getElementById("posSku");

  storeSel.innerHTML = "";
  skuSel.innerHTML = "";

  const inventory = LuciData.retail.inventory;

  [...new Set(inventory.map(i => i.storeId))].forEach(s => {
    storeSel.innerHTML += `<option value="${s}">${s}</option>`;
  });

  [...new Set(inventory.map(i => i.sku))].forEach(s => {
    skuSel.innerHTML += `<option value="${s}">${s}</option>`;
  });
}

function runPosSimulation() {
  const storeId = document.getElementById("posStore").value;
  const sku = document.getElementById("posSku").value;
  const qty = parseInt(document.getElementById("posQty").value, 10);

  if (!storeId || !sku || qty <= 0) {
    alert("Date invalide");
    return;
  }

  LuciData.retail.pos.simulateSale({
    storeId,
    sku,
    quantity: qty
  });

  // refresh UI
  if (window.renderInventoryTable) renderInventoryTable();
  if (window.renderAiTasks) renderAiTasks();

  document.getElementById("posModal").classList.add("hidden");
}
