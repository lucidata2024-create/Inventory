// assets/js/inventory.js
// Inventory UI + Firebase Auth + Firestore
// FĂRĂ base.js · FĂRĂ LuciData · UN SINGUR FIȘIER

/* =========================
   FIREBASE IMPORTS
========================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
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
   LOGIN OVERLAY (AUTO)
========================= */
function showLogin() {
  if (document.getElementById("loginOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "loginOverlay";
  overlay.style.cssText = `
    position:fixed; inset:0; z-index:9999;
    background:#0f172a;
    display:flex; align-items:center; justify-content:center;
  `;

  overlay.innerHTML = `
    <div style="
      background:#111827;
      padding:32px;
      width:360px;
      border-radius:14px;
      box-shadow:0 30px 60px rgba(0,0,0,.6);
      color:#fff;
    ">
      <h2 style="text-align:center;margin-bottom:16px">Autentificare</h2>
      <input id="loginEmail" placeholder="Email"
        style="width:100%;padding:10px;margin-bottom:12px;border-radius:8px;border:none" />
      <input id="loginPassword" type="password" placeholder="Parolă"
        style="width:100%;padding:10px;margin-bottom:16px;border-radius:8px;border:none" />
      <button id="loginBtn"
        style="width:100%;padding:12px;border-radius:8px;border:none;
        background:#2563eb;color:#fff;font-size:15px">
        Login
      </button>
      <div id="loginError"
        style="margin-top:12px;color:#f87171;text-align:center;font-size:14px"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const pass = document.getElementById("loginPassword").value.trim();
    const err = document.getElementById("loginError");

    err.textContent = "";

    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch {
      err.textContent = "Email sau parolă incorecte.";
    }
  };
}

function hideLogin() {
  const el = document.getElementById("loginOverlay");
  if (el) el.remove();
}

/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    showLogin();
    if (unsubscribeInventory) {
      unsubscribeInventory();
      unsubscribeInventory = null;
    }
    return;
  }

  hideLogin();
  startInventory();
});

/* =========================
   FIRESTORE SUBSCRIBE
========================= */
function startInventory() {
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

  bindPosButton();
}

/* =========================
   INVENTORY TABLE
========================= */
function renderInventoryTable() {
  const tbody = document.getElementById("inventoryTableBody");
  if (!tbody || !window.InventoryEngine) return;

  tbody.innerHTML = "";

  INVENTORY.forEach(item => {
    const status = InventoryEngine.getInventoryStatus(item);
    const total = InventoryEngine.getTotalStock(item);
    const explain = InventoryEngine.explain(item);

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
   AI TASKS
========================= */
function renderInventoryTasks() {
  const tbody = document.getElementById("tasksTableBody");
  if (!tbody || !window.InventoryEngine) return;

  tbody.innerHTML = "";

  const storeIds = [...new Set(INVENTORY.map(i => i.storeId))];
  storeIds.forEach(storeId => {
    const tasks = InventoryEngine.generateTasks(storeId, INVENTORY);
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
   POS SIMULATION
========================= */
function bindPosButton() {
  const btn = document.getElementById("simulatePosBtn");
  if (!btn) return;

  btn.onclick = async () => {
    const item = INVENTORY.find(
      i => i.storeId === "MI-001" && i.sku === "SKU-001"
    );
    if (!item) return;

    await updateDoc(doc(db, "inventory", item.id), {
      shelfStock: increment(-3)
    });
  };
}
