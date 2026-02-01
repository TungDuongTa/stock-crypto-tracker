import { model, type Model, models, Schema } from "mongoose";

export type WatchlistItem = {
  userId: string;
  symbol: string;
  company: string;
  addedAt: Date;
};

const WatchlistSchema = new Schema<WatchlistItem>(
  {
    userId: { type: String, required: true, index: true },
    symbol: { type: String, required: true, uppercase: true, trim: true },
    company: { type: String, required: true, trim: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);
//prevent duplicate entries for the same user and symbol
WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Watchlist: Model<WatchlistItem> =
  (models?.Watchlist as Model<WatchlistItem>) ||
  model<WatchlistItem>("Watchlist", WatchlistSchema);
