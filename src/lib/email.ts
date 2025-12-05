import { Resend } from 'resend';
import { translations, type Language } from '@/lib/i18n/translations';

// Lazy initialize Resend client to avoid build errors when API key is not set
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

interface SendLetterNotificationParams {
  recipientEmail: string;
  senderName: string;
  letterId: string;
  unlockAt: Date;
  language?: Language;
}

export async function sendLetterNotification({
  recipientEmail,
  senderName,
  letterId,
  unlockAt,
  language = 'en',
}: SendLetterNotificationParams) {
  const resend = getResendClient();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured, skipping email notification');
    return null;
  }

  const t = translations[language].email;
  const letterUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/letter/${letterId}`;
  
  // Format date based on language
  const locale = language === 'sr' ? 'sr-RS' : 'en-US';
  const formattedDate = unlockAt.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = t.subject.replace('{senderName}', senderName);
  const message = t.message.replace('{senderName}', senderName);
  const copyright = t.copyright.replace('{year}', new Date().getFullYear().toString());

  try {
    const { data, error } = await resend.emails.send({
      from: 'Pisma <letters@pisma.app>',
      to: recipientEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #ffffff; font-size: 48px; margin: 0; letter-spacing: -2px;">${t.title}</h1>
                <p style="color: #666666; font-size: 14px; margin-top: 8px;">${t.subtitle}</p>
              </div>

              <!-- Wax Seal -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background-color: #8B0000; border-radius: 50%; box-shadow: 0 4px 20px rgba(139, 0, 0, 0.4);">
                </div>
              </div>

              <!-- Message -->
              <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 16px; padding: 32px; text-align: center;">
                <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">${t.heading}</h2>
                
                <p style="color: #999999; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  <strong style="color: #ffffff;">${message}</strong>
                </p>

                <div style="background-color: #0a0a0a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: #666666; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">${t.estimatedArrival}</p>
                  <p style="color: #ffffff; font-size: 18px; margin: 0; font-family: monospace;">${formattedDate}</p>
                </div>

                <a href="${letterUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  ${t.trackButton}
                </a>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 40px;">
                <p style="color: #444444; font-size: 12px;">
                  ${t.footerNote}
                </p>
                <p style="color: #333333; font-size: 11px; margin-top: 20px;">
                  ${copyright}
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

export async function sendLetterDeliveredNotification({
  recipientEmail,
  senderName,
  letterId,
  language = 'en',
}: Omit<SendLetterNotificationParams, 'unlockAt'>) {
  const resend = getResendClient();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured, skipping email notification');
    return null;
  }

  const t = translations[language].email;
  const letterUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/letter/${letterId}`;
  const subject = t.deliveredSubject.replace('{senderName}', senderName);
  const message = t.deliveredMessage.replace('{senderName}', senderName);
  const copyright = t.copyright.replace('{year}', new Date().getFullYear().toString());

  try {
    const { data, error } = await resend.emails.send({
      from: 'Pisma <letters@pisma.app>',
      to: recipientEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: Georgia, serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #ffffff; font-size: 48px; margin: 0; letter-spacing: -2px;">${t.title}</h1>
              </div>

              <!-- Message -->
              <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 16px; padding: 32px; text-align: center;">
                <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 16px 0;">${t.deliveredHeading}</h2>
                
                <p style="color: #999999; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  <strong style="color: #ffffff;">${message}</strong>
                </p>

                <a href="${letterUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  ${t.readButton}
                </a>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 40px;">
                <p style="color: #333333; font-size: 11px;">
                  ${copyright}
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}
