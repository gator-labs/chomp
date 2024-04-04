import { headers } from 'next/headers'

export async function GET() {
    const headersList = headers()
    const apiKey = headersList.get('api-key')

    if (apiKey !== process.env.FRAMES_API_KEY) {
        return new Response(`Invalid api-key`, {
            status: 400,
          })
    }

   
    return Response.json({ question: 'This is a sample question from the API'})
  }