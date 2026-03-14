import { checkAdminAuth } from "@/lib/checkAdminAuth";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  await checkAdminAuth();
  return <CategoriesClient />;
}