import { getUserByEmail, setEmail, setWallet, updateUser } from "@/app/queries/user";
import { headers } from "next/headers";

export async function GET(req: Request) {
    const headersList = headers();
    const apiKey = headersList.get("api-key");
  
    if (apiKey !== process.env.BOT_API_KEY) {
      return new Response(`Invalid api-key`, {
        status: 400,
      });
    }
  
    const { searchParams} = new URL(req.url);
    const email = searchParams.get("email");
  
    if (!email || Array.isArray(email)) {
      return Response.json("email parameter is required", { status: 400 });
    }
  
    const profile = await getUserByEmail(email);
  
    if (!profile) {
      return Response.json("No data found", { status: 404 });
    }
  
    return Response.json({ profile });
  }

export async function POST(req: Request) {
    const headersList = headers();
    const apiKey = headersList.get("api-key");
  
    if (apiKey !== process.env.BOT_API_KEY) {
      return new Response(`Invalid api-key`, {
        status: 400,
      });
    }
  
    const data = await req.json();
    const { existingId, newId, telegramId, email, address } = data;
    const user = await updateUser({
      id: newId,
      telegramId,
    }, existingId);

    const wallet = await setWallet({
        userId: newId,
        address,
    });

    const response = await setEmail({
        userId: newId,
        address: email,
    });
  
    return Response.json(response);
  }