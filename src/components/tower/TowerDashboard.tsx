"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { generateEnemy } from "@/src/domains/battle/enemy-generator";
import { useGameStore } from "@/src/stores/game-store";
import { BattleCanvas } from "./BattleCanvas";

const STAT_FIELDS = [
  { key: "attack", label: "언어지식", stat: "일반 공격력", kanji: "言" },
  { key: "maxHp", label: "독해", stat: "최대 체력", kanji: "読" },
  { key: "speed", label: "청해", stat: "속도 · 선공", kanji: "聴" },
  { key: "magicDamage", label: "회화", stat: "마법 피해", kanji: "話" },
] as const;

export function TowerDashboard() {
  const { player, floor, highestFloor, result, running, runId, updatePlayer, setFloor, startBattle, advanceFloor, retry, resetProgress } = useGameStore();
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const enemy = useMemo(() => generateEnemy(floor), [floor]);

  useEffect(() => {
    if (!hydrated || result || running) return;
    const timer = window.setTimeout(startBattle, 350);
    return () => window.clearTimeout(timer);
  }, [floor, hydrated, result, running, startBattle]);
  useEffect(() => {
    if (result?.winner !== "player") return;
    const duration = Math.min(7800, 800 + result.events.length * 340);
    const timer = window.setTimeout(advanceFloor, duration);
    return () => window.clearTimeout(timer);
  }, [result, advanceFloor]);

  if (!hydrated) return <main className="grid min-h-screen place-items-center bg-[#090d12] text-[#d9c78f]">탑을 불러오는 중…</main>;

  return (
    <main className="min-h-screen bg-[#090d12] text-[#e8e2d2]">
      <header className="border-b border-white/8 bg-[#0c1118]/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-[#d4a855]/35 bg-[#d4a855]/10 font-serif text-xl text-[#d4a855]">語</div>
            <div><h1 className="font-serif text-xl tracking-[0.08em]">言ノ葉の塔</h1><p className="text-[11px] uppercase tracking-[0.24em] text-[#737e8b]">Kotoba Infinite Tower</p></div>
          </div>
          <div className="text-right"><p className="text-xs text-[#737e8b]">최고 기록</p><p className="font-mono text-lg text-[#d4a855]">{highestFloor.toLocaleString()} F</p></div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1480px] gap-4 p-4 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="panel order-2 p-4 xl:order-1">
          <SectionTitle eyebrow="LEARNING STATS" title="학습 능력" />
          <div className="mt-4 space-y-3">
            {STAT_FIELDS.map(({ key, label, stat, kanji }) => (
              <label key={key} className="block rounded-xl border border-white/7 bg-white/[0.025] p-3">
                <span className="flex items-center justify-between"><span className="flex items-center gap-2"><b className="text-[#d4a855]">{kanji}</b><span>{label}</span></span><span className="font-mono text-lg">{player[key]}</span></span>
                <span className="mt-1 block text-[11px] text-[#737e8b]">{stat}</span>
                <input className="mt-2 w-full accent-[#d4a855]" type="range" min="1" max="20000" value={player[key]} onChange={(event) => updatePlayer({ [key]: Number(event.target.value) })} />
              </label>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-dashed border-[#d4a855]/25 p-3">
            <p className="text-xs font-semibold text-[#d4a855]">디버그 제어</p>
            <label className="mt-3 block text-xs text-[#89939f]">시작 층</label>
            <input className="input mt-1" type="number" min="1" value={floor} onChange={(event) => setFloor(Number(event.target.value))} />
            <button className="button-secondary mt-3 w-full" onClick={resetProgress}>초기화</button>
          </div>
        </aside>

        <section className="order-1 min-w-0 xl:order-2">
          <div className="panel overflow-hidden p-3 sm:p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div><p className="text-xs tracking-[0.24em] text-[#737e8b]">CURRENT FLOOR</p><h2 className="font-serif text-3xl text-[#f0e4bd]">{floor.toLocaleString()}층</h2></div>
              <div className="text-right"><p className="text-sm text-[#a7b0ba]">{enemy.name}</p><p className="text-xs text-[#737e8b]">{enemy.archetype} · 속도 {enemy.speed}</p></div>
            </div>
            {result ? <BattleCanvas result={result} runId={runId} /> : <div className="grid aspect-[16/9] place-items-center rounded-2xl bg-[#0d1117] text-sm text-[#737e8b]">전투 준비 중…</div>}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="내 체력" value={result ? `${result.finalPlayerHp} / ${player.maxHp}` : player.maxHp.toString()} />
              <Metric label="적 체력" value={result ? `${result.finalEnemyHp} / ${result.enemy.maxHp}` : enemy.maxHp.toString()} />
              <Metric label="마법 쉴드" value={(result?.finalEnemyShield ?? enemy.maxShield).toString()} accent={enemy.maxShield > 0} />
              <Metric label="결과" value={result ? result.winner === "player" ? "승리" : result.winner === "enemy" ? "패배" : "턴 제한" : "진행 중"} />
            </div>
            {result?.winner !== "player" && result && <button className="button-primary mt-4 w-full" onClick={retry}>현재 스탯으로 다시 도전</button>}
          </div>
        </section>

        <aside className="panel order-3 p-4">
          <SectionTitle eyebrow="BATTLE RECORD" title="전투 기록" />
          <div className="scrollbar mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
            {(result?.events ?? []).slice().reverse().map((event, index) => (
              <div key={`${event.turn}-${event.type}-${index}`} className="flex gap-3 border-b border-white/5 pb-2 text-xs">
                <span className="w-8 shrink-0 font-mono text-[#596471]">T{event.turn}</span><span className={event.actor === "player" ? "text-[#d9c78f]" : event.actor === "enemy" ? "text-[#d47a75]" : "text-[#7e8995]"}>{event.message}</span>
              </div>
            ))}
          </div>
          {result?.analysis && <div className="mt-5 border-t border-white/8 pt-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#d47a75]">패배 분석</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Metric label="내 공격" value={`${result.analysis.playerAttacks}회`} />
              <Metric label="적 공격" value={`${result.analysis.enemyAttacks}회`} />
              <Metric label="일반 피해" value={result.analysis.totalPhysicalDamage.toString()} />
              <Metric label="마법 피해" value={result.analysis.totalMagicDamage.toString()} />
              <Metric label="받은 피해" value={result.analysis.totalDamageTaken.toString()} />
              <Metric label="적 회복" value={result.analysis.enemyHealing.toString()} />
            </div>
            <ul className="mt-4 space-y-2">{result.analysis.suggestions.map((suggestion) => <li key={suggestion} className="rounded-lg bg-[#d4a855]/7 p-3 text-xs leading-5 text-[#b7b0a0]">{suggestion}</li>)}</ul>
          </div>}
          {!result?.analysis && <div className="mt-6 rounded-xl border border-white/7 bg-white/[0.025] p-4 text-xs leading-6 text-[#7e8995]">패배하면 선공, 피해, 회복, 남은 체력과 쉴드를 분석해 여러 학습 성장 경로를 제안합니다.</div>}
        </aside>
      </div>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="text-[10px] tracking-[0.2em] text-[#596471]">{eyebrow}</p><h2 className="mt-1 font-serif text-lg text-[#e8d9a7]">{title}</h2></div>;
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return <div className="rounded-lg bg-white/[0.035] px-3 py-2"><p className="text-[10px] text-[#687380]">{label}</p><p className={`mt-0.5 truncate font-mono text-sm ${accent ? "text-[#6ec4f1]" : "text-[#ddd5c3]"}`}>{value}</p></div>;
}
