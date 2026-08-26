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

  UPDATE expenses
  SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1)
  WHERE user_id IS NULL
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
      SELECT id, name, email, password, email_verified
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
        date || null,
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
    const result = await pool.query(
      `
      SELECT *
      FROM expense_history
      ORDER BY deleted_at DESC, id DESC
      `
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

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});

server.on("close", () => {
  console.log("SERVER CLOSED");
});

// ==========================================
// REMINDERS - CRUD
// ==========================================

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