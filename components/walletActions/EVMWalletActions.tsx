import { Button } from "../ui/Button";
import { useState } from "react";
import { View, Text } from "react-native";
import { useTheme } from "@react-navigation/native";
import { Layout } from "@/constants/Colors";

export default function EVMWalletActions({ wallet }: { wallet: any }) {
  const theme = useTheme();
  const [result, setResult] = useState<string | null>(null);

  const signMessage = async () => {
    const provider = await wallet?.getProvider?.();
    if (!provider) return;

    const message = "Hello World";
    try {
      const signature = await provider.request({
        method: "personal_sign",
        params: [message, wallet?.address],
      });
      setResult(signature);
    } catch (e: any) {
      setResult(e.message ?? String(e));
    }
  };
  const signTransaction = async () => {
    const provider = await wallet?.getProvider?.();
    if (!provider) return;

    // Sign transaction (will be signed and populated)
    try {
      const { signature } = await provider.request({
        method: "eth_signTransaction",
        params: [
          {
            from: wallet.address,
            to: "0x0000000000000000000000000000000000000000",
            value: "1",
          },
        ],
      });
      setResult(signature);
    } catch (error: any) {
      setResult(error.message || JSON.stringify(error));
    }
  };
  const signAndSendTransaction = async () => {
    const provider = await wallet?.getProvider?.();
    if (!provider) return;
    try {
      const response = await provider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet.address,
            to: "0x0000000000000000000000000000000000000000",
            value: "1",
          },
        ],
      });
      setResult(JSON.stringify(response));
    } catch (error: any) {
      setResult(error.message || JSON.stringify(error));
    }
  };
  return (
    <View style={{ gap: Layout.gap }}>
      {/* <Text style={{ color: theme.colors.text, fontWeight: "bold" }}>EVM Wallet Actions</Text> */}
      <Button title="Sign Message" onPress={signMessage} variant="secondary" />
      <Button title="Sign Transaction" onPress={signTransaction} variant="secondary" />
      <Button
        title="Sign & Send Transaction"
        onPress={signAndSendTransaction}
        variant="primary"
      />
      {result && (
        <View style={{ marginTop: 10, padding: 10, backgroundColor: theme.colors.card, borderRadius: 8 }}>
          <Text style={{ color: theme.colors.text, fontSize: 12 }}>Result:</Text>
          <Text style={{ color: theme.colors.text, fontFamily: 'Courier' }}>{result}</Text>
        </View>
      )}
    </View>
  );
}
