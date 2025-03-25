export async function GET() {
    const response = await fetch("http://localhost:8000/canvas");
    const json = await response.json();
    return Response.json(json);
}