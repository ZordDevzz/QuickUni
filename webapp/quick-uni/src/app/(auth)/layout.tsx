"use client";
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  //   return <div className="min-h-screen absolute inset-0 bg-linear-270 from-blue-400 to-cyan-600">{children}</div>;
  return (
    <>
      <div className="fixed inset-0 bg-linear-60 from-indigo-900 via-purple-900 to-fuchsia-800 z-[-1]" />
      {children}
    </>
  );
}
