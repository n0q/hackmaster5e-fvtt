// Global type declarations for FoundryVTT
import type { dice, utils } from "@client/_module.mjs";

declare global {
    const Actor: typeof foundry.documents.Actor
    const Color: typeof utils.Color;
    const Item: typeof foundry.documents.Item;
    const Macro: typeof foundry.documents.Macro;
    const PoolTerm: typeof dice.PoolTerm;
    const Roll: typeof dice.Roll;
}

