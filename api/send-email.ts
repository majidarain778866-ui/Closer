// Vercel Serverless Function to dispatch luxury HTML emails via Resend or Brevo directly into Gmail.
// Zero extra npm dependencies needed.

export default async function handler(req: any, res: any) {
  // CORS support if needed
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { to, subject, html } = req.body || {};
    const targetEmail = to || 'majidarain778866@gmail.com';
    const emailSubject = subject || '🌹 Closer Alert: New Connection Experience Completed!';

    const resendApiKey = process.env.RESEND_API_KEY;
    const brevoApiKey = process.env.BREVO_API_KEY;

    // 1. Try Resend if RESEND_API_KEY is available (Free tier: 3,000 emails/month)
    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Closer VIP <onboarding@resend.dev>',
          to: [targetEmail],
          subject: emailSubject,
          html: html,
        }),
      });

      if (resendRes.ok) {
        const data = await resendRes.json();
        return res.status(200).json({ success: true, provider: 'resend', id: data.id });
      } else {
        const errText = await resendRes.text();
        console.warn('Resend dispatch error:', errText);
      }
    }

    // 2. Try Brevo if BREVO_API_KEY is available (Free tier: 300 emails/day)
    if (brevoApiKey) {
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'Closer VIP', email: 'notifications@closer.app' },
          to: [{ email: targetEmail }],
          subject: emailSubject,
          htmlContent: html,
        }),
      });

      if (brevoRes.ok) {
        return res.status(200).json({ success: true, provider: 'brevo' });
      }
    }

    return res.status(200).json({
      success: false,
      message: 'No email API key configured on Vercel yet. Falling back to client relay.',
    });
  } catch (error: any) {
    console.error('API Send-Email Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
