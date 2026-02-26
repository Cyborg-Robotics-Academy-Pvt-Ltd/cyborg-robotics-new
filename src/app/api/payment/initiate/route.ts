import { NextResponse } from "next/server";

type BankResponse = {
  paymentUrl?: string;
  transactionReference?: string;
  orderId?: string;
  message?: string;
};

const pickString = (
  source: Record<string, unknown>,
  keys: string[]
): string | undefined => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
};

export async function POST(request: Request) {
  const bankApiUrl = process.env.BANK_API_URL;
  if (!bankApiUrl) {
    return NextResponse.json(
      { success: false, message: "BANK_API_URL is not configured." },
      { status: 500 }
    );
  }

  const apiKey = process.env.BANK_API_KEY;
  const apiKeyHeader = process.env.BANK_API_KEY_HEADER || "x-api-key";
  const authToken = process.env.BANK_API_BEARER_TOKEN;

  try {
    const body = await request.json();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (apiKey) headers[apiKeyHeader] = apiKey;
    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const payload = {
      amount: body.amount,
      currency: body.currency || "INR",
      courseKey: body.courseKey,
      courseName: body.courseName,
      paymentMethod: body.paymentMethod,
      customer: {
        name: body.studentName,
        email: body.parentEmail,
        phone: body.parentPhone,
      },
      metadata: {
        source: "registration_form",
      },
    };

    const response = await fetch(bankApiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let data: Record<string, unknown> = {};
    try {
      data = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message:
            pickString(data, ["message", "error", "detail"]) ||
            `Bank API error (${response.status}).`,
        },
        { status: response.status }
      );
    }

    const result: BankResponse = {
      paymentUrl: pickString(data, [
        "paymentUrl",
        "payment_url",
        "redirectUrl",
        "redirect_url",
        "checkoutUrl",
        "url",
      ]),
      transactionReference: pickString(data, [
        "transactionReference",
        "transaction_reference",
        "reference",
        "txnId",
        "txn_id",
        "transactionId",
        "transaction_id",
      ]),
      orderId: pickString(data, ["orderId", "order_id", "paymentId", "payment_id"]),
      message: pickString(data, ["message"]),
    };

    return NextResponse.json({
      success: true,
      ...result,
      raw: data,
    });
  } catch (error) {
    console.error("Bank payment initiation failed:", error);
    return NextResponse.json(
      { success: false, message: "Unable to initiate bank payment." },
      { status: 500 }
    );
  }
}
