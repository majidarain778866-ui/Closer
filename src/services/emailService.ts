import { EmailNotificationPayload, ExperienceResponse } from '../types';

class EmailService {
  private lastNotification: EmailNotificationPayload | null = null;
  private onNotificationListeners: Array<(payload: EmailNotificationPayload) => void> = [];

  subscribeToNotifications(callback: (payload: EmailNotificationPayload) => void) {
    this.onNotificationListeners.push(callback);
    return () => {
      this.onNotificationListeners = this.onNotificationListeners.filter((cb) => cb !== callback);
    };
  }

  getLastNotification(): EmailNotificationPayload | null {
    return this.lastNotification;
  }

  buildNotificationPayload(
    response: ExperienceResponse,
    senderEmail: string,
    experienceTitle: string
  ): EmailNotificationPayload {
    const answersSummary = Object.values(response.answers).map((ans) => ({
      question: ans.questionText,
      answer: Array.isArray(ans.value) ? ans.value.join(', ') : ans.value,
    }));

    return {
      to: senderEmail,
      subject: `🌹 [Closer] ${response.recipientName} completed your experience! ❤️ (100% Match)`,
      recipientName: response.recipientName,
      experienceTitle,
      answersSummary,
      completedAt: response.completedAt,
      location: response.location?.formatted || (response.location?.granted ? 'Location shared' : undefined),
      responseId: response.id,
      theme: response.recipientProfile?.selectedTheme || response.theme,
      nickname: response.recipientProfile?.nickname || response.recipientProfile?.lovelyName,
    };
  }

  /**
   * Dispatches an ultra-rich, luxury-formatted email notification to the creator's inbox.
   * 100% Free via FormSubmit.co ($0/month, zero API key required).
   */
  async sendCompletionNotification(
    response: ExperienceResponse,
    senderEmail: string,
    experienceTitle: string
  ): Promise<{ success: boolean; simulated: boolean; payload: EmailNotificationPayload }> {
    const payload = this.buildNotificationPayload(response, senderEmail, experienceTitle);
    this.lastNotification = payload;

    // Notify any active UI listener (e.g. Creator Dashboard badge/toast)
    this.onNotificationListeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Email listener error:', err);
      }
    });

    let emailDispatched = false;
    const targetEmail = senderEmail || 'majidarain778866@gmail.com';

    try {
      const nickname = response.recipientProfile?.nickname;
      const lovely = response.recipientProfile?.lovelyName;
      const theme = response.recipientProfile?.selectedTheme || response.theme || 'Midnight Rose';
      const vibe = response.vibe || 'Romantic & Deep';

      // Extract specific key answers
      const foodAns = response.answers['q8-food']?.value || response.answers['q2-food']?.value;
      const placeAns = response.answers['q6-meeting-place']?.value || response.answers['q6-place']?.value;
      const timeAns = response.answers['q7-meeting-time']?.value || response.answers['q7-time']?.value;
      const attractionAns = response.answers['q4-personal-interest']?.value || response.answers['q4-attention']?.value;
      const finalAns = response.answers['q9-final']?.value || response.answers['q8-final']?.value || 'Haan, definitely YES ❤️';

      // Calculate total dodges (playful 'No' evasions)
      const totalDodges = Object.values(response.answers).reduce(
        (acc, ans) => acc + (ans.evasionCount || 0),
        0
      );

      // Calculate duration if timestamps are present
      let durationText = 'Completed smoothly (~3 mins)';
      if (response.startedAt && response.completedAt) {
        const diffSecs = Math.max(
          1,
          Math.round((new Date(response.completedAt).getTime() - new Date(response.startedAt).getTime()) / 1000)
        );
        const mins = Math.floor(diffSecs / 60);
        const secs = diffSecs % 60;
        durationText = mins > 0 ? `${mins} min ${secs} sec` : `${secs} seconds`;
      }

      // Format time
      const dateObj = new Date(response.completedAt);
      const formattedDate = dateObj.toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'medium',
      });

      // Food & Time helpers for pro-tip text
      const foodStr = Array.isArray(foodAns) ? foodAns.join(', ') : (foodAns as string) || 'favorite food';
      const timeStr = Array.isArray(timeAns) ? timeAns.join(', ') : (timeAns as string) || 'evening';
      const placeStr = Array.isArray(placeAns) ? placeAns.join(', ') : (placeAns as string) || 'a cozy spot';

      // Build structured email fields for FormSubmit box layout
      const emailFields: Record<string, any> = {
        _subject: `🌹 Closer Alert: ${response.recipientName} finished your experience! (${vibe} ❤️)`,
        _template: 'box',
        _captcha: 'false',

        '━━━━━━ 👑 RECIPIENT PROFILE ━━━━━━': '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '🌹 Full Name': response.recipientName,
        '🤍 Lovely Name': lovely || '(None selected)',
        '🌸 Nickname': nickname || '(None selected)',
        '🎨 Experience Theme': theme.toUpperCase(),
        '✨ Selected Vibe': vibe,
        '📸 Photo Status': response.photoUrl || response.recipientProfile?.photoUrl ? 'Attached in Session 📷' : 'None provided',

        '━━━━━━ 🥂 DATE & CONNECTION BLUEPRINT ━━━━━━': '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '🍕 Food & Drinks Craving': foodStr,
        '📍 Dream Meeting Spot': placeStr,
        '🌇 Perfect Meeting Time': timeStr,
        '👀 What Caught Attention First': Array.isArray(attractionAns) ? attractionAns.join(', ') : (attractionAns as string) || 'Your smile and energy ✨',
        '❤️ The Final Verdict': Array.isArray(finalAns) ? finalAns.join(', ') : (finalAns as string),
        ...(totalDodges > 0
          ? {
              '😏 Playful Evasion': `Dodged the 'NO' button ${totalDodges} time(s) before smiling and clicking YES! 🥰`,
            }
          : {}),

        '━━━━━━ 🔮 VIBE & PERSONALITY ANALYSIS ━━━━━━': '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '✨ Archetype Title': response.personalitySnapshot?.title || 'Magnetic Soul',
        '💌 Romantic Synthesis':
          response.personalitySnapshot?.romanticSummary ||
          'Genuine chemistry with natural flow and deep emotional connection.',
      };

      // If traits are available, add them
      if (response.personalitySnapshot?.traits && response.personalitySnapshot.traits.length > 0) {
        emailFields['💫 Dominant Traits'] = response.personalitySnapshot.traits
          .map((t) => `${t.icon} ${t.label}: ${t.note}`)
          .join('\n');
      }

      // Add Step-by-Step Questions
      emailFields['━━━━━━ 📋 STEP-BY-STEP QUESTION BREAKDOWN ━━━━━━'] = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
      Object.values(response.answers).forEach((ans, idx) => {
        const questionKey = `Q${idx + 1} ❯ ${ans.questionText}`;
        const valStr = Array.isArray(ans.value) ? ans.value.join(', ') : ans.value;
        const dodgeNote =
          ans.evasionCount && ans.evasionCount > 0
            ? ` [Playfully resisted ${ans.evasionCount}x before saying YES 😏]`
            : '';
        emailFields[questionKey] = `${valStr}${dodgeNote}`;
      });

      // Add Private Confessions if any
      if (response.privateAnswers && Object.keys(response.privateAnswers).length > 0) {
        emailFields['━━━━━━ 🔒 PRIVATE & SECRET CONFESSIONS ━━━━━━'] = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        Object.values(response.privateAnswers).forEach((ans, pIdx) => {
          const pKey = `🔒 Secret Q${pIdx + 1} ❯ ${ans.questionText}`;
          emailFields[pKey] = Array.isArray(ans.value) ? ans.value.join(', ') : ans.value;
        });
      }

      // Add Session Telemetry
      emailFields['━━━━━━ 📱 SESSION TELEMETRY & CONTEXT ━━━━━━'] = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
      emailFields['⏱️ Completion Pace'] = durationText;
      emailFields['📱 Device Used'] = response.deviceCategory.toUpperCase();
      emailFields['📍 Approximate Location'] =
        response.location?.formatted || (response.location?.granted ? 'Location Shared' : 'Private / Not shared');
      emailFields['⏰ Exact Time'] = formattedDate;
      emailFields['🆔 Session / Experience ID'] = `${response.experienceId} | ${response.id}`;

      // Pro Tip: What to message next
      emailFields['━━━━━━ 💡 PRO-TIP FOR YOUR NEXT MOVE ━━━━━━'] = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
      emailFields['💌 What to Text Them Now'] =
        `“So ${lovely || response.recipientName}… heard you're craving ${foodStr} at ${timeStr}. Shall we make it happen? 😉🌹”`;

      // Complete Narrative Love Dossier (Formatted ASCII Letter)
      emailFields['━━━━━━ 📜 FULL STORY DOSSIER ━━━━━━'] = [
        '╔══════════════════════════════════════════════════════════════════════╗',
        '                      🌹 CLOSER EXPERIENCE DOSSIER 🌹                   ',
        '               "Every honest answer brings us a little closer"           ',
        '╚══════════════════════════════════════════════════════════════════════╝',
        '',
        `👑 Recipient: ${response.recipientName} ${lovely ? `("${lovely}")` : ''}`,
        `🎨 Theme: ${theme} | Vibe: ${vibe}`,
        `⏱️ Completed In: ${durationText}`,
        `📅 Date: ${formattedDate}`,
        '',
        '────────────────────────────────────────────────────────────────────────',
        '🎯 DATE & CONNECTION BLUEPRINT',
        '────────────────────────────────────────────────────────────────────────',
        `• Food Craving:       ${foodStr}`,
        `• Destination / Spot: ${placeStr}`,
        `• Ideal Timing:       ${timeStr}`,
        `• First Attraction:   ${attractionAns || 'Your presence & smile ✨'}`,
        `• Final Verdict:      ${finalAns} ${totalDodges > 0 ? `(Dodged NO ${totalDodges}x first!)` : ''}`,
        '',
        '────────────────────────────────────────────────────────────────────────',
        '🔮 VIBE SYNTHESIS',
        '────────────────────────────────────────────────────────────────────────',
        `• Archetype: ${response.personalitySnapshot?.title || 'Magnetic Soul'}`,
        `• Insight:   ${response.personalitySnapshot?.romanticSummary || 'Genuine spark with deep emotional ease.'}`,
        '',
        '────────────────────────────────────────────────────────────────────────',
        '💬 RECOMMENDED NEXT TEXT TO SEND:',
        '────────────────────────────────────────────────────────────────────────',
        `"So ${lovely || response.recipientName}... heard you're craving ${foodStr} at ${timeStr}. Shall we make it happen? 😉🌹"`,
        '',
        '────────────────────────────────────────────────────────────────────────',
      ].join('\n');

      // Dispatch to FormSubmit AJAX endpoint
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(emailFields),
      });

      if (res.ok) {
        emailDispatched = true;
        console.info(`[EmailService] Ultra-rich direct email successfully dispatched to ${targetEmail}`);
      } else {
        const errorText = await res.text();
        console.warn('[EmailService] FormSubmit response status:', res.status, errorText);
      }
    } catch (dispatchErr) {
      console.warn('[EmailService] Direct email dispatch note:', dispatchErr);
    }

    console.log('[EmailService] Transactional Email Payload:', payload);

    return {
      success: true,
      simulated: !emailDispatched,
      payload,
    };
  }

  /**
   * Helper to trigger a manual test email directly from the admin interface.
   */
  async sendSampleTestEmail(targetEmail: string = 'majidarain778866@gmail.com'): Promise<boolean> {
    const sampleResponse: ExperienceResponse = {
      id: `test-response-${Date.now()}`,
      experienceId: 'exp-ayesha',
      sessionId: `sess-test-${Date.now()}`,
      recipientName: 'Ayesha',
      recipientProfile: {
        name: 'Ayesha',
        nickname: 'Aysh',
        lovelyName: 'Jaan ❤️',
        selectedTheme: 'midnight-rose',
      },
      theme: 'midnight-rose',
      vibe: 'Romantic',
      startedAt: new Date(Date.now() - 195000).toISOString(),
      completedAt: new Date().toISOString(),
      deviceCategory: 'mobile',
      location: {
        granted: true,
        formatted: 'Lahore, Pakistan',
      },
      answers: {
        'q1-evening': {
          questionId: 'q1-evening',
          questionText: 'What does your perfect evening look like?',
          category: 'cute',
          value: 'Sunset glow with soft music 🌅✨',
          answeredAt: new Date().toISOString(),
        },
        'q2-food': {
          questionId: 'q2-food',
          questionText: 'Okay… and what are we ordering?',
          category: 'food',
          value: 'Artisan Cheesy Pizza & Cold Coffee 🍕☕',
          answeredAt: new Date().toISOString(),
        },
        'q3-vibe': {
          questionId: 'q3-vibe',
          questionText: 'What makes spending time with someone feel special to you?',
          category: 'deep',
          value: 'Feeling understood without having to explain 🤍',
          answeredAt: new Date().toISOString(),
        },
        'q4-attention': {
          questionId: 'q4-attention',
          questionText: 'Be honest… what gets your attention first?',
          category: 'attraction',
          value: 'Kind eyes and how you talk to me 👀✨',
          answeredAt: new Date().toISOString(),
        },
        'q6-place': {
          questionId: 'q6-place',
          questionText: 'Where should our ideal first real hangout be?',
          category: 'romantic',
          value: 'A peaceful rooftop cafe with warm fairy lights ☕✨',
          answeredAt: new Date().toISOString(),
        },
        'q7-time': {
          questionId: 'q7-time',
          questionText: 'And at what hour does the magic feel right?',
          category: 'romantic',
          value: 'Sunset / Twilight 🌇',
          answeredAt: new Date().toISOString(),
        },
        'q8-tease': {
          questionId: 'q8-tease',
          questionText: 'Late-night conversation, dim lights, and really good chemistry… sounds tempting? 😏',
          category: 'flirty',
          value: 'Very tempting YES ✨',
          evasionCount: 2,
          answeredAt: new Date().toISOString(),
        },
        'q9-final': {
          questionId: 'q9-final',
          questionText: 'One last question… Would you like to make some beautiful memories together? ❤️',
          category: 'final',
          value: 'YES, absolutely 100% ❤️',
          evasionCount: 1,
          answeredAt: new Date().toISOString(),
        },
      },
      privateAnswers: {
        'secret-thought': {
          questionId: 'secret-thought',
          questionText: 'A secret thought you haven’t shared with anyone else yet:',
          category: 'deep',
          value: 'I smile every time your notification pops up on my phone 🙈🤍',
          answeredAt: new Date().toISOString(),
        },
      },
      personalitySnapshot: {
        title: 'The Magnetic Dreamer ✨',
        romanticSummary: 'A rare blend of playful banter and deep emotional warmth. Loves thoughtful gestures and effortless chemistry.',
        dominantTags: ['romantic', 'deep', 'playful'],
        traits: [
          { icon: '🤍', label: 'Genuine Heart', note: 'Values emotional safety above everything' },
          { icon: '✨', label: 'Playful Spark', note: 'Loves teasing back when comfortable' },
          { icon: '🌹', label: 'Hopeless Romantic', note: 'Appreciates sunsets, quality time, and eye contact' },
        ],
      },
    };

    const res = await this.sendCompletionNotification(sampleResponse, targetEmail, 'A little conversation for Ayesha');
    return res.success;
  }
}

export const emailService = new EmailService();
