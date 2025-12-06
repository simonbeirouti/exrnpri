import { useState, useCallback } from "react";
import { View, Text, TextInput } from "react-native";
import { useTheme } from "@react-navigation/native";
import { PrivyEmbeddedWalletProvider } from "@privy-io/expo";
import { Button } from "../ui/Button";

interface ChainSwitcherProps {
    wallet: any;
}

export default function ChainSwitcher({ wallet }: ChainSwitcherProps) {
    const theme = useTheme();
    const [chainId, setChainId] = useState("1");

    const switchChain = useCallback(
        async (provider: PrivyEmbeddedWalletProvider, id: string) => {
            try {
                await provider.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: id }],
                });
                alert(`Chain switched to ${id} successfully`);
            } catch (e: any) {
                console.error(e);
                alert(`Error switching chain: ${e.message}`);
            }
        },
        []
    );

    return (
        <View style={{ marginTop: 10, padding: 16, backgroundColor: theme.colors.card, borderRadius: 12, gap: 12 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Network Settings</Text>

            <View style={{ gap: 8 }}>
                <Text style={{ color: theme.colors.text, fontSize: 14 }}>Chain ID</Text>
                <TextInput
                    value={chainId}
                    onChangeText={setChainId}
                    placeholder="e.g. 1 (Mainnet), 8453 (Base)"
                    placeholderTextColor={theme.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
                    style={{
                        color: theme.colors.text,
                        borderColor: theme.colors.border,
                        borderWidth: 1,
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: theme.colors.background,
                    }}
                    keyboardType="numeric"
                />
            </View>

            <Button
                title="Switch Chain"
                variant="outline"
                onPress={async () => {
                    const provider = await wallet?.getProvider?.();
                    if (provider) {
                        switchChain(provider, chainId);
                    }
                }}
            />
        </View>
    );
}
