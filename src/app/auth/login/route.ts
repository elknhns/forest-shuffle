import { completeAuthentication } from "@/auth/route";

export async function POST(request: Request) {
  return completeAuthentication(request, "login");
}
