import jwt from 'jsonwebtoken';

export default async function verifyTelegramAuthToken(token: string) {
    const decodedAuthToken = jwt.verify(token, process.env.BOT_TOKEN!, {
        algorithms: ["HS256"],
    }); 
    return decodedAuthToken;
}