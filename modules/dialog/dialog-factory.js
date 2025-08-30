/** @deprecated */
import { HMDialog } from "./dialog.js";

export const HMDialogFactory = (dataset, caller = null, opt = {}) => {
    const { dialog } = dataset;
    if (dialog === "atk") return HMDialog.getAttackDialog(dataset, caller, opt);
    if (dialog === "cast") return HMDialog.getCastDialog(dataset, caller, opt);
    if (dialog === "def") return HMDialog.getDefendDialog(dataset, caller);
    if (dialog === "dmg") return HMDialog.getDamageDialog(dataset, caller);
    return undefined;
};
