"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Connect to your API route /api/auth/forgot-password
    // await fetch("/api/auth/forgot-password", { 
    //   method: "POST", 
    //   body: JSON.stringify({ email }) 
    // });
    
    // Simulate network request
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F4] flex items-center justify-center px-4 py-12">
      
      <div className="w-full max-w-md">
        
        {/* Back Link */}
        <Link 
          href="/auth/login" 
          className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="w-12 h-12 rounded-full bg-[#F3F0FF] flex items-center justify-center mb-6">
                <Mail className="w-6 h-6 text-[#5433EB]" />
              </div>
              
              <h1 className="text-[26px] font-medium text-black mb-2">
                Forgot your password?
              </h1>
              <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
                No worries. Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-[0.1em] mb-2">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3.5 text-[14px] text-black focus:border-[#5433EB] focus:outline-none transition-colors placeholder:text-gray-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5433EB] text-white font-medium py-3.5 rounded-full transition-colors hover:bg-[#4524DB] text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              {/* Footer Note */}
              <p className="text-center text-[12px] text-gray-400 mt-6">
                Remembered it?{" "}
                <Link href="/auth/login" className="text-[#5433EB] font-medium hover:underline">
                  Sign in instead
                </Link>
              </p>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              
              <h1 className="text-[24px] font-medium text-black mb-3">
                Check your inbox
              </h1>
              <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
                We've sent a password reset link to <br />
                <span className="font-medium text-black">{email}</span>
              </p>

              <button
                onClick={() => setIsSubmitted(false)}
                className="text-[13px] font-medium text-[#5433EB] hover:text-[#4524DB] transition-colors"
              >
                Didn't receive it? Try again
              </button>
            </div>
          )}

        </div>

        {/* Security Note */}
        <p className="text-center text-[11px] text-gray-400 mt-6">
          For security reasons, this link will expire in 15 minutes.
        </p>

      </div>
    </div>
  );
}