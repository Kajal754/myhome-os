import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  X,
  Package,
  ShieldCheck,
  Wrench,
  Car,
  Sofa,
  Tv,
  Snowflake,
  IndianRupee,
  MapPin,
  ArrowUpRight,
  Grid3X3,
  List,
  Upload,
  Trash2,
  Eye
} from "lucide-react";



const PRODUCT_IMAGES = {
  macbook: "https://bf1af2.akinoncloudcdn.com/products/2025/03/19/354327/41c9b70c-63f6-4e9e-ab0e-8fa59e7738a4_size3840_cropCenter.jpg",
  lgSplitAc: "https://www.lg.com/content/dam/channel/wcms/in/split-ac/gallery/us-q19jnze/gallery/US-Q19JNZE-spilt-ac-left-view-MZ-05.jpg",
};

function getAssetImage(asset) {
  const name = `${asset.name || ""} ${asset.brand || ""} ${asset.model || ""}`.toLowerCase();

  if (name.includes("macbook") || (name.includes("apple") && name.includes("air"))) {
    return PRODUCT_IMAGES.macbook;
  }

  if (name.includes("lg") && (name.includes("split") || name.includes("ac") || name.includes("air conditioner"))) {
    return PRODUCT_IMAGES.lgSplitAc;
  }

  return asset.image;
}

function Assets() {
  // Logged-in user
  const storedUser = localStorage.getItem("myhomeUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;

  const persistLocalAssets = (items) => {
    localStorage.setItem("myhomeLocalAssets", JSON.stringify(items));
  };

  const [assetList, setAssetList] = useState([]);
 useEffect(() => {
  const loadAssets = async () => {
    const localAssets = JSON.parse(localStorage.getItem("myhomeLocalAssets") || "[]");

    if (!userId) {
      setAssetList(localAssets);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/assets?user_id=${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load assets");
      }

      const data = await response.json();

if (!data.success) {
  throw new Error(data.message || "Failed to load assets");
}

const formattedAssets = data.assets.map((asset) => ({
  ...asset,
  purchaseDate: asset.purchase_date,
  status: "Warranty Active",
  statusType: "success",
}));

setAssetList(formattedAssets);
persistLocalAssets(formattedAssets);
    } catch (error) {
      console.error("LOAD assets error:", error);
      setAssetList(localAssets);
    }
  };

  loadAssets();
}, [userId]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState("grid");
  const [showModal, setShowModal] = useState(false);

  const handleDeleteAsset = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this asset?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
  `http://localhost:5000/api/assets/${id}?user_id=${userId}`,
  {
    method: "DELETE",
  }
);

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.warn("Delete failed, removing locally instead:", data);
      const nextAssets = assetList.filter((asset) => asset.id !== id);
      setAssetList(nextAssets);
      localStorage.setItem("myhomeLocalAssets", JSON.stringify(nextAssets));
      return;
    }

    setAssetList((prev) =>
      prev.filter((asset) => asset.id !== id)
    );
    localStorage.setItem("myhomeLocalAssets", JSON.stringify(assetList.filter((asset) => asset.id !== id)));

  } catch (error) {
    console.warn("DELETE asset error, removing locally:", error);
    const nextAssets = assetList.filter((asset) => asset.id !== id);
    setAssetList(nextAssets);
    localStorage.setItem("myhomeLocalAssets", JSON.stringify(nextAssets));
  }
};

  const categories = [
    { name: "All", icon: Package },
    { name: "Electronics", icon: Tv },
    { name: "Appliances", icon: Snowflake },
    { name: "Vehicle", icon: Car },
    { name: "Furniture", icon: Sofa },
  ];

  const filteredAssets = useMemo(() => {
    return assetList.filter((asset) => {
      const text =
        `${asset.name} ${asset.brand} ${asset.model}`.toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || asset.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [assetList, search, category]);

  const totalValue = assetList.reduce((total, asset) => {
    const number = Number(
      String(asset.price).replace(/[₹,\s]/g, "")
    );

    return total + (isNaN(number) ? 0 : number);
  }, 0);

  const handleAddAsset = async (newAsset) => {
  const fallbackAsset = {
    id: Date.now(),
    user_id: userId || "local-user",
    name: newAsset.name,
    category: newAsset.category,
    brand: newAsset.brand,
    model: newAsset.model,
    price: newAsset.price,
    purchaseDate: newAsset.purchaseDate,
    warranty: newAsset.warranty,
    location: newAsset.location,
    description: newAsset.description || "",
    image: newAsset.image || null,
    image_type: newAsset.image_type || null,
    status: "Warranty Active",
    statusType: "success",
  };

  try {
    const response = await fetch("http://localhost:5000/api/assets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        name: newAsset.name,
        category: newAsset.category,
        brand: newAsset.brand,
        model: newAsset.model,
        price: newAsset.price,
        purchase_date: newAsset.purchaseDate,
        warranty: newAsset.warranty,
        location: newAsset.location,
        description: newAsset.description || null,
        image: newAsset.image,
        image_type: newAsset.image_type,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.warn("ADD asset backend failed, saving locally instead:", data);
      setAssetList((prev) => [fallbackAsset, ...prev]);
      persistLocalAssets([fallbackAsset, ...assetList]);
      setShowModal(false);
      return;
    }

    const savedAsset = {
      ...data.asset,
      image: data.asset.image,
      purchaseDate: data.asset.purchase_date,
      status: "Warranty Active",
      statusType: "success",
    };

    setAssetList((prev) => [
      savedAsset,
      ...prev,
    ]);
    persistLocalAssets([savedAsset, ...assetList]);
    setShowModal(false);

  } catch (error) {
    console.warn("ADD asset error, using local fallback:", error);
    setAssetList((prev) => [fallbackAsset, ...prev]);
    persistLocalAssets([fallbackAsset, ...assetList]);
    setShowModal(false);
  }
};

  return (
    <>
      <main className="relative space-y-6">
        {/* Soft pastel Assets page background */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-violet-200/30 blur-3xl" />
          <div className="absolute right-[-100px] top-[-80px] h-[420px] w-[420px] rounded-full bg-blue-200/25 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/3 h-96 w-96 rounded-full bg-emerald-100/30 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-100/20 blur-3xl" />
        </div>

        {/* HERO */}

        <section className="relative overflow-hidden rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 p-6 sm:p-8">

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

            <div>

              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
                <Package size={15} />
                Home Assets
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#07172f] sm:text-4xl">
                Everything you own,
                <br />
                in one beautiful place.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Manage your electronics, appliances, vehicles,
                furniture and all your important home assets.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#07172f] px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-950"
              >
                <Plus size={16} />
                Add New Asset
              </button>

            </div>

            {/* Assets Page House Image */}
<div className="relative block h-[285px] w-full lg:h-[285px] lg:w-[430px]">

              {/* Soft decorative glow */}
              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
<div className="absolute -bottom-10 left-20 h-52 w-52 rounded-full bg-violet-200/30 blur-3xl" />
              {/* House image */}
             <div className="absolute bottom-0 right-0 h-[200px] w-[90%] overflow-hidden rounded-[34px] border-[7px] border-white bg-white shadow-2xl shadow-blue-200/40 sm:h-[300px] sm:w-[500px]">
               <img
  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVT5KmLQbQkpjul7_e6jm3unOd44HjH433UP4D-sqI3w&s=10"
  alt="Beautiful modern home"
  className="h-full w-full rounded-[32px] object-cover object-center shadow-2xl"
/>

              </div>

              {/* Floating home card */}
              <div className="absolute bottom-3 left-0 z-20 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-3.5 py-3 shadow-xl backdrop-blur">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 text-xl">
                  🏡
                </div>

                <div>
                  <p className="text-[10px] font-extrabold text-slate-800">
                    Your Home
                  </p>

                  <p className="mt-0.5 text-[8px] text-slate-400">
                    All assets in one place
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* SUMMARY */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <Summary
            icon={Package}
            title="Total Assets"
            value={assetList.length}
            text="Everything added"
          />

          <Summary
            icon={ShieldCheck}
            title="Protected"
            value={
              assetList.filter(
                (x) => x.statusType === "success"
              ).length
            }
            text="Warranty active"
          />

          <Summary
            icon={Wrench}
            title="Service Due"
            value={
              assetList.filter(
                (x) => x.statusType === "danger"
              ).length
            }
            text="Needs attention"
          />

          <Summary
            icon={IndianRupee}
            title="Total Value"
            value={formatMoney(totalValue)}
            text="Asset purchase value"
          />

        </div>

        {/* SEARCH */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search assets, brands or models..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-xs outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />

            </div>

            <div className="hidden items-center rounded-xl bg-slate-100 p-1 sm:flex">

              <button
                onClick={() => setView("grid")}
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  view === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                <Grid3X3 size={16} />
              </button>

              <button
                onClick={() => setView("list")}
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  view === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-400"
                }`}
              >
                <List size={17} />
              </button>

            </div>

          </div>

          {/* CATEGORY */}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

            {categories.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.name}
                  onClick={() => setCategory(item.name)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] font-bold transition ${
                    category === item.name
                      ? "bg-[#07172f] text-white"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <Icon size={14} />
                  {item.name}
                </button>
              );
            })}

          </div>

        </section>

        {/* TITLE */}

        <div>
          <h2 className="text-sm font-bold text-slate-900">
            {category === "All" ? "All Assets" : category}
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            {filteredAssets.length} assets found
          </p>
        </div>

        {/* ASSETS */}

        {filteredAssets.length > 0 ? (

          <div
            className={
              view === "grid"
                ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                : "space-y-4"
            }
          >

            {filteredAssets.map((asset) => (
  <AssetCard
    key={asset.id}
    asset={asset}
    list={view === "list"}
    onDelete={handleDeleteAsset}
  />
))}

          </div>

        ) : (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

            <Package
              size={35}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 text-sm font-bold text-slate-800">
              No assets found
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Try another search or category.
            </p>

          </div>

        )}

      </main>

      {/* ADD ASSET FORM */}

      {showModal && (
        <AddAssetModal
          close={() => setShowModal(false)}
          onAdd={handleAddAsset}
        />
      )}
    </>
  );
}


/* =================================================
   ASSET CARD
================================================= */

function AssetCard({ asset, list, onDelete }) {
  if (list) {
    return (
      <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-lg sm:flex-row sm:items-center">

        {/* IMAGE */}

        <div className="flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 sm:h-24 sm:w-28">

          <img
            src={getAssetImage(asset)}
            alt={asset.name}
            onError={(e) => {
              if (e.currentTarget.src !== asset.image && asset.image) {
                e.currentTarget.src = asset.image;
              }
            }}
            className="h-full w-full object-contain p-3 transition group-hover:scale-110"
          />

        </div>

        {/* CONTENT */}

        <div className="flex min-w-0 flex-1 items-center gap-4 px-2">

          <div className="min-w-0 flex-1">

            <p className="text-[9px] font-bold uppercase text-blue-600">
              {asset.category}
            </p>

            <h3 className="mt-1 truncate text-sm font-bold text-slate-900">
              {asset.name}
            </h3>

            <p className="mt-1 text-[10px] text-slate-400">
              {asset.brand} · {asset.model}
            </p>

          </div>

          <span className="hidden text-xs font-bold text-slate-700 sm:block">
            {asset.price}
          </span>

          {/* VIEW */}

          <Link
            to={`/assets/${asset.id}`}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-[9px] font-bold text-blue-600 transition hover:bg-blue-100"
          >
            <Eye size={13} />
            View
          </Link>

          {/* DELETE */}

          <button
            onClick={() => onDelete(asset.id)}
            title="Delete asset"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
          >
            <Trash2 size={14} />
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl">

      {/* =========================
          IMAGE
      ========================== */}

      <div className="relative h-[300px] overflow-hidden">

        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100/40" />

        <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-violet-100/30" />

        <img
          src={getAssetImage(asset)}
          alt={asset.name}
          onError={(e) => {
            if (e.currentTarget.src !== asset.image && asset.image) {
              e.currentTarget.src = asset.image;
            }
          }}
          className="relative z-10 h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        {/* STATUS */}

        <span
          className={`absolute left-4 top-4 z-20 rounded-lg px-2.5 py-1.5 text-[8px] font-bold ${
            asset.statusType === "danger"
              ? "bg-red-50 text-red-500"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {asset.status}
        </span>

      </div>

      {/* =========================
          CONTENT
      ========================== */}

      <div className="p-5">

        <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
          {asset.category}
        </p>

        <h3 className="mt-1.5 text-base font-extrabold text-slate-900">
          {asset.name}
        </h3>

        <p className="mt-1 text-[10px] text-slate-400">
          {asset.brand} · {asset.model}
        </p>

        {/* INFO */}

        <div className="mt-4 grid grid-cols-2 gap-2">

          <div className="rounded-xl bg-slate-50 p-2.5">

            <div className="flex items-center gap-1 text-[8px] text-slate-400">
              <IndianRupee size={11} />
              Price
            </div>

            <p className="mt-1 text-[10px] font-bold text-slate-700">
              {asset.price}
            </p>

          </div>

          <div className="rounded-xl bg-slate-50 p-2.5">

            <div className="flex items-center gap-1 text-[8px] text-slate-400">
              <MapPin size={11} />
              Location
            </div>

            <p className="mt-1 truncate text-[10px] font-bold text-slate-700">
              {asset.location}
            </p>

          </div>

        </div>

        {/* =========================
            BOTTOM ACTIONS
        ========================== */}

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">

          {/* VIEW DETAILS */}

          <Link
            to={`/assets/${asset.id}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#07172f] py-2.5 text-[10px] font-bold text-white transition hover:bg-blue-900"
          >
            <Eye size={14} />
            View Details
            <ArrowUpRight size={13} />
          </Link>

          {/* DELETE */}

          <button
            onClick={() => onDelete(asset.id)}
            title="Delete asset"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:border-red-200 hover:bg-red-100"
          >
            <Trash2 size={15} />
          </button>

        </div>

      </div>

    </div>
  );
}


/* =================================================
   ADD ASSET MODAL
================================================= */

function AddAssetModal({ close, onAdd }) {

  const [form, setForm] = useState({
    name: "",
    brand: "",
    model: "",
    price: "",
    purchaseDate: "",
    category: "Electronics",
    location: "",
    warranty: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* IMAGE UPLOAD */

  const handleImage = (e) => {
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

  setImage(file);

  const reader = new FileReader();

  reader.onload = () => {
    setPreview(reader.result);
  };

  reader.readAsDataURL(file);
};
  const removeImage = () => {
    setImage(null);
    setPreview("");
  };

  /* SUBMIT */

  const submit = (e) => {

    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter Asset Name.");
      return;
    }

    if (!form.brand.trim()) {
      alert("Please enter Brand.");
      return;
    }

    if (!form.price.trim()) {
      alert("Please enter Purchase Price.");
      return;
    }

    if (!form.location.trim()) {
      alert("Please enter Location.");
      return;
    }

    if (!image) {
      alert("Please upload an asset image.");
      return;
    }

    const newAsset = {
  ...form,
  price: Number(form.price),
  image: preview,
  image_type: image?.type || null,
  status: "Warranty Active",
  statusType: "success",
};

    onAdd(newAsset);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[26px] bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 sm:px-7">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
              MyHome OS
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-slate-900">
              Add New Asset
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Add details and upload your own asset image.
            </p>

          </div>

          <button
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={17} />
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={submit}
          className="space-y-4 p-5 sm:p-7"
        >

          {/* NAME */}

          <Field
            label="Asset Name *"
            value={form.name}
            onChange={(e) =>
              updateField("name", e.target.value)
            }
            placeholder="e.g. Samsung Smart TV"
          />

          {/* BRAND MODEL */}

          <div className="grid gap-4 sm:grid-cols-2">

            <Field
              label="Brand *"
              value={form.brand}
              onChange={(e) =>
                updateField("brand", e.target.value)
              }
              placeholder="Samsung"
            />

            <Field
              label="Model"
              value={form.model}
              onChange={(e) =>
                updateField("model", e.target.value)
              }
              placeholder="Neo QLED 55"
            />

          </div>

          {/* PRICE DATE */}

          <div className="grid gap-4 sm:grid-cols-2">

           <Field
  label="Purchase Price *"
  value={form.price}
  onChange={(e) =>
    updateField("price", e.target.value)
  }
  placeholder="78999"
  type="text"
  inputMode="numeric"
/>

            <Field
              label="Purchase Date"
              value={form.purchaseDate}
              onChange={(e) =>
                updateField(
                  "purchaseDate",
                  e.target.value
                )
              }
              type="date"
            />

          </div>

          {/* CATEGORY */}

          <div>

            <label className="mb-1.5 block text-[10px] font-bold text-slate-600">
              Category *
            </label>

            <select
              value={form.category}
              onChange={(e) =>
                updateField(
                  "category",
                  e.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
            >
              <option>Electronics</option>
              <option>Appliances</option>
              <option>Vehicle</option>
              <option>Furniture</option>
            </select>

          </div>

          {/* LOCATION */}

          <Field
            label="Location *"
            value={form.location}
            onChange={(e) =>
              updateField(
                "location",
                e.target.value
              )
            }
            placeholder="Living Room"
          />

          {/* WARRANTY */}

          <Field
            label="Warranty Till"
            value={form.warranty}
            onChange={(e) =>
              updateField(
                "warranty",
                e.target.value
              )
            }
            type="date"
          />

          {/* IMAGE */}

          <div>

            <label className="mb-1.5 block text-[10px] font-bold text-slate-600">
              Asset Image *
            </label>

            {!preview ? (

              <label
                htmlFor="asset-upload"
                className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-blue-300 hover:bg-blue-50"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                  <Upload size={21} />
                </div>

                <p className="mt-3 text-xs font-bold text-slate-700">
                  Click to upload image
                </p>

                <p className="mt-1 text-[9px] text-slate-400">
                  JPG, PNG or WEBP · Maximum 5MB
                </p>

                <input
                  id="asset-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImage}
                  className="hidden"
                />

              </label>

            ) : (

              <div className="overflow-hidden rounded-2xl border border-slate-200">

                <div className="flex h-52 items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">

                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />

                </div>

                <div className="flex items-center justify-between border-t border-slate-100 bg-white p-3">

                  <div className="min-w-0">

                    <p className="truncate text-[10px] font-bold text-slate-700">
                      {image?.name}
                    </p>

                    <p className="text-[9px] text-slate-400">
                      Image ready
                    </p>

                  </div>

                  <div className="flex gap-2">

                    <label
                      htmlFor="change-image"
                      className="cursor-pointer rounded-lg bg-blue-50 px-3 py-2 text-[9px] font-bold text-blue-600"
                    >
                      Change

                      <input
                        id="change-image"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImage}
                        className="hidden"
                      />

                    </label>

                    <button
                      type="button"
                      onClick={removeImage}
                      className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-[9px] font-bold text-red-500"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>

                  </div>

                </div>

              </div>

            )}

          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={close}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700"
            >
              Add Asset
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* =================================================
   FIELD
================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[10px] font-bold text-slate-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
      />

    </div>
  );
}


/* =================================================
   SUMMARY
================================================= */

function Summary({
  icon: Icon,
  title,
  value,
  text,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={18} />
      </div>

      <p className="mt-3 text-[9px] text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-xl font-extrabold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-slate-400">
        {text}
      </p>

    </div>
  );
}


/* =================================================
   MONEY
================================================= */

function formatMoney(value) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

export default Assets;