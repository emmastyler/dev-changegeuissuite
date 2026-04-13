const PAYSTACK_BASE = "https://api.paystack.co";

function paystackHeaders() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

export interface InitializePaystackParams {
  userId: string;
  email: string;
  plan: "individual" | "team";
  teamSize?: number;
  teamId?: string;
  teamName?: string;
  organization?: string;
  isRetake?: boolean;
  callbackUrl: string;
}

export interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializePaystackTransaction(
  params: InitializePaystackParams,
) {
  const priceNGN = 39000; // ₦39,000 per person
  const quantity = params.plan === "team" ? (params.teamSize ?? 1) : 1;
  const amountKobo = priceNGN * quantity * 100;

  const reference = `cgv1_${params.userId}_${Date.now()}`;

  const body = {
    email: params.email,
    amount: amountKobo,
    currency: "NGN",
    reference,
    callback_url: params.callbackUrl,
    metadata: {
      userId: params.userId,
      plan: params.plan,
      teamSize: quantity,
      teamId: params.teamId ?? "",
      teamName: params.teamName ?? "",
      organization: params.organization ?? "",
      isRetake: String(params.isRetake ?? false),
      custom_fields: [
        { display_name: "Plan", variable_name: "plan", value: params.plan },
        {
          display_name: "Team Size",
          variable_name: "team_size",
          value: String(quantity),
        },
      ],
    },
  };

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Paystack initialize failed: ${err}`);
  }

  return res.json() as Promise<PaystackInitResponse>;
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed" | "pending";
    reference: string;
    amount: number;
    currency: string;
    metadata: {
      userId: string;
      plan: string;
      teamSize: number;
      teamId: string;
      teamName?: string;
      organization?: string;
      isRetake?: string;
    };
    customer: { email: string };
    paid_at: string;
  };
}

export async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: paystackHeaders(),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Paystack verify failed: ${err}`);
  }

  return res.json() as Promise<PaystackVerifyResponse>;
}

export function verifyPaystackWebhookSignature(
  payload: string,
  signature: string,
): boolean {
  const crypto = require("crypto");
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET ?? "";
  const hash = crypto
    .createHmac("sha512", secret)
    .update(payload)
    .digest("hex");
  return hash === signature;
}
