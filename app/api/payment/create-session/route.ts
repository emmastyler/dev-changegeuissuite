import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getProviderForCountry, getCountryFromHeaders } from "@/lib/payment";
import { createStripeCheckoutSession } from "@/lib/stripe";
import { initializePaystackTransaction } from "@/lib/paystack";

export async function POST(req: NextRequest) {
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

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      plan: "individual" | "team";
      teamSize?: number;
      teamId?: string;
      provider?: "stripe" | "paystack";
      countryCode?: string;
      teamName?: string;
      organization?: string;
      retake?: boolean;
    };

    const {
      plan,
      teamSize = 1,
      teamId,
      countryCode,
      teamName,
      organization,
      retake,
    } = body;

    if (!["individual", "team"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Check if user is retaking (individual plan only)
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarded")
      .eq("id", session.user.id)
      .single();
    const isRetake =
      plan === "individual" && (retake === true || profile?.onboarded === true);

    const headerCountry = getCountryFromHeaders(req.headers);
    const resolvedCountry = countryCode ?? headerCountry;
    const provider = body.provider ?? getProviderForCountry(resolvedCountry);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // ✅ Add retake flag to success URL
    const successUrl = `${appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&provider=${provider}&retake=${isRetake}`;
    const cancelUrl = `${appUrl}/payment/cancelled`;

    if (provider === "stripe") {
      const stripeSession = await createStripeCheckoutSession({
        userId: session.user.id,
        userEmail: session.user.email!,
        plan,
        teamSize,
        teamId,
        teamName,
        organization,
        isRetake,
        successUrl,
        cancelUrl,
      });

      return NextResponse.json({
        provider: "stripe",
        url: stripeSession.url,
        sessionId: stripeSession.id,
      });
    }

    // Paystack
    const paystackRes = await initializePaystackTransaction({
      userId: session.user.id,
      email: session.user.email!,
      plan,
      teamSize,
      teamId,
      teamName,
      organization,
      isRetake,
      callbackUrl: `${appUrl}/payment/success?provider=paystack&retake=${isRetake}`,
    });

    if (!paystackRes.status) {
      return NextResponse.json({ error: paystackRes.message }, { status: 500 });
    }

    return NextResponse.json({
      provider: "paystack",
      url: paystackRes.data.authorization_url,
      reference: paystackRes.data.reference,
    });
  } catch (err) {
    console.error("[payment/create-session]", err);
    return NextResponse.json(
      { error: "Payment session creation failed" },
      { status: 500 },
    );
  }
}
