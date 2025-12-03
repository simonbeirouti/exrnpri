import Constants from "expo-constants";
import { useState } from "react";
import { useTheme } from "@react-navigation/native";

import { View, Text, Button, TextInput } from "react-native";
import { useLinkWithPasskey } from "@privy-io/expo/passkey";
import {
  useLinkWithOAuth,
  useLinkEmail,
  useLinkSMS,
  useLinkWithFarcaster,
} from "@privy-io/expo";
export default function LinkAccounts() {
  const theme = useTheme();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const { linkWithFarcaster } = useLinkWithFarcaster({
    onSuccess: () => {
      console.log("Link Farcaster success");
    },
    onError: (err) => {
      console.log(err);
      setError(JSON.stringify(err.message));
    },
  });
  const { sendCode: sendCodeEmail, linkWithCode: linkWithCodeEmail } =
    useLinkEmail({
      onError: (err) => {
        console.log(err);
        setError(JSON.stringify(err.message));
      },
      onLinkSuccess: () => {
        console.log("Link Email success");
      },
      onSendCodeSuccess: () => {
        console.log("Link Email success");
      },
    });
  const { sendCode: sendCodeSMS, linkWithCode: linkWithCodeSMS } = useLinkSMS({
    onError: (err) => {
      console.log(err);
      setError(JSON.stringify(err.message));
    },
    onLinkSuccess: () => {
      console.log("Link SMS success");
    },
    onSendCodeSuccess: () => {
      console.log("Link SMS success");
    },
  });

  const { linkWithPasskey } = useLinkWithPasskey({
    onError: (err) => {
      console.log(err);
      setError(JSON.stringify(err.message));
    },
  });
  const oauth = useLinkWithOAuth({
    onError: (err) => {
      console.log(err);
      setError(JSON.stringify(err.message));
    },
  });
  return (
    <View>
      {/* Links Accounts */}
      <Text style={{ color: theme.colors.text, fontWeight: "bold", fontSize: 16 }}>Link Accounts</Text>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          margin: 10,
          flexWrap: "wrap",
        }}
      >
        {(
          [
            "github",
            "google",
            "discord",
            "apple",
            "twitter",
            "spotify",
            "instagram",
            "tiktok",
            "linkedin",
            "line",
          ] as const
        ).map((provider) => (
          <View key={provider}>
            <Button
              title={`Link ${provider}`}
              disabled={oauth.state.status === "loading"}
              onPress={() => oauth.link({ provider })}
            ></Button>
          </View>
        ))}
      </View>
      <Button
        title="Link Passkey"
        onPress={() =>
          linkWithPasskey({
            relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
          })
        }
      />
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          borderColor: theme.colors.border,
          borderWidth: 1,
          padding: 10,
        }}
      >
        <Text style={{ color: theme.colors.text }}>Link Email</Text>
        <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={theme.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 10,
              margin: 10,
              color: theme.colors.text,
            }}
          />
          <Button title="Get Code" onPress={() => sendCodeEmail({ email })} />
        </View>
        <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          <TextInput
            value={emailCode}
            onChangeText={setEmailCode}
            placeholder="Code"
            inputMode="numeric"
            placeholderTextColor={theme.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 10,
              margin: 10,
              color: theme.colors.text,
            }}
          />
          <Button
            title="Link email"
            onPress={() => linkWithCodeEmail({ code: emailCode, email })}
          />
        </View>
      </View>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          borderColor: theme.colors.border,
          borderWidth: 1,
          padding: 10,
        }}
      >
        <Text style={{ color: theme.colors.text }}>Link SMS</Text>
        <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone"
            placeholderTextColor={theme.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 10,
              margin: 10,
              color: theme.colors.text,
            }}
          />
          <Button title="Link SMS" onPress={() => sendCodeSMS({ phone })} />
        </View>
        <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          <TextInput
            value={smsCode}
            onChangeText={setSmsCode}
            placeholder="Code"
            inputMode="numeric"
            placeholderTextColor={theme.dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
            style={{
              borderWidth: 1,
              borderColor: theme.colors.border,
              padding: 10,
              margin: 10,
              color: theme.colors.text,
            }}
          />
          <Button
            title="Link Code"
            onPress={() => linkWithCodeSMS({ code: smsCode, phone })}
          />
        </View>
      </View>
      <Button title="Link Farcaster" onPress={() => linkWithFarcaster({})} />
      {error && <Text style={{ color: "red" }}>Error: {error}</Text>}
    </View>
  );
}
