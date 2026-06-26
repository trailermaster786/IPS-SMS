import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-06-24.dahlia",
  });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "PARENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stripe = getStripe();
    const { invoiceId } = await request.json();

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: true,
        feeStructure: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const amountDue = invoice.amountDue - invoice.amountPaid;

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: {
        invoiceId: invoice.id,
        studentId: invoice.studentId,
      },
      line_items: [
        {
          price_data: {
            currency: process.env.CURRENCY?.toLowerCase() || "usd",
            product_data: {
              name: `${invoice.feeStructure.name} - ${invoice.student.admissionNumber}`,
            },
            unit_amount: Math.round(amountDue * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/parent/fees?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/parent/fees?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Create checkout session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
