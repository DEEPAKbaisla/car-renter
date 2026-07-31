export function passwordResetEmailTemplate(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password - RideOwn</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Ride<span style="color:#fbbf24;">Own</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 20px;">
              <h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1e293b;">
                Reset your password
              </h2>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                Hi ${name}, we received a request to reset the password for your RideOwn account. Click the button below to set a new password.
              </p>
            </td>
          </tr>

          <!-- Reset Button -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;">
                    <a href="${resetUrl}" style="display:inline-block;background-color:#1e293b;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info -->
          <tr>
            <td style="padding:0 40px 32px;">
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;text-align:center;">
                This link is valid for <strong style="color:#64748b;">15 minutes</strong>. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                &copy; ${new Date().getFullYear()} RideOwn. All rights reserved.<br/>
                Self-drive car rental platform
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
}
