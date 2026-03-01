import { inngest } from "@/lib/inngest/client";
import {
  NEWS_SUMMARY_EMAIL_PROMPT,
  PERSONALIZED_WELCOME_EMAIL_PROMPT,
} from "./prompts";
import { success } from "better-auth";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "../nodemailer";
import { getAllUsersForNewsEmail } from "../actions/user.actions";
import { getWatchlistSymbolsByEmail } from "../actions/watchlist.actions";
import { getNews, getStockDetails } from "../actions/finhub.actions";
import { formatPrice, getFormattedTodayDate } from "../utils";
import { getAllAlertsForPriceCheck } from "../actions/alert.actions";

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
  async ({ event, step }) => {
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
        } catch (e) {
          console.error("daily-news: error preparing user news", user.email, e);
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
      } catch (e) {
        console.error("Failed to summarize news for : ", user.email);
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
  [{ cron: "*/1 * * * *" }], // Every 1 minutes
  async ({ step }) => {
    const alerts = await step.run(
      "fetch-all-alerts",
      getAllAlertsForPriceCheck,
    );

    if (!alerts || alerts.length === 0) {
      return { success: false, message: "No active alerts found" };
    }

    // Group alerts by symbol for batch processing
    const alertsBySymbol = alerts.reduce(
      (acc: Record<string, any[]>, alert: any) => {
        if (!acc[alert.symbol]) acc[alert.symbol] = [];
        acc[alert.symbol].push(alert);
        return acc;
      },
      {},
    );

    const triggeredAlerts = await step.run("check-prices", async () => {
      const alerts: any[] = [];
      for (const symbol of Object.keys(alertsBySymbol)) {
        try {
          const stockData = await getStockDetails(symbol);
          const currentPrice = stockData.currentPrice;

          // Check which alerts are triggered
          alertsBySymbol[symbol].forEach((alert: any) => {
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
