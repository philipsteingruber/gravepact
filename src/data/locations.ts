import type { LocationData } from "@/lib/types";
import { skillCards } from "./cards/skills";
import { supportCards } from "./cards/supports";

export const locations: Record<string, LocationData> = { rotting_strand: { cardPool: [...skillCards, ...supportCards] } };
