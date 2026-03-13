import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { connect, disconnect, isConnected, request } from "@stacks/connect";
import { WalletState } from "@/types/campaign";
import { fetchStxBalance, ustxToStx, NETWORK } from "@/lib/stacks";

interface WalletContextType {
  wallet: WalletState;
  connectWallet: (provider?: "hiro" | "xverse") => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_SESSION_KEY = "sbtcfund-wallet-session";

function saveSession(address: string) {
  localStorage.setItem(WALLET_SESSION_KEY, address);
}
function clearSession() {
  localStorage.removeItem(WALLET_SESSION_KEY);
}
function getSavedSession(): string | null {
  return localStorage.getItem(WALLET_SESSION_KEY);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    balance: 0,
    network: NETWORK,
  });

  const updateBalance = useCallback(async (address: string) => {
    try {
      const balanceUstx = await fetchStxBalance(address);
      setWallet((prev) => ({ ...prev, balance: ustxToStx(balanceUstx) }));
    } catch {
      // silent — balance stays at 0
    }
  }, []);

  // Auto-reconnect from saved session
  useEffect(() => {
    const saved = getSavedSession();
    if (saved && isConnected()) {
      setWallet({
        connected: true,
        address: saved,
        balance: 0,
        network: NETWORK,
      });
      updateBalance(saved);
    }
  }, [updateBalance]);

  const connectWallet = useCallback(async () => {
    try {
      const response = await connect();
      // response.addresses: [0]=btc-mainnet, [1]=btc-testnet, [2]=stx
      const stxAddress = response.addresses.find(
        (a) => a.symbol === "STX"
      )?.address ?? response.addresses[2]?.address;

      if (!stxAddress) throw new Error("No STX address found");

      saveSession(stxAddress);
      setWallet({
        connected: true,
        address: stxAddress,
        balance: 0,
        network: NETWORK,
      });
      await updateBalance(stxAddress);
    } catch (err) {
      console.error("Wallet connect failed:", err);
      throw err;
    }
  }, [updateBalance]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    clearSession();
    setWallet({ connected: false, address: null, balance: 0, network: NETWORK });
  }, []);

  const refreshBalance = useCallback(async () => {
    if (wallet.address) {
      await updateBalance(wallet.address);
    }
  }, [wallet.address, updateBalance]);

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

// Re-export request for use in transaction components
export { request };

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
}
