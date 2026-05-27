import { createMockSkillCard } from "@/lib/test-helpers";
import { store } from "../store";
import { drawCards } from "./deck";

describe("deckActions", () => {
  it("moves cards from deck to hand", () => {
    const mockCard = createMockSkillCard();

    const state = { ...store.gameState, run: { ...store.gameState.run, deck: [mockCard, mockCard, mockCard] } };
    const result = drawCards(state, 1);

    expect(result.run.hand.length).toBe(1);
    expect(result.run.deck.length).toBe(2);
  });

  it("handles draw count greater than deck size", () => {
    const mockCard = createMockSkillCard();

    const state = { ...store.gameState, run: { ...store.gameState.run, deck: [mockCard] } };
    const result = drawCards(state, 2);

    expect(result.run.hand.length).toBe(1);
    expect(result.run.deck.length).toBe(0);
  });

  it("leaves state unchanged when drawing from an empty deck", () => {
    const state = { ...store.gameState, run: { ...store.gameState.run, deck: [] } };
    const result = drawCards(state, 1);

    expect(result.run.hand.length).toBe(0);
    expect(result.run.deck.length).toBe(0);
  });

  it("leaves state unchanged when drawing 0 cards", () => {
    const mockCard = createMockSkillCard();

    const state = { ...store.gameState, run: { ...store.gameState.run, deck: [mockCard] } };
    const result = drawCards(state, 0);

    expect(result.run.hand.length).toBe(0);
    expect(result.run.deck.length).toBe(1);
  });
});
