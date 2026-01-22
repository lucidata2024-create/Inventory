// assets/js/pos-simulator.js
// Simulare POS – vânzare la casă

window.LuciData = window.LuciData || {};
LuciData.retail = LuciData.retail || {};

LuciData.retail.pos = {

  simulateSale({ storeId, sku, quantity }) {
    const item = LuciData.retail.inventory.find(
      i => i.storeId === storeId && i.sku === sku
    );

    if (!item) {
      console.warn("POS: produsul nu există în inventar");
      return;
    }

    // 1. Scădem din raft
    item.shelfStock = Math.max(0, item.shelfStock - quantity);

    // 2. Log eveniment
    LuciData.retail.events = LuciData.retail.events || [];
    LuciData.retail.events.push({
      type: "POS_SALE",
      storeId,
      sku,
      quantity,
      timestamp: new Date().toISOString()
    });

    console.log(
      `POS SALE → ${storeId} | ${sku} | -${quantity} buc`
    );
  }
LuciData.audit.record({
  entityType: "POS",
  entityId: `${storeId}-${sku}`,
  action: "POS_SALE",
  actor: {
    type: "SYSTEM",
    role: "POS"
  },
  context: {
    storeId,
    sku,
    quantity
  },
  result: "SUCCESS"
});

};

// DUPĂ ce scazi stocul
LuciData.audit.record({
  entityType: "POS",
  entityId: `${storeId}-${sku}`,
  action: "POS_SALE",
  actor: {
    type: "SYSTEM",
    role: "POS"
  },
  context: {
    storeId,
    sku,
    quantity
  },
  result: "SUCCESS"
});
