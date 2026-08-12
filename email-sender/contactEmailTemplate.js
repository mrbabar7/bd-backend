const contactTemplate = `
<!doctype html>
<html lang="en">
<head>
<style>
  body { margin:0; padding:0; background-color:#f4f4f7; font-family:Arial,sans-serif; }
  .email-wrap { max-width:600px; margin:20px auto; background:#ffffff; border-radius:15px; overflow:hidden; border: 1px solid #e2e8f0; }
  .header { padding:20px; background: #E25555; text-align:center; color:#ffffff; }
  .body { padding:30px; }
  .info-box { background:#f8fafc; border-radius:10px; padding:20px; margin-top:15px; border-left: 5px solid #E25555; }
  .label { font-weight:bold; color:#64748b; font-size:12px; text-transform:uppercase; }
  .value { font-size:16px; color:#1e293b; margin-bottom:15px; }
  .footer { padding:15px; background:#f1f5f9; text-align:center; font-size:12px; color:#94a3b8; }
</style>
</head>
<body>
  <div class="email-wrap">
    <div class="header"><h2>New Contact Inquiry 📩</h2></div>
    <div class="body">
      <p>You have received a new message from the BloodDonation contact form:</p>
      <div class="info-box">
        <div class="label">Full Name</div>
        <div class="value">{name}</div>
        
        <div class="label">Email Address</div>
        <div class="value">{email}</div>
        
        <div class="label">Subject</div>
        <div class="value">{subject}</div>
        
        <div class="label">Message</div>
        <div class="value" style="white-space: pre-wrap;">{message}</div>
      </div>
    </div>
    <div class="footer">Sent from BloodDonation  Web Portal</div>
  </div>
</body>
</html>
`;
module.exports = { contactTemplate };
