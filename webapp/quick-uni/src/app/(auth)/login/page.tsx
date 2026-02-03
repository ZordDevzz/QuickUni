"use client";

import { useForm } from "@tanstack/react-form";
import { loginFormSchema } from "@/schemas/auth/form.schema";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: async ({ value }) => {
      // Handle login submission here
      console.log(value);
    },
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-bold">QuickUNI</h1>
          </div>
          <div className="flex flex-col gap-6 rounded-xl border bg-card text-card-foreground shadow-sm">
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
                  <h1 className="text-2xl font-bold">Đăng nhập</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Cổng đăng nhập hệ thống LMS
                  </p>
                </div>
                <div className="grid gap-4">
                  <form.Field
                    name="username"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field
                          data-invalid={isInvalid}
                          className="grid gap-2"
                        >
                          <FieldLabel htmlFor={field.name}>
                            Tên đăng nhập
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="MSV/MĐD"
                            autoComplete="username webauthn"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <form.Field
                    name="password"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;
                      return (
                        <Field
                          data-invalid={isInvalid}
                          className="grid gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <FieldLabel htmlFor={field.name}>
                              Mật khẩu
                            </FieldLabel>
                            <a
                              href="#"
                              className="text-muted-foreground hover:text-primary ml-auto text-sm underline-offset-4 hover:underline"
                            >
                              Quên mật khẩu?
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
                            placeholder="Mật khẩu"
                            autoComplete="current-password webauthn"
                          />
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <Button type="submit" className="w-full">
                    Đăng nhập
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <div className="text-muted-foreground text-center text-xs text-balance">
             &copy; {new Date().getFullYear()} QuickUNI. All rights reserved. <br /> Design and developed by <a href="https://github.com/ZordDevzz/" className="underline hover:text-primary">Zord</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
