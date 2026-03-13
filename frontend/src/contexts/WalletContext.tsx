import React, { createContext, useContext, useState, useCallback } from "react";
import { WalletState } from "@/types/campaign";

interface WalletContextType {
  wallet: WalletState;
  connectWallet: (provider: "hiro" | "xverse") => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const MOCK_ADDRESS = "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7";
const MOCK_BALANCE = 12450;

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0,
    network: "testnet",
  });

  const connectWallet = useCallback((_provider: "hiro" | "xverse") => {
    setWallet({
      connected: true,
      address: MOCK_ADDRESS,
      balance: MOCK_BALANCE,
      network: "testnet",
    });
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({ connected: false, address: null, balance: 0, network: "testnet" });
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
}
