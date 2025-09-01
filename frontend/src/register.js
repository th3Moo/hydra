async function registerUser(username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      console.log("✅ Registration successful:", data);
      alert("Account created! Please log in.");
      window.location.href = "index.html";
    } else {
      alert("❌ Registration failed: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("❌ Registration error:", err);
    alert("Registration error, check console");
  }
}
document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  registerUser(
    document.getElementById("username").value,
    document.getElementById("password").value
  );
});
