"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function Verify2FAPage() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newCode = pastedData.split("").concat(Array(6 - pastedData.length).fill(""));
      setCode(newCode);
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast({ title: "Please enter all 6 digits", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({ title: data.error || "Verification failed", variant: "destructive" });
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      toast({ title: "Verification successful!" });
      const role = session?.user?.role?.toLowerCase();
      router.push(`/dashboard/${role}`);
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "New code sent!", description: `Your code is: ${data.code}` });
      } else {
        toast({ title: "Failed to resend code", variant: "destructive" });
      }
    } catch {
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setIsResending(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Verification Code</Label>
                <div className="flex gap-2 justify-center">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-xl font-semibold rounded-xl border-gray-200 bg-white/60 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-300"
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all duration-300"
                disabled={isLoading || code.join("").length !== 6}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  "Verify Code"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <Button
                variant="ghost"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                {isResending ? "Sending..." : "Resend Code"}
              </Button>
              <div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
