import { NAV_ITEMS } from "@/app/routes";
import { useGameStore } from "@/stores/game-store";
export function BottomNav() { const route = useGameStore((s) => s.route); const navigate = useGameStore((s) => s.navigate); return <nav className="bottom-nav" aria-label="주 메뉴">{NAV_ITEMS.map((item) => <button key={item.id} className={route === item.id ? "active" : ""} onClick={() => navigate(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav>; }
