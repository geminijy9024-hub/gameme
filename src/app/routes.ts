import type { Route } from "@/stores/game-store";
export const NAV_ITEMS: ReadonlyArray<{ id: Route; label: string; icon: string }> = [
  { id: "tower", label: "탑", icon: "塔" }, { id: "study", label: "학습", icon: "学" }, { id: "growth", label: "성장", icon: "成" }, { id: "settings", label: "설정", icon: "⚙" }
];
