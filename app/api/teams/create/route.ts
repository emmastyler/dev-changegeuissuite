import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(80),
  organization: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (s) =>
          s.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name, organization } = parsed.data;

  // ✅ Create team with status 'pending' – no payment check
  const { data: team, error } = await supabase
    .from("teams")
    .insert({
      name,
      organization: organization ?? null,
      owner_id: session.user.id,
      status: "pending",
    })
    .select("id, name, invite_code")
    .single();

  if (error || !team) {
    console.error("[teams/create]", error);
    return NextResponse.json(
      { error: "Could not create team" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    teamId: team.id,
    name: team.name,
    inviteCode: team.invite_code,
    requiresPayment: true,
  });
}
