"use client";

// React imports
import { FormEvent, ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";

// Next imports
import Link from "next/link";

// Sonner
import { toast } from "sonner";

// UI
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Supabase
import { supabase } from "@/lib/supabase";

// Server Actions
import { createUserInDatabase } from "./signup.actions";

// Utils
import { emailRegex, passwordRegex } from "@/lib/utils/auth.utils";

// Types
type FormFields = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Default form values
const defaultFormFields: FormFields = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Signup = () => {
  const router = useRouter();
  const [formFields, setFormFields] = useState<FormFields>(defaultFormFields);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to reset form
  const resetFormFields = () => setFormFields(defaultFormFields);

  // Function to handle changes in form fields
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    const field = target.id;
    const value = target.value;

    // Validate email
    if (field === "email") {
      if (!value || emailRegex.test(value)) {
        setEmailError("");
      } else {
        setEmailError("Please enter a valid email address.");
      }
    }

    // Validate password
    if (field === "password" || field === "confirmPassword") {
      if (!value || passwordRegex.test(value)) {
        setPasswordError("");
      } else {
        setPasswordError(
          "Password must be at least 8 characters, containing letters and digits."
        );
      }
    }

    setFormFields((prev) => ({ ...prev, [field]: value }));
  };

  // Function to handle sign up submit
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const { displayName, email, password, confirmPassword } = formFields;

    if (!displayName || !email || !password || !confirmPassword) {
      toast.warning("Please enter a missing values.");
      setIsSubmitting(false);
      return;
    }

    // Validate email
    if (!emailRegex.test(email)) {
      toast.warning("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    // Validate password
    if (!passwordRegex.test(password)) {
      toast.warning(
        "Password must be at least 8 characters and contain letters and digits."
      );
      setIsSubmitting(false);
      return;
    }

    // Validate passwords are the same
    if (password !== confirmPassword) {
      toast.warning("Password must be the same.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);

        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please log in.");
        } else {
          toast.error("Error creating account. Please try again.");
        }
        setIsSubmitting(false);
        return;
      }

      if (data.user) {
        // Insert user into the database table with the same UUID from Supabase Auth
        const dbResult = await createUserInDatabase({
          id: data.user.id, // Use the Supabase Auth UUID
          email: email,
          name: displayName,
        });

        if (dbResult.success) {
          toast.success(
            "Account created successfully! Please check your email to confirm your account."
          );
          resetFormFields();

          // Redirect to login page after a short delay
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        } else {
          // User was created in Supabase Auth but failed to add to database
          // You might want to handle this differently in production
          toast.warning(
            "Account created but there was an issue saving additional data. Please contact support if you experience issues."
          );

          // Still redirect to login since auth account was created
          setTimeout(() => {
            router.push("/auth/login");
          }, 3000);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="container max-w-lg mx-auto flex-1 flex flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Create an account</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your information to get started
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Full name</Label>
            <Input
              id="displayName"
              placeholder="John Doe"
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              onChange={handleChange}
              required
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              onChange={handleChange}
              required
            />
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              onChange={handleChange}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={emailError !== "" || passwordError !== "" || isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Signup;
