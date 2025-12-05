import { Resend } from 'resend';

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
}

export async function sendLetterNotification({
  recipientEmail,
  senderName,
  letterId,
  unlockAt,
}: SendLetterNotificationParams) {
  const resend = getResendClient();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured, skipping email notification');
    return null;
  }

  const letterUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/letter/${letterId}`;
  const formattedDate = unlockAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  try {
    const { data, error } = await resend.emails.send({
      from: 'Pisma <letters@pisma.app>',
      to: recipientEmail,
      subject: `📬 A letter from ${senderName} is on its way!`,
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
                <h1 style="color: #ffffff; font-size: 48px; margin: 0; letter-spacing: -2px;">PISMA</h1>
                <p style="color: #666666; font-size: 14px; margin-top: 8px;">The art of waiting in the age of instant</p>
              </div>

              <!-- Wax Seal -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background-color: #8B0000; border-radius: 50%; box-shadow: 0 4px 20px rgba(139, 0, 0, 0.4);">
                </div>
              </div>

              <!-- Message -->
              <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 16px; padding: 32px; text-align: center;">
                <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">A Letter Awaits You</h2>
                
                <p style="color: #999999; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  <strong style="color: #ffffff;">${senderName}</strong> has sent you a time-locked letter.
                </p>

                <div style="background-color: #0a0a0a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: #666666; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Estimated Arrival</p>
                  <p style="color: #ffffff; font-size: 18px; margin: 0; font-family: monospace;">${formattedDate}</p>
                </div>

                <a href="${letterUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  Track Your Letter
                </a>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 40px;">
                <p style="color: #444444; font-size: 12px;">
                  The letter will remain sealed until the delivery time arrives.
                </p>
                <p style="color: #333333; font-size: 11px; margin-top: 20px;">
                  © ${new Date().getFullYear()} Pisma. All rights reserved.
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
}: Omit<SendLetterNotificationParams, 'unlockAt'>) {
  const resend = getResendClient();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured, skipping email notification');
    return null;
  }

  const letterUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/letter/${letterId}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Pisma <letters@pisma.app>',
      to: recipientEmail,
      subject: `📬 Your letter from ${senderName} has arrived!`,
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
                <h1 style="color: #ffffff; font-size: 48px; margin: 0; letter-spacing: -2px;">PISMA</h1>
              </div>

              <!-- Message -->
              <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 16px; padding: 32px; text-align: center;">
                <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 16px 0;">📬 Your Letter Has Arrived!</h2>
                
                <p style="color: #999999; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                  The letter from <strong style="color: #ffffff;">${senderName}</strong> is now ready to be opened.
                </p>

                <a href="${letterUrl}" style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  Open Your Letter
                </a>
              </div>

              <!-- Footer -->
              <div style="text-align: center; margin-top: 40px;">
                <p style="color: #333333; font-size: 11px;">
                  © ${new Date().getFullYear()} Pisma. All rights reserved.
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
