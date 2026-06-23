import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server-side email notification endpoint
app.post("/api/send-lead-email", async (req, res) => {
  const payload = req.body;
  
  if (!payload || !payload.fullName || !payload.phone) {
    res.status(400).json({ error: "Invalid lead payload. Missing fullName or phone." });
    return;
  }

  const adminEmail = "sanketbhavsar27@gmail.com";
  
  // Get SMTP settings from env with Gmail settings as helper suggestion
  const smtpHost = process.env.SMTP_HOST || "";
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpSecure = process.env.SMTP_SECURE === "true"; // true for 465, false for other ports
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";
  const smtpFrom = process.env.SMTP_FROM_EMAIL || smtpUser || "SR Finserv Notifications <noreply@srfinserv.co>";

  console.log(`[Email Dispatcher] Received callback request from: ${payload.fullName} (${payload.phone})`);

  // Rich HTML email design to convey premium SR Finserv operational vibe
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SR Finserv - New Callback Request</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          color: #0f172a;
        }
        .wrapper {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
          border: 1px solid #e2e8f0;
        }
        .header {
          background-color: #0c1a30;
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 22px;
          margin: 0 0 5px 0;
          font-weight: 800;
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }
        .header p {
          font-size: 11px;
          text-transform: uppercase;
          margin: 0;
          letter-spacing: 2px;
          color: #60a5fa;
          font-weight: 700;
        }
        .container {
          padding: 30px;
        }
        .status-badge {
          display: inline-block;
          background-color: #ecfdf5;
          border: 1px solid #10b981;
          color: #065f46;
          font-size: 11px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 30px;
          text-transform: uppercase;
          margin-bottom: 25px;
          font-family: monospace;
        }
        .bento-grid {
          background-color: #f8fafc;
          border: 1px solid #edf2f7;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        }
        .bento-item {
          display: block;
          margin-bottom: 12px;
          font-size: 13px;
        }
        .bento-item:last-child {
          margin-bottom: 0;
        }
        .bento-label {
          color: #64748b;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .bento-value {
          font-weight: 600;
          color: #1e293b;
          font-size: 14px;
        }
        .callout {
          background-color: #eff6ff;
          border-left: 4px solid #2563eb;
          padding: 15px;
          border-radius: 4px 8px 8px 4px;
          margin-bottom: 25px;
        }
        .callout-title {
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
          color: #1e40af;
          margin-bottom: 3px;
        }
        .callout-text {
          font-size: 13px;
          color: #1e3a8a;
          margin: 0;
          font-weight: 600;
        }
        .action-button {
          display: block;
          text-align: center;
          background-color: #2563eb;
          color: #ffffff !important;
          text-decoration: none;
          font-weight: bold;
          padding: 14px;
          border-radius: 8px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 25px;
        }
        .footer {
          background-color: #f1f5f9;
          text-align: center;
          padding: 20px;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1>SR FINSERV</h1>
          <p>Automated Client Acquisition Dispatch</p>
        </div>
        <div class="container">
          <span class="status-badge">● Active Lead Received</span>
          
          <div class="bento-grid">
            <div class="bento-item">
              <div class="bento-label">Client Name</div>
              <div class="bento-value">${payload.fullName}</div>
            </div>
            <div class="bento-item">
              <div class="bento-label">Contact Number</div>
              <div class="bento-value">${payload.phone}</div>
            </div>
            <div class="bento-item">
              <div class="bento-label">Email Address</div>
              <div class="bento-value">${payload.email || "N/A"}</div>
            </div>
            <div class="bento-item">
              <div class="bento-label">Desk category</div>
              <div class="bento-value" style="text-transform: uppercase; color: #4f46e5;">${payload.leadType || "N/A"}</div>
            </div>
            <div class="bento-item">
              <div class="bento-label">Requested Segment/Service</div>
              <div class="bento-value" style="color: #0369a1;">${payload.subType || "N/A"}</div>
            </div>
          </div>

          <div class="callout">
            <div class="callout-title">Interactive Details & Requirements</div>
            <p class="callout-text">${payload.details || "Requesting standard advisory callback."}</p>
          </div>

          <p style="font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
            This lead notification was automatically triggered in real-time. Follow up immediately via WhatsApp or voice call.
          </p>

          <a href="https://wa.me/${payload.phone.replace(/[^0-9]/g, '') || "918487974404"}" target="_blank" class="action-button">
            💬 Connect on WhatsApp
          </a>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SR Finserv Automated Desk Platform. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const plainTextEmail = 
    `📢 [SR FINSERV] NEW INQUIRY CALLBACK REQUEST\n\n` +
    `Hello Sanket Bhavsar,\n\n` +
    `A user has submitted an inquiry on the SR Finserv website. Here are the details:\n\n` +
    `- Client Name: ${payload.fullName}\n` +
    `- Contact Number: ${payload.phone}\n` +
    `- Email Address: ${payload.email || "N/A"}\n` +
    `- Desk Category: ${payload.leadType || "N/A"}\n` +
    `- Selected Product: ${payload.subType || "N/A"}\n` +
    `- Requirements/Details: ${payload.details || "Requesting custom advisory callback."}\n\n` +
    `Please reach out to the customer in 1 hour!\n\n` +
    `Triggered at: ${new Date().toLocaleString()}\n`;

  // Check if SMTP environment variables are fully configured
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn(
      `\x1b[33m%s\x1b[0m`,
      `[SMTP WARNING] Email notification configurations (SMTP_HOST, SMTP_USER, SMTP_PASS) are not populated in the environment. ` +
      `System could not send actual HTML notification emails directly to ${adminEmail}.\n` +
      `Please provide SMTP settings via the Settings panel in AI Studio.\n` +
      `Lead Content: name=${payload.fullName}, phone=${payload.phone}`
    );
    
    // We respond with success because the lead is successfully registered locally,
    // and we want to guide them on how to supply the credentials
    res.json({
      success: true,
      warn: "SMTP variables not set up in settings. Lead is saved, but system email could not be forwarded automatically.",
      leadId: payload.id
    });
    return;
  }

  try {
    // Configure NodeMailer transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send notification
    const info = await transporter.sendMail({
      from: smtpFrom,
      to: adminEmail,
      subject: `📢 New Lead Notification - [${payload.subType}] from ${payload.fullName}`,
      text: plainTextEmail,
      html: emailHtml,
    });

    console.log(`[Email Dispatcher] Email dispatched successfully to ${adminEmail}. MessageID: ${info.messageId}`);
    res.json({ success: true, messageId: info.messageId, leadId: payload.id });
  } catch (error) {
    console.error("[Email Dispatcher] Failed to dispatch automated notification email through SMTP transport:", error);
    res.status(500).json({
      error: "Failed to dispatch email via SMTP connection.",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Configure Vite middleware for development or fallback static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Configuring Express to use Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Serving compiled production build assets from 'dist' directory...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] SR Finserv system starting server listening on port ${PORT}`);
    console.log(`[Server] Full-stack access available at http://0.0.0.0:${PORT}`);
  });
}

startServer();
