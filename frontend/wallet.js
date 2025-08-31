function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + localStorage.getItem("token")
  };
}
async function getWallets() {
  const res = await fetch(`${API_BASE}/api/wallets`, { method: "GET", headers: getAuthHeaders() });
  return res.json();
}
async function deposit(amount) {
  const res = await fetch(`${API_BASE}/api/tx/deposit`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify({ amount }) });
  return res.json();
}
async function withdraw(amount) {
  const res = await fetch(`${API_BASE}/api/tx/withdraw`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify({ amount }) });
  return res.json();
}
async function exchange(fromCurrency, toCurrency, amount) {
  const res = await fetch(`${API_BASE}/api/tx/exchange`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify({ fromCurrency, toCurrency, amount }) });
  return res.json();
}
