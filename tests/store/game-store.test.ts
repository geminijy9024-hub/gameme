import { afterEach, describe, expect, it } from "vitest";
import { useGameStore } from "../../src/stores/game-store";

describe("start flow", () => {
  afterEach(() => useGameStore.setState({ started: false, route: "tower" }));

  it("탑에 오르기 동작이 시작 화면을 종료하고 탑으로 이동한다", () => {
    useGameStore.setState({ started: false, route: "settings" });
    useGameStore.getState().begin();
    expect(useGameStore.getState().started).toBe(true);
    expect(useGameStore.getState().route).toBe("tower");
  });
});
