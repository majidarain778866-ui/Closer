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
      subject: `Someone just completed your experience ❤️`,
      recipientName: response.recipientName,
      experienceTitle,
      answersSummary,
      completedAt: response.completedAt,
      location: response.location?.formatted || (response.location?.granted ? 'Location shared' : undefined),
      responseId: response.id,
    };
  }

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

    // 100% Free Direct Email Dispatch via FormSubmit.co
    let emailDispatched = false;
    const targetEmail = senderEmail || 'majidarain778866@gmail.com';

    try {
      const nickname = response.recipientProfile?.nickname;
      const lovely = response.recipientProfile?.lovelyName;
      const theme = response.recipientProfile?.selectedTheme || response.theme || 'Midnight Rose';

      const foodAns = response.answers['q8-food']?.value || response.answers['q2-food']?.value;
      const placeAns = response.answers['q6-meeting-place']?.value || response.answers['q6-place']?.value;
      const timeAns = response.answers['q7-meeting-time']?.value || response.answers['q7-time']?.value;
      const attractionAns = response.answers['q4-personal-interest']?.value || response.answers['q4-attention']?.value;
      const finalAns = response.answers['q9-final']?.value || response.answers['q8-final']?.value || 'Haan ❤️';

      const emailFields: Record<string, any> = {
        _subject: `🌹 [Closer] ${response.recipientName} completed your connection experience! ❤️`,
        _template: 'box',
        _captcha: 'false',
        '👑 Recipient Name': response.recipientName,
        '🤍 Lovely Name': lovely || 'Sweetheart',
        '🌸 Nickname': nickname || 'None',
        '🎨 Theme & Vibe': `${theme} (${response.vibe || 'Romantic'})`,
        '━━━━━━━━ SUMMARY OF CHOICES ━━━━━━━━': '━━━━━━━━━━━━━━━━━━━━━━━━━',
        ...(foodAns ? { '🍕 Khana / Food': Array.isArray(foodAns) ? foodAns.join(', ') : foodAns } : {}),
        ...(placeAns ? { '📍 Jagah / Meeting Place': Array.isArray(placeAns) ? placeAns.join(', ') : placeAns } : {}),
        ...(timeAns ? { '🌇 Waqt / Meeting Time': Array.isArray(timeAns) ? timeAns.join(', ') : timeAns } : {}),
        ...(attractionAns ? { '👀 Pehli Nazar / Attraction': Array.isArray(attractionAns) ? attractionAns.join(', ') : attractionAns } : {}),
        '❤️ Final Answer': Array.isArray(finalAns) ? finalAns.join(', ') : finalAns,
        '━━━━━━━━ QUESTION-BY-QUESTION BREAKDOWN ━━━━━━━━': '━━━━━━━━━━━━━━━━━━━━━━━━━',
      };

      // Map each question cleanly with evasion notices
      Object.values(response.answers).forEach((ans, idx) => {
        const key = `Q${idx + 1} (${ans.questionText})`;
        const valStr = Array.isArray(ans.value) ? ans.value.join(', ') : ans.value;
        const evasionNotice = ans.evasionCount && ans.evasionCount > 0 ? ` (Dodged ${ans.evasionCount}x before saying YES 😏)` : '';
        emailFields[key] = `${valStr}${evasionNotice}`;
      });

      // Map any private answers
      if (response.privateAnswers && Object.keys(response.privateAnswers).length > 0) {
        emailFields['━━━━━━━━ PRIVATE ANSWERS ━━━━━━━━'] = '━━━━━━━━━━━━━━━━━━━━━━━━━';
        Object.values(response.privateAnswers).forEach((ans) => {
          const key = `🔒 [Private] ${ans.questionText}`;
          emailFields[key] = Array.isArray(ans.value) ? ans.value.join(', ') : ans.value;
        });
      }

      // Map personality snapshot
      if (response.personalitySnapshot) {
        emailFields['━━━━━━━━ VIBE ANALYSIS ━━━━━━━━'] = '━━━━━━━━━━━━━━━━━━━━━━━━━';
        emailFields['✨ Vibe Archetype'] = response.personalitySnapshot.title;
        if (response.personalitySnapshot.romanticSummary) {
          emailFields['💌 Closer Synthesis'] = response.personalitySnapshot.romanticSummary;
        }
      }

      emailFields['━━━━━━━━ DETAILS ━━━━━━━━'] = '━━━━━━━━━━━━━━━━━━━━━━━━━';
      emailFields['📱 Device Type'] = response.deviceCategory;
      emailFields['📍 Location'] = response.location?.formatted || (response.location?.granted ? 'Location Shared' : 'Not shared');
      emailFields['⏰ Completed At'] = new Date(response.completedAt).toLocaleString();
      emailFields['💬 Closing Note'] = '“Baaki baat… shayad mil kar karte hain. 😉❤️”';

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
        console.info(`[EmailService] Real direct email notification sent to ${targetEmail}`);
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
}

export const emailService = new EmailService();

