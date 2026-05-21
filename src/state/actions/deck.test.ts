import type { Card } from "@/lib/types";
import { gameState } from "..";
import { drawCards } from "./deck";

const createMockSkillCard = (overrides?: Omit<Partial<Card>, "kind">): Card => {
  return {
    kind: "skill",
    effectId: "test",
    energyCost: 1,
    tags: [],
    id: "mock_card",
    name: "Mock Card",
    rarity: "Common",
    target: { kind: "enemy" },
    ...overrides,
  };
};

describe("deckActions", () => {
  it("should move cards from deck to hand", () => {
    const mockCard = createMockSkillCard();

    const state = { ...gameState, run: { ...gameState.run, deck: [mockCard, mockCard, mockCard] } };
    const result = drawCards(state, 1);

    expect(result.run.hand.length).toBe(1);
    expect(result.run.deck.length).toBe(2);
  });

  it("should handle draw count greater than deck size", () => {
    const mockCard = createMockSkillCard();

    const state = { ...gameState, run: { ...gameState.run, deck: [mockCard] } };
    const result = drawCards(state, 2);

    expect(result.run.hand.length).toBe(1);
    expect(result.run.deck.length).toBe(0);
  });

  it("should leave state unchanged when drawing from an empty deck", () => {
    const state = { ...gameState, run: { ...gameState.run } };
    const result = drawCards(state, 1);

    expect(result.run.hand.length).toBe(0);
    expect(result.run.deck.length).toBe(0);
  });

  it("should leave state unchanged when drawing 0 cards", () => {
    const mockCard = createMockSkillCard();

    const state = { ...gameState, run: { ...gameState.run, deck: [mockCard] } };
    const result = drawCards(state, 0);

    expect(result.run.hand.length).toBe(0);
    expect(result.run.deck.length).toBe(1);
  });
});
