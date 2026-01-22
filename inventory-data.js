// assets/js/inventory-data.js
// INVENTORY – demo data (MVP)

window.LuciData = window.LuciData || {};
LuciData.retail = LuciData.retail || {};

LuciData.retail.inventory = [
  {
    storeId: "MI-BUC-001",
    sku: "SKU-0001",
    shelfStock: 100,
    warehouseStock: 100,
    minShelf: 150,
    minWarehouse: 150,
    expiry: "2025-01-10",
    lastUpdate: "2024-12-12T09:30:00"
  },
  {
    storeId: "MI-BUC-001",
    sku: "SKU-0002",
    shelfStock: 18,
    warehouseStock: 15,
    minShelf: 12,
    minWarehouse: 20,
    expiry: "2025-02-05",
    lastUpdate: "2024-12-12T09:35:00"
  },
  {
    storeId: "MI-IF-002",
    sku: "SKU-0001",
    shelfStock: 3,
    warehouseStock: 8,
    minShelf: 10,
    minWarehouse: 15,
    expiry: "2024-12-20",
    lastUpdate: "2024-12-12T08:55:00"
  },
   {
    storeId: "MI-IF-002",
    sku: "SKU-0001",
    shelfStock: 8,
    warehouseStock: 19,
    minShelf: 14,
    minWarehouse: 100,
    expiry: "2024-12-20",
    lastUpdate: "2024-12-12T08:55:00"
  }
];

LuciData.inventory = {};

LuciData.inventory.tasks = [
  {
    id: "T-001",
    storeId: "MI-001",
    type: "REFILL_SHELF",
    sku: "LAPTE-ZUZU-1L",
    productName: "Lapte Zuzu 1L",
    quantity: 24,
    priority: "high",
    status: "open",
    reason: "Stoc raft sub prag minim"
  },
  {
    id: "T-002",
    storeId: "MI-001",
    type: "EXPIRY_CHECK",
    sku: "IAURT-DANONE-150G",
    productName: "Iaurt Danone 150g",
    priority: "medium",
    status: "open",
    reason: "Expirare în 3 zile"
  }
];
