import type { Store } from "@/lib/types";
import { initialMetaState } from "./meta-state";
import { initialRunState } from "./run-state";

export const store: Store = { gameState: { meta: { ...initialMetaState }, run: { ...initialRunState } } };
