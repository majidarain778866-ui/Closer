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
      const emailFields: Record<string, any> = {
        _subject: `❤️ ${response.recipientName} completed your Closer experience!`,
        _template: 'box',
        _captcha: 'false',
        'Recipient Name': response.recipientName,
        'Experience': experienceTitle,
        'Completion Time': new Date(response.completedAt).toLocaleString(),
        'Device Type': response.deviceCategory,
        'Location': response.location?.formatted || (response.location?.granted ? 'Shared' : 'Not shared'),
      };

      // Map question answers
      Object.values(response.answers).forEach((ans, idx) => {
        const key = `Question ${idx + 1} (${ans.questionText})`;
        emailFields[key] = Array.isArray(ans.value) ? ans.value.join(', ') : ans.value;
      });

      // Map any private answers
      if (response.privateAnswers) {
        Object.values(response.privateAnswers).forEach((ans, idx) => {
          const key = `[Private] ${ans.questionText}`;
          emailFields[key] = Array.isArray(ans.value) ? ans.value.join(', ') : ans.value;
        });
      }

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

