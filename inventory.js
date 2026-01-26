// assets/js/inventory.js
// Inventory UI + Firebase Firestore (NO localStorage)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

/* =========================
   FIREBASE INIT
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyCGOo2RHcC8esOLFyTGiaadJS90AhC-PwQ",
  authDomain: "lucidata-inventory.firebaseapp.com",
  projectId: "lucidata-inventory",
  storageBucket: "lucidata-inventory.firebasestorage.app",
  messagingSenderId: "326427323164",
  appId: "1:326427323164:web:02b4e5f9738e43ef9ba8d9",
  measurementId: "G-6J6YH21R32"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

/* =========================
   STATE
========================= */

let INVENTORY = []; // date live din Firestore

/* =========================
   DOM READY
========================= */

document.addEventListener("DOMContentLoaded", () => {
  subscribeInventory();
  bindSimulatePOS();
});

/* =========================
   FIRESTORE SUBSCRIPTIONS
========================= */

function subscribeInventory() {
  const q = query(collection(db, "inventory"));

  onSnapshot(q, (snapshot) => {
    INVENTORY = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    renderInventoryTable();
    renderInventoryTasks();
  });
}

/* =========================
   RENDER INVENTORY TABLE
========================= */

function renderInventoryTable() {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  INVENTORY.forEach(item => {
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

/* =========================
   RENDER TASKS (AI ENGINE)
========================= */

function renderInventoryTasks() {
  const tbody = document.getElementById("tasksTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const storeIds = [...new Set(INVENTORY.map(i => i.storeId))];

  storeIds.forEach(storeId => {
    const tasks = LuciData.retail.inventoryEngine.generateTasks(storeId, INVENTORY);

    tasks.forEach(task => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${task.storeId}</td>
        <td>${task.sku}</td>
        <td>${task.type}</td>
        <td>${task.priority}</td>
        <td>${task.reason}</td>
        <td>${task.suggestedQty ?? "-"}</td>
      `;
      tbody.appendChild(tr);
    });
  });
}

/* =========================
   POS – SIMULATE SALE
========================= */

function bindSimulatePOS() {
  const btn = document.getElementById("simulatePosBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const item = INVENTORY.find(
      i => i.storeId === "MI-001" && i.sku === "SKU-001"
    );
    if (!item) return;

    const ref = doc(db, "inventory", item.id);

    await updateDoc(ref, {
      shelfStock: increment(-3)
    });

    recordAudit(item.storeId, item.sku, "POS_SALE", {
      quantity: 3
    });
  });
}

/* =========================
   AUDIT LOG (FIRESTORE)
========================= */

function recordAudit(storeId, sku, action, context = {}) {
  if (!LuciData?.audit) return;

  LuciData.audit.record({
    entityType: "INVENTORY",
    entityId: `${storeId}-${sku}`,
    action,
    actor: {
      type: "SYSTEM",
      role: "INVENTORY_ENGINE"
    },
    context,
    result: "SUCCESS",
    timestamp: new Date().toISOString()
  });
}
