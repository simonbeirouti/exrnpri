import React, { useState, useCallback } from "react";
import { Text, TextInput, View, Button } from "react-native";
import { useTheme } from "@react-navigation/native";
import {
  usePrivy,
  useEmbeddedEthereumWallet,
  getUserEmbeddedEthereumWallet,
  PrivyEmbeddedWalletProvider,
} from "@privy-io/expo";
import { ScreenScrollView } from "./layout/ScreenScrollView";
import SolanaWalletActions from "./walletActions/SolanaWalletActions";
import EVMWalletActions from "./walletActions/EVMWalletActions";

export const UserScreen = () => {
  const [chainId, setChainId] = useState("1");
  const theme = useTheme();

  const { user } = usePrivy();
  const { wallets } = useEmbeddedEthereumWallet();
  const account = getUserEmbeddedEthereumWallet(user);

  const switchChain = useCallback(
    async (provider: PrivyEmbeddedWalletProvider, id: string) => {
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: id }],
        });
        alert(`Chain switched to ${id} successfully`);
      } catch (e) {
        console.error(e);
      }
    },
    [account?.address]
  );

  return (
    <ScreenScrollView>
      <View
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >

        <SolanaWalletActions />
        <EVMWalletActions />

        <View>
          {account?.address && (
            <>
              <Text style={{ fontWeight: "bold", color: theme.colors.text }}>Embedded Wallet</Text>
              <Text style={{ color: theme.colors.text }}>{account?.address}</Text>
            </>
          )}

          <>
            <Text style={{ color: theme.colors.text }}>Chain ID to set to:</Text>
            <TextInput
              value={chainId}
              onChangeText={setChainId}
              placeholder="Chain Id"
              placeholderTextColor={theme.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              style={{
                color: theme.colors.text,
                borderColor: theme.colors.border,
                borderWidth: 1,
                padding: 8,
                borderRadius: 4,
              }}
            />
            <Button
              title="Switch Chain"
              onPress={async () =>
                switchChain(await wallets[0].getProvider(), chainId)
              }
            />
          </>
        </View>

      </View>
    </ScreenScrollView>
  );
};
