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

  const { teamId } = await req.json();
  if (!teamId)
    return NextResponse.json({ error: "Missing teamId" }, { status: 400 });

  // Verify ownership
  const { data: team } = await supabase
    .from("teams")
    .select("id, name")
    .eq("id", teamId)
    .eq("owner_id", session.user.id)
    .single();

  if (!team)
    return NextResponse.json(
      { error: "Team not found or not owner" },
      { status: 404 },
    );

  const stripe = getStripe();
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email!,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Team Diagnostic Report – ${team.name}`,
            description:
              "Role distribution, friction points, decision bottlenecks, execution risks, 90-day roadmap",
          },
          unit_amount: 9900, // $99
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: session.user.id,
      teamId,
      type: "team_report",
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/teams/${teamId}?report_purchased=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/teams/${teamId}`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
