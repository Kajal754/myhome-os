const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ==========================================
// POSTGRESQL
// ==========================================

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

console.log("Connected database:", process.env.DB_NAME);

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
});

const expensesTableReady = pool.query(`
  ALTER TABLE expenses
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

  
`).catch((error) => {
  console.error("EXPENSES TABLE ERROR:", error);
  throw error;
});

const familyTableReady = pool.query(`
  ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
`).catch((error) => {
  console.error("FAMILY TABLE ERROR:", error);
  throw error;
});

const remindersTableReady = pool.query(`
  CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_date DATE NOT NULL,
    type TEXT NOT NULL DEFAULT 'other',
    priority TEXT NOT NULL DEFAULT 'Medium',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
  `).catch((error) => {
    console.error("REMINDERS TABLE ERROR:", error);
    throw error;
  });

const providersTableReady = pool.query(`
  CREATE TABLE IF NOT EXISTS service_providers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    phone TEXT NOT NULL,
    rating NUMERIC(2,1) NOT NULL DEFAULT 0,
    last_visit TEXT,
    visits INTEGER NOT NULL DEFAULT 0,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'New',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
  `).catch((error) => {
    console.error("PROVIDERS TABLE ERROR:", error);
    throw error;
  });

const maintenanceTableReady = pool.query(`
  CREATE TABLE IF NOT EXISTS maintenance_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset TEXT NOT NULL,
    service TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'Self',
    service_date TEXT NOT NULL,
    cost NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'scheduled',
    category TEXT NOT NULL DEFAULT 'Home Repair',
    progress INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).catch((error) => {
  console.error("MAINTENANCE TABLE ERROR:", error);
  throw error;
});

const brainHistoryTableReady = pool.query(`
  CREATE TABLE IF NOT EXISTS brain_knowledge_history (
    id SERIAL PRIMARY KEY,
    knowledge_id INTEGER,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source_type TEXT,
    source_id INTEGER,
    deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`).catch((error) => {
  console.error("BRAIN HISTORY TABLE ERROR:", error);
  throw error;
});

const brainReminderDateReady = pool.query(`
  ALTER TABLE brain_knowledge
  ADD COLUMN IF NOT EXISTS reminder_date DATE
`).catch((error) => {
  console.error("BRAIN REMINDER DATE ERROR:", error);
  throw error;
});

const emailReminderLogReady = pool.query(`
  CREATE TABLE IF NOT EXISTS email_reminder_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    source_id INTEGER NOT NULL,
    due_date DATE NOT NULL,
    sent_for_date DATE NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, source_type, source_id, due_date, sent_for_date)
  )
`).catch((error) => {
  console.error("EMAIL REMINDER LOG ERROR:", error);
  throw error;
});

// ==========================================
// EMAIL
// ==========================================

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const getNoteReminderDate = (content, reminderDate) => {
  if (reminderDate) return reminderDate;

  const text = String(content || "");
  const match = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?[\s-]*(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i)
    || text.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/);

  if (!match) return null;

  let month;
  let day = Number(match[1]);
  let year = match[3] ? Number(match[3]) : new Date().getFullYear();

  if (Number.isNaN(Number(match[2]))) {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    month = months.findIndex((item) => match[2].toLowerCase().startsWith(item));
  } else {
    month = Number(match[2]) - 1;
  }

  if (year < 100) year += 2000;
  const date = new Date(year, month, day);

  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

const normalizeExpenseDate = (value) => {
  if (!value) return null;

  const text = String(value).trim();
  const parsed = new Date(text);

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10);
};

transporter.verify((error) => {
  if (error) {
    console.error("Email error:", error.message);
  } else {
    console.log("Email service ready ✅");
  }
});

// ==========================================
// TEST
// ==========================================

app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "PostgreSQL connected successfully",
      time: result.rows[0],
    });
  } catch (error) {
    console.error("Database error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ==========================================
// AUTH - LOGIN
// ==========================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const result = await pool.query(
      `
      SELECT id, name, email, password, email_verified, gender
FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Account nahi mila. Please register first.",
      });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Email ya password incorrect hai.",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        email_verified: user.email_verified,
        gender: user.gender,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// ==========================================
// AUTH - SEND OTP
// ==========================================

app.post("/api/auth/send-otp", async (req, res) => {
  try {
   const { name, email, password, gender } = req.body;

    if (!name || !email || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await pool.query(
      "DELETE FROM email_otps WHERE email = $1",
      [cleanEmail]
    );

    await pool.query(
      `
      INSERT INTO email_otps
      (email, otp, expires_at)
      VALUES ($1, $2, $3)
      `,
      [cleanEmail, otp, expiresAt]
    );

    console.log("Sending OTP to:", cleanEmail);

    const mailInfo = await transporter.sendMail({
      from: `"MyHome" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: "MyHome Email Verification",

      html: `
        <div style="
          background:#eef1ec;
          padding:40px 20px;
          font-family:Arial;
        ">
          <div style="
            max-width:550px;
            margin:auto;
            background:white;
            padding:40px;
            border-radius:25px;
            text-align:center;
          ">

            <h1 style="color:#20201d;">
              MyHome
            </h1>

            <p style="color:#777;">
              Verify your email address
            </p>

            <p>
              Your verification code is:
            </p>

            <div style="
              background:#eef1ec;
              padding:20px;
              border-radius:15px;
              display:inline-block;
              margin:20px;
            ">
              <strong style="
                font-size:34px;
                letter-spacing:8px;
              ">
                ${otp}
              </strong>
            </div>

            <p style="color:#777;">
              This OTP will expire in 5 minutes.
            </p>

            <p style="
              color:#aaa;
              font-size:12px;
              margin-top:30px;
            ">
              If you didn't request this OTP,
              ignore this email.
            </p>

          </div>
        </div>
      `,
    });

    console.log("OTP sent successfully ✅");
    console.log("Message ID:", mailInfo.messageId);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
});

// ==========================================
// AUTH - VERIFY OTP + REGISTER
// ==========================================

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { name, email, password, gender, otp } = req.body;

    if (!name || !email || !password || !gender || !otp) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and OTP are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const otpResult = await pool.query(
      `
      SELECT *
      FROM email_otps
      WHERE email = $1
      AND otp = $2
      AND expires_at > NOW()
      ORDER BY id DESC
      LIMIT 1
      `,
      [cleanEmail, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "This email is already registered",
      });
    }

    const result = await pool.query(
      `
       INSERT INTO users
  (name, email, password, email_verified, gender)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING id, name, email, email_verified, gender
  `,
  [
    name.trim(),
    cleanEmail,
    password,
    true,
    gender,
      ]
    );

    await pool.query(
      "DELETE FROM email_otps WHERE email = $1",
      [cleanEmail]
    );

    res.json({
      success: true,
      message: "Registration successful",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
});

// ==========================================
// ASSETS - GET USER ASSETS
// ==========================================

app.get("/api/assets", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM assets
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [user_id]
    );
    

    const assets = result.rows.map((asset) => {
      let image = asset.image || null;

      if (asset.image_data) {
        const type = asset.image_type || "image/jpeg";

        image =
          `data:${type};base64,` +
          asset.image_data.toString("base64");
      }

      return {
        ...asset,
        image,
      };
    });

    res.json({
      success: true,
      assets,
    });
  } catch (error) {
    console.error("GET assets error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load assets",
      error: error.message,
    });
  }
});

// ==========================================
// ASSETS - GET ONE
// ==========================================

app.get("/api/assets/:id", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM assets
      WHERE id = $1
      AND user_id = $2
      `,
      [req.params.id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    const asset = result.rows[0];

    let image = asset.image || null;

    if (asset.image_data) {
      const type = asset.image_type || "image/jpeg";

      image =
        `data:${type};base64,` +
        asset.image_data.toString("base64");
    }

    res.json({
      success: true,
      asset: {
        ...asset,
        image,
      },
    });
  } catch (error) {
    console.error("GET asset error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load asset",
      error: error.message,
    });
  }
});

// ==========================================
// ASSETS - ADD
// ==========================================

app.post("/api/assets", async (req, res) => {
  try {
    const {
      user_id,
      name,
      category,
      brand,
      model,
      price,
      purchase_date,
      warranty,
      location,
      description,
      image,
      image_type,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Asset name is required",
      });
    }

    const cleanPrice = price
      ? Number(String(price).replace(/[₹,\s]/g, ""))
      : 0;

    let imageData = null;
    let imageType = image_type || "image/jpeg";
    let imageValue = image || null;

    if (image && image.startsWith("data:image/")) {
      const match = image.match(
        /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
      );

      if (!match) {
        return res.status(400).json({
          success: false,
          message: "Invalid image format",
        });
      }

      imageType = match[1];
      imageData = Buffer.from(match[2], "base64");
    }

    const result = await pool.query(
      `
      INSERT INTO assets
      (
        user_id,
        name,
        category,
        brand,
        model,
        price,
        purchase_date,
        warranty,
        location,
        description,
        image,
        image_data,
        image_type
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13
      )
      RETURNING *
      `,
      [
        user_id,
        name.trim(),
        category || null,
        brand || null,
        model || null,
        cleanPrice,
        purchase_date || null,
        warranty || null,
        location || null,
        description || null,
        imageValue,
        imageData,
        imageType,
      ]
    );

    const asset = result.rows[0];

    let responseImage = asset.image || null;

    if (asset.image_data) {
      const type = asset.image_type || "image/jpeg";

      responseImage =
        `data:${type};base64,` +
        asset.image_data.toString("base64");
    }

    res.json({
      success: true,
      message: "Asset added successfully",
      asset: {
        ...asset,
        image: responseImage,
      },
    });
    sendUpcomingReminderEmails();
  } catch (error) {
    console.error("ADD asset error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add asset",
      error: error.message,
    });
  }
});

// ==========================================
// ASSETS - UPDATE
// ==========================================

app.put("/api/assets/:id", async (req, res) => {
  try {
    const {
      user_id,
      name,
      category,
      brand,
      model,
      price,
      purchase_date,
      warranty,
      location,
      description,
      image,
      image_type,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Asset name is required",
      });
    }

    const existingResult = await pool.query(
      `
      SELECT *
      FROM assets
      WHERE id = $1
      AND user_id = $2
      `,
      [req.params.id, user_id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    const existingAsset = existingResult.rows[0];

    let imageData = existingAsset.image_data;
    let imageType =
      existingAsset.image_type || "image/jpeg";
    let imageValue = existingAsset.image || null;

    if (image && image.startsWith("data:image/")) {
      const match = image.match(
        /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
      );

      if (!match) {
        return res.status(400).json({
          success: false,
          message: "Invalid image format",
        });
      }

      imageType = match[1];
      imageData = Buffer.from(match[2], "base64");
      imageValue = image;
    }

    const cleanPrice = price
      ? Number(String(price).replace(/[₹,\s]/g, ""))
      : 0;

    const result = await pool.query(
      `
      UPDATE assets
      SET
        name = $1,
        category = $2,
        brand = $3,
        model = $4,
        price = $5,
        purchase_date = $6,
        warranty = $7,
        location = $8,
        description = $9,
        image = $10,
        image_data = $11,
        image_type = $12
      WHERE id = $13
      AND user_id = $14
      RETURNING *
      `,
      [
        name.trim(),
        category || null,
        brand || null,
        model || null,
        cleanPrice,
        purchase_date || null,
        warranty || null,
        location || null,
        description || null,
        imageValue,
        imageData,
        imageType,
        req.params.id,
        user_id,
      ]
    );

    const asset = result.rows[0];

    let responseImage = asset.image || null;

    if (asset.image_data) {
      const type = asset.image_type || "image/jpeg";

      responseImage =
        `data:${type};base64,` +
        asset.image_data.toString("base64");
    }

    res.json({
      success: true,
      message: "Asset updated successfully",
      asset: {
        ...asset,
        image: responseImage,
      },
    });
    sendUpcomingReminderEmails();
  } catch (error) {
    console.error("UPDATE asset error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update asset",
      error: error.message,
    });
  }
});

// ==========================================
// ASSETS - DELETE + HISTORY
// ==========================================

app.delete("/api/assets/:id", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const assetResult = await pool.query(
      `
      SELECT *
      FROM assets
      WHERE id = $1
      AND user_id = $2
      `,
      [req.params.id, user_id]
    );

    if (assetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    const asset = assetResult.rows[0];

    await pool.query(
      `
      INSERT INTO asset_history
      (
        asset_id,
        action,
        name,
        category,
        brand,
        model,
        price,
        purchase_date,
        warranty,
        location,
        description,
        image,
        image_data,
        image_type
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14
      )
      `,
      [
        asset.id,
        "DELETE",
        asset.name,
        asset.category,
        asset.brand,
        asset.model,
        asset.price,
        asset.purchase_date,
        asset.warranty,
        asset.location,
        asset.description,
        asset.image,
        asset.image_data,
        asset.image_type,
      ]
    );

    const result = await pool.query(
      `
      DELETE FROM assets
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [req.params.id, user_id]
    );

    res.json({
      success: true,
      message: "Asset deleted successfully",
      asset: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE asset error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete asset",
      error: error.message,
    });
  }
});

// ==========================================
// DOCUMENTS - GET USER DOCUMENTS
// ==========================================

app.get("/api/documents", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM documents
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    const documents = result.rows.map((doc) => {
      let image = doc.image || null;

      if (doc.image_data) {
        const type = doc.image_type || "image/jpeg";

        image =
          `data:${type};base64,` +
          doc.image_data.toString("base64");
      }

      return {
        ...doc,
        documentNo: doc.document_no,
        image,
      };
    });

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("GET documents error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load documents",
      error: error.message,
    });
  }
});

// ==========================================
// DOCUMENTS - GET ONE
// ==========================================

app.get("/api/documents/:id", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM documents
      WHERE id = $1
      AND user_id = $2
      `,
      [req.params.id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const doc = result.rows[0];

    let image = doc.image || null;

    if (doc.image_data) {
      const type = doc.image_type || "image/jpeg";

      image =
        `data:${type};base64,` +
        doc.image_data.toString("base64");
    }

    res.json({
      success: true,
      document: {
        ...doc,
        documentNo: doc.document_no,
        image,
      },
    });
  } catch (error) {
    console.error("GET document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load document",
      error: error.message,
    });
  }
});

// ==========================================
// DOCUMENTS - ADD
// ==========================================

app.post("/api/documents", async (req, res) => {
  try {
    const {
      user_id,
      name,
      category,
      holder,
      documentNo,
      added,
      expiry,
      status,
      image,
      image_type,
      icon,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Document name is required",
      });
    }

    let imageData = null;
    let imageType = image_type || "image/jpeg";

    if (image && image.startsWith("data:image/")) {
      const match = image.match(
        /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
      );

      if (!match) {
        return res.status(400).json({
          success: false,
          message: "Invalid image format",
        });
      }

      imageType = match[1];
      imageData = Buffer.from(match[2], "base64");
    }

    const result = await pool.query(
      `
      INSERT INTO documents
      (
        user_id,
        name,
        category,
        holder,
        document_no,
        added,
        expiry,
        status,
        image,
        image_data,
        image_type,
        icon
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12
      )
      RETURNING *
      `,
      [
        user_id,
        name.trim(),
        category || null,
        holder || null,
        documentNo || null,
        added || null,
        expiry || null,
        status || null,
        image || null,
        imageData,
        imageType,
        icon || null,
      ]
    );

   const document = result.rows[0];

// ==========================================
// SAVE DOCUMENT TO SECOND BRAIN
// ==========================================

try {
  await pool.query(
    `
    INSERT INTO brain_knowledge
    (
      user_id,
      title,
      content,
      source_type,
      source_id
    )
    VALUES ($1, $2, $3, $4, $5)
    `,
    [
      document.user_id,
      document.name,
      `
Document Name: ${document.name}
Category: ${document.category || "Not specified"}
Holder: ${document.holder || "Not specified"}
Document Number: ${document.document_no || "Not specified"}
Added: ${document.added || "Not specified"}
Expiry: ${document.expiry || "Not specified"}
Status: ${document.status || "Not specified"}
      `.trim(),
      "document",
      document.id,
    ]
  );

  console.log("DOCUMENT SAVED TO SECOND BRAIN ✅");
} catch (brainError) {
  console.error("DOCUMENT BRAIN SAVE ERROR:", brainError);
}

let responseImage = document.image || null;

    if (document.image_data) {
      const type = document.image_type || "image/jpeg";

      responseImage =
        `data:${type};base64,` +
        document.image_data.toString("base64");
    }

    res.json({
      success: true,
      message: "Document added successfully",
      document: {
        ...document,
        documentNo: document.document_no,
        image: responseImage,
      },
    });
  } catch (error) {
    console.error("ADD document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add document",
      error: error.message,
    });
  }
});

// ==========================================
// DOCUMENTS - UPDATE
// ==========================================

app.put("/api/documents/:id", async (req, res) => {
  try {
    const {
      user_id,
      name,
      category,
      holder,
      document_no,
      added,
      expiry,
      status,
      image,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE documents
      SET
        name = $1,
        category = $2,
        holder = $3,
        document_no = $4,
        added = $5,
        expiry = $6,
        status = $7,
        image = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      AND user_id = $10
      RETURNING *
      `,
      [
        name || null,
        category || null,
        holder || null,
        document_no || null,
        added || null,
        expiry || null,
        status || null,
        image || null,
        req.params.id,
        user_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    res.json({
      success: true,
      message: "Document updated successfully",
      document: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update document",
      error: error.message,
    });
  }
});

// ==========================================
// DOCUMENTS - DELETE + HISTORY
// ==========================================

app.delete("/api/documents/:id", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const documentResult = await pool.query(
      `
      SELECT *
      FROM documents
      WHERE id = $1
      AND user_id = $2
      `,
      [req.params.id, user_id]
    );

    if (documentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const doc = documentResult.rows[0];

    await pool.query(
      `
      INSERT INTO document_history
      (
        document_id,
        action,
        name,
        category,
        holder,
        document_no,
        added,
        expiry,
        status,
        image,
        image_data,
        image_type,
        icon
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13
      )
      `,
      [
        doc.id,
        "DELETE",
        doc.name,
        doc.category,
        doc.holder,
        doc.document_no,
        doc.added,
        doc.expiry,
        doc.status,
        doc.image,
        doc.image_data,
        doc.image_type,
        doc.icon,
      ]
    );

    const result = await pool.query(
      `
      DELETE FROM documents
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [req.params.id, user_id]
    );

    res.json({
      success: true,
      message: "Document deleted successfully",
      document: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE document error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
});

// ==========================================
// EXPENSES - GET
// ==========================================

app.get("/api/expenses", async (req, res) => {
  try {
    await expensesTableReady;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM expenses
      WHERE user_id = $1
      ORDER BY date DESC, id DESC
      `,
      [user_id]
    );

    res.json({
      success: true,
      expenses: result.rows,
    });
  } catch (error) {
    console.error("GET expenses error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load expenses",
      error: error.message,
    });
  }
});

// ==========================================
// EXPENSES - ADD
// ==========================================

app.post("/api/expenses", async (req, res) => {
  try {
    await expensesTableReady;
    const {
      user_id,
      title,
      amount,
      category,
      date,
      description,
    } = req.body;

    if (!user_id || !title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Expense title is required",
      });
    }

    const cleanAmount = amount
      ? Number(String(amount).replace(/[₹,\s]/g, ""))
      : 0;

    const result = await pool.query(
      `
      INSERT INTO expenses
      (
        user_id,
        title,
        amount,
        category,
        date,
        description
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        user_id,
        title.trim(),
        cleanAmount,
        category || null,
        normalizeExpenseDate(date),
        description || null,
      ]
    );

    res.json({
      success: true,
      message: "Expense added successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("ADD expense error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add expense",
      error: error.message,
    });
  }
});

// ==========================================
// EXPENSES - UPDATE
// ==========================================

app.put("/api/expenses/:id", async (req, res) => {
  try {
    await expensesTableReady;
    const {
      user_id,
      title,
      amount,
      category,
      date,
      description,
    } = req.body;

    const cleanAmount = amount
      ? Number(String(amount).replace(/[₹,\s]/g, ""))
      : 0;

    const result = await pool.query(
      `
      UPDATE expenses
      SET
        title = $1,
        amount = $2,
        category = $3,
        date = $4,
        description = $5
      WHERE id = $6 AND user_id = $7
      RETURNING *
      `,
      [
        title?.trim() || null,
        cleanAmount,
        category || null,
        date || null,
        description || null,
        req.params.id,
        user_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      message: "Expense updated successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE expense error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update expense",
      error: error.message,
    });
  }
});

// ==========================================
// EXPENSES - DELETE + HISTORY
// ==========================================

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await expensesTableReady;
    const { id } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const expenseResult = await pool.query(
      "SELECT * FROM expenses WHERE id = $1 AND user_id = $2",
      [id, user_id]
    );

    if (expenseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const expense = expenseResult.rows[0];

    await pool.query(
      `
      INSERT INTO expense_history
      (
        expense_id,
        action,
        title,
        amount,
        category,
        date,
        description
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        expense.id,
        "DELETE",
        expense.title,
        expense.amount,
        expense.category,
        expense.date,
        expense.description,
      ]
    );

    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, user_id]
    );

    res.json({
      success: true,
      message: "Expense deleted successfully",
      expense: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE expense error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete expense",
      error: error.message,
    });
  }
});

// ==========================================
// EXPENSES - HISTORY
// ==========================================

app.get("/api/expenses/history", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      SELECT eh.*
      FROM expense_history eh
      WHERE eh.expense_id IN (
        SELECT e.id
        FROM expenses e
        WHERE e.user_id = $1
      )
      ORDER BY eh.deleted_at DESC, eh.id DESC
      `,
      [user_id]
    );

    res.json({
      success: true,
      history: result.rows,
    });
  } catch (error) {
    console.error("GET expense history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load expense history",
      error: error.message,
    });
  }
});

// ==========================================
// FAMILY MEMBERS
// ==========================================

app.get("/api/family-members", async (req, res) => {
  try {
    await familyTableReady;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM family_members
      WHERE user_id = $1
      ORDER BY id DESC
      `,
      [user_id]
    );

    res.json({
      success: true,
      members: result.rows,
    });
  } catch (error) {
    console.error("GET family members error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load family members",
      error: error.message,
    });
  }
});

// ==========================================
// ADD FAMILY MEMBER
// ==========================================

app.post("/api/family-members", async (req, res) => {
  try {
    await familyTableReady;
    const {
      user_id,
      name,
      email,
      role,
      status,
      joined,
      avatar,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO family_members
      (
        user_id,
        name,
        email,
        role,
        status,
        joined,
        avatar
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
      `,
      [
        user_id,
        name || null,
        email || null,
        role || "Member",
        status || "Pending",
        joined || "Invitation sent",
        avatar || null,
      ]
    );

    res.json({
      success: true,
      message: "Family member added successfully",
      member: result.rows[0],
    });
  } catch (error) {
    console.error("ADD FAMILY MEMBER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add family member",
      error: error.message,
    });
  }
});

// ==========================================
// UPDATE FAMILY MEMBER
// ==========================================

app.put("/api/family-members/:id", async (req, res) => {
  try {
    await familyTableReady;
    const {
      user_id,
      name,
      email,
      role,
      status,
      joined,
      avatar,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE family_members
      SET
        name = $1,
        email = $2,
        role = $3,
        status = $4,
        joined = $5,
        avatar = $6,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND user_id = $8
      RETURNING *
      `,
      [
        name || null,
        email || null,
        role || null,
        status || null,
        joined || null,
        avatar || null,
        req.params.id,
        user_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    res.json({
      success: true,
      message: "Family member updated successfully",
      member: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE family member error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update family member",
      error: error.message,
    });
  }
});

// ==========================================
// DELETE FAMILY MEMBER
// ==========================================

app.delete("/api/family-members/:id", async (req, res) => {
  try {
    await familyTableReady;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const memberResult = await pool.query(
      "SELECT * FROM family_members WHERE id = $1 AND user_id = $2",
      [req.params.id, user_id]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    const member = memberResult.rows[0];

    await pool.query(
      `
      INSERT INTO family_member_history
      (
        member_id,
        action,
        name,
        email,
        role,
        status,
        joined,
        avatar
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        member.id,
        "DELETE",
        member.name,
        member.email,
        member.role,
        member.status,
        member.joined,
        member.avatar,
      ]
    );

    const result = await pool.query(
      `
      DELETE FROM family_members
      WHERE id = $1 AND user_id = $2
      RETURNING *
      `,
      [req.params.id, user_id]
    );

    res.json({
      success: true,
      message: "Family member deleted successfully",
      member: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE family member error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete family member",
      error: error.message,
    });
  }
});

// ==========================================
// SETTINGS - GET USER SETTINGS
// ==========================================

app.get("/api/settings", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    let result = await pool.query(
      `
      SELECT *
      FROM user_settings
      WHERE user_id = $1
      LIMIT 1
      `,
      [user_id]
    );

    if (result.rows.length === 0) {
      result = await pool.query(
        `
        INSERT INTO user_settings
        (
          user_id,
          name,
          email,
          photo,
          notifications,
          warranty_alerts,
          maintenance_alerts,
          theme
        )
        SELECT id, name, email, $2, $3, $4, $5, $6
        FROM users
        WHERE id = $1
        RETURNING *
        `,
        [
          user_id,
          null,
          true,
          true,
          true,
          "light",
        ]
      );
    }

    res.json({
      success: true,
      settings: result.rows[0],
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load settings",
      error: error.message,
    });
  }
});

// ==========================================
// SETTINGS - UPDATE
// ==========================================

app.put("/api/settings", async (req, res) => {
  try {
    const {
      user_id,
      name,
      email,
      photo,
      notifications,
      warranty_alerts,
      maintenance_alerts,
      theme,
    } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const result = await pool.query(
      `
      UPDATE user_settings
      SET
        name = $1,
        email = $2,
        photo = $3,
        notifications = $4,
        warranty_alerts = $5,
        maintenance_alerts = $6,
        theme = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $8
      RETURNING *
      `,
      [
        name || null,
        email || null,
        photo || null,
        notifications ?? true,
        warranty_alerts ?? true,
        maintenance_alerts ?? true,
        theme || "light",
        user_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update settings",
      error: error.message,
    });
  }
});

app.delete("/api/settings/account", async (req, res) => {
  const client = await pool.connect();

  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    await client.query("BEGIN");

    await client.query(
      "DELETE FROM asset_history WHERE asset_id IN (SELECT id FROM assets WHERE user_id = $1)",
      [user_id]
    );
    await client.query(
      "DELETE FROM document_history WHERE document_id IN (SELECT id FROM documents WHERE user_id = $1)",
      [user_id]
    );
    await client.query(
      "DELETE FROM family_member_history WHERE member_id IN (SELECT id FROM family_members WHERE user_id = $1)",
      [user_id]
    );
    await client.query(
      "DELETE FROM expense_history WHERE expense_id IN (SELECT id FROM expenses WHERE user_id = $1)",
      [user_id]
    );

    const tables = [
      "user_settings",
      "family_members",
      "reminders",
      "service_providers",
      "maintenance_records",
      "expenses",
      "documents",
      "assets",
    ];

    for (const table of tables) {
      await client.query(`DELETE FROM ${table} WHERE user_id = $1`, [user_id]);
    }

    const result = await client.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [user_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "Account not found" });
    }

    await client.query("COMMIT");

    res.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("DELETE ACCOUNT ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to delete account" });
  } finally {
    client.release();
  }
});

// ==========================================
// SERVER
// ==========================================

app.get("/api/service-providers", async (req, res) => {
  try {
    await providersTableReady;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const result = await pool.query(
      `SELECT * FROM service_providers
       WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );

    res.json({ success: true, providers: result.rows });
  } catch (error) {
    console.error("GET service providers error:", error);
    res.status(500).json({ success: false, message: "Failed to load service providers" });
  }
});

app.post("/api/service-providers", async (req, res) => {
  try {
    await providersTableReady;
    const {
      user_id,
      name,
      category,
      phone,
      rating,
      last_visit,
      location,
    } = req.body;

    if (!user_id || !name?.trim() || !category || !phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "User ID, name, category and phone are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO service_providers
       (user_id, name, category, phone, rating, last_visit, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [user_id, name.trim(), category, phone.trim(), Number(rating) || 0, last_visit || null, location || null]
    );

    res.status(201).json({ success: true, provider: result.rows[0] });
  } catch (error) {
    console.error("ADD service provider error:", error);
    res.status(500).json({ success: false, message: "Failed to save service provider" });
  }
});

app.put("/api/service-providers/:id", async (req, res) => {
  try {
    await providersTableReady;
    const {
      user_id,
      name,
      category,
      phone,
      rating,
      last_visit,
      visits,
      location,
      status,
    } = req.body;

    const result = await pool.query(
      `UPDATE service_providers
       SET name = $1, category = $2, phone = $3, rating = $4,
           last_visit = $5, visits = $6, location = $7, status = $8
       WHERE id = $9 AND user_id = $10 RETURNING *`,
      [name?.trim(), category, phone?.trim(), Number(rating) || 0, last_visit || null, Number(visits) || 0, location || null, status || "New", req.params.id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Service provider not found" });
    }

    res.json({ success: true, provider: result.rows[0] });
  } catch (error) {
    console.error("UPDATE service provider error:", error);
    res.status(500).json({ success: false, message: "Failed to update service provider" });
  }
});

app.delete("/api/service-providers/:id", async (req, res) => {
  try {
    await providersTableReady;
    const result = await pool.query(
      `DELETE FROM service_providers
       WHERE id = $1 AND user_id = $2 RETURNING id`,
      [req.params.id, req.query.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Service provider not found" });
    }

    res.json({ success: true, message: "Service provider deleted" });
  } catch (error) {
    console.error("DELETE service provider error:", error);
    res.status(500).json({ success: false, message: "Failed to delete service provider" });
  }
});

app.get("/api/maintenance", async (req, res) => {
  try {
    await maintenanceTableReady;
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ success: false, message: "User ID is required" });

    const result = await pool.query(
      `SELECT id, asset, service, provider, service_date AS date, cost, status, category, progress
       FROM maintenance_records WHERE user_id = $1 ORDER BY id DESC`,
      [user_id]
    );
    res.json({ success: true, records: result.rows });
  } catch (error) {
    console.error("GET maintenance error:", error);
    res.status(500).json({ success: false, message: "Failed to load maintenance" });
  }
});

app.post("/api/maintenance", async (req, res) => {
  try {
    await maintenanceTableReady;
    const { user_id, asset, service, provider, date, cost, status, category, progress } = req.body;
    if (!user_id || !asset?.trim() || !service?.trim() || !date) {
      return res.status(400).json({ success: false, message: "User ID, asset, service and date are required" });
    }

    const result = await pool.query(
      `INSERT INTO maintenance_records (user_id, asset, service, provider, service_date, cost, status, category, progress)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, asset, service, provider, service_date AS date, cost, status, category, progress`,
      [user_id, asset.trim(), service.trim(), provider || "Self", date, Number(cost || 0), status || "scheduled", category || "Home Repair", Number(progress || 0)]
    );
    res.status(201).json({ success: true, record: result.rows[0] });
  } catch (error) {
    console.error("ADD maintenance error:", error);
    res.status(500).json({ success: false, message: "Failed to save maintenance" });
  }
});

app.put("/api/maintenance/:id", async (req, res) => {
  try {
    await maintenanceTableReady;
    const { user_id, asset, service, provider, date, cost, status, category, progress } = req.body;
    const result = await pool.query(
      `UPDATE maintenance_records
       SET asset=$1, service=$2, provider=$3, service_date=$4, cost=$5, status=$6, category=$7, progress=$8
       WHERE id=$9 AND user_id=$10
       RETURNING id, asset, service, provider, service_date AS date, cost, status, category, progress`,
      [asset?.trim(), service?.trim(), provider || "Self", date, Number(cost || 0), status || "scheduled", category || "Home Repair", Number(progress || 0), req.params.id, user_id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Maintenance record not found" });
    res.json({ success: true, record: result.rows[0] });
  } catch (error) {
    console.error("UPDATE maintenance error:", error);
    res.status(500).json({ success: false, message: "Failed to update maintenance" });
  }
});

app.delete("/api/maintenance/:id", async (req, res) => {
  try {
    await maintenanceTableReady;
    const result = await pool.query(
      "DELETE FROM maintenance_records WHERE id=$1 AND user_id=$2 RETURNING id",
      [req.params.id, req.query.user_id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Maintenance record not found" });
    res.json({ success: true });
  } catch (error) {
    console.error("DELETE maintenance error:", error);
    res.status(500).json({ success: false, message: "Failed to delete maintenance" });
  }
});


// ==========================================
// SECOND BRAIN - SAVE KNOWLEDGE
// ==========================================

app.post("/api/brain/knowledge", async (req, res) => {
  try {
    const {
      user_id,
      title,
      content,
      source_type,
      source_id,
      reminder_date,
    } = req.body;

    if (!user_id || !title || !content) {
      return res.status(400).json({
        message: "user_id, title and content are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO brain_knowledge
      (
        user_id,
        title,
        content,
        source_type,
        source_id,
        reminder_date
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        user_id,
        title,
        content,
        source_type || "note",
        source_id || null,
        getNoteReminderDate(content, reminder_date),
      ]
    );

    res.status(201).json(result.rows[0]);
    sendUpcomingReminderEmails();
  } catch (error) {
    console.error("SECOND BRAIN SAVE ERROR:", error);

    res.status(500).json({
      message: "Failed to save knowledge",
      error: error.message,
    });
  }
});

// ==========================================
// SECOND BRAIN - GET USER KNOWLEDGE
// ==========================================

app.get("/api/brain/knowledge", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        message: "user_id is required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM brain_knowledge
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("SECOND BRAIN GET ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch knowledge",
      error: error.message,
    });
  }
});

app.delete("/api/brain/knowledge/:id", async (req, res) => {
  try {
    await brainHistoryTableReady;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    const knowledgeResult = await pool.query(
      `SELECT * FROM brain_knowledge WHERE id = $1 AND user_id = $2`,
      [req.params.id, user_id]
    );

    if (!knowledgeResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Knowledge item not found",
      });
    }

    const item = knowledgeResult.rows[0];

    await pool.query(
      `
      INSERT INTO brain_knowledge_history
        (knowledge_id, user_id, title, content, source_type, source_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        item.id,
        item.user_id,
        item.title,
        item.content,
        item.source_type,
        item.source_id,
      ]
    );

    await pool.query(
      `DELETE FROM brain_knowledge WHERE id = $1 AND user_id = $2`,
      [req.params.id, user_id]
    );

    res.json({
      success: true,
      message: "Knowledge item deleted and added to history",
    });
  } catch (error) {
    console.error("SECOND BRAIN DELETE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete knowledge item",
      error: error.message,
    });
  }
});
// ==========================================
// SECOND BRAIN - ASK / SEARCH
// ==========================================

app.post("/api/brain/ask", async (req, res) => {
  try {
    const { user_id, question } = req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "user_id is required",
      });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "question is required",
      });
    }

    const originalQuestion = question.trim();
    const q = originalQuestion.toLowerCase();

    // ==========================================
    // HELPERS
    // ==========================================

    const normalize = (value) =>
      String(value || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const hasWord = (text, word) => {
      const normalizedText = normalize(text);
      const normalizedWord = normalize(word);

      if (!normalizedWord) return false;

      return normalizedText
        .split(" ")
        .includes(normalizedWord);
    };

    const includesAny = (terms) =>
      terms.some((term) => q.includes(term));

    const recordText = (record) =>
      Object.values(record || {})
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            value !== ""
        )
        .join(" ")
        .toLowerCase();

    const formatDate = (value) => {
      if (!value) return "Not saved";

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    const formatMoney = (value) =>
      `₹${Number(value || 0).toLocaleString("en-IN")}`;

    const noData = (section) =>
      `Aapke ${section} section mein abhi relevant data saved nahi hai. Pehle wahan record add karein.`;

    const knowledgeSearchWords = (text) =>
      normalize(text)
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 2 &&
            ![
              "what",
              "when",
              "where",
              "which",
              "who",
              "how",
              "is",
              "are",
              "the",
              "my",
              "mere",
              "meri",
              "mera",
              "mujhe",
              "ka",
              "ki",
              "ke",
              "kya",
              "kab",
              "hai",
              "hain",
              "me",
              "mein",
              "par",
              "pe",
              "batao",
              "bata",
              "please",
              "tell",
              "about",
              "note",
              "notes",
              "memory",
              "memories",
              "knowledge",
              "remember",
              "saved",
            ].includes(word)
        );

    const knowledgeWordMatches = (text, word) => {
      const aliases = {
        mom: ["mom", "mother", "mummy", "mama", "ammi"],
        mother: ["mom", "mother", "mummy", "mama", "ammi"],
        mummy: ["mom", "mother", "mummy", "mama", "ammi"],
        mama: ["mom", "mother", "mummy", "mama", "ammi"],
        ammi: ["mom", "mother", "mummy", "mama", "ammi"],
        papa: ["papa", "father", "dad", "daddy", "pitaji"],
        father: ["papa", "father", "dad", "daddy", "pitaji"],
        dad: ["papa", "father", "dad", "daddy", "pitaji"],
        daddy: ["papa", "father", "dad", "daddy", "pitaji"],
        pitaji: ["papa", "father", "dad", "daddy", "pitaji"],
      };

      return (aliases[word] || [word]).some((alias) =>
        hasWord(text, alias)
      );
    };

    const isVehicle = (record) => {
      const text = recordText(record);

      return (
        hasWord(text, "car") ||
        hasWord(text, "vehicle") ||
        hasWord(text, "bike") ||
        hasWord(text, "scooter") ||
        hasWord(text, "auto") ||
        hasWord(text, "motorcycle") ||
        hasWord(text, "gaadi")
      );
    };

    const isAC = (record) => {
      const text = recordText(record);

      return (
        hasWord(text, "ac") ||
        hasWord(text, "air conditioner") ||
        text.includes("air conditioner")
      );
    };

    const isThisMonth = (value) => {
      if (!value) return false;

      const date = new Date(value);
      const now = new Date();

      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    };

    const isActiveWarranty = (value) => {
      if (!value) return false;

      const expiry = new Date(value);

      return (
        !Number.isNaN(expiry.getTime()) &&
        expiry >= new Date()
      );
    };

    const isExpiringSoon = (value) => {
      if (!value) return false;

      const expiry = new Date(value);
      const today = new Date();

      const days =
        (expiry - today) / (1000 * 60 * 60 * 24);

      return (
        !Number.isNaN(expiry.getTime()) &&
        days >= 0 &&
        days <= 60
      );
    };

    // ==========================================
    // LOAD ONLY THIS USER'S DATA
    // ==========================================

    

    const [
  documentsResult,
  assetsResult,
  expensesResult,
  maintenanceResult,
  knowledgeResult,
  familyResult,
  remindersResult,
  providersResult,
  settingsResult,
] = await Promise.all([
      pool.query(
  `
  SELECT
    id,
    name,
    category,
    holder,
    document_no,
    added,
    expiry,
    status
  FROM documents
  WHERE user_id = $1
  ORDER BY created_at DESC
  `,
  [user_id]
),
      pool.query(
        `
        SELECT
          id,
          name,
          category,
          brand,
          model,
          price,
          purchase_date,
          warranty,
          location,
          description
        FROM assets
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [user_id]
      ),

      pool.query(
        `
        SELECT
          id,
          title,
          amount,
          category,
          date,
          description
        FROM expenses
        WHERE user_id = $1
        ORDER BY date DESC, id DESC
        `,
        [user_id]
      ),

      pool.query(
        `
        SELECT
          id,
          asset,
          service,
          provider,
          service_date,
          cost,
          status,
          category
        FROM maintenance_records
        WHERE user_id = $1
        ORDER BY service_date DESC, id DESC
        `,
        [user_id]
      ),

      pool.query(
        `
        SELECT
          id,
          title,
          content,
          source_type,
          created_at
        FROM brain_knowledge
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [user_id]
      ),
            pool.query(
        `
        SELECT
          id,
          name,
          email,
          role,
          status,
          joined,
          avatar
        FROM family_members
        WHERE user_id = $1
        ORDER BY id DESC
        `,
        [user_id]
      ),

      pool.query(
        `
        SELECT
          id,
          title,
          description,
          reminder_date,
          type,
          priority,
          completed
        FROM reminders
        WHERE user_id = $1
        ORDER BY reminder_date ASC, id DESC
        `,
        [user_id]
      ),

      pool.query(
        `
        SELECT
          id,
          name,
          category,
          phone,
          rating,
          last_visit,
          visits,
          location,
          status
        FROM service_providers
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [user_id]
      ),

      pool.query(
        `
        SELECT
          id,
          name,
          email,
          photo,
          notifications,
          warranty_alerts,
          maintenance_alerts,
          theme
        FROM user_settings
        WHERE user_id = $1
        LIMIT 1
        `,
        [user_id]
      ),
    ]);

    const documents = documentsResult.rows;
    const assets = assetsResult.rows;
    const expenses = expensesResult.rows;
    const maintenance = maintenanceResult.rows;
    const knowledge = knowledgeResult.rows;
    const familyMembers = familyResult.rows;
    const reminders = remindersResult.rows;
    const serviceProviders = providersResult.rows;
    const settings = settingsResult.rows;

    console.log("====================================");
    console.log("SECOND BRAIN USER:", user_id);
    console.log("QUESTION:", originalQuestion);
    console.log("DOCUMENTS:", documents.length);
    console.log("ASSETS:", assets.length);
    console.log("EXPENSES:", expenses.length);
    console.log("MAINTENANCE:", maintenance.length);
    console.log("KNOWLEDGE:", knowledge.length);
    console.log("FAMILY MEMBERS:", familyMembers.length);
    console.log("REMINDERS:", reminders.length);
    console.log("SERVICE PROVIDERS:", serviceProviders.length);
    console.log("SETTINGS:", settings.length);
    console.log("====================================");

    // ==========================================
    // 1. WHAT HAVE I SAVED?
    // ==========================================

    const asksSavedData =
      includesAny([
        "kya kya save",
        "kya-kya save",
        "what have i saved",
        "what all have i saved",
        "what did i save",
        "sabhi data",
        "all my data",
        "my saved data",
        "saved data",
      ]);

    if (asksSavedData) {
      const total =
        documents.length +
        assets.length +
        expenses.length +
        maintenance.length +
        knowledge.length;

      if (total === 0) {
        return res.json({
          success: true,
          found: false,
          answer:
            "Aapke Second Brain mein abhi koi data saved nahi hai. Documents, Assets, Expenses, Maintenance ya Notes mein record add karke shuru karein.",
          results: [],
        });
      }

      const answer = `
Aapke Second Brain mein saved data:

Documents: ${documents.length}
Assets: ${assets.length}
Expenses: ${expenses.length}
Maintenance records: ${maintenance.length}
Saved notes: ${knowledge.length}

${
  documents.length
    ? `\nDocuments:\n${documents
        .map(
          (doc) =>
            `• ${doc.name || "Unnamed document"}`
        )
        .join("\n")}`
    : ""
}

${
  assets.length
    ? `\nAssets:\n${assets
        .map(
          (asset) =>
            `• ${asset.name || "Unnamed asset"} — ${
              asset.location || "Location not saved"
            }`
        )
        .join("\n")}`
    : ""
}

${
  expenses.length
    ? `\nRecent Expenses:\n${expenses
        .slice(0, 10)
        .map(
          (expense) =>
            `• ${expense.title || "Expense"} — ${formatMoney(
              expense.amount
            )}`
        )
        .join("\n")}`
    : ""
}

${
  maintenance.length
    ? `\nMaintenance:\n${maintenance
        .slice(0, 10)
        .map(
          (item) =>
            `• ${item.asset || "Asset"} — ${
              item.service || "Service"
            }`
        )
        .join("\n")}`
    : ""
}
`.trim();

      return res.json({
        success: true,
        found: true,
        answer,
        results: [
          ...documents.map((x) => ({
            type: "document",
            ...x,
          })),

          ...assets.map((x) => ({
            type: "asset",
            ...x,
          })),

          ...expenses.map((x) => ({
            type: "expense",
            ...x,
          })),

          ...maintenance.map((x) => ({
            type: "maintenance",
            ...x,
          })),

          ...knowledge.map((x) => ({
            type: "brain",
            ...x,
          })),
        ],
      });
    }

    // ==========================================
    // 2. WARRANTIES
    // ==========================================

    if (
      includesAny([
        "warranty",
        "warranties",
        "guarantee",
        "guarantee",
      ])
    ) {
      const warrantyAssets = assets.filter(
        (asset) => asset.warranty
      );

      if (!warrantyAssets.length) {
        return res.json({
          success: true,
          found: false,
          answer:
            "Aapke Assets mein abhi koi warranty information saved nahi hai.",
          results: [],
        });
      }

      const wantsExpiring = includesAny([
        "expire",
        "expiry",
        "expir",
        "khatam",
        "ending",
        "soon",
        "jaldi",
      ]);

      const wantsActive =
        includesAny([
          "active",
          "valid",
          "chal rahi",
          "currently",
        ]) || !wantsExpiring;

      let records = warrantyAssets;

      if (wantsExpiring) {
        records = warrantyAssets.filter((asset) =>
          isExpiringSoon(asset.warranty)
        );
      } else if (wantsActive) {
        records = warrantyAssets.filter((asset) =>
          isActiveWarranty(asset.warranty)
        );
      }

      if (!records.length) {
        return res.json({
          success: true,
          found: false,
          answer: wantsExpiring
            ? "Aapki koi warranty agle 60 din mein expire nahi ho rahi."
            : "Aapki koi active warranty saved nahi hai.",
          results: [],
        });
      }

      const answer = records
        .map(
          (asset) =>
            `• ${asset.name || "Asset"}${
              asset.brand ? ` (${asset.brand})` : ""
            }
 — Warranty: ${formatDate(asset.warranty)}
   Location: ${
     asset.location || "Location not saved"
   }`
        )
        .join("\n");

      return res.json({
        success: true,
        found: true,
        answer:
          `${
            wantsExpiring
              ? "Agle 60 din mein expire hone wali warranties:"
              : "Active warranties:"
          }\n\n${answer}`,
        results: records,
      });
    }

    // ==========================================
    // 3. EXPENSES
    // ==========================================

    if (
      includesAny([
        "spend",
        "spent",
        "kharch",
        "expense",
        "expenses",
        "kharcha",
        "kitna spend",
        "kitna kharch",
      ])
    ) {
      const monthlyExpenses = expenses.filter(
        (expense) => isThisMonth(expense.date)
      );

      if (!monthlyExpenses.length) {
        return res.json({
          success: true,
          found: false,
          answer:
            "Is month aapke Expenses section mein koi expense saved nahi hai.",
          results: [],
        });
      }

      const total = monthlyExpenses.reduce(
        (sum, expense) =>
          sum + Number(expense.amount || 0),
        0
      );

      const details = monthlyExpenses
        .map(
          (expense) =>
            `• ${expense.title || "Expense"} — ${formatMoney(
              expense.amount
            )}${
              expense.category
                ? ` (${expense.category})`
                : ""
            }`
        )
        .join("\n");

      return res.json({
        success: true,
        found: true,
        answer:
          `Is month aapne total ${formatMoney(
            total
          )} spend kiya hai.\n\n${details}`,
        results: monthlyExpenses,
      });
    }

    // ==========================================
    // 4. MAINTENANCE / SERVICE
    // ==========================================

    if (
      includesAny([
        "maintenance",
        "service",
        "servicing",
        "last service",
        "last servicing",
      ])
    ) {
      let records = maintenance;

      const vehicleQuestion = includesAny([
        "car",
        "vehicle",
        "gaadi",
        "bike",
        "scooter",
        "motorcycle",
      ]);

      if (vehicleQuestion) {
        records = maintenance.filter(isVehicle);
      }

      if (!records.length) {
        return res.json({
          success: true,
          found: false,
          answer: vehicleQuestion
            ? "Mujhe aapke saved Maintenance records mein vehicle ki koi service nahi mili."
            : "Mujhe aapke Maintenance records mein koi service record nahi mila.",
          results: [],
        });
      }

      const last = records[0];

      return res.json({
        success: true,
        found: true,
        answer:
          `Latest ${
            vehicleQuestion ? "vehicle " : ""
          }service record:\n\n` +
          `Asset: ${
            last.asset || "Not saved"
          }\n` +
          `Service: ${
            last.service || "Not saved"
          }\n` +
          `Date: ${formatDate(
            last.service_date
          )}\n` +
          `Provider: ${
            last.provider || "Not saved"
          }\n` +
          `Cost: ${formatMoney(
            last.cost
          )}\n` +
          `Status: ${
            last.status || "Not saved"
          }`,
        results: records,
      });
    }

    // ==========================================
    // 5. DOCUMENTS
    // ==========================================

    const documentTerms = [
      "aadhar",
      "adhar",
      "aadhaar",
      "adhaar",
      "pan",
      "passport",
      "driving",
      "license",
      "licence",
      "voter",
      "document",
      "certificate",
    ];

    const asksDocument =
      documentTerms.some((term) =>
        q.includes(term)
      );

    if (asksDocument) {
      if (!documents.length) {
        return res.json({
          success: true,
          found: false,
          answer: noData("Documents"),
          results: [],
        });
      }

      let matches = [];

      // ------------------------------------------
      // AADHAAR
      // ------------------------------------------

      if (
        includesAny([
          "aadhar",
          "adhar",
          "aadhaar",
          "adhaar",
        ])
      ) {
        matches = documents.filter((doc) => {
          const text = recordText(doc);

          return (
            text.includes("aadhar") ||
            text.includes("aadhaar") ||
            text.includes("adhar") ||
            text.includes("adhaar")
          );
        });
      }

      // ------------------------------------------
      // PAN
      // ------------------------------------------

      else if (hasWord(q, "pan")) {
        matches = documents.filter((doc) => {
          const text = recordText(doc);

          return (
            hasWord(text, "pan") ||
            text.includes("permanent account")
          );
        });
      }

      // ------------------------------------------
      // PASSPORT
      // ------------------------------------------

      else if (hasWord(q, "passport")) {
        matches = documents.filter((doc) =>
          recordText(doc).includes("passport")
        );
      }

      // ------------------------------------------
      // DRIVING LICENSE
      // ------------------------------------------

      else if (
        q.includes("driving") ||
        q.includes("license") ||
        q.includes("licence")
      ) {
        matches = documents.filter((doc) => {
          const text = recordText(doc);

          return (
            text.includes("driving") ||
            text.includes("license") ||
            text.includes("licence")
          );
        });
      }

      // ------------------------------------------
      // VOTER
      // ------------------------------------------

      else if (hasWord(q, "voter")) {
        matches = documents.filter((doc) =>
          recordText(doc).includes("voter")
        );
      }

      // ------------------------------------------
      // EXPIRY QUESTIONS
      // ------------------------------------------

      else if (
        includesAny([
          "expiry",
          "expire",
          "expir",
          "khatam",
        ])
      ) {
        matches = documents.filter(
          (doc) => doc.expiry
        );
      }

      // ------------------------------------------
      // GENERIC DOCUMENT
      // ------------------------------------------

      else {
        matches = documents;
      }

      if (!matches.length) {
        return res.json({
          success: true,
          found: false,
          answer:
            `Mujhe "${originalQuestion}" se match karta hua document nahi mila.\n\n` +
            `Aapke saved documents:\n` +
            documents
              .map(
                (doc) =>
                  `• ${doc.name || "Unnamed document"}`
              )
              .join("\n"),
          results: [],
        });
      }

      // ------------------------------------------
      // EXPIRY QUESTION
      // ------------------------------------------

      if (
        includesAny([
          "expiry",
          "expire",
          "expir",
          "khatam",
        ])
      ) {
        const expiryRecords = matches.filter(
          (doc) => doc.expiry
        );

        if (!expiryRecords.length) {
          return res.json({
            success: true,
            found: false,
            answer:
              "Is document ki expiry date aapne save nahi ki hai.",
            results: matches,
          });
        }

        return res.json({
          success: true,
          found: true,
          answer:
            `Document expiry details:\n\n` +
            expiryRecords
              .map(
                (doc) =>
                  `• ${
                    doc.name || "Document"
                  } — ${formatDate(
                    doc.expiry
                  )} — Status: ${
                    doc.status || "Not specified"
                  }`
              )
              .join("\n"),
          results: expiryRecords,
        });
      }

      const doc = matches[0];

      // ------------------------------------------
      // DOCUMENT LOCATION
      // ------------------------------------------

      if (
        includesAny([
          "where",
          "kahan",
          "kaha",
          "kidhar",
          "location",
        ])
      ) {
        return res.json({
          success: true,
          found: true,
          answer:
            `${doc.name || "Document"} mil gaya.\n\n` +
            `📍 Location: ${
              doc.location ||
              doc.description ||
              "Is document ki location aapne save nahi ki hai."
            }`,
          results: matches,
        });
      }

      // ------------------------------------------
      // DOCUMENT NUMBER
      // ------------------------------------------

      if (
        includesAny([
          "number",
          "number kya",
          "document no",
          "document number",
          "no.",
        ])
      ) {
        return res.json({
          success: true,
          found: true,
          answer:
            `${doc.name || "Document"} mil gaya.\n\n` +
            `Document Number: ${
              doc.document_no ||
              "Document number save nahi kiya gaya hai."
            }`,
          results: matches,
        });
      }

      // ------------------------------------------
      // GENERAL DOCUMENT DETAILS
      // ------------------------------------------

      return res.json({
        success: true,
        found: true,
        answer:
          `${doc.name || "Document"} aapke Documents mein saved hai.\n\n` +
          `Category: ${
            doc.category || "Not specified"
          }\n` +
          `Holder: ${
            doc.holder || "Not specified"
          }\n` +
          `Document Number: ${
            doc.document_no || "Not specified"
          }\n` +
          `Location: ${
            doc.location || "Not specified"
          }\n` +
          `Added: ${formatDate(doc.added)}\n` +
          `Expiry: ${formatDate(doc.expiry)}\n` +
          `Status: ${
            doc.status || "Not specified"
          }\n` +
          `Description: ${
            doc.description || "Not specified"
          }`,
        results: matches,
      });
    }

    // ==========================================
// 6. ASSETS
// ==========================================

const asksAsset =
  includesAny([
    "asset",
    "assets",
    "mere paas",
    "mere pass",
    "my assets",
    "my things",
    "my items",
    "item",
    "items",
  ]) ||
  includesAny([
    "where",
    "kahan",
    "kaha",
    "kidhar",
    "location",
    "warranty",
    "guarantee",
    "model",
    "brand",
    "price",
    "cost",
    "purchase",
    "bought",
    "liya",
    "liye",
    "kaunsa",
    "kaunsi",
    "details",
    "detail",
  ]);

if (asksAsset) {
  // ------------------------------------------
  // NO ASSETS
  // ------------------------------------------

  if (!assets.length) {
    return res.json({
      success: true,
      found: false,
      answer:
        "Aapke Assets section mein abhi koi asset saved nahi hai. Pehle Assets page par asset add karein.",
      results: [],
    });
  }

  // ------------------------------------------
  // ALL ASSETS
  // ------------------------------------------

  if (
    includesAny([
      "mere paas",
      "mere pass",
      "my assets",
      "all assets",
      "kaun kaun",
      "kaun kaun se",
      "kya kya asset",
      "what assets",
      "my things",
      "my items",
      "mere assets",
      "mere items",
    ])
  ) {
    return res.json({
      success: true,
      found: true,

      answer:
        `Aapke saved Assets (${assets.length}):\n\n` +
        assets
          .map(
            (asset) =>
              `• ${asset.name || "Unnamed asset"}\n` +
              `  Category: ${asset.category || "Not saved"}\n` +
              `  Brand: ${asset.brand || "Not saved"}\n` +
              `  Model: ${asset.model || "Not saved"}\n` +
              `  Price: ${
                asset.price !== null &&
                asset.price !== undefined &&
                asset.price !== ""
                  ? formatMoney(asset.price)
                  : "Not saved"
              }\n` +
              `  Purchase Date: ${
                asset.purchase_date
                  ? formatDate(asset.purchase_date)
                  : "Not saved"
              }\n` +
              `  Warranty: ${
                asset.warranty
                  ? formatDate(asset.warranty)
                  : "Not saved"
              }\n` +
              `  📍 Location: ${
                asset.location || "Not saved"
              }\n` +
              `  Description: ${
                asset.description || "Not saved"
              }`
          )
          .join("\n\n"),

      results: assets,
    });
  }

  // ------------------------------------------
  // FIND ASSET FROM QUESTION
  // ------------------------------------------

  const ignoredWords = new Set([
  "where",
  "is",
  "are",
  "my",
  "the",
  "a",
  "an",

  "mera",
  "meri",
  "mere",
  "mujhe",

  "hai",
  "hain",
  "ka",
  "ki",
  "ke",

  "kahan",
  "kaha",
  "kidhar",

  "location",
  "please",
  "show",
  "tell",
  "me",
  "about",

  "details",
  "detail",
  "information",
  "info",

  "saved",
  "save",

  "asset",
  "assets",
  "item",
  "items",

  "warranty",
  "warranties",
  "guarantee",

  "model",
  "brand",

  "price",
  "cost",

  "purchase",
  "purchased",
  "bought",

  "kab",
  "tak",
  "kya",

  "kaunsa",
  "kaunsi",
  "kaun",

  "se",
  "mein",
  "me",
  "par",
  "pe",

  "batao",
  "bata",
  "dikhao",
]);

  const keywords = normalize(originalQuestion)
  .split(/\s+/)
  .filter(
    (word) =>
      word.length > 2 &&
      !ignoredWords.has(word)
  );

let matches = [];

if (keywords.length) {
  matches = assets.filter((asset) => {
    const searchableText = [
      asset.name,
      asset.category,
      asset.brand,
      asset.model,
      asset.location,
      asset.description,
      asset.warranty,
      asset.purchase_date,
      asset.price,
      asset.purchase_price,
    ]
      .filter(
        (value) =>
          value !== null &&
          value !== undefined
      )
      .join(" ")
      .toLowerCase();

    return keywords.some((word) =>
      searchableText.includes(word.toLowerCase())
    );
  });
}

  // ------------------------------------------
  // MATCH ASSET
  // ------------------------------------------

  if (keywords.length) {
    matches = assets.filter((asset) => {
      const text = recordText(asset);

      return keywords.some((word) =>
        text.includes(word)
      );
    });
  }

  // ------------------------------------------
  // IF NO MATCH
  // ------------------------------------------

 if (!matches.length) {
  const requestedAsset = keywords.join(" ");

  return res.json({
    success: true,
    found: false,
    answer: `${requestedAsset || "This asset"} is not available.`,
    results: [],
  });
}

  // ------------------------------------------
  // FIRST MATCH
  // ------------------------------------------

  const asset = matches[0];

  // ------------------------------------------
  // WHAT INFORMATION IS BEING ASKED?
  // ------------------------------------------

  const asksLocation = includesAny([
    "where",
    "kahan",
    "kaha",
    "kidhar",
    "location",
  ]);

  const asksWarranty = includesAny([
    "warranty",
    "warranties",
    "guarantee",
  ]);

  const asksModel = includesAny([
    "model",
  ]);

  const asksBrand = includesAny([
    "brand",
  ]);

  const asksPrice = includesAny([
    "price",
    "cost",
    "kitne ka",
    "kitne ki",
    "kitne mein",
    "kitne me",
  ]);

  const asksPurchaseDate = includesAny([
    "purchase date",
    "purchased",
    "bought",
    "kab liya",
    "kab kharida",
    "purchase",
  ]);

  const asksDetails = includesAny([
    "details",
    "detail",
    "about",
    "batao",
    "bata",
    "information",
    "info",
  ]);

  // ------------------------------------------
  // LOCATION
  // LOCATION + COMPLETE DETAILS
  // ------------------------------------------

  if (asksLocation) {
   return res.json({
  success: true,
  found: true,
  answer:
    `${asset.name || "Asset"} is saved in your Assets.\n\n` +
    `📍 Location: ${asset.location || "Not specified"}\n` +
    `Category: ${asset.category || "Not specified"}\n` +
    `Brand: ${asset.brand || "Not specified"}\n` +
    `Model: ${asset.model || "Not specified"}\n` +
    `Price: ${
      asset.price !== null &&
      asset.price !== undefined &&
      asset.price !== ""
        ? formatMoney(asset.price)
        : "Not specified"
    }\n` +
    `Purchase Date: ${
      asset.purchase_date
        ? formatDate(asset.purchase_date)
        : "Not specified"
    }\n` +
    `Warranty: ${
      asset.warranty
        ? formatDate(asset.warranty)
        : "Not specified"
    }\n` +
    `Description: ${asset.description || "Not specified"}`,
  results: matches,
});
  }

  // ------------------------------------------
  // WARRANTY
  // ------------------------------------------

  if (asksWarranty) {
    return res.json({
      success: true,
      found: true,

      answer:
        `${asset.name || "Asset"} ki warranty:\n\n` +
        `Warranty: ${
          asset.warranty
            ? formatDate(asset.warranty)
            : "Is asset ki warranty information save nahi ki gayi hai."
        }\n` +
        `Brand: ${
          asset.brand || "Not specified"
        }\n` +
        `Model: ${
          asset.model || "Not specified"
        }\n` +
        `Location: ${
          asset.location || "Not specified"
        }`,

      results: matches,
    });
  }

  // ------------------------------------------
  // MODEL
  // ------------------------------------------

  if (asksModel) {
    return res.json({
      success: true,
      found: true,

      answer:
        `${asset.name || "Asset"} ka model:\n\n` +
        `Model: ${
          asset.model ||
          "Is asset ka model save nahi kiya gaya hai."
        }\n` +
        `Brand: ${
          asset.brand || "Not specified"
        }\n` +
        `Location: ${
          asset.location || "Not specified"
        }`,

      results: matches,
    });
  }

  // ------------------------------------------
  // BRAND
  // ------------------------------------------

  if (asksBrand) {
    return res.json({
      success: true,
      found: true,

      answer:
        `${asset.name || "Asset"} ka brand:\n\n` +
        `Brand: ${
          asset.brand ||
          "Is asset ka brand save nahi kiya gaya hai."
        }\n` +
        `Model: ${
          asset.model || "Not specified"
        }\n` +
        `Location: ${
          asset.location || "Not specified"
        }`,

      results: matches,
    });
  }

  // ------------------------------------------
  // PRICE
  // ------------------------------------------

  if (asksPrice) {
    return res.json({
      success: true,
      found: true,

      answer:
        `${asset.name || "Asset"} ki saved price:\n\n` +
        `Price: ${
          asset.price !== null &&
          asset.price !== undefined &&
          asset.price !== ""
            ? formatMoney(asset.price)
            : "Is asset ki price save nahi ki gayi hai."
        }\n` +
        `Purchase Date: ${
          asset.purchase_date
            ? formatDate(asset.purchase_date)
            : "Not specified"
        }\n` +
        `Location: ${
          asset.location || "Not specified"
        }`,

      results: matches,
    });
  }

  // ------------------------------------------
  // PURCHASE DATE
  // ------------------------------------------

  if (asksPurchaseDate) {
    return res.json({
      success: true,
      found: true,

      answer:
        `${asset.name || "Asset"} ki purchase date:\n\n` +
        `Purchase Date: ${
          asset.purchase_date
            ? formatDate(asset.purchase_date)
            : "Purchase date save nahi ki gayi hai."
        }\n` +
        `Price: ${
          asset.price !== null &&
          asset.price !== undefined &&
          asset.price !== ""
            ? formatMoney(asset.price)
            : "Not specified"
        }\n` +
        `Location: ${
          asset.location || "Not specified"
        }`,

      results: matches,
    });
  }

  // ------------------------------------------
  // COMPLETE DETAILS
  // ------------------------------------------

  if (asksDetails) {
    return res.json({
      success: true,
      found: true,

      answer:
        `${asset.name || "Asset"} ki complete saved details:\n\n` +
        `Name: ${
          asset.name || "Not specified"
        }\n` +
        `Category: ${
          asset.category || "Not specified"
        }\n` +
        `Brand: ${
          asset.brand || "Not specified"
        }\n` +
        `Model: ${
          asset.model || "Not specified"
        }\n` +
        `Price: ${
          asset.price !== null &&
          asset.price !== undefined &&
          asset.price !== ""
            ? formatMoney(asset.price)
            : "Not specified"
        }\n` +
        `Purchase Date: ${
          asset.purchase_date
            ? formatDate(asset.purchase_date)
            : "Not specified"
        }\n` +
        `Warranty: ${
          asset.warranty
            ? formatDate(asset.warranty)
            : "Not specified"
        }\n` +
        `📍 Location: ${
          asset.location || "Not specified"
        }\n` +
        `Description: ${
          asset.description || "Not specified"
        }`,

      results: matches,
    });
  }

  // ------------------------------------------
  // DEFAULT COMPLETE DETAILS
  // ------------------------------------------

  return res.json({
    success: true,
    found: true,

    answer:
      `${asset.name || "Asset"} aapke Assets mein saved hai.\n\n` +
      `Category: ${
        asset.category || "Not specified"
      }\n` +
      `Brand: ${
        asset.brand || "Not specified"
      }\n` +
      `Model: ${
        asset.model || "Not specified"
      }\n` +
      `Price: ${
        asset.price !== null &&
        asset.price !== undefined &&
        asset.price !== ""
          ? formatMoney(asset.price)
          : "Not specified"
      }\n` +
      `Purchase Date: ${
        asset.purchase_date
          ? formatDate(asset.purchase_date)
          : "Not specified"
      }\n` +
      `Warranty: ${
        asset.warranty
          ? formatDate(asset.warranty)
          : "Not specified"
      }\n` +
      `📍 Location: ${
        asset.location || "Not specified"
      }\n` +
      `Description: ${
        asset.description || "Not specified"
      }`,

    results: matches,
  });
}

    // ==========================================
    // 7. GENERIC LOCATION SEARCH
    // ==========================================

    if (
      includesAny([
        "where",
        "kahan",
        "kaha",
        "kidhar",
        "location",
      ])
    ) {
      const ignoredWords = new Set([
        "where",
        "is",
        "my",
        "the",
        "a",
        "an",
        "mera",
        "meri",
        "mere",
        "hai",
        "hain",
        "kahan",
        "kaha",
        "kidhar",
        "location",
        "please",
        "show",
        "tell",
        "me",
      ]);

      const keywords =
        normalize(originalQuestion)
          .split(" ")
          .filter(
            (word) =>
              word.length > 2 &&
              !ignoredWords.has(word)
          );

      const matchingAsset = assets.find(
        (asset) =>
          keywords.length &&
          keywords.some((word) =>
            recordText(asset).includes(word)
          )
      );

      const matchingDocument = documents.find(
        (doc) =>
          keywords.length &&
          keywords.some((word) =>
            recordText(doc).includes(word)
          )
      );

      const record =
        matchingAsset || matchingDocument;

      if (record) {
        const section = matchingAsset
          ? "Assets"
          : "Documents";

        return res.json({
          success: true,
          found: true,
          answer:
            `${record.name || "Item"} ${section} mein saved hai.\n\n` +
            `📍 Location: ${
              record.location ||
              record.description ||
              "Location save nahi ki gayi hai."
            }`,
          results: [record],
        });
      }

      return res.json({
        success: true,
        found: false,
        answer:
          `Mujhe "${originalQuestion}" se match karta hua item nahi mila.\n\n` +
          `Agar aapne item add nahi kiya hai, to use Assets ya Documents section mein save karein.`,
        results: [],
      });
    }

    // ==========================================
    // 8. NOTES / BRAIN KNOWLEDGE
    // ==========================================

    const knowledgeKeywords = knowledgeSearchWords(originalQuestion);
    const hasKnowledgeMatch = knowledgeKeywords.length > 0 &&
      knowledge.some((item) => {
        const text = recordText(item);
        return knowledgeKeywords.every((word) =>
          knowledgeWordMatches(text, word)
        );
      });

    if (
      includesAny([
        "note",
        "notes",
        "knowledge",
        "remember",
        "yaad",
        "saved note",
      ]) || hasKnowledgeMatch
    ) {
      if (!knowledge.length) {
        return res.json({
          success: true,
          found: false,
          answer: "This information is not available.",
          results: [],
        });
      }

      const keywords = knowledgeKeywords;

      const matches = keywords.length
        ? knowledge.filter((item) => {
            const text = recordText(item);

            return keywords.every((word) =>
              knowledgeWordMatches(text, word)
            );
          })
        : knowledge;

      if (!matches.length) {
        return res.json({
          success: true,
          found: false,
          answer:
            `This information is not available in your saved notes.`,
          results: [],
        });
      }

      return res.json({
        success: true,
        found: true,
        answer:
          `Aapke saved notes:\n\n` +
          matches
            .map(
              (item) =>
                `• ${item.title || "Untitled note"}\n${item.content || ""}\n` +
                `  Added: ${formatDate(item.created_at)}`
            )
            .join("\n\n"),
        results: matches,
      });
    }
    // ==========================================
// 9. FAMILY MEMBERS
// ==========================================

if (
  includesAny([
    "family",
    "family member",
    "family members",
    "ghar ke log",
    "family mein",
    "members",
  ])
) {
  if (!familyMembers.length) {
    return res.json({
      success: true,
      found: false,
      answer:
        "Aapke Family section mein abhi koi family member saved nahi hai.",
      results: [],
    });
  }

  return res.json({
    success: true,
    found: true,
    answer:
      `Aapke Family Members (${familyMembers.length}):\n\n` +
      familyMembers
        .map(
          (member) =>
            `• ${member.name || "Unnamed member"}\n` +
            `  Email: ${member.email || "Not saved"}\n` +
            `  Role: ${member.role || "Not saved"}\n` +
            `  Status: ${member.status || "Not saved"}`
        )
        .join("\n\n"),
    results: familyMembers,
  });
}


// ==========================================
// 10. REMINDERS
// ==========================================

if (
  includesAny([
    "reminder",
    "reminders",
    "yaad dilana",
    "yaad dilao",
    "upcoming reminder",
    "next reminder",
  ])
) {
  if (!reminders.length) {
    return res.json({
      success: true,
      found: false,
      answer:
        "Aapke Reminders section mein abhi koi reminder saved nahi hai.",
      results: [],
    });
  }

  const upcoming = reminders.filter(
    (reminder) => !reminder.completed
  );

  if (!upcoming.length) {
    return res.json({
      success: true,
      found: false,
      answer:
        "Aapke saare saved reminders complete ho chuke hain.",
      results: [],
    });
  }

  return res.json({
    success: true,
    found: true,
    answer:
      `Aapke upcoming reminders (${upcoming.length}):\n\n` +
      upcoming
        .slice(0, 10)
        .map(
          (reminder) =>
            `• ${reminder.title || "Reminder"}\n` +
            `  Date: ${formatDate(reminder.reminder_date)}\n` +
            `  Type: ${reminder.type || "Not specified"}\n` +
            `  Priority: ${reminder.priority || "Not specified"}\n` +
            `  Description: ${reminder.description || "Not specified"}`
        )
        .join("\n\n"),
    results: upcoming,
  });
}


// ==========================================
// 11. SERVICE PROVIDERS
// ==========================================

if (
  includesAny([
    "service provider",
    "service providers",
    "provider",
    "providers",
    "plumber",
    "electrician",
    "car mechanic",
    "mechanic",
    "technician",
    "repair person",
  ])
) {
  if (!serviceProviders.length) {
    return res.json({
      success: true,
      found: false,
      answer:
        "Aapke Service Providers section mein abhi koi provider saved nahi hai.",
      results: [],
    });
  }

  let matches = serviceProviders;

  const providerKeywords = normalize(originalQuestion)
    .split(/\s+/)
    .filter(
      (word) =>
        word.length > 2 &&
        ![
          "service",
          "services",
          "provider",
          "providers",
          "mera",
          "meri",
          "mere",
          "kaun",
          "hai",
          "hain",
          "who",
          "my",
          "the",
          "is",
        ].includes(word)
    );

  if (providerKeywords.length) {
    const filtered = serviceProviders.filter((provider) => {
      const text = recordText(provider);

      return providerKeywords.some((word) =>
        text.includes(word)
      );
    });

    if (filtered.length) {
      matches = filtered;
    }
  }

  return res.json({
    success: true,
    found: true,
    answer:
      `Aapke Service Providers (${matches.length}):\n\n` +
      matches
        .map(
          (provider) =>
            `• ${provider.name || "Unnamed provider"}\n` +
            `  Category: ${provider.category || "Not saved"}\n` +
            `  Phone: ${provider.phone || "Not saved"}\n` +
            `  Rating: ${provider.rating ?? "Not saved"}\n` +
            `  Last Visit: ${formatDate(provider.last_visit)}\n` +
            `  Visits: ${provider.visits ?? 0}\n` +
            `  Location: ${provider.location || "Not saved"}\n` +
            `  Status: ${provider.status || "Not saved"}`
        )
        .join("\n\n"),
    results: matches,
  });
}


// ==========================================
// 12. SETTINGS
// ==========================================

if (
  includesAny([
    "settings",
    "my settings",
    "account settings",
    "notification settings",
    "theme",
    "notifications",
  ])
) {
  if (!settings.length) {
    return res.json({
      success: true,
      found: false,
      answer:
        "Aapki Settings mein abhi koi saved settings nahi mili.",
      results: [],
    });
  }

  const setting = settings[0];

  return res.json({
    success: true,
    found: true,
    answer:
      `Aapki saved Settings:\n\n` +
      `Name: ${setting.name || "Not saved"}\n` +
      `Email: ${setting.email || "Not saved"}\n` +
      `Notifications: ${
        setting.notifications ? "Enabled" : "Disabled"
      }\n` +
      `Warranty Alerts: ${
        setting.warranty_alerts ? "Enabled" : "Disabled"
      }\n` +
      `Maintenance Alerts: ${
        setting.maintenance_alerts ? "Enabled" : "Disabled"
      }\n` +
      `Theme: ${setting.theme || "Not saved"}`,
    results: settings,
  });
}

    // ==========================================
    // 13. FALLBACK
    // ==========================================

    if (knowledge.length) {
      return res.json({
        success: true,
        found: false,
        answer: "This information is not available in your saved notes.",
        results: [],
      });
    }

    return res.json({
      success: true,
      found: false,
      answer: "This information is not available.",
      results: [],
    });
  } catch (error) {
    console.error(
      "SECOND BRAIN ASK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to search Second Brain",
      error: error.message,
    });
  }
});
// ==========================================

// ==========================================
// REMINDERS - CRUD
// ==========================================
app.get("/api/notifications", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        error: "user_id is required",
      });
    }

    const result = await pool.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = $1 AND COALESCE(is_read, FALSE) = FALSE
      ORDER BY created_at DESC
      `,
      [user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("NOTIFICATIONS ERROR:", error);

    res.status(500).json({
      error: "Failed to fetch notifications",
    });
  }
});

app.put("/api/notifications/read", async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "user_id is required" });
    }

    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = $1",
      [user_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("MARK NOTIFICATIONS READ ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to mark notifications as read" });
  }
});

app.get("/api/reminders", async (req, res) => {
  try {
    await remindersTableReady;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const result = await pool.query(
      `SELECT id, title, description, reminder_date, type, priority, completed
       FROM reminders WHERE user_id = $1 ORDER BY reminder_date ASC, created_at DESC`,
      [user_id]
    );

    res.json({
      success: true,
      reminders: result.rows.map((reminder) => ({
        ...reminder,
        date: String(reminder.reminder_date).slice(0, 10),
        dueIn: "Upcoming",
      })),
    });
  } catch (error) {
    console.error("GET reminders error:", error);
    res.status(500).json({ success: false, message: "Failed to load reminders" });
  }
});

app.post("/api/reminders", async (req, res) => {
  try {
    await remindersTableReady;
    const { user_id, title, description, date, type, priority } = req.body;

    if (!user_id || !title?.trim() || !date) {
      return res.status(400).json({
        success: false,
        message: "User ID, title and date are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO reminders (user_id, title, description, reminder_date, type, priority)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, title.trim(), description || null, date, type || "other", priority || "Medium"]
    );

    res.status(201).json({ success: true, reminder: result.rows[0] });
    sendUpcomingReminderEmails();
  } catch (error) {
    console.error("ADD reminder error:", error);
    res.status(500).json({ success: false, message: "Failed to save reminder" });
  }
});

app.put("/api/reminders/:id", async (req, res) => {
  try {
    await remindersTableReady;
    const { user_id, title, description, date, type, priority, completed } = req.body;

    const result = await pool.query(
      `UPDATE reminders
       SET title = $1, description = $2, reminder_date = $3, type = $4,
           priority = $5, completed = $6
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [title?.trim(), description || null, date, type || "other", priority || "Medium", Boolean(completed), req.params.id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    res.json({ success: true, reminder: result.rows[0] });
    sendUpcomingReminderEmails();
  } catch (error) {
    console.error("UPDATE reminder error:", error);
    res.status(500).json({ success: false, message: "Failed to update reminder" });
  }
});

app.delete("/api/reminders/:id", async (req, res) => {
  try {
    await remindersTableReady;
    const result = await pool.query(
      "DELETE FROM reminders WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, req.query.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    res.json({ success: true, message: "Reminder deleted" });
  } catch (error) {
    console.error("DELETE reminder error:", error);
    res.status(500).json({ success: false, message: "Failed to delete reminder" });
  }
});

const sendUpcomingReminderEmails = async () => {
  try {
    await Promise.all([remindersTableReady, brainReminderDateReady, emailReminderLogReady]);

    const result = await pool.query(`
      SELECT
        u.id AS user_id,
        COALESCE(NULLIF(us.email, ''), u.email) AS email,
        due_items.source_type,
        due_items.source_id,
        due_items.title,
        due_items.due_date,
        CURRENT_DATE - due_items.due_date AS days_until_due,
        COALESCE(us.notifications, TRUE) AS notifications_enabled,
        COALESCE(us.warranty_alerts, TRUE) AS warranty_alerts_enabled
      FROM users u
      LEFT JOIN user_settings us ON us.user_id = u.id
      JOIN (
        SELECT user_id, id AS source_id, 'warranty' AS source_type,
               name AS title, NULLIF(warranty, '')::date AS due_date
        FROM assets
        WHERE NULLIF(warranty, '')::date BETWEEN CURRENT_DATE AND CURRENT_DATE + 6
        UNION ALL
        SELECT user_id, id AS source_id, 'reminder' AS source_type,
               title, reminder_date AS due_date
        FROM reminders
        WHERE completed = FALSE
          AND reminder_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 6
        UNION ALL
        SELECT user_id, id AS source_id, 'note' AS source_type,
               title, reminder_date AS due_date
        FROM brain_knowledge
        WHERE reminder_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 6
      ) due_items ON due_items.user_id = u.id
      WHERE COALESCE(NULLIF(us.email, ''), u.email) IS NOT NULL
        AND COALESCE(NULLIF(us.email, ''), u.email) <> ''
        AND COALESCE(us.notifications, TRUE) = TRUE
        AND (due_items.source_type <> 'warranty' OR COALESCE(us.warranty_alerts, TRUE) = TRUE)
        AND NOT EXISTS (
          SELECT 1
          FROM email_reminder_log sent
          WHERE sent.user_id = u.id
            AND sent.source_type = due_items.source_type
            AND sent.source_id = due_items.source_id
            AND sent.due_date = due_items.due_date
            AND sent.sent_for_date = CURRENT_DATE
        )
      ORDER BY u.id, due_items.due_date
    `);

    const byUser = new Map();
    for (const item of result.rows) {
      if (!byUser.has(item.user_id)) byUser.set(item.user_id, []);
      byUser.get(item.user_id).push(item);
    }

    for (const items of byUser.values()) {
      const first = items[0];
      const lines = items.map((item) => {
        const days = Number(item.days_until_due);
        const timing = days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`;
        const kind = item.source_type === "warranty" ? "Warranty" : item.source_type === "note" ? "Note" : "Reminder";
        return `- ${kind}: ${item.title} (${timing})`;
      });

      await transporter.sendMail({
        from: `"MyHome" <${process.env.EMAIL_USER}>`,
        to: first.email,
        subject: "MyHome: upcoming reminders",
        text: `Your upcoming MyHome reminders:\n\n${lines.join("\n")}\n\nPlease open MyHome to review them.`,
      });

      for (const item of items) {
        await pool.query(
          `INSERT INTO email_reminder_log
             (user_id, source_type, source_id, due_date, sent_for_date)
           VALUES ($1, $2, $3, $4, CURRENT_DATE)
           ON CONFLICT DO NOTHING`,
          [item.user_id, item.source_type, item.source_id, item.due_date]
        );
      }
    }

    if (result.rows.length) {
      console.log(`Sent ${byUser.size} upcoming reminder email(s).`);
    }
  } catch (error) {
    console.error("UPCOMING REMINDER EMAIL ERROR:", error.message);
  }
};

// ==========================================
// LIFE RADAR - DYNAMIC INTELLIGENCE
// ==========================================

app.get("/api/life-radar", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const [
      documentsResult,
      assetsResult,
      expensesResult,
      maintenanceResult,
      remindersResult,
    ] = await Promise.all([
      // --------------------------------------
      // DOCUMENTS
      // --------------------------------------
      pool.query(
        `
        SELECT
          id,
          name,
          category,
          expiry,
          status
        FROM documents
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [user_id]
      ),

      // --------------------------------------
      // ASSETS
      // --------------------------------------
      pool.query(
        `
        SELECT
          id,
          name,
          category,
          brand,
          model,
          purchase_date,
          warranty,
          location
        FROM assets
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [user_id]
      ),

      // --------------------------------------
      // EXPENSES
      // --------------------------------------
      pool.query(
        `
        SELECT
          id,
          title,
          amount,
          category,
          date
        FROM expenses
        WHERE user_id = $1
        ORDER BY date DESC
        `,
        [user_id]
      ),

      // --------------------------------------
      // MAINTENANCE
      // --------------------------------------
      pool.query(
        `
        SELECT
          id,
          asset,
          service,
          provider,
          service_date,
          cost,
          status,
          category
        FROM maintenance_records
        WHERE user_id = $1
        ORDER BY service_date DESC
        `,
        [user_id]
      ),

      // --------------------------------------
      // REMINDERS
      // --------------------------------------
      pool.query(
        `
        SELECT
          id,
          title,
          reminder_date,
          priority,
          completed
        FROM reminders
        WHERE user_id = $1
        ORDER BY reminder_date ASC
        `,
        [user_id]
      ),
    ]);

    const documents = documentsResult.rows;
    const assets = assetsResult.rows;
    const expenses = expensesResult.rows;
    const maintenance = maintenanceResult.rows;
    const reminders = remindersResult.rows;

    // ==========================================
    // DOCUMENT SCORE
    // ==========================================

    let documentScore = 100;

    if (documents.length === 0) {
      documentScore = 50;
    } else {
      const today = new Date();

      const expiredDocuments = documents.filter((doc) => {
        if (!doc.expiry) return false;

        const expiryDate = new Date(doc.expiry);

        return expiryDate < today;
      });

      documentScore -= expiredDocuments.length * 15;

      documentScore = Math.max(0, Math.min(100, documentScore));
    }

    // ==========================================
    // HOME / ASSET SCORE
    // ==========================================

    let homeScore = 100;

    if (assets.length === 0) {
      homeScore = 50;
    } else {
      const incompleteAssets = assets.filter(
        (asset) =>
          !asset.location ||
          !asset.brand ||
          !asset.model
      );

      homeScore -= incompleteAssets.length * 5;

      homeScore = Math.max(0, Math.min(100, homeScore));
    }

    // ==========================================
    // MONEY SCORE
    // ==========================================

    let moneyScore = 100;

    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = expenses.filter((expense) => {
      if (!expense.date) return false;

      const date = new Date(expense.date);

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    const monthlySpend = currentMonthExpenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

    /*
      Basic money health calculation.

      Lower spending = higher score.
      This is intentionally simple for now.
      Later we can connect income/budget data.
    */

    if (monthlySpend > 100000) {
      moneyScore = 55;
    } else if (monthlySpend > 50000) {
      moneyScore = 65;
    } else if (monthlySpend > 25000) {
      moneyScore = 75;
    } else if (monthlySpend > 10000) {
      moneyScore = 85;
    } else {
      moneyScore = 95;
    }

    // ==========================================
    // MAINTENANCE SCORE
    // ==========================================

    let maintenanceScore = 100;

    const pendingMaintenance = maintenance.filter(
      (item) =>
        item.status &&
        String(item.status).toLowerCase() !== "completed"
    );

    if (maintenance.length === 0) {
      maintenanceScore = assets.length > 0 ? 75 : 50;
    } else {
      maintenanceScore -=
        pendingMaintenance.length * 10;

      maintenanceScore = Math.max(
        0,
        Math.min(100, maintenanceScore)
      );
    }

    // ==========================================
    // WARRANTY SCORE
    // ==========================================

    let warrantyScore = 100;

    if (assets.length === 0) {
      warrantyScore = 50;
    } else {
      const today = new Date();

      const assetsWithoutWarranty = assets.filter(
        (asset) => !asset.warranty
      );

      const expiredWarranties = assets.filter((asset) => {
        if (!asset.warranty) return false;

        const warrantyDate = new Date(asset.warranty);

        return warrantyDate < today;
      });

      warrantyScore -=
        assetsWithoutWarranty.length * 5;

      warrantyScore -=
        expiredWarranties.length * 10;

      warrantyScore = Math.max(
        0,
        Math.min(100, warrantyScore)
      );
    }

    // ==========================================
    // REMINDER SCORE
    // ==========================================

    let reminderScore = 100;

    const pendingReminders = reminders.filter(
      (reminder) => !reminder.completed
    );

    const overdueReminders = pendingReminders.filter(
      (reminder) => {
        if (!reminder.reminder_date) return false;

        return (
          new Date(reminder.reminder_date) <
          new Date()
        );
      }
    );

    reminderScore -=
      overdueReminders.length * 10;

    reminderScore = Math.max(
      0,
      Math.min(100, reminderScore)
    );

    // ==========================================
    // OVERALL SCORE
    // ==========================================

    const overallScore = Math.round(
      (
        documentScore +
        homeScore +
        moneyScore +
        maintenanceScore +
        warrantyScore +
        reminderScore
      ) / 6
    );

    // ==========================================
    // LABEL
    // ==========================================

    const getScoreLabel = (score) => {
      if (score >= 85) return "Excellent";
      if (score >= 70) return "Good";
      if (score >= 50) return "Needs Attention";
      return "Critical";
    };

    // ==========================================
    // INSIGHT
    // ==========================================

    const scores = [
      {
        name: "Documents",
        score: documentScore,
      },
      {
        name: "Home",
        score: homeScore,
      },
      {
        name: "Money",
        score: moneyScore,
      },
      {
        name: "Maintenance",
        score: maintenanceScore,
      },
      {
        name: "Warranties",
        score: warrantyScore,
      },
      {
        name: "Reminders",
        score: reminderScore,
      },
    ];

    const lowestArea = scores.reduce(
      (lowest, current) =>
        current.score < lowest.score
          ? current
          : lowest
    );

    let insight;

    if (lowestArea.score < 70) {
      insight = `${lowestArea.name} currently needs the most attention.`;
    } else {
      insight =
        "Your important life records are currently in good shape.";
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.json({
      success: true,

      score: overallScore,

      label: getScoreLabel(overallScore),

      insight,

      areas: [
        {
          name: "Documents",
          score: documentScore,
          description:
            documents.length === 0
              ? "No documents have been added yet."
              : `${documents.length} document(s) are saved.`,
        },

        {
          name: "Home",
          score: homeScore,
          description:
            assets.length === 0
              ? "No assets have been added yet."
              : `${assets.length} asset(s) are being tracked.`,
        },

        {
          name: "Money",
          score: moneyScore,
          description:
            currentMonthExpenses.length === 0
              ? "No expenses recorded this month."
              : `₹${monthlySpend.toLocaleString(
                  "en-IN"
                )} spent this month.`,
        },

        {
          name: "Maintenance",
          score: maintenanceScore,
          description:
            pendingMaintenance.length === 0
              ? "No pending maintenance requires attention."
              : `${pendingMaintenance.length} maintenance item(s) need attention.`,
        },

        {
          name: "Warranties",
          score: warrantyScore,
          description:
            assets.length === 0
              ? "No assets available for warranty tracking."
              : "Warranty coverage is calculated from your saved assets.",
        },

        {
          name: "Reminders",
          score: reminderScore,
          description:
            pendingReminders.length === 0
              ? "You have no pending reminders."
              : `${pendingReminders.length} reminder(s) are pending.`,
        },
      ],

      stats: {
        documents: documents.length,
        assets: assets.length,
        expenses: expenses.length,
        monthlySpend,
        maintenance: maintenance.length,
        pendingMaintenance: pendingMaintenance.length,
        reminders: reminders.length,
        pendingReminders: pendingReminders.length,
      },
    });
  } catch (error) {
    console.error(
      "LIFE RADAR ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to calculate Life Radar",
      error: error.message,
    });
  }
});

// ==========================================
// LIFE AUDITOR API
// ==========================================

app.get("/api/life-auditor", async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // ------------------------------------------
    // Fetch user's real data
    // ------------------------------------------

    const [
      documentsResult,
      assetsResult,
      warrantiesResult,
      expensesResult,
      maintenanceResult,
    ] = await Promise.all([
      pool.query(
        `
        SELECT
          id,
          name,
          category,
          expiry,
          status,
          user_id
        FROM documents
        WHERE user_id = $1
        ORDER BY id DESC
        `,
        [user_id]
      ),

      pool.query(
        `
        SELECT
          id,
          name,
          category,
          brand,
          model,
          price,
          purchase_date,
          warranty,
          location,
          description,
          user_id
        FROM assets
        WHERE user_id = $1
        ORDER BY id DESC
        `,
        [user_id]
      ),

      pool.query(
        `
        SELECT
          id,
          name,
          warranty,
          user_id
        FROM assets
        WHERE user_id = $1
          AND warranty IS NOT NULL
          AND warranty <> ''
        ORDER BY id DESC
        `,
        [user_id]
      ),

      pool.query(
        `
        SELECT
          id,
          title,
          amount,
          category,
          date,
          user_id
        FROM expenses
        WHERE user_id = $1
        ORDER BY date DESC, id DESC
        `,
        [user_id]
      ),

      pool.query(
        `
        SELECT
          id,
          asset,
          service,
          provider,
          service_date,
          cost,
          status,
          category,
          user_id
        FROM maintenance_records
        WHERE user_id = $1
        ORDER BY service_date DESC, id DESC
        `,
        [user_id]
      ),
    ]);

    const documents = documentsResult.rows;
    const assets = assetsResult.rows;
    const warranties = warrantiesResult.rows;
    const expenses = expensesResult.rows;
    const maintenance = maintenanceResult.rows;

    // ==========================================
    // DATE HELPERS
    // ==========================================

    const today = new Date();

    const normalizeDate = (value) => {
      if (!value) return null;

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return null;
      }

      return date;
    };

    const daysUntil = (value) => {
      const date = normalizeDate(value);

      if (!date) return null;

      const diff =
        date.getTime() - today.getTime();

      return Math.ceil(
        diff / (1000 * 60 * 60 * 24)
      );
    };

    // ==========================================
    // AUDIT ISSUES
    // ==========================================

    const auditItems = [];

    // ------------------------------------------
    // 1. DOCUMENTS EXPIRING SOON
    // ------------------------------------------

    const expiringDocuments = documents.filter((doc) => {
      const days = daysUntil(doc.expiry);

      return (
        days !== null &&
        days >= 0 &&
        days <= 30
      );
    });

    if (expiringDocuments.length > 0) {
      auditItems.push({
        title: "Documents expiring soon",
        description:
          "Some of your documents may need renewal within the next 30 days.",
        severity: "warning",
        count: expiringDocuments.length,
        type: "documents",
        records: expiringDocuments,
      });
    }

    // ------------------------------------------
    // 2. EXPIRED DOCUMENTS
    // ------------------------------------------

    const expiredDocuments = documents.filter((doc) => {
      const days = daysUntil(doc.expiry);

      return days !== null && days < 0;
    });

    if (expiredDocuments.length > 0) {
      auditItems.push({
        title: "Expired documents",
        description:
          "Some saved documents have already expired.",
        severity: "high",
        count: expiredDocuments.length,
        type: "documents",
        records: expiredDocuments,
      });
    }

    // ------------------------------------------
    // 3. WARRANTY EXPIRING SOON
    // ------------------------------------------

    const expiringWarranties = warranties.filter((item) => {
      const days = daysUntil(item.warranty);

      return (
        days !== null &&
        days >= 0 &&
        days <= 30
      );
    });

    if (expiringWarranties.length > 0) {
      auditItems.push({
        title: "Warranties expiring soon",
        description:
          "Some asset warranties will expire within the next 30 days.",
        severity: "warning",
        count: expiringWarranties.length,
        type: "warranties",
        records: expiringWarranties,
      });
    }
    // ==========================================
// CREATE WARRANTY NOTIFICATIONS
// ==========================================

for (const warranty of expiringWarranties) {
  const daysLeft = daysUntil(warranty.warranty);

  if ([30, 15, 7, 6, 1, 0].includes(daysLeft)) {
    await pool.query(
      `
      INSERT INTO notifications
        (user_id, title, message, type, reference_id)
      SELECT $1, $2, $3, $4, $5
      WHERE NOT EXISTS (
        SELECT 1
        FROM notifications
        WHERE user_id = $1
          AND type = 'warranty'
          AND reference_id = $5
          AND DATE(created_at) = CURRENT_DATE
      )
      `,
      [
        warranty.user_id,
        "Warranty Expiring Soon",
        `${warranty.name} warranty expires in ${
          daysLeft === 0 ? "today" : `${daysLeft} days`
        }.`,
        "warranty",
        warranty.id,
      ]
    );
  }
}

    // ------------------------------------------
    // 4. EXPIRED WARRANTIES
    // ------------------------------------------

    const expiredWarranties = warranties.filter((item) => {
      const days = daysUntil(item.warranty);

      return days !== null && days < 0;
    });

    if (expiredWarranties.length > 0) {
      auditItems.push({
        title: "Expired warranties",
        description:
          "Some of your saved asset warranties have expired.",
        severity: "high",
        count: expiredWarranties.length,
        type: "warranties",
        records: expiredWarranties,
      });
    }

    // ------------------------------------------
    // 5. ASSETS WITHOUT LOCATION
    // ------------------------------------------

    const assetsWithoutLocation = assets.filter(
      (asset) =>
        !asset.location ||
        !String(asset.location).trim()
    );

    if (assetsWithoutLocation.length > 0) {
      auditItems.push({
        title: "Assets missing location",
        description:
          "Some assets do not have a saved location.",
        severity: "info",
        count: assetsWithoutLocation.length,
        type: "assets",
        records: assetsWithoutLocation,
      });
    }

    // ------------------------------------------
    // 6. ASSETS WITHOUT WARRANTY
    // ------------------------------------------

    const assetsWithoutWarranty = assets.filter(
      (asset) =>
        !asset.warranty ||
        !String(asset.warranty).trim()
    );

    if (assetsWithoutWarranty.length > 0) {
      auditItems.push({
        title: "Assets missing warranty information",
        description:
          "Some assets do not have warranty information saved.",
        severity: "info",
        count: assetsWithoutWarranty.length,
        type: "assets",
        records: assetsWithoutWarranty,
      });
    }

    // ------------------------------------------
    // 7. MAINTENANCE ATTENTION
    // ------------------------------------------

    const maintenanceIssues = maintenance.filter(
      (item) => {
        const status = String(
          item.status || ""
        ).toLowerCase();

        return [
          "pending",
          "due",
          "overdue",
          "attention",
        ].some((word) =>
          status.includes(word)
        );
      }
    );

    if (maintenanceIssues.length > 0) {
      auditItems.push({
        title: "Maintenance needs attention",
        description:
          "Some maintenance records may require action.",
        severity: "warning",
        count: maintenanceIssues.length,
        type: "maintenance",
        records: maintenanceIssues,
      });
    }

    // ==========================================
    // HEALTHY ITEMS
    // ==========================================

    const totalRecords =
      documents.length +
      assets.length +
      warranties.length +
      expenses.length +
      maintenance.length;

    const issueCount = auditItems.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const healthyCount = Math.max(
      totalRecords - issueCount,
      0
    );

    // ==========================================
    // PRIORITY
    // ==========================================

    const highPriority = auditItems.filter(
      (item) => item.severity === "high"
    ).length;

    // ==========================================
    // SCORE
    // ==========================================

    let score = 100;

    auditItems.forEach((item) => {
      if (item.severity === "high") {
        score -= item.count * 10;
      } else if (item.severity === "warning") {
        score -= item.count * 6;
      } else {
        score -= item.count * 2;
      }
    });

    score = Math.max(
      0,
      Math.min(100, score)
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.json({
      success: true,

      summary: {
        score,
        issuesFound: issueCount,
        highPriority,
        healthy: healthyCount,
        totalRecords,
      },

      auditItems,

      stats: {
        documents: documents.length,
        assets: assets.length,
        warranties: warranties.length,
        expenses: expenses.length,
        maintenance: maintenance.length,
      },

      lastChecked: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "LIFE AUDITOR ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to analyze Life Auditor",
      error: error.message,
    });
  }
});



const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  sendUpcomingReminderEmails();
  setInterval(sendUpcomingReminderEmails, 24 * 60 * 60 * 1000);
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});

server.on("close", () => {
  console.log("SERVER CLOSED");
});
