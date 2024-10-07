"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";

export default function SignInForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setThreadId = useAuthStore((state) => state.setThreadId);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isEmailValid =
      formData.email.includes("@") && formData.email.includes(".");
    const isPasswordValid = formData.password.length >= 8;
    setIsFormValid(isEmailValid && isPasswordValid);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSignIn = useCallback(async () => {
    if (isFormValid) {
      try {
        const response = await fetch("http://localhost:8000/signin", {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (response.ok) {
          const userData = await response.json();
          setAuth(userData.user.idToken || "dummy_token", formData.email);
          if (userData.thread_id) {
            setThreadId(userData.thread_id);
          }
          toast({
            title: "Success",
            description: "You have successfully signed in!",
            duration: 3000,
          });
          router.push("/chat");
        } else {
          throw new Error("Sign in failed");
        }
      } catch (error) {
        console.error("Error during sign in:", error);
        setError("Sign in failed: Please check your email and password");
        toast({
          title: "Error",
          description: "Sign in failed: Please check your email and password",
          duration: 3000,
          variant: "destructive",
        });
      }
    }
  }, [formData, isFormValid, setAuth, setThreadId, toast, router]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-black">
      <div className="rounded-lg shadow-xl overflow-hidden w-full max-w-md border-2 border-white">
        <div className="p-6 text-white bg-black">
          <h1 className="text-2xl font-bold mb-4 text-white">
            Welcome Back to TutorAssist! 🎓
          </h1>
          <p className="text-white mb-4 text-sm">
            {`We're glad to see you again. Sign in to continue your learning journey with us.`}
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="signin-email" className="text-sm">
                Email
              </Label>
              <Input
                id="signin-email"
                name="email"
                type="email"
                placeholder="example@email.com"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 text-white"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="signin-password" className="text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="signin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 pr-10 text-white"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <Button
              className="w-full bg-[#B7799B] hover:bg-[#9A6581] mt-2"
              onClick={handleSignIn}
              disabled={!isFormValid}
            >
              Sign In
            </Button>
            {!isFormValid && (
              <p className="text-red-500 text-xs mt-1">
                Please enter a valid email and password to sign in.
              </p>
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <p className="mt-4 text-center text-xs text-white">
            {`Don't have an account?`}{" "}
            <Link
              href="/signup"
              className="text-white font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
          <a
            href="#"
            className="block mt-2 text-center text-xs text-white hover:underline"
          >
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
}
