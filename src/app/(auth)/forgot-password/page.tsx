"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await axios.post("/api/auth/forgot-password", { email });
      setSent(true);
      if (result.data.resetUrl) {
        setResetUrl(result.data.resetUrl);
        toast.success("Email sending failed. Use the link below for testing.", { duration: 30000 });
      } else {
        toast.success("If an account exists, a reset link has been sent.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
            <p className="text-sm text-slate-500 mt-2">
              We sent a password reset link to <span className="font-medium text-slate-900">{email}</span>
            </p>
          </div>
          {resetUrl && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <p className="text-xs text-amber-700 font-medium mb-2">Dev Mode — Reset Link:</p>
                <a
                  href={resetUrl}
                  className="text-xs text-amber-900 underline break-all hover:text-amber-700">
                  {resetUrl}
                </a>
              </CardContent>
            </Card>
          )}
          <div className="space-y-3">
            <Link href="/login">
              <Button className="w-full h-11 bg-slate-900 hover:bg-slate-800">
                Back to Sign In
              </Button>
            </Link>
            <button
              onClick={() => { setSent(false); setResetUrl(""); setEmail(""); }}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
            <Mail className="h-7 w-7 text-slate-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Forgot your password?</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
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
                  <Button type="submit" disabled={isLoading} className="w-full h-11 bg-slate-900 hover:bg-slate-800">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-slate-900 hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
