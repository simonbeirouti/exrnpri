import React, { useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import {
  usePrivy,
  useEmbeddedEthereumWallet,
  useEmbeddedSolanaWallet,
} from "@privy-io/expo";
import { ScreenScrollView } from "./layout/ScreenScrollView";
import SolanaWalletActions from "./walletActions/SolanaWalletActions";
import EVMWalletActions from "./walletActions/EVMWalletActions";

import { Button } from "./ui/Button";
import { Dropdown } from "./ui/Dropdown";
import { ChainSelector } from "./walletActions/ChainSelector";
import { Layout } from "@/constants/Colors";
import { useWallet } from "@/context/WalletContext";

export const UserScreen = () => {
  const theme = useTheme();

  const { user } = usePrivy();

  // Use global wallet context
  const {
    selectedChain,
    setSelectedChain,
    selectedWalletIndex,
    setSelectedWalletIndex,
    activeWallets,
    currentWallet,
  } = useWallet();

  // Helper to format address
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const walletOptions = activeWallets?.map((w, index) => {
    const address = (w as any).address || (w as any).publicKey;
    return {
      label: `Wallet ${index + 1} (${formatAddress(address)})`,
      value: index,
    };
  }) || [];

  return (
    <ScreenScrollView>
      <View
        style={{
          padding: Layout.padding,
          display: "flex",
          flexDirection: "column",
          gap: Layout.gap,
        }}
      >
        <ChainSelector
          selectedChain={selectedChain}
          onSelectChain={setSelectedChain}
        />

        {activeWallets && activeWallets.length > 0 ? (
          <View>
            <Text style={{ color: theme.colors.text, marginBottom: 8, fontWeight: '600' }}>Select Wallet</Text>
            <Dropdown
              options={walletOptions}
              selectedValue={selectedWalletIndex}
              onSelect={setSelectedWalletIndex}
              disabled={activeWallets.length <= 1}
            />
          </View>
        ) : (
          <Text style={{ color: theme.colors.text, fontStyle: 'italic', opacity: 0.7 }}>
            No active wallets for {selectedChain}
          </Text>
        )}

        {/* Actions Area */}
        <View style={{ gap: Layout.gap }}>
          {selectedChain === "solana" && currentWallet && (
            <SolanaWalletActions wallet={currentWallet} />
          )}

          {selectedChain === "ethereum" && currentWallet && (
            <EVMWalletActions wallet={currentWallet} />
          )}
        </View>
      </View>
    </ScreenScrollView>
  );
};

