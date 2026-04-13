import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  assessmentId: z.string().uuid(),
  questionId: z.string().min(1),
  value: z.number().int().min(1).max(5),
  questionIndex: z.number().int().min(0).max(59),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { assessmentId, questionId, value, questionIndex } = parsed.data;

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

  // Verify assessment belongs to user and is in progress
  const { data: assessment, error: fetchError } = await supabase
    .from("assessments")
    .select("id, user_id, status")
    .eq("id", assessmentId)
    .eq("user_id", session.user.id)
    .single();

  if (fetchError || !assessment) {
    console.error("[answer] assessment fetch error:", fetchError);
    return NextResponse.json(
      { error: "Assessment not found" },
      { status: 404 },
    );
  }
  if (assessment.status !== "in_progress") {
    return NextResponse.json(
      { error: "Assessment already completed" },
      { status: 409 },
    );
  }

  // ✅ Upsert the answer
  const { error: responseError } = await supabase.from("responses").upsert(
    {
      assessment_id: assessmentId,
      question_id: questionId,
      value,
      answered_at: new Date().toISOString(),
    },
    { onConflict: "assessment_id,question_id" },
  );

  if (responseError) {
    console.error("[answer] upsert error:", responseError);
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 },
    );
  }

  // ✅ Update last_question_index to the index of the question just answered
  const { error: updateError } = await supabase
    .from("assessments")
    .update({ last_question_index: questionIndex })
    .eq("id", assessmentId);

  if (updateError) {
    console.error("[answer] update last_question_index error:", updateError);
    // Still return success because answer was saved, but log error
  } else {
    console.log(
      `[answer] Saved answer for q${questionIndex}, updated last_question_index to ${questionIndex}`,
    );
  }

  return NextResponse.json({ saved: true, questionIndex });
}
