import { UserScreen } from "@/components/UserScreen";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <UserScreen />
    </SafeAreaView>
  );
}
