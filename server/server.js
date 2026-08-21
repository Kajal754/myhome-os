const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
console.log("Connected database:", process.env.DB_NAME);

// Test connection
app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "PostgreSQL connected successfully",
      time: result.rows[0],
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// GET all assets
// GET all assets
app.get("/api/assets", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM assets ORDER BY created_at DESC"
    );

    const assets = result.rows.map((asset) => {
      let image = asset.image || null;

      if (asset.image_data) {
        const imageType = asset.image_type || "image/jpeg";

        image = `data:${imageType};base64,${asset.image_data.toString(
          "base64"
        )}`;
      }

      return {
        ...asset,
        image,
      };
    });

    res.json(assets);

  } catch (error) {
    console.error("GET assets error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load assets",
      error: error.message,
    });
  }
});

// GET one asset
app.get("/api/assets/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM assets WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("GET single asset error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load asset",
      error: error.message,
    });
  }
});

// ADD asset
// ADD asset
// ADD asset
// ADD asset
// ADD asset
// ADD asset

app.post("/api/assets", async (req, res) => {
  console.log("POST ASSET HIT");
console.log("IMAGE:", req.body.image ? "YES" : "NO");
  try {
    const {
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

    // Name required
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Asset name is required",
      });
    }

    // Image data
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

    // Price clean
    const cleanPrice = price
      ? Number(String(price).replace(/[₹,\s]/g, ""))
      : 0;

    // Insert into database
    const result = await pool.query(
      `
      INSERT INTO assets (
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
      VALUES (
  $1, $2, $3, $4, $5,
  $6, $7, $8, $9, $10, $11, $12
)
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
        image || null,
        imageData,
        imageType,
      ]
    );

    const asset = result.rows[0];

    // Convert image back to base64 for frontend
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


// UPDATE asset
app.put("/api/assets/:id", async (req, res) => {
  try {
    const {
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

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Asset name is required",
      });
    }

    // Existing asset check
    const existingResult = await pool.query(
      "SELECT * FROM assets WHERE id = $1",
      [req.params.id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    const existingAsset = existingResult.rows[0];

    // Keep old image by default
    let imageData = existingAsset.image_data;
    let imageType = existingAsset.image_type;

    // If a new image was uploaded
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
console.log("IMAGE RECEIVED:", image ? image.substring(0, 50) : "NO IMAGE");
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
        image_data = $10,
        image_type = $11
      WHERE id = $12
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
        imageData,
        imageType,
        req.params.id,
      ]
    );

    const asset = result.rows[0];

    let responseImage = asset.image || null;

    if (asset.image_data) {
      const type = asset.image_type || "image/jpeg";

      responseImage = `data:${type};base64,${asset.image_data.toString(
        "base64"
      )}`;
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
// ===============================
// DOCUMENTS - GET ALL
// ===============================

app.get("/api/documents", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM documents ORDER BY created_at DESC"
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

    res.json(documents);

  } catch (error) {
    console.error("GET documents error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load documents",
      error: error.message,
    });
  }
});


// ===============================
// DOCUMENTS - ADD
// ===============================

app.post("/api/documents", async (req, res) => {
  try {
    const {
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

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Document name is required",
      });
    }

    let imageData = null;
    let imageType = image_type || "image/jpeg";

    // Convert base64 image into Buffer
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
      INSERT INTO documents (
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
      VALUES (
        $1,$2,$3,$4,$5,
        $6,$7,$8,$9,$10,$11
      )
      RETURNING *
      `,
      [
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

// ===============================
// DOCUMENTS - DELETE
// ===============================

app.delete("/api/documents/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const documentResult = await pool.query(
      "SELECT * FROM documents WHERE id = $1",
      [id]
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
      INSERT INTO document_history (
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
      VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12,$13
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
        null,
      ]
    );

    const result = await pool.query(
      "DELETE FROM documents WHERE id = $1 RETURNING *",
      [id]
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


// ISKE BAAD tumhara purana code 👇
// ==========================================
// UPDATE DOCUMENT
// ==========================================

app.put("/api/documents/:id", async (req, res) => {
  console.log("UPDATE DOCUMENT ROUTE HIT, ID:", req.params.id);
  try {
    const {
      name,
      category,
      holder,
      document_no,
      added,
      expiry,
      status,
      image,
    } = req.body;

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
        image = $8
      WHERE id = $9
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
// DELETE asset
// DELETE asset
app.delete("/api/assets/:id", async (req, res) => {
  console.log("DELETE REQUEST RECEIVED, ID:", req.params.id);

  try {
    // 1. Delete karne se pehle asset ka complete data nikalo
    const assetResult = await pool.query(
      "SELECT * FROM assets WHERE id = $1",
      [req.params.id]
    );

    if (assetResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    const asset = assetResult.rows[0];

    // 2. DELETE ka complete record history mein save karo
    await pool.query(
      `
      INSERT INTO asset_history (
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
        image
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
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
      ]
    );

    // 3. Ab assets table se asset delete karo
    const result = await pool.query(
      "DELETE FROM assets WHERE id = $1 RETURNING *",
      [req.params.id]
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
// EXPENSES - GET ALL
// ==========================================

app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM expenses ORDER BY date DESC, id DESC"
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
    const {
      title,
      amount,
      category,
      date,
      description,
    } = req.body;

    if (!title || !title.trim()) {
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
        title,
        amount,
        category,
        date,
        description
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
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
    const { title, amount, category, date, description } = req.body;

    if (!title || !title.trim()) {
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
      UPDATE expenses
      SET
        title = $1,
        amount = $2,
        category = $3,
        date = $4,
        description = $5
      WHERE id = $6
      RETURNING *
      `,
      [
        title.trim(),
        cleanAmount,
        category || null,
        date || null,
        description || null,
        req.params.id,
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
    const { id } = req.params;

    // 1. Pehle expense ka data nikalo
    const expenseResult = await pool.query(
      "SELECT * FROM expenses WHERE id = $1",
      [id]
    );

    if (expenseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    const expense = expenseResult.rows[0];

    // 2. Delete hone wale expense ko history mein save karo
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
      VALUES ($1, $2, $3, $4, $5, $6, $7)
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

    // 3. Main expenses table se delete karo
    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 RETURNING *",
      [id]
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
// EXPENSES - DELETED HISTORY
// ==========================================

app.get("/api/expenses/history", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM expense_history ORDER BY deleted_at DESC, id DESC"
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
// FAMILY MEMBERS API
// ==========================================

// GET all family members
app.get("/api/family-members", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM family_members ORDER BY id DESC"
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


// ADD family member
app.post("/api/family-members", async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      status,
      joined,
      avatar,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO family_members
      (name, email, role, status, joined, avatar)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        name || null,
        email || null,
        role || null,
        status || null,
        joined || null,
        avatar || null,
      ]
    );

    res.json({
      success: true,
      message: "Family member added successfully",
      member: result.rows[0],
    });
  } catch (error) {
    console.error("ADD family member error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add family member",
      error: error.message,
    });
  }
});
// ==========================================
// ADD FAMILY MEMBER
// ==========================================

app.post("/api/family-members", async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      status,
      joined,
      avatar,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO family_members
      (
        name,
        email,
        role,
        status,
        joined,
        avatar
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
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



// UPDATE family member
app.put("/api/family-members/:id", async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      status,
      joined,
      avatar,
    } = req.body;

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
      WHERE id = $7
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


// DELETE family member + save history
app.delete("/api/family-members/:id", async (req, res) => {
  try {
    const memberResult = await pool.query(
      "SELECT * FROM family_members WHERE id = $1",
      [req.params.id]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    const member = memberResult.rows[0];

    // Save deleted member's complete data in history
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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

    // Delete from main table
    const result = await pool.query(
      "DELETE FROM family_members WHERE id = $1 RETURNING *",
      [req.params.id]
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
// SETTINGS - GET
// ==========================================

app.get("/api/settings", async (req, res) => {
  try {
    let result = await pool.query(
      "SELECT * FROM user_settings ORDER BY id ASC LIMIT 1"
    );

    // Agar settings ka record nahi hai to default create karo
    if (result.rows.length === 0) {
      result = await pool.query(
        `
        INSERT INTO user_settings
        (
          name,
          email,
          photo,
          notifications,
          warranty_alerts,
          maintenance_alerts,
          theme
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
          "Miss Kajal",
          "kajal@example.com",
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
      name,
      email,
      photo,
      notifications,
      warranty_alerts,
      maintenance_alerts,
      theme,
    } = req.body;

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
      WHERE id = (
        SELECT id
        FROM user_settings
        ORDER BY id ASC
        LIMIT 1
      )
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
      ]
    );

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
