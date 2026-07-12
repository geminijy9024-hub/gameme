import { useEffect } from "react";
import { BattleCanvas } from "@/components/BattleCanvas";
import { generateEnemy } from "@/domains/battle/enemy-generator";
import { useGameStore } from "@/stores/game-store";

const NAMES = { balanced: "균형형", tank: "고체력형", striker: "고공격형", swift: "고속형", regenerator: "회복형" } as const;
export function TowerScreen() {
  const state = useGameStore(); const enemy = state.result?.enemy ?? generateEnemy(state.floor); const speed = state.winStreak >= 10 ? 2 : state.winStreak >= 4 ? 1.5 : 1;
  useEffect(() => { if (!state.result && !state.battling) { const id = window.setTimeout(state.startBattle, 250); return () => clearTimeout(id); } }, [state.floor, state.result, state.battling, state.startBattle]);
  const final = state.result?.events.at(-2); const playerHp = final?.playerHp ?? state.player.maxHp; const enemyHp = final?.enemyHp ?? enemy.maxHp; const shield = final?.enemyShield ?? enemy.maxShield;
  return <section className="tower-screen">
    <div className="tower-top"><div><small>CURRENT FLOOR</small><strong>{state.floor.toLocaleString()}<em>F</em></strong></div><div className="streak"><span>🔥</span><small>연승</small><b>{state.winStreak}</b></div></div>
    <div className="enemy-chip"><span className={`enemy-dot ${enemy.archetype}`}/><div><small>{NAMES[enemy.archetype]}</small><b>{enemy.name}</b></div><span className="speed-chip">×{speed}</span></div>
    <div className="battle-stage">{state.result ? <BattleCanvas result={state.result} runId={state.runId} speed={speed} reducedMotion={state.settings.reducedMotion} sound={state.settings.sound} haptics={state.settings.haptics} onComplete={state.finishPlayback}/> : <div className="battle-loading"><i/><span>전투 준비</span></div>}</div>
    <div className="battle-bars"><Bar label="학습자" value={playerHp} max={state.player.maxHp} color="mint"/><Bar label={enemy.name} value={enemyHp} max={enemy.maxHp} color="red"/>{enemy.maxShield > 0 && <Bar label="마법 쉴드" value={shield} max={enemy.maxShield} color="blue"/>}</div>
    {state.result && !state.battling && state.result.winner !== "player" ? <DefeatCard/> : <div className="result-strip"><span className="pulse"/>{state.result ? `${state.result.turns}턴 · 일반 ${state.result.stats.totalPhysicalDamage} · 마법 ${state.result.stats.totalMagicDamage}` : "스탯에 따라 자동으로 전투합니다"}</div>}
  </section>;
}
function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) { const ratio = Math.max(0, Math.min(100, value / max * 100)); return <div className="hud-bar"><div><span>{label}</span><b>{value.toLocaleString()} / {max.toLocaleString()}</b></div><i><u className={color} style={{ width: `${ratio}%` }}/></i></div>; }
function DefeatCard() { const result = useGameStore((s) => s.result)!; const navigate = useGameStore((s) => s.navigate); const a = result.analysis!; return <div className="defeat-card"><div className="defeat-title"><div><small>BATTLE ANALYSIS</small><h2>{result.winner === "draw" ? "전투가 길어졌어요" : "조금 더 성장할 시간"}</h2></div><span>{result.winner === "draw" ? "膠" : "敗"}</span></div><div className="analysis-grid"><Metric n={a.playerAttacks} l="내 공격"/><Metric n={a.enemyAttacks} l="적 공격"/><Metric n={a.totalPhysicalDamage} l="일반 피해"/><Metric n={a.totalMagicDamage} l="마법 피해"/><Metric n={a.totalDamageTaken} l="받은 피해"/><Metric n={a.enemyHealing} l="적 회복"/><Metric n={a.shieldBreakTurn ?? "—"} l="쉴드 파괴 턴"/><Metric n={`${a.remainingEnemyHp}/${a.remainingEnemyShield}`} l="남은 체력/쉴드"/></div><p className="first-info">{a.playerWentFirst ? "✓ 플레이어가 선공했습니다" : "! 적이 먼저 공격했습니다"}</p><div className="suggestions">{a.suggestions.map((s) => <p key={s}>{s}</p>)}</div><button className="primary" onClick={() => navigate("study")}>학습하고 다시 도전 →</button></div>; }
function Metric({ n, l }: { n: string | number; l: string }) { return <div><b>{n}</b><small>{l}</small></div>; }
