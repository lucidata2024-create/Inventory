// assets/js/inventory.js
// UI pentru Inventory – conectat la inventoryEngine

document.addEventListener("DOMContentLoaded", () => {
  renderInventoryTable();
  renderInventoryTasks();
});

function renderInventoryTable() {
  const tbody = document.getElementById("inventoryTableBody");
  tbody.innerHTML = "";

  LuciData.retail.inventory.forEach(item => {
    const status = LuciData.retail.inventoryEngine.getInventoryStatus(item);
    const total = LuciData.retail.inventoryEngine.getTotalStock(item);
    const explain = LuciData.retail.inventoryEngine.explain(item);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.storeId}</td>
      <td>${item.sku}</td>
      <td>${item.shelfStock}</td>
      <td>${item.warehouseStock}</td>
      <td><strong>${total}</strong></td>
      <td><span class="status ${status.toLowerCase()}">${status}</span></td>
      <td class="ai-explain">${explain}</td>
    `;

    tbody.appendChild(tr);
  });
}

function renderInventoryTasks() {
  const tbody = document.getElementById("tasksTableBody");
  tbody.innerHTML = "";

  // task-uri pentru toate magazinele
  const storeIds = [
    ...new Set(LuciData.retail.inventory.map(i => i.storeId))
  ];

  storeIds.forEach(storeId => {
    const tasks = LuciData.retail.inventoryEngine.generateTasks(storeId);

    tasks.forEach(task => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${task.storeId}</td>
        <td>${task.sku}</td>
        <td>${task.type}</td>
        <td>${task.priority}</td>
        <td>${task.reason}</td>
        <td>${task.suggestedQty || "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  });
}

document.getElementById("simulatePosBtn")?.addEventListener("click", () => {

  // demo fix (pentru prezentare)
  LuciData.retail.pos.simulateSale({
    storeId: "MI-001",
    sku: "SKU-001",
    quantity: 3
  });

  // re-render UI
  renderInventoryTable();
  renderInventoryTasks();
});

LuciData.audit.record({
  entityType: "INVENTORY",
  entityId: `${storeId}-${sku}`,
  action: "STOCK_UPDATE",
  actor: {
    type: "SYSTEM",
    role: "INVENTORY_ENGINE"
  },
  context: {
    storeId,
    sku,
    shelfStock: item.shelfStock,
    warehouseStock: item.warehouseStock
  },
  result: "SUCCESS"
});
