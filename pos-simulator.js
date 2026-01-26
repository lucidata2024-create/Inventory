// assets/js/pos-simulator.js
// POS Simulator – fără LuciData, fără localStorage
// Compatibil cu inventory.js + Firebase

window.POSSimulator = {

  /**
   * Simulează o vânzare POS
   * @param {Object} payload
   * @param {string} payload.storeId
   * @param {string} payload.sku
   * @param {number} payload.quantity
   */
  simulateSale({ storeId, sku, quantity }) {
    if (!storeId || !sku || !quantity) {
      console.warn("POS Simulator: date invalide", {
        storeId, sku, quantity
      });
      return;
    }

    console.log(
      `[POS SIM] ${storeId} | ${sku} | -${quantity}`
    );

    // 🔔 Declanșăm eveniment custom
    document.dispatchEvent(
      new CustomEvent("pos:sale", {
        detail: {
          storeId,
          sku,
          quantity,
          timestamp: new Date().toISOString()
        }
      })
    );
  }

};
