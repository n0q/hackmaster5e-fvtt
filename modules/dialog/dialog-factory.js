/** @deprecated */
import { HMDialog } from "./dialog.js";

export const HMDialogFactory = (dataset, caller = null, opt = {}) => {
    const { dialog } = dataset;
    if (dialog === "ability") return HMDialog.getAbilityDialog(dataset, caller);
    if (dialog === "atk") return HMDialog.getAttackDialog(dataset, caller, opt);
    if (dialog === "cast") return HMDialog.getCastDialog(dataset, caller, opt);
    if (dialog === "def") return HMDialog.getDefendDialog(dataset, caller);
    if (dialog === "dmg") return HMDialog.getDamageDialog(dataset, caller);
    if (dialog === "fumble") return HMDialog.getFumbleDialog(dataset, caller);
    if (dialog === "initdie") return HMDialog.getInitDieDialog(caller);
    if (dialog === "save") return HMDialog.getSaveDialog(dataset, caller);
    if (dialog === "skill") return HMDialog.getSkillDialog(dataset, caller);
    if (dialog === "wound") return HMDialog.setWoundDialog(caller);
    return undefined;
};
