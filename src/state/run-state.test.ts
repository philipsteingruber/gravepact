import { initialRunState } from "./run-state";

describe("runState", () => {
  it("starts the deck with 10 cards", () => {
    const state = { ...initialRunState };

    expect(state.deck.length).toBe(10);
  });

  it("starts the deck with 6 Strike cards", () => {
    const state = { ...initialRunState };

    expect(state.deck.filter((card) => card.id === "strike").length).toBe(6);
  });

  it("starts the deck with 4 Fortify cards", () => {
    const state = { ...initialRunState };

    expect(state.deck.filter((card) => card.id === "fortify").length).toBe(4);
  });
});
