import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
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

  // Fetch completed assessments with their scores using a proper join
  const { data: assessments, error } = await supabase
    .from("assessments")
    .select(
      `
      id,
      completed_at,
      scores (
        derived
      )
    `,
    )
    .eq("user_id", session.user.id)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("[history] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }

  // Transform the data: scores is an array, take first element
  const formatted = (assessments ?? []).map((a) => ({
    id: a.id,
    completed_at: a.completed_at,
    derived: (a.scores as any)?.[0]?.derived || {},
  }));

  return NextResponse.json({ assessments: formatted });
}
