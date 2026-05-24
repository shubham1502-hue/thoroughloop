import { StyleSheet, Text, View } from "react-native";

export default function MemosScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Memos</Text>
      <Text style={styles.body}>Saved mobile memos are coming soon. Web is the production-ready MVP for v1.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: 12, padding: 24 },
  title: { color: "#171717", fontSize: 32, fontWeight: "700" },
  body: { color: "#5f5a52", fontSize: 16, lineHeight: 24 }
});
