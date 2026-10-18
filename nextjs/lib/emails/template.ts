export function baseTemplate(opts: { preheader?: string; body: string }): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Promex Inc.</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;color:transparent;font-size:1px;">${opts.preheader}&nbsp;&#8203;&#8203;&#8203;&#8203;</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#4FA3C7 0%,#7C3AED 100%);padding:28px 36px;border-radius:12px 12px 0 0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><img src="https://www.promexph.com/images/logo.png" alt="Promex Inc." width="150" height="38" style="display:block;"/></td>
      <td align="right" style="color:rgba(255,255,255,0.8);font-size:12px;vertical-align:middle;font-style:italic;">Overseas Recruitment Partner</td>
    </tr></table>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:36px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;line-height:1.6;">
    ${opts.body}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f9fafb;padding:20px 36px;border:1px solid #e5e7eb;border-top:3px solid #4FA3C7;border-radius:0 0 12px 12px;text-align:center;">
    <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;">
      &copy; ${year} Promex Manpower &amp; Allied Services Corp. &middot; All rights reserved.
    </p>
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      <a href="https://promexph.com" style="color:#4FA3C7;text-decoration:none;">promexph.com</a>
      &nbsp;&middot;&nbsp;
      <a href="mailto:connect@promexph.com" style="color:#4FA3C7;text-decoration:none;">connect@promexph.com</a>
      &nbsp;&middot;&nbsp;
      <a href="https://promexph.com/privacy-policy" style="color:#9ca3af;text-decoration:none;">Privacy Policy</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export function primaryBtn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#4FA3C7,#7C3AED);color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">${label}</a>`;
}

export function outlineBtn(label: string, href: string, color = '#7C3AED'): string {
  return `<a href="${href}" style="display:inline-block;border:2px solid ${color};color:${color};text-decoration:none;padding:11px 24px;border-radius:8px;font-size:15px;font-weight:600;">${label}</a>`;
}

export function infoTable(rows: Array<[string, string]>): string {
  return `<table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;font-size:14px;margin-bottom:24px;">
    ${rows.map(([label, value]) => `<tr>
      <td style="padding:8px 0;color:#6b7280;width:160px;border-bottom:1px solid #f3f4f6;vertical-align:top;">${label}</td>
      <td style="padding:8px 0;font-weight:600;color:#1a1a2e;border-bottom:1px solid #f3f4f6;">${value}</td>
    </tr>`).join('')}
  </table>`;
}

export function alertBox(content: string, color: string = '#4FA3C7'): string {
  return `<div style="background:${color}1a;border-left:4px solid ${color};padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;font-size:14px;color:#374151;line-height:1.7;">${content}</div>`;
}
