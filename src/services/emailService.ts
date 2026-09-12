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

    // Architecture ready for Resend / SendGrid / Firebase Trigger Email:
    // e.g. await fetch('/api/send-email', { method: 'POST', body: JSON.stringify(payload) })
    console.log('[EmailService] Transactional Email Prepared & Dispatched:', payload);

    return {
      success: true,
      simulated: true,
      payload,
    };
  }
}

export const emailService = new EmailService();
