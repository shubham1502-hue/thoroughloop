import { StyleSheet, Text, View } from "react-native";

export default function DecisionLogScreen() {
  return (
    <View style={styles.page}>
      <Text style={styles.title}>Decision Log</Text>
      <Text style={styles.body}>Mobile decision review is coming soon. The web app records decisions in v1.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: 12, padding: 24 },
  title: { color: "#171717", fontSize: 32, fontWeight: "700" },
  body: { color: "#5f5a52", fontSize: 16, lineHeight: 24 }
});
