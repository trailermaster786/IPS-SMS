import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { invoiceId, studentId } = session.metadata || {};

      if (invoiceId && session.payment_intent) {
        const existingPayment = await prisma.payment.findFirst({
          where: { stripeSessionId: session.id },
        });

        if (!existingPayment) {
          const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
          });

          if (invoice) {
            const amountPaid = (session.amount_total || 0) / 100;
            const newTotalPaid = invoice.amountPaid + amountPaid;
            const newStatus = newTotalPaid >= invoice.amountDue ? "PAID" : "PARTIAL";

            await prisma.invoice.update({
              where: { id: invoiceId },
              data: {
                amountPaid: newTotalPaid,
                status: newStatus,
              },
            });

            // Find the actual parent of this student
            if (studentId) {
              const student = await prisma.student.findUnique({
                where: { id: studentId },
              });

              if (student) {
                const parentStudent = await prisma.parentStudent.findFirst({
                  where: { studentId: student.id },
                });

                if (parentStudent) {
                  await prisma.payment.create({
                    data: {
                      invoiceId,
                      parentId: parentStudent.parentId,
                      amount: amountPaid,
                      method: "stripe",
                      stripeSessionId: session.id,
                      status: "succeeded",
                    },
                  });
                }
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
