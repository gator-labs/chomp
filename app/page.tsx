"use client";
import c from "./page.module.css";
import { Profile } from "./components/Profile/Profile";
import { TokenBalance } from "./components/TokenBalance/TokenBalance";
import { DynamicLogoutWrapper } from "./components/DynamicLogoutWrapper/DynamicLogoutWrapper";

export default function Page() {
  return (
    <main className={c.main}>
      home page
      <TokenBalance />
      <Profile />
      <DynamicLogoutWrapper />
    </main>
  );
}
