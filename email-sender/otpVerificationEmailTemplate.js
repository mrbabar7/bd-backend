const useTemplate = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>PakBlood – Verify Your Email</title>

<style>
body {
  margin:0;
  padding:0;
  background-color:#fff1f2;
  font-family:Arial,Helvetica,sans-serif;
}

table { border-collapse:collapse; }
img { border:0; display:block; }
a { text-decoration:none; color:inherit; }

.email-wrap {
  width:100%;
  max-width:560px;
  margin:30px auto;
  background:#ffffff;
  border-radius:20px;
  overflow:hidden;
  box-shadow:0 10px 28px rgba(0,0,0,0.08);
}

/* HEADER */
.header {
  padding:28px 30px;
  background:linear-gradient(135deg,#dc2626,#7f1d1d);
  text-align:center;
  color:#ffffff;
}
.brand {
  font-size:28px;
  font-weight:700;
  letter-spacing:0.6px;
}
.sub {
  margin-top:6px;
  font-size:12px;
  color:#fee2e2;
}

/* BODY */
.body {
  padding:34px 34px;
  color:#1f2933;
  text-align:center;
}
.greeting {
  font-size:16px;
  font-weight:600;
  margin-bottom:10px;
}
.message {
  font-size:14px;
  color:#4b5563;
  margin-bottom:22px;
}

/* OTP */
.otp-wrap {
  margin:16px 0 10px;
}
.otp-box {
  display:inline-block;
  background:#fff5f5;
  border:2px dashed #dc2626;
  border-radius:16px;
  padding:20px 38px;
  font-size:36px;
  font-weight:700;
  letter-spacing:12px;
  color:#991b1b;
}

/* TIMER */
.timer {
  margin-top:12px;
  font-size:14px;
  font-weight:600;
  color:#b91c1c;
}

/* SECURITY */
.security {
  margin-top:16px;
  font-size:12px;
  color:#6b7280;
}

/* FOOTER */
.footer {
  padding:18px 30px;
  background:#fafafa;
  text-align:center;
  font-size:11px;
  color:#9ca3af;
}

.expire {
  margin-top:6px;
  font-size:12px;
  color:#b91c1c;
  font-weight:600;
}

/* MOBILE */
@media only screen and (max-width:420px) {
  .brand { font-size:24px; }
  .otp-box {
    font-size:28px;
    padding:16px 26px;
    letter-spacing:8px;
  }
  .body { padding:26px; }
}
</style>
</head>

<body>
<center>
<table width="100%">
<tr>
<td align="center">

<div class="email-wrap">

<!-- HEADER -->
<div class="header">
  <div class="brand">🩸 BloodDonation </div>
  <div class="sub">Connecting Donors, Saving Lives</div>
</div>

<!-- BODY -->
<div class="body">

  <div class="greeting">Hello, {name}</div>

  <div class="message">
    To continue creating your PakBlood account, please enter the verification
    code below.
  </div>

  <div class="otp-wrap">
    <div class="otp-box">{verificationCode}</div>
  </div>

  <div class="timer">This code expires in 1 minute</div>

  <div class="security">
    For your security, never share this code with anyone.<br/>
    If you didn’t request this verification, you can safely ignore this email.
  </div>

</div>

<!-- FOOTER -->
<div class="footer">
  © 2026 BloodDonation  • All rights reserved
  <div class="expire">
    This OTP is valid for 1 minute. Please verify immediately.
  </div>
</div>

</div>

</td>
</tr>
</table>
</center>
</body>
</html>
`;

module.exports = { useTemplate };
