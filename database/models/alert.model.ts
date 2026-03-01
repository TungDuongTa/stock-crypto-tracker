import { model, type Model, models, Schema } from "mongoose";

const AlertSchema = new Schema<Alert>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    alertName: { type: String, required: true, trim: true },
    currentPrice: { type: Number, default: 0 }, // Changed: removed 'required', added 'default: 0'
    alertType: { type: String, enum: ["greater", "less"], required: true },
    threshold: { type: Number, required: true },
    changePercent: { type: Number, default: 0 },
    logo: { type: String, default: null },
  },
  { timestamps: true },
);

AlertSchema.index({ userId: 1, symbol: 1, threshold: 1 }, { unique: true });

export const Alert: Model<Alert> =
  (models?.Alert as Model<Alert>) || model<Alert>("Alert", AlertSchema);
