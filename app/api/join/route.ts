import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const TO_EMAIL = process.env.CONTACT_EMAIL ?? 'tcobb@hey.com';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, company, website, reason, message, newsletter } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not set');
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 503 });
    }

    const resend = new Resend(apiKey);

    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      company ? `Company: ${company}` : null,
      website ? `Website/LinkedIn: ${website}` : null,
      reason ? `Reason: ${reason}` : null,
      message ? `\nMessage:\n${message}` : null,
      `Newsletter: ${newsletter ? 'Yes' : 'No'}`,
    ]
      .filter(Boolean)
      .join('\n');

    const { error } = await resend.emails.send({
      from: 'General Purpose <onboarding@resend.dev>',
      to: [TO_EMAIL],
      replyTo: email,
      subject: `New message from ${name}`,
      text,
    });

    if (error) {
      console.error('Resend error', error);
      return NextResponse.json({ error: 'Failed to send email.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Join API error', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
