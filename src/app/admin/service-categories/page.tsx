import { checkAdminAuth } from "@/lib/checkAdminAuth";
import ServiceCategoriesClient from "./ServiceCategoriesClient";

export default async function ServiceCategoriesPage() {
  await checkAdminAuth();
  return <ServiceCategoriesClient />;
}