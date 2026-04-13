import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  console.log("[start] Called");
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

  const userId = session.user.id;
  console.log("[start] User ID:", userId);

  // Check payment
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_paid")
    .eq("id", userId)
    .single();
  if (!profile?.has_paid) {
    return NextResponse.json({ error: "Payment required" }, { status: 402 });
  }

  // Check if user already has a COMPLETED assessment
  const { data: completed } = await supabase
    .from("assessments")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .maybeSingle();

  if (completed) {
    console.log("[start] Found completed assessment, blocking retake");
    return NextResponse.json(
      {
        error:
          "You have already taken the assessment. Retake requires a new payment.",
        canRetake: false,
        paymentRequired: true,
      },
      { status: 403 },
    );
  }

  // Look for an existing IN_PROGRESS assessment
  let { data: existing, error: fetchError } = await supabase
    .from("assessments")
    .select("id, last_question_index, status")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  console.log("[start] Existing assessment:", existing);

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("[start] Fetch error:", fetchError);
  }

  if (existing) {
    // Fetch all saved answers
    const { data: responses } = await supabase
      .from("responses")
      .select("question_id, value")
      .eq("assessment_id", existing.id);

    const answeredMap: Record<string, number> = {};
    for (const r of responses ?? []) answeredMap[r.question_id] = r.value;

    // Use the stored last_question_index (which is the index of the last answered question)
    let resumeIndex = existing.last_question_index ?? 0;
    // If for some reason last_question_index is -1, set to 0
    if (resumeIndex < 0) resumeIndex = 0;
    // Ensure we don't exceed total questions
    if (resumeIndex >= 60) resumeIndex = 59;

    console.log("[start] Resuming at index:", resumeIndex);

    return NextResponse.json({
      assessmentId: existing.id,
      resuming: true,
      lastQuestionIndex: resumeIndex,
      answeredResponses: answeredMap,
    });
  }

  // No in-progress assessment – create a new one
  console.log("[start] Creating new assessment");
  const { data: newAssessment, error: createError } = await supabase
    .from("assessments")
    .insert({
      user_id: userId,
      version: "v1",
      status: "in_progress",
      last_question_index: 0,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (createError || !newAssessment) {
    console.error("[start] Creation error:", createError);
    return NextResponse.json(
      { error: "Could not start assessment" },
      { status: 500 },
    );
  }

  console.log("[start] New assessment created:", newAssessment.id);

  return NextResponse.json({
    assessmentId: newAssessment.id,
    resuming: false,
    lastQuestionIndex: 0,
    answeredResponses: {},
  });
}
