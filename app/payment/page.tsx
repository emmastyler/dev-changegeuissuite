import { Suspense } from "react";
import PaymentCheckout from "./PaymentCheckout";

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "var(--sage)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 14, color: "var(--text-3)" }}>
            Loading checkout…
          </div>
        </div>
      }
    >
      <PaymentCheckout />
    </Suspense>
  );
}
