"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Mail, ArrowLeft, Check, X, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score, label: "Fair", color: "bg-amber-500" };
  if (score <= 4) return { score, label: "Strong", color: "bg-blue-500" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const [step, setStep] = useState<"signup" | "otp">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });
      setRegisteredEmail(result.data.email || email);
      setStep("otp");
      if (result.data.otp) {
        toast.success(`OTP for testing: ${result.data.otp}`, { duration: 30000 });
      } else {
        toast.success("Account created! Please check your email for the verification code.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await axios.post("/api/auth/verify-otp", {
        email: registeredEmail,
        otp,
      });
      toast.success("Email verified! Welcome to RideOwn.");
      const result = await signIn("credentials", {
        email: registeredEmail,
        password: password,
        redirect: false,
      });
      if (result?.ok) {
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = useCallback(async () => {
    setIsResending(true);
    try {
      const result = await axios.post("/api/auth/resend-otp", { email: registeredEmail });
      setResendCooldown(60);
      if (result.data.otp) {
        toast.success(`OTP for testing: ${result.data.otp}`, { duration: 30000 });
      } else {
        toast.success("OTP resent! Check your email.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  }, [registeredEmail]);

  const passwordStrength = getPasswordStrength(password);

  const passwordChecks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  if (step === "otp") {
    return (
      <div className="flex flex-col gap-6" {...props}>
        <div className="text-center lg:text-left">
          <button
            onClick={() => setStep("signup")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
          <p className="text-muted-foreground text-sm mt-1">
            We sent a 6-digit code to <span className="font-medium text-slate-900">{registeredEmail}</span>
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleVerifyOtp}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={isVerifying}
                    className="h-11 text-center text-lg tracking-[0.3em] font-mono"
                    maxLength={6}
                  />
                </Field>

                <Field>
                  <Button type="submit" disabled={isVerifying || otp.length !== 6} className="w-full h-11 bg-slate-900 hover:bg-slate-800">
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </Button>
                </Field>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isResending}
                      className="font-medium text-slate-900 hover:underline underline-offset-4 disabled:opacity-50 disabled:cursor-not-allowed">
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : isResending
                          ? "Sending..."
                          : "Resend OTP"}
                    </button>
                  </p>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" {...props}>
      <div className="text-center lg:text-left">
        <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Enter your information below to get started
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleRegister}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-11 border-slate-200 hover:bg-slate-50"
                  onClick={async () => {
                    setIsGoogleLoading(true);
                    await signIn("google", { callbackUrl: "/" });
                  }}>
                  {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                or sign up with email
              </FieldSeparator>

              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 min-w-[70px] text-right">
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {passwordChecks.map((check) => (
                        <div key={check.label} className="flex items-center gap-1.5 text-xs">
                          {check.met ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-slate-300" />
                          )}
                          <span className={check.met ? "text-emerald-600" : "text-slate-400"}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading} className="w-full h-11 bg-slate-900 hover:bg-slate-800">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-slate-900 hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>

      <FieldDescription className="px-6 text-center text-xs text-slate-400">
        By continuing, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-slate-600">Terms of Service</a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-slate-600">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
