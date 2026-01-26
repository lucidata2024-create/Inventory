// assets/js/inventory.js
// Inventory UI + Firebase Auth + Firestore (ONE FILE)

/* =========================
   FIREBASE IMPORTS
========================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

import {
  getFirestore,
  collection,
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
  appId: "1:326427323164:web:02b4e5f9738e43ef9ba8d9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================
   STATE
========================= */

let INVENTORY = [];
let unsubscribeInventory = null;

/* =========================
   AUTH OVERLAY UI
========================= */

function renderLoginOverlay() {
  const overlay = document.getElementById("authOverlay");
  if (!overlay) return;

  overlay.innerHTML = `
    <div style="
      position:fixed; inset:0;
      background:#0f172a;
      display:flex; align-items:center; justify-content:center;
      z-index:9999;">
      <div style="
        background:#111827; padding:32px; width:360px;
        border-radius:14px; box-shadow:0 30px 60px rgba(0,0,0,.5);
        color:#fff;">
        <h2 style="margin-bottom:16px;text-align:center">Autentificare</h2>
        <input id="authEmail" placeholder="Email" style="width:100%;padding:10px;margin-bottom:12px;border-radius:8px;border:none" />
        <input id="authPassword" type="password" placeholder="Parolă" style="width:100%;padding:10px;margin-bottom:16px;border-radius:8px;border:none" />
        <button id="authLoginBtn" style="width:100%;padding:12px;border-radius:8px;border:none;background:#2563eb;color:#fff">
          Login
        </button>
        <div id="authError" style="margin-top:12px;color:#f87171;text-align:center"></div>
      </div>
    </div>
  `;

  document.getElementById("authLoginBtn").onclick = async () => {
    const email = document.getElementById("authEmail").value.trim();
    const pass = document.getElementById("authPassword").value.trim();
    const errorBox = document.getElementById("authError");

    errorBox.textContent = "";

    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch {
      errorBox.textContent = "Email sau parolă incorecte";
    }
  };
}

function hideLoginOverlay() {
  const overlay = document.getElementById("authOverlay");
  if (overlay) overlay.innerHTML = "";
}

/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, (user) => {
  if (!user) {
    renderLoginOverlay();
    if (unsubscribeInventory) unsubscribeInventory();
    return;
  }

  hideLoginOverlay();
  subscribeInventory();
});

/* =========================
   FIRESTORE SUBSCRIBE
========================= */

function subscribeInventory() {
  if (unsubscribeInventory) return;

  unsubscribeInventory = onSnapshot(
    collection(db, "inventory"),
    (snapshot) => {
      INVENTORY = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      renderInventoryTable();
      renderInventoryTasks();
    }
  );
}

/* =========================
   INVENTORY UI
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
      <td><b>${total}</b></td>
      <td><span class="status ${status.toLowerCase()}">${status}</span></td>
      <td class="ai-explain">${explain}</td>
    `;
    tbody.appendChild(tr);
  });
}

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
   POS DEMO
========================= */

document.getElementById("simulatePosBtn")?.addEventListener("click", async () => {
  const item = INVENTORY.find(i => i.storeId === "MI-001" && i.sku === "SKU-001");
  if (!item) return;

  await updateDoc(doc(db, "inventory", item.id), {
    shelfStock: increment(-3)
  });
});
