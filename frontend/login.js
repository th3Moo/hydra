async function loginUser(username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      console.log("✅ Login successful:", data);
      localStorage.setItem("token", data.token);
      alert("Login successful! Welcome " + data.username);
    } else {
      alert("❌ Login failed: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    alert("Login error, check console");
  }
}
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  loginUser(
    document.getElementById("username").value,
    document.getElementById("password").value
  );
});
