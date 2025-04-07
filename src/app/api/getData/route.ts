export async function GET(): Promise<Response> {
  const flaskAPI: string = "https://d916-152-59-224-34.ngrok-free.app/predict";

  try {
    const response: Response = await fetch(flaskAPI);
    const data: unknown = await response.json();
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

export function HelloWorld(): Response {
  return new Response(JSON.stringify({ message: "Hello, World!" }), {
    headers: { "Content-Type": "application/json" },
  });
}
