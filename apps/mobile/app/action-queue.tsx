import { StyleSheet, Text, View } from "react-native";

export default function ActionQueueScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Founder Action Queue</Text>
      <Text style={styles.body}>Mobile action updates are coming soon. Shared core logic is ready for reuse.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: 12, padding: 24 },
  title: { color: "#171717", fontSize: 32, fontWeight: "700" },
  body: { color: "#5f5a52", fontSize: 16, lineHeight: 24 }
});
