// Global type declarations for FoundryVTT
import type { dice, utils } from "@client/_module.mjs";

declare global {
    const Roll: typeof dice.Roll;
    const Color: typeof utils.Color;
    const PoolTerm: typeof dice.PoolTerm;
}

