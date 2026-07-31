import crypto from "crypto";
import nodemailer from "nodemailer";
import { verificationEmailTemplate } from "./email-template";
import { passwordResetEmailTemplate } from "./password-reset-template";

export function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationOtp(
  email: string,
  name: string,
  otp: string
): Promise<void> {
  const html = verificationEmailTemplate(name, otp);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "RideOwn <noreply@rideown.com>",
    to: email,
    subject: "Verify your RideOwn account",
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<void> {
  const html = passwordResetEmailTemplate(name, resetUrl);

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "RideOwn <noreply@rideown.com>",
    to: email,
    subject: "Reset your RideOwn password",
    html,
  });
}
