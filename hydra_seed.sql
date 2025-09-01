-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert demo user
INSERT INTO users (username, password_hash, email, role)
VALUES (
  'demo',
  crypt('password123', gen_salt('bf')),
  'demo@hydra.test',
  'user'
)
RETURNING id;

-- Insert demo wallets for user ID 1
INSERT INTO wallets (user_id, asset, address, balance)
VALUES (1, 'USDT', 'TUxxxxxxYourTRC20Wallet', 50.00);

INSERT INTO wallets (user_id, asset, address, balance)
VALUES (1, 'BTC', 'bc1qxxxxxxYourBTCWallet', 0.005);

-- Insert sample transactions for user ID 1
INSERT INTO transactions (user_id, type, asset, amount, tx_hash, status)
VALUES (1, 'deposit', 'USDT', 25.00, '0xtestdeposit123', 'confirmed');

INSERT INTO transactions (user_id, type, asset, amount, tx_hash, status)
VALUES (1, 'withdraw', 'BTC', 0.002, '0xtestwithdraw456', 'pending');

-- Insert demo admin
INSERT INTO admins (username, password_hash)
VALUES (
  'hydraadmin',
  crypt('supersecret', gen_salt('bf'))
);
