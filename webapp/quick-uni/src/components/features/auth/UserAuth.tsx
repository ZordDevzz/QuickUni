'use client';

import { signIn, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export const LoginButton = () => {
  const t = useTranslations("Common");
  return (
    <button
      onClick={() => signIn()}
      className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      {t("LogIn")}
    </button>
  );
};

export const LogoutButton = () => {
  const t = useTranslations("Common");
  return (
    <button
      onClick={() => signOut({ callbackUrl: window.location.origin })}
      className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
    >
      {t("LogOut")}
    </button>
  );
};
