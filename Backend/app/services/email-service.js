import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// =====================================================
// NODEMAILER TRANSPORTER CONFIGURATION
// =====================================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration on startup
transporter.verify((error) => {
  if (error) {
    console.warn("⚠️  Email transporter setup warning:", error.message);
  } else {
    console.log("✅ Email service is ready to deliver messages.");
  }
});

// =====================================================
// SEND WELCOME EMAIL
// =====================================================
/**
 * Sends a welcome email upon successful user registration.
 *
 * @param {Object} user - User document containing name, email, roles
 * @returns {Promise<Object>} - Nodemailer sendMail result
 */
export const sendWelcomeEmail = async (user) => {
  if (!user || !user.email) {
    throw new Error("Cannot send welcome email without a valid recipient email.");
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const loginUrl = `${frontendUrl}/login`;

  const primaryRole =
    Array.isArray(user.roles) && user.roles.length > 0
      ? user.roles[0]
      : user.role || "CUSTOMER";

  const isHost = primaryRole === "HOST";

  const roleDescription = isHost
    ? "As a registered <strong>Host</strong>, you can now list your vehicle fleet, set daily rental rates, review incoming booking requests, and manage rental earnings seamlessly."
    : "As a registered <strong>Customer</strong>, you can now browse available cars, reserve self-drive journeys, pay securely via Razorpay or Pay at Pickup, and manage your trips anytime.";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AI Car Rental</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1E3A8A; padding: 36px 30px; text-align: center;">
              <h1 style="margin: 0 0 8px 0; color: #FFFFFF; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                🚗 AI Car Rental
              </h1>
              <p style="margin: 0; color: #93C5FD; font-size: 15px; font-weight: 500;">
                Smart, Reliable & Seamless Self-Drive Car Rentals
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 24px 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0F172A;">
                Welcome aboard, ${user.name || "Explorer"}! 🎉
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                Thank you for joining <strong>AI Car Rental</strong>. Your account has been successfully created and is now active and ready to use.
              </p>

              <!-- Account Information Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F1F5F9; border-radius: 8px; border: 1px solid #E2E8F0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px;">
                      Account Summary
                    </h3>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="35%" style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #475569;">Full Name:</td>
                        <td width="65%" style="padding: 4px 0; font-size: 14px; font-weight: 700; color: #0F172A;">${user.name || "N/A"}</td>
                      </tr>
                      <tr>
                        <td width="35%" style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #475569;">Email Address:</td>
                        <td width="65%" style="padding: 4px 0; font-size: 14px; font-weight: 700; color: #0F172A;">${user.email}</td>
                      </tr>
                      <tr>
                        <td width="35%" style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #475569;">Registered Role:</td>
                        <td width="65%" style="padding: 4px 0; font-size: 14px; font-weight: 700; color: #1E3A8A;">${primaryRole}</td>
                      </tr>
                      <tr>
                        <td width="35%" style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #475569;">Status:</td>
                        <td width="65%" style="padding: 4px 0; font-size: 14px; font-weight: 700; color: #10B981;">Active</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Role Description -->
              <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 1.6; color: #475569;">
                ${roleDescription}
              </p>

              <!-- Call to Action Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #1E3A8A; color: #FFFFFF; font-size: 16px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(30, 58, 138, 0.25);">
                      Login to AI Car Rental &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Safety Notice -->
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94A3B8; text-align: center;">
                If you did not register for this account, please disregard this message or contact our team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 24px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 600; color: #64748B;">
                AI-Powered Car Rental Platform
              </p>
              <p style="margin: 0; font-size: 12px; color: #94A3B8;">
                &copy; ${new Date().getFullYear()} AI Car Rental. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"AI Car Rental" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Welcome to AI Car Rental! 🚗 Your Account is Ready",
    text: `Hello ${user.name || "Explorer"},\n\nWelcome to AI Car Rental! Your account has been registered successfully as a ${primaryRole}.\n\nYou can log in at: ${loginUrl}\n\nThank you,\nAI Car Rental Team`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email} (Message ID: ${info.messageId})`);
    return info;
  } catch (error) {
    console.error("Error in email service transporter.sendMail:", error.message);
    throw error;
  }
};

export default {
  sendWelcomeEmail,
};
