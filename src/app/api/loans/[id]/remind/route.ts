import { NextRequest, NextResponse } from 'next/server';
import { getLoanById, findUserById } from '@/lib/db';
import { getAuthSessionFromRequest } from '@/lib/auth';
import { sendSmtpEmail, renderRepaymentReminderEmail } from '@/lib/email';
import { remindLoanSchema } from '@/lib/validations';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const loan = await getLoanById(id);

    if (!loan) {
      return NextResponse.json(
        { success: false, error: 'Loan entry not found.' },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = remindLoanSchema.safeParse(body);

    const session = getAuthSessionFromRequest(req);
    const lenderName = session?.name || 'Account Owner';

    const friendEmail = parsed.success ? parsed.data.friend_email : undefined;
    const customNote = (parsed.success && parsed.data.custom_note) || loan.notes;

    const formattedAmount = `₹${loan.amount.toLocaleString('en-IN')}`;
    const cleanPhone = loan.phone.replace(/[^\d]/g, '');

    // Formulate polite WhatsApp copy (Protocol P-03 Zero Awkwardness)
    const waText = encodeURIComponent(
      `Hi ${loan.friend_name}! Hope you're doing well. Just a polite heads up about the ${formattedAmount} balance for "${loan.notes || 'our shared expense'}" scheduled for ${loan.due_date}. Whenever you get a moment, please check and settle up: https://credsetutechnologiesprivatelimited.vercel.app`
    );
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

    let emailSent = false;
    let emailMessageId: string | undefined;

    // If recipient email is provided or available, dispatch real SMTP reminder
    if (friendEmail) {
      const emailResult = await sendSmtpEmail({
        to: friendEmail,
        subject: `Friendly expense reminder from ${lenderName} (${formattedAmount})`,
        html: renderRepaymentReminderEmail({
          friendName: loan.friend_name,
          lenderName,
          amount: loan.amount,
          dueDate: loan.due_date,
          notes: customNote,
          payUrl: 'https://credsetutechnologiesprivatelimited.vercel.app',
          appName: 'MiniLedger',
        }),
      });
      emailSent = emailResult.delivered;
      emailMessageId = emailResult.messageId;
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? `Polite reminder email dispatched to ${friendEmail} and WhatsApp link generated.`
        : `WhatsApp reminder link generated for ${loan.friend_name}.`,
      friend_name: loan.friend_name,
      amount: loan.amount,
      whatsapp_url: whatsappUrl,
      email_dispatched: emailSent,
      email_message_id: emailMessageId,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Server error sending reminder';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
