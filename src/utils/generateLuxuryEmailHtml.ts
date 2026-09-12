import { ExperienceResponse } from '../types';

/**
 * Generates an ultra-luxurious, responsive HTML email with modern UI colors,
 * elegant typography, card layouts, glowing gradients, and visual graphics.
 * Fully optimized for Gmail (desktop & mobile), Apple Mail, and Outlook.
 */
export function generateLuxuryEmailHtml(
  response: ExperienceResponse,
  senderEmail: string = 'majidarain778866@gmail.com',
  experienceTitle: string = 'Private Connection Experience'
): string {
  const recipientName = response.recipientName || 'Your Match';
  const lovely = response.recipientProfile?.lovelyName;
  const nickname = response.recipientProfile?.nickname;
  const theme = (response.recipientProfile?.selectedTheme || response.theme || 'Midnight Rose').toUpperCase();
  const vibe = response.vibe || 'Romantic & Deep';

  // Key answers
  const foodAns = response.answers['q8-food']?.value || response.answers['q2-food']?.value;
  const placeAns = response.answers['q6-meeting-place']?.value || response.answers['q6-place']?.value;
  const timeAns = response.answers['q7-meeting-time']?.value || response.answers['q7-time']?.value;
  const attractionAns = response.answers['q4-personal-interest']?.value || response.answers['q4-attention']?.value;
  const finalAns = response.answers['q9-final']?.value || response.answers['q8-final']?.value || 'YES, definitely ❤️';

  const foodStr = Array.isArray(foodAns) ? foodAns.join(', ') : (foodAns as string) || 'Surprise treat 😋';
  const placeStr = Array.isArray(placeAns) ? placeAns.join(', ') : (placeAns as string) || 'Cozy rooftop or cafe ☕';
  const timeStr = Array.isArray(timeAns) ? timeAns.join(', ') : (timeAns as string) || 'Sunset / Twilight 🌇';
  const attractionStr = Array.isArray(attractionAns) ? attractionAns.join(', ') : (attractionAns as string) || 'Your eyes & energy 👀✨';
  const finalStr = Array.isArray(finalAns) ? finalAns.join(', ') : (finalAns as string);

  // Dodges count
  const totalDodges = Object.values(response.answers).reduce(
    (acc, a) => acc + (a.evasionCount || 0),
    0
  );

  // Duration
  let durationText = 'Completed in ~3 mins';
  if (response.startedAt && response.completedAt) {
    const diffSecs = Math.max(
      1,
      Math.round((new Date(response.completedAt).getTime() - new Date(response.startedAt).getTime()) / 1000)
    );
    const mins = Math.floor(diffSecs / 60);
    const secs = diffSecs % 60;
    durationText = mins > 0 ? `${mins} min ${secs} sec` : `${secs} seconds`;
  }

  const completedDate = new Date(response.completedAt).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  // Personality snapshot
  const snapshot = response.personalitySnapshot;
  const archetypeTitle = snapshot?.title || 'The Magnetic Dreamer ✨';
  const romanticSummary =
    snapshot?.romanticSummary ||
    'A genuine, warm connection with natural chemistry, playful banter, and effortless emotional safety.';

  // Question cards HTML
  const questionCardsHtml = Object.values(response.answers)
    .map((ans, idx) => {
      const valStr = Array.isArray(ans.value) ? ans.value.join(', ') : ans.value;
      const dodgedBadge =
        ans.evasionCount && ans.evasionCount > 0
          ? `<div style="display:inline-block; margin-top:6px; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.3); color:#fda4af; font-size:11px; padding:3px 8px; border-radius:12px; font-weight:600;">
              😏 Dodged NO ${ans.evasionCount}x before saying YES
             </div>`
          : '';

      return `
        <div style="background:#131122; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px 16px; margin-bottom:10px;">
          <div style="font-size:11px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:4px;">
            Question ${idx + 1}
          </div>
          <div style="font-size:13px; color:#e2e8f0; font-weight:500; margin-bottom:8px; line-height:1.4;">
            ${ans.questionText}
          </div>
          <div style="font-size:14px; color:#fb7185; font-weight:700; background:rgba(244,63,94,0.08); padding:8px 12px; border-radius:8px; border-left:3px solid #f43f5e;">
            ${valStr}
          </div>
          ${dodgedBadge}
        </div>
      `;
    })
    .join('');

  // Private answers HTML
  let privateAnswersHtml = '';
  if (response.privateAnswers && Object.keys(response.privateAnswers).length > 0) {
    const pItems = Object.values(response.privateAnswers)
      .map((ans, pIdx) => {
        const val = Array.isArray(ans.value) ? ans.value.join(', ') : ans.value;
        return `
          <div style="background:#181028; border:1px solid rgba(168,85,247,0.3); border-radius:12px; padding:12px 14px; margin-bottom:8px;">
            <div style="font-size:11px; color:#c084fc; font-weight:600;">🔒 Secret Thought #${pIdx + 1}</div>
            <div style="font-size:12px; color:#e2e8f0; margin:4px 0;">${ans.questionText}</div>
            <div style="font-size:13px; color:#f472b6; font-weight:700;">${val}</div>
          </div>
        `;
      })
      .join('');

    privateAnswersHtml = `
      <div style="margin-top:20px; background:#11091d; border:1px solid rgba(168,85,247,0.3); border-radius:16px; padding:16px;">
        <div style="font-size:13px; font-weight:700; color:#e9d5ff; margin-bottom:12px; display:flex; align-items:center;">
          🔒 Private &amp; Secret Confessions
        </div>
        ${pItems}
      </div>
    `;
  }

  // Traits badges
  let traitsHtml = '';
  if (snapshot?.traits && snapshot.traits.length > 0) {
    traitsHtml = snapshot.traits
      .map(
        (t) => `
        <div style="display:inline-block; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:6px 10px; margin:4px 4px 4px 0; font-size:11px; color:#f1f5f9;">
          <strong>${t.icon} ${t.label}:</strong> <span style="color:#cbd5e1;">${t.note}</span>
        </div>
      `
      )
      .join('');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🌹 Closer VIP Connection Report</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #06040a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f8fafc;
      -webkit-font-smoothing: antialiased;
    }
    table { border-collapse: collapse; }
    img { border: 0; }
  </style>
</head>
<body style="margin:0; padding:24px 12px; background-color:#06040a;">
  <center>
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:620px; background:#0c0915; border:1px solid rgba(244,63,94,0.25); border-radius:24px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.8);">
      
      <!-- HEADER BANNER -->
      <tr>
        <td style="padding:32px 28px 24px 28px; background:linear-gradient(135deg, #2b0b1e 0%, #4a0f2e 50%, #170720 100%); text-align:center; border-bottom:1px solid rgba(244,63,94,0.2);">
          <div style="display:inline-block; padding:6px 14px; background:rgba(244,63,94,0.2); border:1px solid rgba(244,63,94,0.4); border-radius:20px; font-size:11px; font-weight:700; color:#fda4af; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">
            🌹 VIP CONNECTION REPORT • 100% MATCH
          </div>
          <h1 style="margin:0; font-size:28px; font-weight:800; color:#ffffff; letter-spacing:-0.5px; font-family:Georgia, serif;">
            Closer
          </h1>
          <p style="margin:6px 0 0 0; font-size:13px; color:rgba(255,255,255,0.7); font-style:italic;">
            "Every honest answer brings us a little closer."
          </p>
        </td>
      </tr>

      <!-- RECIPIENT HERO CARD -->
      <tr>
        <td style="padding:24px 24px 12px 24px;">
          <div style="background:linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(168,85,247,0.08) 100%); border:1px solid rgba(244,63,94,0.35); border-radius:18px; padding:20px; text-align:left;">
            <table width="100%">
              <tr>
                <td>
                  <div style="font-size:11px; font-weight:700; color:#f43f5e; text-transform:uppercase; letter-spacing:0.8px;">
                    👑 Recipient Profile
                  </div>
                  <div style="font-size:24px; font-weight:800; color:#ffffff; margin-top:2px;">
                    ${recipientName} ${lovely ? `<span style="font-size:16px; color:#fda4af; font-weight:600;">("${lovely}")</span>` : ''}
                  </div>
                  <div style="margin-top:8px;">
                    <span style="display:inline-block; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); padding:4px 10px; border-radius:12px; font-size:11px; color:#e2e8f0; margin-right:6px;">
                      ✨ Vibe: <strong style="color:#fb7185;">${vibe}</strong>
                    </span>
                    <span style="display:inline-block; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); padding:4px 10px; border-radius:12px; font-size:11px; color:#e2e8f0;">
                      🎨 Theme: <strong style="color:#c084fc;">${theme}</strong>
                    </span>
                  </div>
                </td>
                <td align="right" valign="top">
                  <div style="background:#10b981; color:#ffffff; font-size:11px; font-weight:800; padding:6px 12px; border-radius:14px; box-shadow:0 0 15px rgba(16,185,129,0.4); text-align:center;">
                    ✓ COMPLETED
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>

      <!-- DATE & CHEMISTRY BLUEPRINT GRID -->
      <tr>
        <td style="padding:12px 24px;">
          <div style="font-size:13px; font-weight:700; color:#cbd5e1; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">
            🥂 Date &amp; Chemistry Blueprint
          </div>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <!-- FOOD CARD -->
              <td width="48%" style="vertical-align:top; padding-bottom:12px;">
                <div style="background:#141124; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px;">
                  <div style="font-size:11px; color:#94a3b8; font-weight:600;">🍕 Food &amp; Drinks Craving</div>
                  <div style="font-size:14px; font-weight:700; color:#f8fafc; margin-top:4px;">
                    ${foodStr}
                  </div>
                </div>
              </td>
              <td width="4%"></td>
              <!-- SPOT CARD -->
              <td width="48%" style="vertical-align:top; padding-bottom:12px;">
                <div style="background:#141124; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px;">
                  <div style="font-size:11px; color:#94a3b8; font-weight:600;">📍 Dream Meeting Spot</div>
                  <div style="font-size:14px; font-weight:700; color:#f8fafc; margin-top:4px;">
                    ${placeStr}
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <!-- TIMING CARD -->
              <td width="48%" style="vertical-align:top; padding-bottom:12px;">
                <div style="background:#141124; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px;">
                  <div style="font-size:11px; color:#94a3b8; font-weight:600;">🌇 Ideal Time</div>
                  <div style="font-size:14px; font-weight:700; color:#f8fafc; margin-top:4px;">
                    ${timeStr}
                  </div>
                </div>
              </td>
              <td width="4%"></td>
              <!-- ATTRACTION CARD -->
              <td width="48%" style="vertical-align:top; padding-bottom:12px;">
                <div style="background:#141124; border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px;">
                  <div style="font-size:11px; color:#94a3b8; font-weight:600;">👀 First Attraction</div>
                  <div style="font-size:14px; font-weight:700; color:#f8fafc; margin-top:4px;">
                    ${attractionStr}
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <!-- FINAL VERDICT BANNER -->
          <div style="background:linear-gradient(135deg, rgba(244,63,94,0.2) 0%, rgba(219,39,119,0.25) 100%); border:1px solid #f43f5e; border-radius:14px; padding:16px; margin-top:4px; text-align:center;">
            <div style="font-size:11px; color:#fda4af; font-weight:700; text-transform:uppercase; letter-spacing:1px;">
              ❤️ The Big Final Question
            </div>
            <div style="font-size:18px; font-weight:800; color:#ffffff; margin-top:4px;">
              ${finalStr}
            </div>
          </div>

          ${
            totalDodges > 0
              ? `
          <!-- PLAYFUL EVASION BANNER -->
          <div style="background:rgba(251,113,133,0.1); border:1px dashed rgba(251,113,133,0.4); border-radius:12px; padding:12px; margin-top:10px; text-align:center;">
            <span style="font-size:12px; color:#fda4af; font-weight:600;">
              😏 <strong>Playful Resistance:</strong> Tried dodging 'NO' ${totalDodges} time(s) before smiling and saying YES! ❤️
            </span>
          </div>
          `
              : ''
          }
        </td>
      </tr>

      <!-- VIBE & PERSONALITY SYNTHESIS -->
      <tr>
        <td style="padding:12px 24px;">
          <div style="background:#120e22; border:1px solid rgba(192,132,252,0.3); border-radius:16px; padding:18px;">
            <div style="font-size:11px; color:#c084fc; font-weight:700; text-transform:uppercase; letter-spacing:0.8px;">
              🔮 Vibe &amp; Personality Read
            </div>
            <div style="font-size:17px; font-weight:800; color:#ffffff; margin-top:4px; font-family:Georgia, serif;">
              ${archetypeTitle}
            </div>
            <p style="font-size:13px; color:#cbd5e1; line-height:1.5; margin:8px 0 12px 0;">
              ${romanticSummary}
            </p>
            ${traitsHtml}
          </div>
        </td>
      </tr>

      <!-- QUESTIONS BREAKDOWN -->
      <tr>
        <td style="padding:12px 24px;">
          <div style="font-size:13px; font-weight:700; color:#cbd5e1; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">
            📋 Step-by-Step Question Breakdown
          </div>
          ${questionCardsHtml}
          ${privateAnswersHtml}
        </td>
      </tr>

      <!-- NEXT MOVE PRO-TIP -->
      <tr>
        <td style="padding:12px 24px;">
          <div style="background:linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(244,63,94,0.1) 100%); border:1px solid rgba(245,158,11,0.3); border-radius:16px; padding:16px;">
            <div style="font-size:11px; font-weight:700; color:#fbbf24; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:4px;">
              💡 Pro-Tip For Your Next Move
            </div>
            <div style="font-size:13px; color:#fef3c7; font-style:italic; font-family:Georgia, serif; line-height:1.4;">
              “So ${lovely || recipientName}… heard you're craving ${foodStr} at ${timeStr}. Shall we make it happen? 😉🌹”
            </div>
          </div>
        </td>
      </tr>

      <!-- METADATA & TELEMETRY FOOTER -->
      <tr>
        <td style="padding:20px 24px 32px 24px; border-top:1px solid rgba(255,255,255,0.08); text-align:center;">
          <div style="font-size:11px; color:#64748b; line-height:1.6;">
            ⏱️ Completed in <strong>${durationText}</strong> &nbsp;•&nbsp;
            📱 Device: <strong>${response.deviceCategory.toUpperCase()}</strong> &nbsp;•&nbsp;
            📍 <strong>${response.location?.formatted || (response.location?.granted ? 'Location shared' : 'Private')}</strong>
          </div>
          <div style="font-size:11px; color:#475569; margin-top:6px;">
            Completed on ${completedDate} • Sent securely to ${senderEmail}
          </div>
          <div style="margin-top:16px;">
            <span style="font-size:11px; color:#f43f5e; font-weight:700; letter-spacing:1px; text-transform:uppercase;">
              Closer • Intimate Connection Experiences
            </span>
          </div>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;
}
