"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type Status = "verifying" | "success" | "failed";

export default function PaymentSuccessInner() {
  const params = useSearchParams();
  const router = useRouter();
  const provider = params.get("provider");
  const reference = params.get("reference"); // Paystack
  const sessionId = params.get("session_id"); // Stripe
  const plan = params.get("plan");
  const teamId = params.get("teamId");
  const retake = params.get("retake") === "true";

  const [status, setStatus] = useState<Status>("verifying");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    void verify();
  }, []);

  async function verify() {
    if (provider === "paystack" && reference) {
      try {
        const res = await fetch(
          `/api/payment/verify?reference=${encodeURIComponent(reference)}`,
        );
        const data = (await res.json()) as { success?: boolean };
        if (data.success) {
          await getSupabase().auth.refreshSession();
          await waitForHasPaid();
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
      return;
    }

    if (
      provider === "stripe" &&
      sessionId &&
      sessionId !== "{CHECKOUT_SESSION_ID}"
    ) {
      try {
        const res = await fetch("/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = (await res.json()) as {
          confirmed?: boolean;
          paid?: boolean;
          error?: string;
        };
        if (data.confirmed && data.paid) {
          await getSupabase().auth.refreshSession();
          await waitForHasPaid();
          setStatus("success");
          return;
        }
      } catch {}
      await pollUntilPaid();
      return;
    }

    setStatus("failed");
  }

  async function waitForHasPaid(maxAttempts = 10, intervalMs = 1000) {
    const sb = getSupabase();
    for (let i = 0; i < maxAttempts; i++) {
      await sb.auth.refreshSession();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (user) {
        const { data: profile } = await sb
          .from("profiles")
          .select("has_paid")
          .eq("id", user.id)
          .single();
        if (profile?.has_paid === true) return true;
      }
      await sleep(intervalMs);
    }
    return false;
  }

  async function pollUntilPaid(maxAttempts = 8, intervalMs = 1500) {
    const sb = getSupabase();
    for (let i = 0; i < maxAttempts; i++) {
      setAttempt(i + 1);
      await sb.auth.refreshSession();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) {
        setStatus("failed");
        return;
      }
      const { data: profile } = await sb
        .from("profiles")
        .select("has_paid")
        .eq("id", user.id)
        .single();
      if (profile?.has_paid) {
        setStatus("success");
        return;
      }
      if (i < maxAttempts - 1) await sleep(intervalMs);
    }
    setStatus("success");
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  useEffect(() => {
    if (status === "success") {
      if (plan === "team" && teamId) {
        router.push(`/teams/${teamId}`);
      } else if (retake) {
        router.push("/assessment/take?retake=true");
      } else {
        router.push("/assessment");
      }
    }
  }, [status, plan, teamId, retake, router]);

  if (status === "verifying")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--sage)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--navy)",
              marginBottom: 6,
            }}
          >
            Confirming your payment…
          </div>
          <div
            style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 16 }}
          >
            {attempt > 1
              ? `Checking… (${attempt})`
              : "This takes just a moment."}
          </div>
          <div
            style={{
              width: 200,
              height: 3,
              background: "var(--border)",
              borderRadius: 2,
              overflow: "hidden",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "var(--blue)",
                borderRadius: 2,
                animation: "loadbar 1.5s ease infinite",
                width: "40%",
              }}
            />
          </div>
        </div>
        <style>{`@keyframes loadbar{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
      </div>
    );

  if (status === "failed")
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--sage)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "var(--radius)",
            padding: "52px 48px",
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(10,37,64,.08)",
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 20 }}>❌</div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "var(--navy)",
              marginBottom: 10,
            }}
          >
            Payment could not be confirmed
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-3)",
              lineHeight: 1.65,
              marginBottom: 28,
            }}
          >
            Your payment may have gone through but we couldn&apos;t confirm it
            automatically. Contact support with your reference and we&apos;ll
            resolve it within the hour.
          </p>
          {reference && (
            <div
              style={{
                background: "var(--off)",
                borderRadius: 8,
                padding: "10px 16px",
                marginBottom: 24,
                fontSize: 13,
                fontFamily: "monospace",
                color: "var(--text-2)",
              }}
            >
              Ref: {reference}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/payment"
              style={{
                background: "var(--blue)",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                padding: "11px 24px",
                borderRadius: "100px",
                textDecoration: "none",
              }}
            >
              Try Again
            </Link>
            <a
              href="mailto:support@changegeniussuite.com"
              style={{
                background: "white",
                color: "var(--navy)",
                fontSize: 14,
                fontWeight: 700,
                padding: "11px 24px",
                borderRadius: "100px",
                textDecoration: "none",
                border: "1.5px solid var(--border)",
              }}
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );

  // Brief success message while redirect happens
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--sage)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--navy)" }}>
          Payment successful!
        </h2>
        <p style={{ marginTop: 8, color: "var(--text-3)" }}>
          Redirecting you...
        </p>
      </div>
    </div>
  );
}
