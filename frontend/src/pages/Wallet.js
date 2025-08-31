import React, { useEffect, useState } from "react";
import axios from "axios";

const Wallet = () => {
  const [balance, setBalance] = useState({ cashapp: 0, tron: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        const api = axios.create({
          baseURL: "http://localhost:5000/api",
        });
        api.interceptors.request.use((config) => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        });
        const res = await api.get("/transactions/balance");
        setBalance(res.data);
      } catch (err) {
        console.error("Failed to fetch balance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  if (loading) return <div>Loading wallet...</div>;

  return (
    <div className="wallet">
      <h2>Wallet</h2>
      <p>CashApp Balance: ${balance.cashapp}</p>
      <p>TRON Balance: {balance.tron} TRX</p>
    </div>
  );
};

export default Wallet;
