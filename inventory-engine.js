// assets/js/inventory-engine.js
// INVENTORY ENGINE – logică business & AI rules (MVP)

window.LuciData = window.LuciData || {};
LuciData.retail = LuciData.retail || {};

LuciData.retail.inventoryEngine = {

  // ==============================
  // STARE INVENTAR
  // ==============================
  getInventoryStatus(item) {
    if (item.shelfStock < item.minShelf) return "REFILL_REQUIRED";
    if (item.warehouseStock < item.minWarehouse) return "REORDER_REQUIRED";
    return "OK";
  },

  getTotalStock(item) {
    return item.shelfStock + item.warehouseStock;
  },

  // ==============================
  // TASK GENERATION (MVP)
  // ==============================
  generateTasks(storeId) {
    const inventory = LuciData.retail.inventory
      .filter(i => i.storeId === storeId);

    const tasks = [];

    inventory.forEach(item => {
      if (item.shelfStock < item.minShelf) {
        tasks.push({
          type: "REFILL_SHELF",
          storeId: item.storeId,
          sku: item.sku,
          priority: "HIGH",
          reason: "Stoc raft sub prag",
          suggestedQty: item.minShelf - item.shelfStock
        });
      }

      if (item.warehouseStock < item.minWarehouse) {
        tasks.push({
          type: "REORDER_WAREHOUSE",
          storeId: item.storeId,
          sku: item.sku,
          priority: "MEDIUM",
          reason: "Stoc depozit sub prag",
          suggestedQty: item.minWarehouse * 2
        });
      }

      // Expiry check (simplificat)
      const daysToExpire =
        (new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24);

      if (daysToExpire <= 7) {
        tasks.push({
          type: "EXPIRY_ALERT",
          storeId: item.storeId,
          sku: item.sku,
          priority: "HIGH",
          reason: `Produs expiră în ${Math.ceil(daysToExpire)} zile`
        });
      }
    });

    return tasks;
  },

  // ==============================
  // EXPLAINABILITY
  // ==============================
  explain(item) {
    const status = this.getInventoryStatus(item);

    if (status === "REFILL_REQUIRED") {
      return "AI a detectat că stocul de pe raft este sub pragul minim definit pentru vânzări optime.";
    }

    if (status === "REORDER_REQUIRED") {
      return "Stocul din depozit este sub nivelul de siguranță. Recomandare de reaprovizionare.";
    }

    return "Stocurile sunt în parametri normali.";
  }
};

LuciData.inventory.completeTask = function(taskId) {
  const task = this.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.status = "done";
  task.completedAt = new Date().toISOString();

  console.log("✔ Task finalizat:", task);
};
