import { checkAdminAuth } from "@/lib/checkAdminAuth";
import ServicesClient from "./ServicesClient";

export default async function ServicesPage() {
  await checkAdminAuth();
  return <ServicesClient />;
}