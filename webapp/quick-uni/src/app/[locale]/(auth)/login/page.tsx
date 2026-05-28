"use client";

import { useForm } from "@tanstack/react-form";
import { loginFormSchema } from "@/lib/validators/auth/form.schema";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/custom-toast";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Auth");
  const toastT = useTranslations("Toast");
  const tCommon = useTranslations("Common");

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      try {
        const result = await signIn("user-credentials", {
          username: value.username,
          password: value.password,
          redirect: false,
        });

        if (result?.error) {
          console.error("Login failed:", result.error);
          notify(toastT("LoginFailed"), {
            type: "error",
            description: toastT("LoginFailedDesc"),
            duration: 3500,
            position: "top-center",
          });
        } else if (result?.ok) {
          notify(toastT("LoginSuccess"), {
            type: "success",
            description: toastT("LoginSuccessDesc"),
            duration: 1500,
            position: "top-center",
          });
          router.push("/");
          router.refresh();
        }
      } catch (error) {
        console.error("Login error:", error);
        notify(toastT("SystemError"), {
          type: "error",
          description: toastT("SystemErrorDesc"),
          duration: 3500,
          position: "top-center",
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="max-sm w-full md:max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-bold">QuickUNI</h1>
          </div>
          <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm">
            <div className="p-6 md:p-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">{t("Login")}</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    {t("LoginDescription")}
                  </p>
                </div>
                <div className="grid gap-4">
                  <form.Field name="username">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="grid gap-2">
                          <FieldLabel htmlFor={field.name}>
                            {t("Username")}
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder={t("UsernamePlaceholder")}
                            autoComplete="username"
                            disabled={isLoading}
                          />
                          {isInvalid && (
                            <FieldError
                              errors={field.state.meta.errors.map((e) => ({
                                message: e as unknown as string,
                              }))}
                            />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
                  <form.Field name="password">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field data-invalid={isInvalid} className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <FieldLabel htmlFor={field.name}>
                              {t("Password")}
                            </FieldLabel>
                            <a
                              tabIndex={-1}
                              href="#"
                              className="text-muted-foreground hover:text-primary ml-auto text-sm underline-offset-4 hover:underline"
                            >
                              {t("ForgotPassword")}
                            </a>
                          </div>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="password"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder={t("PasswordPlaceholder")}
                            autoComplete="new-password"
                            disabled={isLoading}
                          />
                          {isInvalid && (
                            <FieldError
                              errors={field.state.meta.errors.map((e) => ({
                                message: e as unknown as string,
                              }))}
                            />
                          )}
                        </Field>
                      );
                    }}
                  </form.Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t("LoggingIn") : t("Login")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <div className="text-muted-foreground text-center text-xs text-balance">
            &copy; {new Date().getFullYear()} QuickUNI. {t("Copyright")} <br />{" "}
            {tCommon("DesignedBy")}{" "}
            <a
              href="https://github.com/ZordDevzz/"
              className="hover:text-primary underline"
            >
              Zord
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
