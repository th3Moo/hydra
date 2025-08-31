const { TronWeb } = require('tronweb');

// create instance (no private key yet, just connecting to mainnet)
const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io"
});

(async () => {
  try {
    const account = await tronWeb.createAccount();
    console.log("Address:", account.address.base58);
    console.log("Private Key:", account.privateKey);
  } catch (err) {
    console.error("❌ Error creating account:", err);
  }
})();
