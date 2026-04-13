import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

  const userId = session.user.id;
  const fresh = req.nextUrl.searchParams.get("fresh") === "true";

  // Check payment
  const { data: profile } = await supabase
    .from("profiles")
    .select("has_paid, onboarded")
    .eq("id", userId)
    .single();
  if (!profile?.has_paid) {
    return NextResponse.json({ error: "Payment required" }, { status: 402 });
  }

  // If already completed and not fresh, block (user must pay for retake)
  if (profile.onboarded === true && !fresh) {
    return NextResponse.json(
      {
        error:
          "You have already completed the assessment. Retake requires a new payment.",
        paymentRequired: true,
      },
      { status: 403 },
    );
  }

  // For fresh retake: always create new assessment, never resume
  if (fresh) {
    // Mark any existing in_progress as completed? No, we don't want to complete it.
    // Actually, when retaking, user has already completed the previous one.
    // So there should be no in_progress. But if there is (due to some bug), we just abandon it.
    await supabase
      .from("assessments")
      .update({ status: "abandoned" })
      .eq("user_id", userId)
      .eq("status", "in_progress");

    const { data: newAssessment, error } = await supabase
      .from("assessments")
      .insert({
        user_id: userId,
        version: "v1",
        status: "in_progress",
        last_question_index: 0,
      })
      .select("id")
      .single();

    if (error || !newAssessment) {
      console.error("[start] fresh creation error:", error);
      return NextResponse.json(
        { error: "Could not start assessment" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      assessmentId: newAssessment.id,
      resuming: false,
      lastQuestionIndex: 0,
      answeredResponses: {},
    });
  }

  // Normal flow: find existing in_progress assessment
  const { data: existing } = await supabase
    .from("assessments")
    .select("id, last_question_index")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data: responses } = await supabase
      .from("responses")
      .select("question_id, value")
      .eq("assessment_id", existing.id);

    const answeredMap: Record<string, number> = {};
    for (const r of responses ?? []) answeredMap[r.question_id] = r.value;
    const resumeIndex = existing.last_question_index ?? 0;

    return NextResponse.json({
      assessmentId: existing.id,
      resuming: true,
      lastQuestionIndex: resumeIndex,
      answeredResponses: answeredMap,
    });
  }

  // No in_progress and not fresh – create new assessment (first time after payment)
  const { data: newAssessment, error } = await supabase
    .from("assessments")
    .insert({
      user_id: userId,
      version: "v1",
      status: "in_progress",
      last_question_index: 0,
    })
    .select("id")
    .single();

  if (error || !newAssessment) {
    console.error("[start] creation error:", error);
    return NextResponse.json(
      { error: "Could not start assessment" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    assessmentId: newAssessment.id,
    resuming: false,
    lastQuestionIndex: 0,
    answeredResponses: {},
  });
}
