import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#fbfaf7" },
        headerTintColor: "#171717",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#fbfaf7" }
      }}
    />
  );
}
