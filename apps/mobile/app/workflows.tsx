import { ScrollView, StyleSheet, Text, View } from "react-native";
import { WORKFLOWS } from "@thoroughloop/core";

export default function WorkflowsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>Workflows</Text>
      {WORKFLOWS.map((workflow) => (
        <View key={workflow.id} style={styles.card}>
          <Text style={styles.cardTitle}>{workflow.name}</Text>
          <Text style={styles.body}>{workflow.problemItSolves}</Text>
          <Text style={styles.meta}>{workflow.estimatedTime}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { gap: 14, padding: 24 },
  title: { color: "#171717", fontSize: 32, fontWeight: "700" },
  card: { backgroundColor: "#ffffff", borderColor: "#ded8cc", borderRadius: 8, borderWidth: 1, gap: 8, padding: 16 },
  cardTitle: { color: "#171717", fontSize: 20, fontWeight: "700" },
  body: { color: "#5f5a52", fontSize: 15, lineHeight: 22 },
  meta: { color: "#2f4f46", fontSize: 13, fontWeight: "700" }
});
