"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="btn-ghost px-3 py-1.5 text-sm"
    >
      Keluar
    </button>
  );
}