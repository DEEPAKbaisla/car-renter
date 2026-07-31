import arcjet, { fixedWindow } from "@arcjet/next";

// Registration: 10 requests per hour per IP
export const registerLimiter = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [fixedWindow({ mode: "LIVE", window: "1h", max: 10 })],
});

// Verify OTP: 10 requests per 10 minutes per IP
export const verifyOtpLimiter = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [fixedWindow({ mode: "LIVE", window: "10m", max: 10 })],
});

// Resend OTP: 5 requests per 10 minutes per IP
export const resendOtpLimiter = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [fixedWindow({ mode: "LIVE", window: "10m", max: 5 })],
});

// Forgot password: 5 requests per 10 minutes per IP
export const forgotPasswordLimiter = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [fixedWindow({ mode: "LIVE", window: "10m", max: 5 })],
});

// Reset password: 10 requests per 15 minutes per IP
export const resetPasswordLimiter = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [fixedWindow({ mode: "LIVE", window: "15m", max: 10 })],
});
