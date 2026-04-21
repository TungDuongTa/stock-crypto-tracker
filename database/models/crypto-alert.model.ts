import { model, type Model, models, Schema } from "mongoose";

export type CryptoAlert = {
  userId: string;
  coinId: string;
  symbol: string;
  name: string;
  alertName: string;
  alertType: "greater" | "less";
  threshold: number;
  image?: string;
};

const CryptoAlertSchema = new Schema<CryptoAlert>(
  {
    userId: { type: String, required: true, index: true },
    coinId: { type: String, required: true, trim: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    alertName: { type: String, required: true, trim: true },
    alertType: { type: String, enum: ["greater", "less"], required: true },
    threshold: { type: Number, required: true },
    image: { type: String, default: "" },
  },
  { timestamps: true },
);

CryptoAlertSchema.index(
  { userId: 1, coinId: 1, threshold: 1, alertType: 1 },
  { unique: true },
);

export const CryptoAlertModel: Model<CryptoAlert> =
  (models?.CryptoAlert as Model<CryptoAlert>) ||
  model<CryptoAlert>("CryptoAlert", CryptoAlertSchema);

