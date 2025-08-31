// Import correctly for tronweb v6
const { TronWeb } = require("tronweb");

const PRIVATE_KEY = "d7b286fb391cbe0a38b378190339cffa4e648b34951e695f1541d0f0875341ba";

// Initialize tronWeb with the private key
const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  privateKey: PRIVATE_KEY,
});

(async () => {
  const address = tronWeb.address.fromPrivateKey(PRIVATE_KEY);
  console.log("🚀 Base58 Address:", address);
})();
