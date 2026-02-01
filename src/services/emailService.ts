import * as nodemailer from 'nodemailer';
import { EmailLog } from '../types/notifications';
import { opportunityTemplate } from '../templates/emails/opportunity-email';
import { deadlineTemplate } from '../templates/emails/deadline-alert-email';

// In a real app, environment variables would be used
const EMAIL_USER = process.env.EMAIL_USER || 'test@taxlossshadow.com';
const EMAIL_PASS = process.env.EMAIL_PASSWORD || 'password';

// Mock transporter for hackathon if no env vars, otherwise real
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email', // Fallback to Ethereal for testing if no real SMTP
    port: 587,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export interface EmailConfig {
    to: string;
    subject: string;
    type: 'opportunity' | 'alert' | 'deadline' | 'calculation' | 'error';
    templateName?: string;
    data?: any;
    html?: string;
    text?: string;
}

class EmailService {
    private history: EmailLog[] = [];

    async sendEmail(config: EmailConfig): Promise<{ success: boolean; messageId?: string; error?: string }> {
        try {
            // 1. Select Template if not provided explicitly
            let finalHtml = config.html || '';

            if (!finalHtml && config.templateName && config.data) {
                if (config.templateName === 'opportunity') {
                    finalHtml = opportunityTemplate(config.data);
                } else if (config.templateName === 'deadline') {
                    finalHtml = deadlineTemplate(config.data);
                }
                // Add other templates...
            }

            if (!finalHtml) {
                finalHtml = `<p>${config.data?.message || 'Notification from Taxicity'}</p>`;
            }

            // 2. Send
            // For Demo/Hackathon safety, we might just log if credentials aren't real
            let result;
            if (process.env.EMAIL_USER) {
                result = await transporter.sendMail({
                    from: `"Taxicity" <${EMAIL_USER}>`,
                    to: config.to,
                    subject: config.subject,
                    html: finalHtml,
                    text: config.text || config.subject, // Fallback
                    replyTo: 'support@tax-loss-shadow.com',
                });
            } else {
                // Mock Send
                console.log(`[Mock Email Service] Sending to ${config.to}: ${config.subject}`);
                result = { messageId: `mock-${Date.now()}` };
            }

            // 3. Log
            const logEntry: EmailLog = {
                id: result.messageId || 'unknown',
                recipient: config.to,
                type: config.type,
                subject: config.subject,
                status: 'sent',
                sentAt: Date.now(),
                retryCount: 0
            };
            this.history.unshift(logEntry);

            return { success: true, messageId: result.messageId };

        } catch (error: any) {
            console.error('Email Send Error:', error);

            const logEntry: EmailLog = {
                id: `fail-${Date.now()}`,
                recipient: config.to,
                type: config.type,
                subject: config.subject,
                status: 'failed',
                sentAt: Date.now(),
                retryCount: 0,
                error: error.message
            };
            this.history.unshift(logEntry);

            return { success: false, error: error.message };
        }
    }

    getHistory() {
        return this.history;
    }

    async resendFailedEmails() {
        // Logic to retry failed emails
        // For now, just a placeholder
        return { resentCount: 0 };
    }
}

export const emailService = new EmailService();
