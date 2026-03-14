import { checkAdminAuth } from "@/lib/checkAdminAuth";
import GalleryClient from "./GalleryClient";

export default async function GalleryPage() {
  await checkAdminAuth();
  return <GalleryClient />;
}