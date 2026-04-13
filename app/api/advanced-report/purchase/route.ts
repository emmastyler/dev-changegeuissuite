import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripe = getStripe();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email!,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Change Genius™ Advanced Report",
            description:
              "Deeper ADAPTS breakdown, blind spot analysis, leadership growth plan",
          },
          unit_amount: 1500, // $15
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: session.user.id,
      type: "advanced_report",
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/results?report_purchased=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/results`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
