import { View } from "react-native";
import { useTheme } from "@react-navigation/native";
import PrivyUI from "./login/PrivyUI";
// import Constants from "expo-constants";
// import * as Application from "expo-application";
// import OAuth from "./login/OAuth";
// import PasskeyLogin from "./login/PasskeyLogin";
// import SMSLogin from "./login/SMS";

export default function LoginScreen() {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        backgroundColor: theme.colors.background,
      }}
    >
      <PrivyUI />
      {/* <SMSLogin /> */}
      {/* <PasskeyLogin /> */}
      {/* <OAuth /> */}
    </View>
  );
}
