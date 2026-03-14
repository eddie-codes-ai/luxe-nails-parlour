import { checkAdminAuth } from "@/lib/checkAdminAuth";
import AdminDashboard from "./AdminDashboardClient";

export default async function AdminPage() {
  await checkAdminAuth();
  return <AdminDashboard />;
}