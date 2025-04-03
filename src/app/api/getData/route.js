export async function GET() {
  const flaskAPI = "https://32cf-111-92-16-20.ngrok-free.app/predict";

  try {
    const response = await fetch(flaskAPI);
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch Flask data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
export function HelloWorld() {
  return new Response(JSON.stringify({ message: "Hello, World!" }), {
    headers: { "Content-Type": "application/json" },
  });
}
