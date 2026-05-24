import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { createDiagnosis, generateFounderMemo } from "@thoroughloop/core";

const sampleContext =
  "FinCore Labs has been stuck in negotiation for 21 days after raising a pricing concern. BrightLayer AI has not replied after proposal for 12 days.";

export default function HomeScreen() {
  const diagnosis = createDiagnosis(sampleContext);
  const memo = generateFounderMemo(diagnosis);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.kicker}>ThoroughLoop mobile</Text>
      <Text style={styles.title}>Paste messy founder context. Close the loop.</Text>
      <Text style={styles.body}>
        Mobile support is coming soon. This skeleton already reuses the shared core diagnosis and memo logic.
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>Sample diagnosis</Text>
        <Text style={styles.cardTitle}>{diagnosis.workflow.name}</Text>
        <Text style={styles.body}>{memo.founderAction}</Text>
      </View>
      <View style={styles.links}>
        <MobileLink href="/workflows" label="Workflows" />
        <MobileLink href="/memos" label="Memos" />
        <MobileLink href="/action-queue" label="Founder Action Queue" />
        <MobileLink href="/decision-log" label="Decision Log" />
        <MobileLink href="/settings" label="Settings" />
      </View>
    </ScrollView>
  );
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  page: {
    gap: 18,
    padding: 24
  },
  kicker: {
    color: "#5f5a52",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  title: {
    color: "#171717",
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 40
  },
  body: {
    color: "#5f5a52",
    fontSize: 16,
    lineHeight: 24
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#ded8cc",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16
  },
  label: {
    color: "#5f5a52",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  cardTitle: {
    color: "#171717",
    fontSize: 22,
    fontWeight: "700"
  },
  links: {
    gap: 10
  },
  button: {
    backgroundColor: "#2f4f46",
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700"
  }
});
