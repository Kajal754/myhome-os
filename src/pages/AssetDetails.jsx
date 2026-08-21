import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Save,
  X,
  Package,
  Tag,
  IndianRupee,
  MapPin,
  CalendarDays,
  ShieldCheck,
  FileText,
  Loader2,
} from "lucide-react";

function AssetDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    brand: "",
    model: "",
    price: "",
    purchaseDate: "",
    warranty: "",
    location: "",
    description: "",
    image: "",
  });

  /* =========================
     LOAD ASSET
  ========================= */

  useEffect(() => {
    const loadAsset = async () => {
      try {
        setLoading(true);

        console.log("SAVE CLICKED", form);
        const response = await fetch(
          `http://localhost:5000/api/assets/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load asset."
          );
        }

        const item = data.asset || data;

        const normalized = {
          ...item,
          image: item.image || item.image_url || "",
          purchaseDate:
            item.purchaseDate || item.purchase_date || "",
        };

        setAsset(normalized);

        setForm({
          name: normalized.name || "",
          category: normalized.category || "",
          brand: normalized.brand || "",
          model: normalized.model || "",
          price: normalized.price || "",
          purchaseDate: normalized.purchaseDate || "",
          warranty: normalized.warranty || "",
          location: normalized.location || "",
          description: normalized.description || "",
          image: normalized.image || "",
        });
      } catch (error) {
        console.error("Asset details error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAsset();
  }, [id]);

  /* =========================
     FORM CHANGE
  ========================= */

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
const handleEditImage = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image must be smaller than 5MB.");
    return;
  }

  const reader = new FileReader();

  reader.onloadend = () => {
    setForm((prev) => ({
      ...prev,
      image: reader.result,
    }));
  };

  reader.readAsDataURL(file);
};
  /* =========================
     SAVE
  ========================= */
const handleSave = async () => {
  if (!form.name.trim()) {
    alert("Please enter Asset Name.");
    return;
  }

  try {
    setSaving(true);

    const response = await fetch(
      `http://localhost:5000/api/assets/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          category: form.category || null,
          brand: form.brand || null,
          model: form.model || null,
          price: form.price || 0,
          purchase_date: form.purchaseDate || null,
          warranty: form.warranty || null,
          location: form.location || null,
          description: form.description || null,

          // Existing image ko same rakhna
         image: form.image || null,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      alert(data.message || "Failed to update asset.");
      return;
    }

    // Updated data screen par bhi dikhao
    const updated = data.asset;

    setAsset({
      ...updated,
      image: updated.image || updated.image_url || form.image || "",
      purchaseDate:
        updated.purchase_date || form.purchaseDate || "",
    });

    setForm({
      name: updated.name || "",
      category: updated.category || "",
      brand: updated.brand || "",
      model: updated.model || "",
      price: updated.price || "",
      purchaseDate: updated.purchase_date || "",
      warranty: updated.warranty || "",
      location: updated.location || "",
      description: updated.description || "",
      image: updated.image || updated.image_url || "",
    });

    setEditing(false);

    alert("Asset updated successfully.");
  } catch (error) {
    console.error("Update asset error:", error);
    alert("Could not update asset.");
  } finally {
    setSaving(false);
  }
};
  /* =========================
     CANCEL EDIT
  ========================= */

  const handleCancel = () => {
    if (!asset) return;

    setForm({
      name: asset.name || "",
      category: asset.category || "",
      brand: asset.brand || "",
      model: asset.model || "",
      price: asset.price || "",
      purchaseDate:
        asset.purchaseDate ||
        asset.purchase_date ||
        "",
      warranty: asset.warranty || "",
      location: asset.location || "",
      description: asset.description || "",
      image:
        asset.image ||
        asset.image_url ||
        "",
    });

    setEditing(false);
  };

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={30}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm font-semibold text-slate-500">
            Loading asset...
          </p>
        </div>
      </main>
    );
  }

  /* =========================
     NOT FOUND
  ========================= */

  if (!asset) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Package
            size={40}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Asset not found
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            This asset could not be loaded.
          </p>

          <button
            onClick={() => navigate("/assets")}
            className="mt-5 rounded-xl bg-[#07172f] px-5 py-2.5 text-xs font-bold text-white"
          >
            Back to Assets
          </button>
        </div>
      </main>
    );
  }

  /* =========================
     MAIN
  ========================= */

  return (
    <main className="relative min-h-full space-y-6">
      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />

        <div className="absolute right-[-100px] top-[-80px] h-[420px] w-[420px] rounded-full bg-blue-200/25 blur-3xl" />

        <div className="absolute bottom-[-120px] left-1/3 h-96 w-96 rounded-full bg-emerald-100/30 blur-3xl" />
      </div>

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate("/assets")}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft size={15} />
          Back to Assets
        </button>

        <div className="flex gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#07172f] px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-blue-950"
            >
              <Pencil size={14} />
              Edit Asset
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                <X size={14} />
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={14} />
                )}

                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* HERO */}

      <section className="overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-5 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          {/* IMAGE */}

          <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100/50 blur-2xl" />

            {form.image ? (
              <img
                src={form.image}
                alt={form.name}
                className="relative z-10 max-h-[320px] w-full object-contain drop-shadow-xl"
              />
            ) : (
              <Package
                size={80}
                className="relative z-10 text-slate-300"
              />
            )}
          </div>

          {/* TITLE */}

          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-600">
                {asset.category || "Asset"}
              </span>

              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[9px] font-bold text-emerald-600">
                Warranty Active
              </span>
            </div>

            {!editing ? (
              <>
                <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#07172f] sm:text-4xl">
                  {asset.name}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  {asset.brand} · {asset.model}
                </p>
              </>
            ) : (
              <div className="mt-4 space-y-3">
                <input
                  value={form.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  placeholder="Asset Name"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-400"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={form.brand}
                    onChange={(e) =>
                      updateField("brand", e.target.value)
                    }
                    placeholder="Brand"
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-blue-400"
                  />

                  <input
                    value={form.model}
                    onChange={(e) =>
                      updateField("model", e.target.value)
                    }
                    placeholder="Model"
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-blue-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DETAILS */}

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Asset Information
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-slate-900">
              Details
            </h2>
          </div>

          <Package
            size={20}
            className="text-slate-300"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            icon={Tag}
            label="Category"
            value={asset.category}
            editing={editing}
            input={
              <input
                value={form.category}
                onChange={(e) =>
                  updateField("category", e.target.value)
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
              />
            }
          />

          <InfoCard
            icon={IndianRupee}
            label="Purchase Price"
            value={asset.price}
            editing={editing}
            input={
              <input
                value={form.price}
                onChange={(e) =>
                  updateField("price", e.target.value)
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
              />
            }
          />

          <InfoCard
            icon={MapPin}
            label="Location"
            value={asset.location}
            editing={editing}
            input={
              <input
                value={form.location}
                onChange={(e) =>
                  updateField("location", e.target.value)
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
              />
            }
          />

          <InfoCard
            icon={CalendarDays}
            label="Purchase Date"
            value={asset.purchaseDate || "Not specified"}
            editing={editing}
            input={
              <input
                type="date"
                value={form.purchaseDate || ""}
                onChange={(e) =>
                  updateField(
                    "purchaseDate",
                    e.target.value
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
              />
            }
          />

          <InfoCard
            icon={ShieldCheck}
            label="Warranty"
            value={asset.warranty || "Not specified"}
            editing={editing}
            input={
              <input
                value={form.warranty}
                onChange={(e) =>
                  updateField("warranty", e.target.value)
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
              />
            }
          />

          <InfoCard
            icon={FileText}
            label="Description"
            value={asset.description || "No description"}
            editing={editing}
            input={
              <input
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none focus:border-blue-400"
              />
            }
          />
        </div>
      </section>

      {/* IMAGE URL */}

      {editing && (
  <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
      Asset Image
    </p>

    <h2 className="mt-1 text-lg font-extrabold text-slate-900">
      Change Image
    </h2>

    <div className="mt-4 flex items-center gap-4">
      {form.image && (
        <img
          src={form.image}
          alt={form.name}
          className="h-28 w-28 rounded-2xl object-contain border border-slate-200"
        />
      )}

      <label className="cursor-pointer rounded-xl bg-[#07172f] px-4 py-3 text-xs font-bold text-white">
        Change Image

        <input
          type="file"
          accept="image/*"
          onChange={handleEditImage}
          className="hidden"
        />
      </label>
    </div>

    <p className="mt-3 text-[10px] text-slate-400">
      JPG, PNG, WEBP — maximum 5MB
    </p>
  </section>
)}
    </main>
  );
}

/* =================================================
   INFO CARD
================================================= */

function InfoCard({
  icon: Icon,
  label,
  value,
  editing,
  input,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
          <Icon size={15} />
        </div>

        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      </div>

      {editing ? (
        input
      ) : (
        <p className="mt-3 text-sm font-bold text-slate-700">
          {value || "Not specified"}
        </p>
      )}
    </div>
  );
}

export default AssetDetails;