const requestTemplate = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Urgent Blood Request – BloodDonation </title>

<style>
  body { margin:0; padding:0; background-color:#f8fafc; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
  table { border-collapse:collapse; }
  .email-wrap { width:100%; max-width:500px; margin:40px auto; background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 20px 40px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
  
  /* HEADER */
  .header { padding:40px 20px; background: linear-gradient(135deg, #e11d48 0%, #9f1239 100%); text-align:center; color:#ffffff; }
  .brand { font-size:32px; font-weight:800; letter-spacing:-0.5px; margin-bottom: 4px; }
  .pulse-icon { font-size: 40px; margin-bottom: 10px; display: block; }
  
  /* BODY */
  .body { padding:40px 30px; text-align:center; }
  .greeting { font-size:20px; font-weight:700; color:#1e293b; margin-bottom:12px; }
  .message { font-size:15px; color:#64748b; line-height:1.6; margin-bottom:30px; }

  /* MODERN DATA CARD */
  .data-card { background:#f1f5f9; border-radius:20px; padding:24px; margin-bottom:35px; border: 1px solid #cbd5e1; }
  .data-row { display: table; width: 100%; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
  .data-row:last-child { border: none; margin-bottom: 0; padding-bottom: 0; }
  
  .data-label { display: table-cell; text-align: left; font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; width: 40%; }
  .data-value { display: table-cell; text-align: right; font-size: 15px; font-weight: 700; color: #334155; }
  
  .blood-highlight { color: #e11d48; font-size: 18px; }

  /* BUTTONS */
  .btn-container { display: flex; gap: 12px; justify-content: center; }
  .btn { 
    display: inline-block; 
    padding: 16px 30px; 
    border-radius: 14px; 
    font-weight: 700; 
    font-size: 15px; 
    text-decoration: none; 
    transition: all 0.3s;
    width: 42%;
  }
  .btn-accept { background-color:#e11d48; margin-bottom:5px; color:#ffffff !important; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3); }
  .btn-decline { background-color:#f1f5f9; color:#64748b !important; border: 1px solid #e2e8f0; }

  /* FOOTER */
  .footer { padding:25px; background:#f8fafc; border-top: 1px solid #e2e8f0; text-align:center; font-size:12px; color:#94a3b8; }

  @media only screen and (max-width:480px) {
    .btn { display: block; width: 100%; margin: 8px 0; box-sizing: border-box; }
    .data-label, .data-value { display: block; width: 100%; text-align: center; }
    .data-value { margin-top: 4px; padding-bottom: 10px; }
  }
</style>
</head>

<body>
<center>
  <div class="email-wrap">
    <div class="header">
      <span class="pulse-icon">❤️‍🔥</span>
      <div class="brand">BloodDonation </div>
      <div style="font-size:13px; opacity:0.9;">LIFE SAVING NETWORK</div>
    </div>

    <div class="body">
      <div class="greeting">Urgent Request for {donorName}</div>
      <p class="message">You have been identified as a potential match for a critical blood request. Your quick response could save a life today.</p>

      <div class="data-card">
        <div class="data-row">
          <span class="data-label">👤 SEEKER</span>
          <span class="data-value">{seekerName}</span>
        </div>
        <div class="data-row">
          <span class="data-label">🩸 BLOOD TYPE</span>
          <span class="data-value blood-highlight">{bloodType}</span>
        </div>
        <div class="data-row">
          <span class="data-label">📍 LOCATION</span>
          <span class="data-value">{location}</span>
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <a href="{acceptLink}" class="btn btn-accept">Accept Help</a>
        <a href="{rejectLink}" class="btn btn-decline">Decline</a>
      </div>
      
      <p style="font-size: 12px; color: #94a3b8;">Clicking accept will share your contact info with the seeker.</p>
    </div>

    <div class="footer">
      <b>BloodDonation  2026</b><br/>
      Helping each other, one drop at a time.
    </div>
  </div>
</center>
</body>
</html>
`;

module.exports = { requestTemplate };
