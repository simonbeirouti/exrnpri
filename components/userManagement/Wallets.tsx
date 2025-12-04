import {
  useEmbeddedEthereumWallet,
  useEmbeddedSolanaWallet,
  usePrivy,
} from "@privy-io/expo";
import { useCreateWallet } from "@privy-io/expo/extended-chains";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";

export default function Wallets() {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const { user } = usePrivy();
  const { create: createEthereumWallet } = useEmbeddedEthereumWallet();
  const { create: createSolanaWallet } = useEmbeddedSolanaWallet();
  const { createWallet } = useCreateWallet();
  const wallets = user?.linked_accounts.filter(
    (account) => account.type === "wallet",
  );

  type ExtendedChainType =
    | "bitcoin-segwit"
    | "stellar"
    | "cosmos"
    | "near"
  // | "sui"
  // | "tron"
  // | "ton"
  // | "spark";
  type chainTypes = "ethereum" | "solana" | ExtendedChainType;

  const ALL_CHAIN_TYPES: chainTypes[] = [
    "ethereum",
    "solana",
    "bitcoin-segwit",
    "stellar",
    "cosmos",
    "near",
    // "sui",
    // "tron",
    // "ton",
    // "spark",
  ];

  const createWallets = (chainType: chainTypes) => {
    switch (chainType) {
      case "ethereum":
        return createEthereumWallet({ createAdditional: true });
      case "solana":
        return createSolanaWallet?.({
          createAdditional: true,
          recoveryMethod: "privy",
        });

      default:
        return createWallet({
          chainType: chainType as ExtendedChainType,
        }).catch((err: any) => {
          console.log(err);
          setError(err?.message ? String(err.message) : String(err));
        });
    }
  };
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >

      {ALL_CHAIN_TYPES.map((chainType) => {
        const chainWallets = wallets?.filter((w) => w.chain_type === chainType) || [];
        return (
          <View key={chainType} style={{ gap: 5 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 5,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {chainType}
              </Text>
              <TouchableOpacity onPress={() => createWallets(chainType)}>
                <Ionicons name="add" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            {chainWallets.length > 0 ? (
              chainWallets.map((wallet, index) => (
                <Text
                  key={`${chainType}-wallet-${index}`}
                  style={{ color: theme.colors.text, paddingLeft: 10, fontSize: 12 }}
                >
                  {wallet.address}
                </Text>
              ))
            ) : (
              <Text style={{ color: theme.colors.text, opacity: 0.5, paddingLeft: 10, fontSize: 12 }}>
                No wallets
              </Text>
            )}
          </View>
        );
      })}
      {error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  );
}
