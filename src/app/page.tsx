import { HomePageContent } from "./components/home-page-content";
import { getCurrentUser } from "../auth/server";

export default async function HomePage() {
  const user = await getCurrentUser();

  return <HomePageContent signedIn={Boolean(user)} />;
}
