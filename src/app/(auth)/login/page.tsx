import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dxmmbkhq8/image/upload/v1771155904/swift_qvuk6a.png')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link href="/" className="mb-12">
            <span className="font-heading text-3xl font-bold text-white tracking-tight">
              Ride<span className="text-amber-400">Own</span>
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-white leading-tight">
            Welcome back to your next adventure
          </h1>
          <p className="mt-4 text-slate-400 text-lg leading-relaxed max-w-md">
            Sign in to access your bookings, manage your account, and discover amazing cars.
          </p>
          <div className="mt-12 flex items-center gap-6 text-slate-500 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
              Secure login
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
              Easy access
            </div>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-slate-50/50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-block">
              <span className="font-heading text-2xl font-bold text-slate-900 tracking-tight">
                Ride<span className="text-amber-500">Own</span>
              </span>
            </Link>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
