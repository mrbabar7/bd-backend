const seekerUpdateTemplate = `
<!doctype html>
<html lang="en">
<head>
<style>
  body { margin:0; padding:0; background-color:#f8fafc; font-family:Arial,sans-serif; }
  .email-wrap { max-width:500px; margin:40px auto; background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
  .header { padding:30px; background: {bgColor}; text-align:center; color:#ffffff; }
  .body { padding:40px 30px; text-align:center; }
  .status-badge { display:inline-block; padding:6px 16px; border-radius:50px; font-weight:bold; background:{badgeColor}; color:white; margin-bottom:20px; }
  .info-card { background:#f1f5f9; border-radius:16px; padding:20px; text-align:left; margin-top:20px; }
  .info-row { margin-bottom:10px; font-size:14px; color:#334155; border-bottom:1px solid #e2e8f0; padding-bottom:5px; }
  .footer { padding:20px; background:#f8fafc; text-align:center; font-size:12px; color:#94a3b8; }
</style>
</head>
<body>
  <div class="email-wrap">
    <div class="header">
      <div style="font-size:24px; font-weight:800;">🩸 BloodDonation </div>
    </div>
    <div class="body">
      <div class="status-badge">{statusText}</div>
      <h2 style="margin:0; color:#1e293b;">Hello, {seekerName}</h2>
      <p style="color:#64748b; line-height:1.6;">{mainMessage}</p>

      {donorDetailsHtml}

      <div style="margin-top:30px;">
        <a href="http://localhost:5173/dashboard" style="background:#1e293b; color:white; padding:12px 25px; text-decoration:none; border-radius:10px; font-weight:bold;">View Dashboard</a>
      </div>
    </div>
    <div class="footer">© 2026 PakBlood • Community Service</div>
  </div>
</body>
</html>
`;
module.exports = { seekerUpdateTemplate };