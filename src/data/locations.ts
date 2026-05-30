import type { LocationData } from "@/lib/types";
import { auraCards } from "./cards/auras";
import { skillCards } from "./cards/skills";
import { supportCards } from "./cards/supports";

export const locations: Record<string, LocationData> = { rotting_strand: { cardPool: [...skillCards, ...supportCards, ...auraCards] } };
