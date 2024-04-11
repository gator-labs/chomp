import { getProfile } from "@/app/queries/profile";

export async function GET() {
  const profile = await getProfile();

  if (!profile) {
    return Response.json({ message: "invalid jwt" }, { status: 401 });
  }

  return Response.json({
    profile,
  });
}
