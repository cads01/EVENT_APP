const WALLET_KEY = "eventapp_offline_wallet";

export function cacheTicket(ticket) {
  try {
    const wallet = JSON.parse(localStorage.getItem(WALLET_KEY) || "[]");
    const existing = wallet.findIndex(t => t._id === ticket._id);
    if (existing > -1) wallet[existing] = ticket;
    else wallet.push(ticket);
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
    return true;
  } catch { return false; }
}

export function getCachedTickets() {
  try {
    return JSON.parse(localStorage.getItem(WALLET_KEY) || "[]");
  } catch { return []; }
}

export function getCachedTicket(ticketId) {
  return getCachedTickets().find(t => t._id === ticketId) || null;
}

export function removeCachedTicket(ticketId) {
  const wallet = getCachedTickets().filter(t => t._id !== ticketId);
  localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
}

export function clearWallet() {
  localStorage.removeItem(WALLET_KEY);
}

export function isOnline() {
  return navigator.onLine;
}

export function cacheEventData(eventId, data) {
  try {
    localStorage.setItem(`eventapp_event_${eventId}`, JSON.stringify(data));
  } catch {}
}

export function getCachedEventData(eventId) {
  try {
    return JSON.parse(localStorage.getItem(`eventapp_event_${eventId}`));
  } catch { return null; }
}
