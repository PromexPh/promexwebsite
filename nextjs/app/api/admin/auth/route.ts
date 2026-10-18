export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  if (!adminPassword) {
    return Response.json({ error: 'Admin password not configured' }, { status: 500 });
  }
  if (password === adminPassword) {
    return Response.json({ success: true });
  }
  return Response.json({ error: 'Invalid password' }, { status: 401 });
}
