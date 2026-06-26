import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini Client with user-agent for AI Studio telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Server-side OCR document endpoint
app.post("/api/ocr-document", async (req, res) => {
  const { fileData, docName } = req.body;
  
  if (!fileData) {
    res.status(400).json({ error: "Missing fileData payload for OCR." });
    return;
  }

  // Check if GEMINI_API_KEY is available
  if (!process.env.GEMINI_API_KEY) {
    console.warn("[OCR] GEMINI_API_KEY is not defined in the environment. Falling back to default mock extraction.");
    res.json({
      success: true,
      documentType: docName || "Unspecified Document",
      documentDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      extractedSummary: `Successfully registered file named '${docName || "document"}'. [AI Grounding pending configuration]`,
      warn: "GEMINI_API_KEY_MISSING"
    });
    return;
  }

  try {
    const matches = fileData.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      res.status(400).json({ error: "Invalid fileData format. Expected data URI." });
      return;
    }
    const mimeType = matches[1];
    const base64Data = matches[2];

    console.log(`[OCR] Processing document OCR via Gemini for: ${docName} (MIME: ${mimeType})`);

    const imagePart = {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    };

    const promptText = `
      You are an elite financial underwriter assistant at SR Finserv.
      Perform high-precision Optical Character Recognition (OCR) on this uploaded document.
      Identify and extract:
      1. Document Type (e.g. Aadhaar Card, PAN Card, Salary Slip, Bank Statement, Income Tax Return, GST Certificate, Udyam Certificate, Offer Letter, etc.)
      2. Document Date / Statement Period (e.g. '15-Mar-2026', 'April 2026', or 'FY 2025-26').
      3. A short 1-sentence summary of the document, specifically mentioning any client names, company names, or primary numeric figures (e.g., net pay, total tax, address) if legible.
      
      The original slot label is: "${docName}". Ground your analysis on both the image visual details and this label.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, { text: promptText }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: {
              type: Type.STRING,
              description: "The extracted type of document, normalized and formatted."
            },
            documentDate: {
              type: Type.STRING,
              description: "The date or period of the document. If not found, return an empty string."
            },
            extractedSummary: {
              type: Type.STRING,
              description: "Short 1-sentence summary of the document details."
            }
          },
          required: ["documentType", "documentDate", "extractedSummary"]
        }
      }
    });

    const resultText = response.text?.trim() || "{}";
    const ocrData = JSON.parse(resultText);

    console.log("[OCR] Extracted data successfully:", ocrData);

    res.json({
      success: true,
      documentType: ocrData.documentType || docName || "Extracted Document",
      documentDate: ocrData.documentDate || "N/A",
      extractedSummary: ocrData.extractedSummary || "OCR content successfully processed."
    });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[OCR ERROR] Failed to perform OCR via Gemini:", error);
    res.status(500).json({
      error: "Failed to process document OCR",
      details: errMsg
    });
  }
});

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
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[Email Dispatcher] Failed to dispatch automated notification email through SMTP transport:", error);
    
    if (errMsg.includes("Application-specific password required") || errMsg.includes("534-5.7.9") || errMsg.includes("534 5.7.9")) {
      console.error(
        `\n========================================================================\n` +
        `❌ [SMTP AUTHENTICATION ERROR] GMAIL APP PASSWORD REQUIRED\n` +
        `========================================================================\n` +
        `Google requires an "App Password" to authenticate SMTP requests when 2-Step\n` +
        `Verification is enabled. Please follow these simple steps to fix this:\n\n` +
        `1. Go to your Google Account Settings: https://myaccount.google.com/\n` +
        `2. Select "Security" in the left menu.\n` +
        `3. Under "How you sign in to Google", select "2-Step Verification" (ensure it is ON).\n` +
        `4. Scroll to the bottom of the page and select "App passwords".\n` +
        `5. Enter an app name (e.g. "SR Finserv" or "AI Studio") and click "Create".\n` +
        `6. Copy the 16-character password shown on your screen (e.g. "xxxx xxxx xxxx xxxx").\n` +
        `7. Paste this 16-character code as the value for SMTP_PASS in your AI Studio Settings/Secrets.\n` +
        `8. Re-trigger the inquiry form to confirm!\n` +
        `========================================================================\n`
      );
      
      res.status(200).json({
        success: true,
        warn: "GMAIL_APP_PASSWORD_REQUIRED",
        errorDetails: errMsg,
        leadId: payload.id
      });
      return;
    }

    res.status(500).json({
      error: "Failed to dispatch email via SMTP connection.",
      details: errMsg
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
