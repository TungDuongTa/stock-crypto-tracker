import { model, type Model, models, Schema } from "mongoose";

export type CryptoWatchlistItem = {
  userId: string;
  coinId: string;
  symbol: string;
  name: string;
  image?: string;
  addedAt: Date;
};

const CryptoWatchlistSchema = new Schema<CryptoWatchlistItem>(
  {
    userId: { type: String, required: true, index: true },
    coinId: { type: String, required: true, trim: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

CryptoWatchlistSchema.index({ userId: 1, coinId: 1 }, { unique: true });

export const CryptoWatchlist: Model<CryptoWatchlistItem> =
  (models?.CryptoWatchlist as Model<CryptoWatchlistItem>) ||
  model<CryptoWatchlistItem>("CryptoWatchlist", CryptoWatchlistSchema);
