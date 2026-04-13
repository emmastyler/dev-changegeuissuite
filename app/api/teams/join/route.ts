import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z
  .object({
    token: z.string().optional(),
    code: z.string().optional(),
  })
  .refine((d) => d.token || d.code, { message: "Provide token or code" });

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

  const { token, code } = parsed.data;
  let teamId: string;

  if (token) {
    const { data: invite } = await supabase
      .from("invites")
      .select("id, team_id, email, status")
      .eq("token", token)
      .single();
    if (!invite)
      return NextResponse.json(
        { error: "Invalid invite link" },
        { status: 404 },
      );
    if (invite.status === "accepted")
      return NextResponse.json(
        { error: "Invite already used" },
        { status: 409 },
      );
    teamId = invite.team_id;
    await supabase
      .from("invites")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", invite.id);
  } else {
    const { data: team } = await supabase
      .from("teams")
      .select("id")
      .eq("invite_code", code!.toUpperCase())
      .single();
    if (!team)
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 },
      );
    teamId = team.id;
  }

  const { data: existing } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", session.user.id)
    .single();

  if (existing) {
    return NextResponse.json({ teamId, alreadyMember: true });
  }

  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: session.user.id,
    status: "joined",
  });

  if (memberError) {
    console.error("[teams/join] member error:", memberError);
    return NextResponse.json({ error: "Could not join team" }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("has_paid")
    .eq("id", session.user.id)
    .single();
  if (!profile?.has_paid) {
    await supabase
      .from("profiles")
      .update({ has_paid: true })
      .eq("id", session.user.id);
  }

  await supabase
    .from("profiles")
    .update({ role: "team_member" })
    .eq("id", session.user.id)
    .in("role", ["individual", null]);

  return NextResponse.json({ teamId, joined: true });
}
