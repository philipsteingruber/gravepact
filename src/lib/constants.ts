// --- Display ---
export const SCREEN_WIDTH = 1920 * (2 / 3);
export const SCREEN_HEIGHT = 1080 * (2 / 3);

export const CARD_WIDTH = 140;
export const CARD_HEIGHT = 160;
export const CARD_SPACING = 10;

// --- Player ---
export const BASE_MAX_HEALTH = 100; // tune
export const BASE_MAX_ENERGY = 3; // tune
export const BASE_HAND_SIZE = 5; // tune

// --- Status Effects ---
export const BLEED_TICK_MULTIPLIER = 0.5; // tune
export const WEAKEN_PER_STACK = 0.05; // tune

// --- Map Generation ---
export const MIN_LAYERS_PER_MAP = 10;
export const MAX_LAYERS_PER_MAP = 12;

// Node counts per map
export const MIN_ELITE_COUNT = 2;
export const MAX_ELITE_COUNT = 3;

export const MIN_SHOP_COUNT = 2;
export const MAX_SHOP_COUNT = 3;

export const MIN_REST_COUNT = 2;
export const MAX_REST_COUNT = 3;

// Layer placement constraints (0-indexed; map has MIN–MAX_LAYERS_PER_MAP total layers)
export const MIN_ELITE_LAYER = 6;
export const MIN_SPECIAL_NODE_LAYER = 3;
export const MAX_SPECIAL_NODE_LAYER = 8;
