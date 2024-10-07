"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const isEmailValid =
      formData.email.includes("@") && formData.email.includes(".");
    const isPasswordValid = formData.password.length >= 8;
    const isConfirmPasswordValid =
      formData.password === formData.confirmPassword;
    setIsFormValid(isEmailValid && isPasswordValid && isConfirmPasswordValid);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = async () => {
    if (isFormValid) {
      try {
        const response = await fetch("http://localhost:8000/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            confirm_password: formData.confirmPassword,
          }),
        });

        if (response.ok) {
          toast({
            title: "Success",
            description:
              "You have successfully signed up! Please proceed to sign in.",
            duration: 3000,
          });
          router.push("/signin");
        } else {
          const errorData = await response.json();
          if (
            response.status === 400 &&
            errorData.detail.toLowerCase().includes("email already exists")
          ) {
            setErrorMessage(
              "This email is already registered. Please use a different email or sign in.",
            );
          } else {
            throw new Error(
              errorData.detail || "An error occurred during sign up.",
            );
          }
        }
      } catch (error) {
        console.error("Error during sign up:", error);
        toast({
          title: "Error",
          description:
            errorMessage ||
            "An error occurred during sign up. Please try again.",
          duration: 3000,
          variant: "destructive",
        });
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-black">
      <div className="rounded-lg shadow-xl overflow-hidden max-w-md border-2 border-white">
        <div className="p-6 text-white bg-black">
          <h1 className="text-2xl font-bold mb-4 text-white">
            Join TutorAssist Today! 🎓
          </h1>
          <p className="text-white mb-4 text-sm">
            Embark on your learning journey with us. Sign up now for
            personalized tutoring experiences.
          </p>
          <div className="space-y-3">
            <div>
              <Label htmlFor="signup-email" className="text-sm">
                Email
              </Label>
              <Input
                id="signup-email"
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
              <Label htmlFor="signup-password" className="text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 pr-10 text-white"
                  autoComplete="new-password"
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
            <div>
              <Label htmlFor="signup-confirm-password" className="text-sm">
                Confirm Password
              </Label>
              <Input
                id="signup-confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="mt-1 text-white"
                autoComplete="new-password"
              />
            </div>
            <Button
              className="w-full bg-[#B7799B] hover:bg-[#9A6581] mt-2"
              onClick={handleSignUp}
              disabled={!isFormValid}
            >
              Sign Up
            </Button>
            {errorMessage && (
              <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
            )}
            {!isFormValid && (
              <p className="text-red-500 text-xs mt-1">
                Please fill in all fields correctly to complete your
                registration.
              </p>
            )}
          </div>
          <p className="mt-4 text-center text-xs text-white">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-white font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
