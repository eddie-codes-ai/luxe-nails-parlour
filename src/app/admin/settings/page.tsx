import { checkAdminAuth } from "@/lib/checkAdminAuth";
import SettingsClient from "./SettingsClient";

export default async function AdminSettingsPage() {
  await checkAdminAuth();
  return <SettingsClient />;
}