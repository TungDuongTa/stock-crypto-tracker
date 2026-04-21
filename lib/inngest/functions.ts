import { inngest } from "@/lib/inngest/client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "./prompts";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "../nodemailer";
import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews, getStockDetails } from "../actions/finhub.actions";
import { formatCurrency, formatPrice, getFormattedTodayDate } from "../utils";
import { getAllAlertsForPriceCheck } from "../actions/alert.actions";
import { getAllCryptoAlertsForPriceCheck } from "../actions/crypto-alert.actions";
import { fetcher } from "../actions/coingecko.actions";

type StockAlertDoc = {
  userId: string;
  symbol: string;
  company: string;
  alertName: string;
  alertType: "greater" | "less";
  threshold: number;
};

type CryptoAlertDoc = {
  userId: string;
  coinId: string;
  symbol: string;
  name: string;
  alertName: string;
  alertType: "greater" | "less";
  threshold: number;
  image?: string;
};

export const sendSignUpEmail = inngest.createFunction(
  { id: "sign-up-email" },
  { event: "app/user.created" },
  async ({ event, step }) => {
    const userProfile = `
        - Country: ${event.data.country}
        - Investment Goals: ${event.data.investmentGoals}
        - Risk Tolerance: ${event.data.riskTolerance}
        - Perferred industry: ${event.data.preferredIndustry}
        `;

    const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace(
      "{userProfile}",
      userProfile,
    );

    const response = await step.ai.infer("generate-welcome-intro", {
      model: step.ai.models.gemini({ model: "gemini-2.5-flash" }),
      body: {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
    });

    await step.run("send-welcome-email", async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText =
        (part && "text" in part ? part.text : null) ||
        "Thank for joining Signalist. You now have the tools to track your favorite stocks and crypto assets all in one place.";
      //email sending logic here
      const {
        data: { email, name },
      } = event;
      return await sendWelcomeEmail({
        email,
        name,
        intro: introText,
      });
    });
    return {
      success: true,
      message: "welcome email sent",
    };
  },
);

export const sendDailyNewsSummary = inngest.createFunction(
  { id: "daily-news-summary" },
  [{ event: "app/send.daily.news" }, { cron: "0 12 * * *" }],
  async ({ step }) => {
    //get all users for news delivery
    const users = await step.run("get-all-users", getAllUsersForNewsEmail);
    if (!users || users.length === 0) {
      return { success: false, message: "No users found for news email" };
    }
    //fetch personalized news for each user
    const results = await step.run("fetch-user-news", async () => {
      const perUser: Array<{
        user: User;
        articles: MarketNewsArticle[];
      }> = [];
      for (const user of users as User[]) {
        try {
          const symbols = await getWatchlistSymbolsByEmail(user.email);
          let articles = await getNews(symbols);
          // Enforce max 6 articles per user
          articles = (articles || []).slice(0, 6);
          // If still empty, fallback to general
          if (!articles || articles.length === 0) {
            articles = await getNews();
            articles = (articles || []).slice(0, 6);
          }
          perUser.push({ user, articles });
        } catch (error) {
          console.error(
            "daily-news: error preparing user news",
            user.email,
            error,
          );
          perUser.push({ user, articles: [] });
        }
      }
      return perUser;
    });
    //summary these news via Ai for each user
    const userNewsSummaries: {
      user: User;
      newsContent: string | null;
    }[] = [];

    for (const { user, articles } of results) {
      try {
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace(
          "{{newsData}}",
          JSON.stringify(articles, null, 2),
        );

        const response = await step.ai.infer(`summarize-news-${user.email}`, {
          model: step.ai.models.gemini({ model: "gemini-2.5-flash-lite" }),
          body: {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const newsContent =
          (part && "text" in part ? part.text : null) || "No market news.";

        userNewsSummaries.push({ user, newsContent });
      } catch (error) {
        console.error("Failed to summarize news for : ", user.email, error);
        userNewsSummaries.push({ user, newsContent: null });
      }
    }
    //send email via nodemailer
    await step.run("send-news-emails", async () => {
      await Promise.all(
        userNewsSummaries.map(async ({ user, newsContent }) => {
          if (!newsContent) return false;

          return await sendNewsSummaryEmail({
            email: user.email,
            date: getFormattedTodayDate(),
            newsContent,
          });
        }),
      );
    });

    return {
      success: true,
      message: "Daily news summary emails sent successfully",
    };
  },
);

//Alerting function example
export const checkPriceAlerts = inngest.createFunction(
  { id: "check-price-alerts" },
  [{ cron: "*/59 * * * *" }], // Every 1 minutes
  async ({ step }) => {
    const alerts = (await step.run(
      "fetch-all-alerts",
      getAllAlertsForPriceCheck,
    )) as StockAlertDoc[];

    if (!alerts || alerts.length === 0) {
      return { success: false, message: "No active alerts found" };
    }

    // Group alerts by symbol for batch processing
    const alertsBySymbol = alerts.reduce(
      (acc: Record<string, StockAlertDoc[]>, alert: StockAlertDoc) => {
        if (!acc[alert.symbol]) acc[alert.symbol] = [];
        acc[alert.symbol].push(alert);
        return acc;
      },
      {},
    );

    const triggeredAlerts = await step.run("check-prices", async () => {
      const alerts: Array<StockAlertDoc & { currentPrice: number }> = [];
      for (const symbol of Object.keys(alertsBySymbol)) {
        try {
          const stockData = await getStockDetails(symbol);
          const currentPrice = stockData.currentPrice;

          // Check which alerts are triggered
          alertsBySymbol[symbol].forEach((alert) => {
            const isTriggered =
              (alert.alertType === "greater" &&
                currentPrice >= alert.threshold) ||
              (alert.alertType === "less" && currentPrice <= alert.threshold);

            if (isTriggered) {
              alerts.push({
                ...alert,
                currentPrice,
              });
            }
          });
        } catch (error) {
          console.error(`Error checking price for ${symbol}:`, error);
        }
      }
      return alerts;
    });

    // Send emails for triggered alerts
    if (triggeredAlerts.length > 0) {
      await step.run("send-price-alerts", async () => {
        const { sendPriceAlertEmail } = await import("../nodemailer");
        const { getAllUsersForNewsEmail } =
          await import("../actions/user.actions");

        // Get user emails mapping
        const users = await getAllUsersForNewsEmail();
        const userMap = new Map(users.map((u) => [u.id, u.email]));

        for (const alert of triggeredAlerts) {
          try {
            const userEmail = userMap.get(alert.userId);
            if (!userEmail) continue;

            await sendPriceAlertEmail({
              email: userEmail,
              company: alert.company,
              symbol: alert.symbol,
              alertName: alert.alertName,
              currentPrice: formatPrice(alert.currentPrice),
              threshold: formatPrice(alert.threshold),
              alertType: alert.alertType,
            });
          } catch (error) {
            console.error(
              `Failed to send alert email for ${alert.symbol}:`,
              error,
            );
          }
        }
      });
    }

    return {
      success: true,
      message: `Checked ${Object.keys(alertsBySymbol).length} symbols, triggered ${triggeredAlerts.length} alerts`,
    };
  },
);

export const checkCryptoPriceAlerts = inngest.createFunction(
  { id: "check-crypto-price-alerts" },
  [{ cron: "*/59 * * * *" }],
  async ({ step }) => {
    const alerts = (await step.run(
      "fetch-all-crypto-alerts",
      getAllCryptoAlertsForPriceCheck,
    )) as CryptoAlertDoc[];

    if (!alerts || alerts.length === 0) {
      return { success: false, message: "No active crypto alerts found" };
    }

    const alertsByCoinId = alerts.reduce(
      (acc: Record<string, CryptoAlertDoc[]>, alert: CryptoAlertDoc) => {
        if (!acc[alert.coinId]) acc[alert.coinId] = [];
        acc[alert.coinId].push(alert);
        return acc;
      },
      {},
    );

    const triggeredAlerts = await step.run("check-crypto-prices", async () => {
      const triggered: Array<CryptoAlertDoc & { currentPrice: number }> = [];

      const coinIds = Object.keys(alertsByCoinId);
      const idsParam = coinIds.join(",");

      type CoinMarketLite = {
        id: string;
        symbol: string;
        name: string;
        image: string;
        current_price: number;
        price_change_percentage_24h: number;
      };

      let marketData: CoinMarketLite[] = [];
      try {
        marketData = await fetcher<CoinMarketLite[]>("coins/markets", {
          vs_currency: "usd",
          ids: idsParam,
          sparkline: "false",
          price_change_percentage: "24h",
        });
      } catch (error) {
        console.error("Error fetching CoinGecko market data:", error);
        return [];
      }

      const marketById = new Map(marketData.map((c) => [c.id, c]));

      for (const coinId of coinIds) {
        const live = marketById.get(coinId);
        if (!live) continue;
        const currentPrice = live.current_price;

        alertsByCoinId[coinId].forEach((alert) => {
          const isTriggered =
            (alert.alertType === "greater" &&
              currentPrice >= alert.threshold) ||
            (alert.alertType === "less" && currentPrice <= alert.threshold);

          if (isTriggered) {
            triggered.push({
              ...alert,
              currentPrice,
            });
          }
        });
      }

      return triggered;
    });

    if (triggeredAlerts.length > 0) {
      await step.run("send-crypto-price-alerts", async () => {
        const { sendPriceAlertEmail } = await import("../nodemailer");
        const { getAllUsersForNewsEmail } =
          await import("../actions/user.actions");
        const users = await getAllUsersForNewsEmail();
        const userMap = new Map(users.map((u) => [u.id, u.email]));

        for (const alert of triggeredAlerts) {
          try {
            const userEmail = userMap.get(alert.userId);
            if (!userEmail) continue;

            const digits = alert.currentPrice < 1 ? 6 : 2;
            await sendPriceAlertEmail({
              email: userEmail,
              company: alert.name,
              symbol: String(alert.symbol || "").toUpperCase(),
              alertName: alert.alertName,
              currentPrice: formatCurrency(alert.currentPrice, digits),
              threshold: formatCurrency(alert.threshold, digits),
              alertType: alert.alertType,
            });
          } catch (error) {
            console.error(
              `Failed to send crypto alert email for ${alert.coinId}:`,
              error,
            );
          }
        }
      });
    }

    return {
      success: true,
      message: `Checked ${Object.keys(alertsByCoinId).length} coins, triggered ${triggeredAlerts.length} alerts`,
    };
  },
);
