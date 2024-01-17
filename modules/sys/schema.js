import { HMWoundSchema } from '../item/schema/wound-schema.js';

export const registerSchema = () => {
    CONFIG.Item.dataModels.wound = HMWoundSchema;
};
