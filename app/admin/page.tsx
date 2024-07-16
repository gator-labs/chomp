export default async function Page() {
  console.log({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
  return <div>some app stats</div>;
}
