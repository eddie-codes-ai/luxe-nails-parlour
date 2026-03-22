import { checkAdminAuth } from "@/lib/checkAdminAuth";
import ArtistsClient from "./ArtistsClient";

export default async function AdminArtistsPage() {
  await checkAdminAuth();
  return <ArtistsClient />;
}