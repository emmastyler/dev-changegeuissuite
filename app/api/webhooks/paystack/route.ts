import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhookSignature } from "@/lib/paystack";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

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
    };
  };
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("x-paystack-signature");
  if (!sig)
    return NextResponse.json({ error: "No signature" }, { status: 400 });

  const rawBody = await req.text();

  if (!verifyPaystackWebhookSignature(rawBody, sig)) {
    console.error("[paystack-webhook] Signature verification failed");
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
    const { userId, plan, teamId } = data.metadata ?? {};

    if (!userId) {
      console.error("[paystack-webhook] Missing userId in metadata");
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: (toSet) =>
              toSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              ),
          },
        },
      );

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

      await supabase
        .from("profiles")
        .update({ has_paid: true })
        .eq("id", userId);

      console.log(`[paystack-webhook] Payment recorded for user ${userId}`);
    } catch (err) {
      console.error("[paystack-webhook] DB write failed:", err);
    }
  }

  return NextResponse.json({ received: true });
}
