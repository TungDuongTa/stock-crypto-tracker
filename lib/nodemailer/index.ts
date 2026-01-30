import nodemailer from "nodemailer";
import { WELCOME_EMAIL_TEMPLATE } from "./templates";
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
