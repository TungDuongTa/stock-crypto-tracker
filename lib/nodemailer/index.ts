import nodemailer from "nodemailer";
import {
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  STOCK_ALERT_LOWER_EMAIL_TEMPLATE,
  STOCK_ALERT_UPPER_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./templates";
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name).replace(
    "{{intro}}",
    intro,
  );
  const mailOptions = {
    from: `"Signalist" <banvirank@gmail.com>`,
    to: email,
    subject: "Welcome to Signalist!",
    text: "Thank for joning Signalist. You now have the tools to track your favorite stocks and crypto assets all in one place.",
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
export const sendNewsSummaryEmail = async ({
  email,
  date,
  newsContent,
}: {
  email: string;
  date: string;
  newsContent: string;
}) => {
  const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE.replace(
    "{{date}}",
    date,
  ).replace("{{newsContent}}", newsContent);

  const mailOptions = {
    from: `"Signalist News" <signalist@jsmastery.pro>`,
    to: email,
    subject: `📈 Market News Summary Today - ${date}`,
    text: `Today's market news summary from Signalist`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
export const sendPriceAlertEmail = async ({
  email,
  company,
  symbol,
  alertName,
  currentPrice,
  threshold,
  alertType,
}: {
  email: string;
  company: string;
  symbol: string;
  alertName: string;
  currentPrice: string;
  threshold: string;
  alertType: "greater" | "less";
}) => {
  // Select template based on alert type
  const template =
    alertType === "greater"
      ? STOCK_ALERT_UPPER_EMAIL_TEMPLATE
      : STOCK_ALERT_LOWER_EMAIL_TEMPLATE;

  const htmlTemplate = template
    .replace("{{symbol}}", symbol)
    .replace("{{company}}", company)
    .replace("{{alertName}}", alertName)
    .replace("{{currentPrice}}", currentPrice)
    .replace("{{targetPrice}}", threshold);

  const mailOptions = {
    from: `"Signalist Alerts" <banvirank@gmail.com>`,
    to: email,
    subject: `🚨 Price Alert: ${company} (${symbol}) - ${alertType === "upper" ? "Above" : "Below"} Target`,
    text: `Price alert triggered for ${company}`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
