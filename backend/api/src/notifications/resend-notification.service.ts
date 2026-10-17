import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ResendNotificationService {
  private readonly logger = new Logger(ResendNotificationService.name);

  async send(to: string, subject: string, text: string): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) {
      this.logger.warn('Resend notification skipped because email configuration is missing.');
      return false;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [to], subject, text }),
      });
      if (!response.ok) {
        this.logger.warn(`Resend rejected a notification with status ${response.status}.`);
        return false;
      }
      return true;
    } catch (error) {
      const details = error instanceof Error ? error.message : 'Unknown provider error.';
      this.logger.error(`Resend notification failed: ${details}`);
      return false;
    }
  }
}
