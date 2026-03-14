import { checkAdminAuth } from "@/lib/checkAdminAuth";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  await checkAdminAuth();
  return <ProductsClient />;
}