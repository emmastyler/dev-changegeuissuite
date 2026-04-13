import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

interface PaystackChargeEvent {
  event: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    customer: { email: string };
    metadata: {
      userId: string;
      plan: string;
      teamSize: number;
      teamId: string;
      teamName?: string;
      organization?: string;
      isRetake?: string;
    };
  };
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("x-paystack-signature");
  if (!sig)
    return NextResponse.json({ error: "No signature" }, { status: 400 });

  const rawBody = await req.text();
  if (!verifyPaystackWebhookSignature(rawBody, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: PaystackChargeEvent;
  try {
    payload = JSON.parse(rawBody) as PaystackChargeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.event === "charge.success") {
    const { data } = payload;
    const { userId, plan, teamId, teamName, organization, isRetake } =
      data.metadata ?? {};

    if (!userId) {
      console.error("[paystack-webhook] Missing userId in metadata");
      return NextResponse.json({ received: true });
    }

    try {
      const supabase = getServiceClient();

      await supabase.from("payments").upsert(
        {
          user_id: userId,
          provider: "paystack",
          provider_reference: data.reference,
          plan: plan ?? "individual",
          team_id: teamId || null,
          amount_minor: data.amount,
          currency: data.currency,
          status: "completed",
          paid_at: data.paid_at,
        },
        { onConflict: "provider_reference" },
      );

      // If team purchase, create team
      if (plan === "team" && teamName) {
        const { data: team, error: teamError } = await supabase
          .from("teams")
          .insert({
            name: teamName,
            organization: organization || null,
            owner_id: userId,
          })
          .select("id, invite_code")
          .single();

        if (!teamError && team) {
          await supabase.from("team_members").insert({
            team_id: team.id,
            user_id: userId,
            status: "completed",
          });
          // After creating team or if teamId exists
          await supabase
            .from("teams")
            .update({ status: "active" })
            .eq("id", teamId);
          await supabase
            .from("profiles")
            .update({ role: "team_owner" })
            .eq("id", userId);
          console.log(
            `[paystack-webhook] Team created: ${team.id} for user ${userId}`,
          );
        } else {
          console.error("[paystack-webhook] Failed to create team:", teamError);
        }
      }

      // If individual retake, reset onboarded
      if (plan === "individual" && isRetake === "true") {
        const { error: resetError } = await supabase
          .from("profiles")
          .update({ onboarded: false })
          .eq("id", userId);
        if (resetError) {
          console.error(
            "[paystack-webhook] Failed to reset onboarded:",
            resetError,
          );
        } else {
          console.log(
            `[paystack-webhook] Retake – reset onboarded for user ${userId}`,
          );
        }
      } else if (plan === "individual") {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ has_paid: true })
          .eq("id", userId);
        if (updateError) {
          console.error(
            "[paystack-webhook] Failed to update has_paid:",
            updateError,
          );
        } else {
          console.log(`[paystack-webhook] ✓ has_paid set for user ${userId}`);
        }
      }
    } catch (err) {
      console.error("[paystack-webhook] DB error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
