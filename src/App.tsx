import { useAppStore } from "./store/emomStore";
import { HomeScreen } from "./screens/HomeScreen";
import { EmomSetupScreen } from "./screens/EmomSetupScreen";
import { EmomActiveScreen } from "./screens/EmomActiveScreen";
import { SummaryScreen } from "./screens/SummaryScreen";

export default function App() {
  const screen = useAppStore((s) => s.screen);

  switch (screen) {
    case "home":
      return <HomeScreen />;
    case "emom-setup":
      return <EmomSetupScreen />;
    case "emom-active":
      return <EmomActiveScreen />;
    case "summary":
      return <SummaryScreen />;
  }
}
