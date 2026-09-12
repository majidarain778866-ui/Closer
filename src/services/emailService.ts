import { EmailNotificationPayload, ExperienceResponse } from '../types';
import { generateLuxuryEmailHtml } from '../utils/generateLuxuryEmailHtml';

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
      subject: `🌹 [Closer VIP] ${response.recipientName} Completed Your Experience! ❤️ (100% Match)`,
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
   * Dispatches an ultra-luxurious, rich HTML email notification.
   * 1. Attempts high-definition custom HTML dispatch via Vercel serverless /api/send-email (Resend/Brevo).
   * 2. Seamlessly falls back to optimized clean FormSubmit.co relay.
   */
  async sendCompletionNotification(
    response: ExperienceResponse,
    senderEmail: string,
    experienceTitle: string
  ): Promise<{ success: boolean; simulated: boolean; payload: EmailNotificationPayload }> {
    const targetEmail = senderEmail || 'majidarain778866@gmail.com';
    const payload = this.buildNotificationPayload(response, targetEmail, experienceTitle);
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
    const recipientName = response.recipientName || 'Your Match';
    const lovely = response.recipientProfile?.lovelyName;
    const theme = (response.recipientProfile?.selectedTheme || response.theme || 'Midnight Rose').toUpperCase();
    const vibe = response.vibe || 'Romantic & Deep';

    // Key answers extraction
    const foodAns = response.answers['q8-food']?.value || response.answers['q2-food']?.value;
    const placeAns = response.answers['q6-meeting-place']?.value || response.answers['q6-place']?.value;
    const timeAns = response.answers['q7-meeting-time']?.value || response.answers['q7-time']?.value;
    const attractionAns = response.answers['q4-personal-interest']?.value || response.answers['q4-attention']?.value;
    const finalAns = response.answers['q9-final']?.value || response.answers['q8-final']?.value || 'YES, definitely ❤️';

    const foodStr = Array.isArray(foodAns) ? foodAns.join(', ') : (foodAns as string) || 'Favorite food 🍕';
    const placeStr = Array.isArray(placeAns) ? placeAns.join(', ') : (placeAns as string) || 'Cozy rooftop / cafe ☕';
    const timeStr = Array.isArray(timeAns) ? timeAns.join(', ') : (timeAns as string) || 'Sunset / Twilight 🌇';
    const attractionStr = Array.isArray(attractionAns) ? attractionAns.join(', ') : (attractionAns as string) || 'Your eyes & energy 👀✨';
    const finalStr = Array.isArray(finalAns) ? finalAns.join(', ') : (finalAns as string);

    const totalDodges = Object.values(response.answers).reduce(
      (acc, a) => acc + (a.evasionCount || 0),
      0
    );

    let durationText = 'Completed smoothly in ~3 mins';
    if (response.startedAt && response.completedAt) {
      const diffSecs = Math.max(
        1,
        Math.round((new Date(response.completedAt).getTime() - new Date(response.startedAt).getTime()) / 1000)
      );
      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      durationText = mins > 0 ? `${mins} min ${secs} sec` : `${secs} seconds`;
    }

    const emailSubject = `🌹 Closer VIP: ${recipientName} just completed your experience! (${vibe} ❤️)`;

    // Generate the full luxury HTML email
    const luxuryHtml = generateLuxuryEmailHtml(response, targetEmail, experienceTitle);

    // STEP 1: Attempt Vercel API Route with custom HTML (Resend / Brevo)
    try {
      const apiRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          subject: emailSubject,
          html: luxuryHtml,
        }),
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.success) {
          emailDispatched = true;
          console.info(`[EmailService] Luxury HTML email delivered via ${data.provider} to ${targetEmail}`);
        }
      }
    } catch (apiErr) {
      console.warn('[EmailService] API Route dispatch note:', apiErr);
    }

    // STEP 2: Fallback to FormSubmit (Clean, elegant, no broken dashes)
    if (!emailDispatched) {
      try {
        // Compile all questions into a clean, numbered list string
        const allQuestionsFormatted = Object.values(response.answers)
          .map((ans, idx) => {
            const val = Array.isArray(ans.value) ? ans.value.join(', ') : ans.value;
            const dodge = ans.evasionCount && ans.evasionCount > 0 ? ` (Dodged NO ${ans.evasionCount}x 😏)` : '';
            return `${idx + 1}. ${ans.questionText}\n   ➔ ${val}${dodge}`;
          })
          .join('\n\n');

        const cleanFields: Record<string, any> = {
          _subject: emailSubject,
          _template: 'box',
          _captcha: 'false',
          '👑 Recipient': `${recipientName} ${lovely ? `("${lovely}")` : ''}`,
          '✨ Vibe & Theme': `${vibe} • ${theme}`,
          '🥂 Date Blueprint': `🍕 Food: ${foodStr}\n📍 Spot: ${placeStr}\n🌇 Time: ${timeStr}\n👀 First Attraction: ${attractionStr}`,
          '❤️ Final Answer': finalStr,
          '😏 Playful Evasions':
            totalDodges > 0
              ? `Playfully dodged NO ${totalDodges} time(s) before smiling and clicking YES! 🥰`
              : 'Zero dodges — straight YES! ❤️',
          '🔮 Personality Archetype': `${response.personalitySnapshot?.title || 'The Magnetic Dreamer ✨'}\n${response.personalitySnapshot?.romanticSummary || 'Genuine chemistry and deep emotional warmth.'}`,
          '📋 All Answers': allQuestionsFormatted,
          '💡 Next Move Pro-Tip': `“So ${lovely || recipientName}… heard you're craving ${foodStr} at ${timeStr}. Shall we make it happen? 😉🌹”`,
          '📱 Context': `${durationText} • ${response.deviceCategory.toUpperCase()} • ${response.location?.formatted || 'Private'} • ${new Date(response.completedAt).toLocaleString()}`,
        };

        const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(targetEmail)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(cleanFields),
        });

        if (res.ok) {
          emailDispatched = true;
          console.info(`[EmailService] Clean FormSubmit notification sent to ${targetEmail}`);
        }
      } catch (formSubmitErr) {
        console.warn('[EmailService] FormSubmit dispatch note:', formSubmitErr);
      }
    }

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
      personalitySnapshot: {
        title: 'The Magnetic Dreamer ✨',
        romanticSummary:
          'A rare blend of playful banter and deep emotional warmth. Loves thoughtful gestures and effortless chemistry.',
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
