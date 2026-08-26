import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  FileText,
  ShieldCheck,
  CreditCard,
  Home,
  Car,
  Eye,
  Trash2,
  Pencil,
  Download,
  X,
  Upload,
  CalendarDays,
  FolderOpen,
  Grid3X3,
  List,
  FileCheck2,
  UserRound,
  GraduationCap,
  Receipt,
} from "lucide-react";



const categories = [
  "All",
  "Identity",
  "Property",
  "Vehicle",
  "Insurance",
  "Education",
  "Personal",
  "Bills",
];

function Documents() {
  const [documents, setDocuments] = useState([]);

 const [user, setUser] = useState(null);
const [userId, setUserId] = useState(null);
const [authLoading, setAuthLoading] = useState(true);

useEffect(() => {
  try {
    const savedUser = localStorage.getItem("myhomeUser");

    if (!savedUser) {
      setUser(null);
      setUserId(null);
      return;
    }

    const parsedUser = JSON.parse(savedUser);

    setUser(parsedUser);
    setUserId(parsedUser?.id || null);
  } catch (error) {
    console.error("USER LOAD ERROR:", error);
    setUser(null);
    setUserId(null);
  } finally {
    setAuthLoading(false);
  }
}, []);

useEffect(() => {
  const loadDocuments = async () => {
    if (!userId) {
      setDocuments([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/documents?user_id=${userId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load documents"
        );
      }

      setDocuments(
        Array.isArray(data.documents)
          ? data.documents
          : []
      );
    } catch (error) {
      console.error("LOAD documents error:", error);
      setDocuments([]);
    }
  };

  if (!authLoading) {
    loadDocuments();
  }
}, [userId, authLoading]); 

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [view, setView] = useState("grid");

  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (Array.isArray(documents) ? documents : []).filter((doc) => {
      const searchable =
        `${doc.name} ${doc.category} ${doc.holder} ${doc.documentNo}`.toLowerCase();

      return (
        searchable.includes(query) &&
        (category === "All" || doc.category === category)
      );
    });
  }, [documents, search, category]);

  const deleteDocument = async (id) => {
    if (!userId) {
  alert("Please login first.");
  return;
}
    const doc = documents.find((item) => item.id === id);

    if (!doc) return;

    if (!window.confirm(`Delete "${doc.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/documents/${id}?user_id=${userId}`,
        {
          method: "DELETE",
        }
      );
      
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete document");
      }

      setDocuments((prev) =>
        prev.filter((item) => item.id !== id)
      );

      if (selected?.id === id) {
        setSelected(null);
      }

      if (editing?.id === id) {
        setEditing(null);
      }
    } catch (error) {
      console.error("DELETE document error:", error);
      alert(error.message);
    }
  };

  const addDocument = async (newDocument) => {
  if (!userId) {
    alert("Please login first.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/documents",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newDocument.name,
          category: newDocument.category,
          holder: newDocument.holder,
          documentNo: newDocument.documentNo,
          added: newDocument.added,
          expiry: newDocument.expiry,
          status: newDocument.status,
          image: newDocument.image,
          image_type: newDocument.image_type,
          icon: newDocument.icon,
          user_id: userId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
  console.error("ADD document error:", data);
  alert(data.message || "Failed to save document");
  return;
}

const savedDocument = {
  ...data.document,
  documentNo:
    data.document?.documentNo ||
    data.document?.document_no ||
    "",
};

setDocuments((prev) => [
  savedDocument,
  ...(Array.isArray(prev) ? prev : []),
]);

setShowAdd(false);

    setDocuments(
  Array.isArray(data.documents)
    ? data.documents.map((doc) => ({
        ...doc,
        documentNo: doc.documentNo || doc.document_no || "",
      }))
    : []
);

    setShowAdd(false);

  } catch (error) {
    console.error("ADD document error:", error);
    alert(`ADD DOCUMENT ERROR: ${error.message}`);
  }
};
  const saveDocument = async (updatedDocument) => {
  if (!userId) {
    alert("Please login first.");
    return;
  }

  if (!updatedDocument?.id) {
    alert("Document ID is missing.");
    return;
  }

  try {
    const response = await fetch(
  `http://localhost:5000/api/documents/${updatedDocument.id}?user_id=${userId}`,
  {
    method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: updatedDocument.name,
          category: updatedDocument.category,
          holder: updatedDocument.holder,
          document_no: updatedDocument.documentNo,
          added: updatedDocument.added,
          expiry: updatedDocument.expiry,
          status: updatedDocument.status,
          image: updatedDocument.image,
          image_type: updatedDocument.image_type,
          user_id: userId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("UPDATE document error:", data);
      alert(data.message || "Failed to update document");
      return;
    }

    const updatedDoc = {
  ...data.document,
  documentNo:
    data.document.documentNo ||
    data.document.document_no ||
    "",
};

setDocuments((prev) =>
  prev.map((item) =>
    item.id === updatedDocument.id
      ? updatedDoc
      : item
  )
);

setEditing(null);

if (selected?.id === updatedDocument.id) {
  setSelected(updatedDoc);
}

    setEditing(null);

    if (selected?.id === updatedDocument.id) {
      setSelected(data.document);
    }

  } catch (error) {
    console.error("UPDATE document error:", error);
    alert(`UPDATE DOCUMENT ERROR: ${error.message}`);
  }
};

  const downloadDocument = (doc) => {
    if (!doc.image) {
      alert("Document image is not available.");
      return;
    }

    const link = document.createElement("a");

    link.href = doc.image;

    link.download =
      doc.name.replace(/\s+/g, "-").toLowerCase() + ".jpg";

    link.target = "_blank";
    link.rel = "noopener noreferrer";

    link.click();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f7fb] p-3 sm:p-5 lg:p-6">

      {/* Soft background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />

        <div className="absolute right-[-100px] top-[-80px] h-[420px] w-[420px] rounded-full bg-violet-100/60 blur-3xl" />

        <div className="absolute bottom-[-120px] left-1/2 h-96 w-96 rounded-full bg-cyan-100/50 blur-3xl" />

      </div>

      <main className="relative z-10 space-y-6">

        {/* HERO */}
<section className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-violet-50 px-5 py-7 shadow-[0_18px_50px_rgba(15,23,42,0.07)] sm:px-8 sm:py-9 lg:px-10 lg:py-10">

  {/* Soft decorative background */}
  <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-200/20 blur-3xl" />

  <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_430px]">

    {/* LEFT CONTENT */}
    <div className="max-w-[650px]">

      <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-violet-600">
        <FolderOpen size={15} />
        MyHome OS · Personal Vault
      </div>

      <h1 className="mt-4 text-3xl font-black leading-[1.05] tracking-[-0.045em] text-slate-900 sm:text-4xl lg:text-[48px]">
        Everything important,
        <br />

        <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
          safely in one place.
        </span>
      </h1>

      <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 sm:text-[15px]">
        Store your Aadhaar, PAN, property papers, certificates,
        insurance and bills. View, edit, download or remove them
        anytime from your personal document vault.
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">

        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-violet-600"
        >
          <Plus size={16} />
          Add Document
        </button>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-[10px] font-bold text-slate-500 shadow-sm">
          <ShieldCheck size={15} className="text-emerald-500" />
          Private & Secure
        </div>

      </div>
    </div>


    {/* RIGHT SIDE CARD IMAGE */}
<div className="absolute right-4 top-1/2 hidden h-[300px] w-[440px] -translate-y-1/2 lg:block">

  {/* Background glow */}
  <div className="absolute right-10 top-10 h-64 w-80 rounded-full bg-violet-200/50 blur-3xl" />
  <div className="absolute bottom-0 right-20 h-40 w-72 rounded-full bg-blue-200/40 blur-3xl" />

  {/* Back Card - Driving License */}
  <div className="absolute right-6 top-4 h-[170px] w-[285px] rotate-[6deg] rounded-[20px] bg-gradient-to-br from-violet-500 to-indigo-500 p-5 shadow-2xl">
    <p className="text-[10px] font-bold tracking-wide text-white/90">
      DRIVING LICENSE
    </p>

    <div className="mt-4 flex justify-between">
      <div className="space-y-2">
        <div className="h-2 w-28 rounded-full bg-white/30" />
        <div className="h-2 w-20 rounded-full bg-white/20" />
      </div>

      <span className="text-2xl">🚗</span>
    </div>

    <div className="absolute bottom-5 left-5 right-5">
      <div className="h-2 w-32 rounded-full bg-white/30" />
    </div>
  </div>

  {/* Middle Card - Aadhaar */}
  <div className="absolute right-[65px] top-[48px] h-[170px] w-[285px] rotate-[2deg] rounded-[20px] border border-white bg-gradient-to-br from-sky-100 via-white to-blue-100 p-5 shadow-2xl">

    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-extrabold text-slate-800">
          Aadhaar Card
        </p>

        <p className="mt-1 text-[8px] text-slate-500">
          Government of India
        </p>
      </div>

      <span className="text-xl">🇮🇳</span>
    </div>

    <div className="mt-5 flex items-center gap-3">
      <div className="flex h-11 w-10 items-center justify-center rounded-lg bg-slate-200">
        👤
      </div>

      <div className="space-y-2">
        <div className="h-2 w-28 rounded-full bg-slate-300" />
        <div className="h-2 w-20 rounded-full bg-slate-200" />
      </div>
    </div>

    <p className="absolute bottom-4 left-5 text-[8px] font-bold tracking-widest text-slate-500">
      XXXX XXXX 4821
    </p>
  </div>

  {/* Front Card - Credit Card */}
  <div className="absolute bottom-[15px] right-[110px] z-20 h-[180px] w-[300px] rotate-[-4deg] rounded-[22px] bg-gradient-to-br from-[#1d2945] via-[#10192f] to-[#080e1e] p-6 text-white shadow-[0_25px_45px_rgba(15,23,42,0.35)]">

    <div className="flex items-center justify-between">
      <p className="text-sm font-bold tracking-wide">
        CREDIT CARD
      </p>

      <span className="text-xl">
        ))))
      </span>
    </div>

    {/* Chip */}
    <div className="mt-5 h-9 w-12 rounded-lg bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600">
      <div className="mt-2 border-t border-yellow-700/40" />
      <div className="mt-2 border-t border-yellow-700/40" />
    </div>

    {/* Card Number */}
    <p className="mt-5 font-mono text-[13px] tracking-[0.18em]">
      1234 5678 9012 3456
    </p>

    {/* Bottom */}
    <div className="absolute bottom-5 left-6 right-6 flex justify-between">

      <div>
        <p className="text-[6px] uppercase text-white/50">
          Cardholder Name
        </p>

        <p className="mt-1 text-[9px] font-semibold">
          KAJAL
        </p>
      </div>

      <div>
        <p className="text-[6px] text-white/50">
          VALID THRU
        </p>

        <p className="text-[9px] font-bold">
          12/29
        </p>
      </div>

    </div>
  </div>

  {/* Decorative Sparkles */}
  <span className="absolute left-5 top-16 text-2xl text-violet-300">
    ✦
  </span>

  <span className="absolute right-0 top-20 text-xl text-blue-300">
    ✦
  </span>

</div>


      {/* Small floating badge */}
      <div className="absolute bottom-0 right-0 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-[0_15px_35px_rgba(15,23,42,0.12)] backdrop-blur">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <ShieldCheck size={19} />
        </div>

        <div>
          <p className="text-[10px] font-extrabold text-slate-800">
            Safe & Organized
          </p>

          <p className="mt-0.5 text-[8px] text-slate-400">
            All your documents in one place
          </p>
        </div>

      </div>

    </div>
</section>
       

                  {/* ================= STATS ================= */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          <Stat
            icon={FileText}
            title="Total Documents"
            value={documents.length}
            text="In your vault"
          />

          <Stat
            icon={CreditCard}
            title="Identity"
            value={
              documents.filter(
                (d) => d.category === "Identity"
              ).length
            }
            text="Aadhaar & PAN"
          />

          <Stat
            icon={Home}
            title="Home & Property"
            value={
              documents.filter(
                (d) => d.category === "Property"
              ).length
            }
            text="Important papers"
          />

          <Stat
            icon={CalendarDays}
            title="Expiring"
            value={
              documents.filter(
                (d) => d.expiry !== "No Expiry"
              ).length
            }
            text="Keep an eye on"
          />

        </div>

        {/* ================= SEARCH ================= */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">

          <div className="flex flex-col gap-4 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search Aadhaar, PAN, property, insurance..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
              />

            </div>

            <div className="hidden items-center rounded-xl bg-slate-100 p-1 sm:flex">

              <button
                onClick={() => setView("grid")}
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  view === "grid"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400"
                }`}
              >

                <Grid3X3 size={16} />

              </button>

              <button
                onClick={() => setView("list")}
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  view === "list"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400"
                }`}
              >

                <List size={17} />

              </button>

            </div>

          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">

            {categories.map((item) => (

              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-[10px] font-bold ${
                  category === item
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >

                {item}

              </button>

            ))}

          </div>

        </section>

        {/* ================= TITLE ================= */}

        <div className="flex items-end justify-between px-1">

          <div>

            <h2 className="text-lg font-extrabold text-slate-900">

              My Documents

            </h2>

            <p className="mt-1 text-xs text-slate-500">

              {filteredDocuments.length} documents available

            </p>

          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 sm:flex"
          >

            <Plus size={14} />

            Add New

          </button>

        </div>

        {/* ================= DOCUMENTS ================= */}

        {filteredDocuments.length > 0 ? (

          <div
            className={
              view === "grid"
                ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
                : "space-y-4"
            }
          >

            {filteredDocuments.map((doc) => (

              <DocumentCard
                key={doc.id}
                document={doc}
                list={view === "list"}
                onView={() => setSelected(doc)}
                onEdit={() => setEditing(doc)}
                onDelete={() =>
                  deleteDocument(doc.id)
                }
                onDownload={() =>
                  downloadDocument(doc)
                }
              />

            ))}

          </div>

        ) : (

          <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center shadow-sm">

            <FileText
              size={38}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 text-sm font-bold text-slate-900">

              No documents found

            </h3>

            <p className="mt-1 text-xs text-slate-500">

              Try another search or category.

            </p>

          </div>

        )}

      </main>

      {/* VIEW MODAL */}

      {selected && (
        <DocumentDetails
          document={selected}
          close={() => setSelected(null)}
          onEdit={() => {
            setEditing(selected);
            setSelected(null);
          }}
          onDelete={() =>
            deleteDocument(selected.id)
          }
          onDownload={() =>
            downloadDocument(selected)
          }
        />
      )}

      {/* EDIT MODAL */}

      {editing && (
        <DocumentFormModal
          title="Edit Document"
          document={editing}
          close={() => setEditing(null)}
          onSave={saveDocument}
        />
      )}

      {/* ADD MODAL */}

      {showAdd && (
        <DocumentFormModal
          title="Add Document"
          document={null}
          close={() => setShowAdd(false)}
          onSave={addDocument}
        />
      )}

    </div>
  );
}

/* =====================================================
   DOCUMENT CARD
===================================================== */

function DocumentCard({
  document,
  list,
  onView,
  onEdit,
  onDelete,
  onDownload,
}) {
  const Icon =
  typeof document.icon === "function"
    ? document.icon
    : FileText;
  if (list) {
    return (

      <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-lg sm:flex-row sm:items-center">

        <div className="h-28 w-full overflow-hidden rounded-xl bg-slate-100 sm:w-36">

          <img
            src={document.image}
            alt={document.name}
            className="h-full w-full object-cover"
          />

        </div>

        <div className="min-w-0 flex-1">

          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">

            {document.category}

          </span>

          <h3 className="mt-1 truncate text-sm font-extrabold text-slate-900">

            {document.name}

          </h3>

          <p className="mt-1 text-[10px] text-slate-500">

            {document.holder} · {document.documentNo}

          </p>

        </div>

        <div className="grid grid-cols-4 gap-2">

          <SmallAction
            icon={Eye}
            text="View"
            onClick={onView}
          />

          <SmallAction
            icon={Pencil}
            text="Edit"
            onClick={onEdit}
          />

          <SmallAction
            icon={Download}
            text="Save"
            onClick={onDownload}
          />

          <SmallAction
            icon={Trash2}
            text="Delete"
            onClick={onDelete}
            danger
          />

        </div>

      </div>

    );
  }

  return (

    <article className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* IMAGE */}

      <div className="relative h-[190px] overflow-hidden bg-slate-100">

        <img
          src={document.image}
          alt={document.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 rounded-lg bg-white/90 px-2.5 py-1.5 text-[8px] font-bold text-slate-700 shadow">

          {document.category}

        </div>

        <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-lg">

          <Icon size={16} />

        </div>

        <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[8px] font-bold text-slate-700">

          {document.status}

        </div>

      </div>

      {/* DETAILS */}

      <div className="p-4">

        <h3 className="truncate text-sm font-extrabold text-slate-900">

          {document.name}

        </h3>

        <p className="mt-1 truncate text-[10px] text-slate-500">

          {document.holder} · {document.documentNo}

        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">

          <MiniInfo
            label="Added"
            value={document.added}
          />

          <MiniInfo
            label="Expiry"
            value={document.expiry}
          />

        </div>

        {/* ACTIONS */}

        <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4">

          <SmallAction
            icon={Eye}
            text="View"
            onClick={onView}
          />

          <SmallAction
            icon={Pencil}
            text="Edit"
            onClick={onEdit}
          />

          <SmallAction
            icon={Download}
            text="Save"
            onClick={onDownload}
          />

          <SmallAction
            icon={Trash2}
            text="Delete"
            onClick={onDelete}
            danger
          />

        </div>

      </div>

    </article>
  );
}

/* =====================================================
   SMALL ACTION
===================================================== */

function SmallAction({
  icon: Icon,
  text,
  onClick,
  danger,
}) {
  return (

    <button
      onClick={onClick}
      title={text}
      className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg py-2 ${
        danger
          ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
          : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >

      <Icon size={13} />

      <span className="truncate text-[7px] font-bold">

        {text}

      </span>

    </button>

  );
}

/* =====================================================
   MINI INFO
===================================================== */

function MiniInfo({ label, value }) {
  return (

    <div className="rounded-xl bg-slate-50 p-2">

      <p className="text-[7px] uppercase tracking-wider text-slate-400">

        {label}

      </p>

      <p className="mt-1 truncate text-[9px] font-bold text-slate-700">

        {value}

      </p>

    </div>

  );
}

/* =====================================================
   STAT
===================================================== */

function Stat({
  icon: Icon,
  title,
  value,
  text,
}) {
  return (

    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

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

/* =====================================================
   VIEW DETAILS
===================================================== */

function DocumentDetails({
  document,
  close,
  onEdit,
  onDelete,
  onDownload,
}) {
  return (

    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-md">

      <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">

        {/* HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-7">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-600">

              Full Document

            </p>

            <h2 className="mt-1 text-xl font-extrabold text-slate-900">

              {document.name}

            </h2>

          </div>

          <button
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
          >

            <X size={17} />

          </button>

        </div>

        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">

          {/* IMAGE */}

          <div className="flex min-h-[360px] items-center justify-center bg-slate-50 p-5 sm:min-h-[550px] sm:p-8">

            <img
              src={document.image}
              alt={document.name}
              className="max-h-[510px] w-full rounded-2xl object-contain shadow-lg"
            />

          </div>

          {/* DETAILS */}

          <div className="p-6 sm:p-8">

            <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[9px] font-bold text-emerald-600">

              {document.status}

            </span>

            <h3 className="mt-4 text-2xl font-black text-slate-900">

              {document.name}

            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-500">

              Secure document stored inside your
              MyHome OS personal vault.

            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <Detail
                label="Document Type"
                value={document.category}
              />

              <Detail
                label="Holder"
                value={document.holder}
              />

              <Detail
                label="Document No."
                value={document.documentNo}
              />

              <Detail
                label="Added"
                value={document.added}
              />

              <Detail
                label="Expiry"
                value={document.expiry}
              />

              <Detail
                label="Status"
                value={document.status}
              />

            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">

              <button
                onClick={onDownload}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-50 py-3 text-xs font-bold text-cyan-600 hover:bg-cyan-100"
              >

                <Download size={15} />

                Download

              </button>

              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 py-3 text-xs font-bold text-violet-600 hover:bg-violet-100"
              >

                <Pencil size={15} />

                Edit

              </button>

              <button
                onClick={onDelete}
                className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-rose-50 py-3 text-xs font-bold text-rose-600 hover:bg-rose-100"
              >

                <Trash2 size={15} />

                Delete Document

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

/* =====================================================
   DETAIL
===================================================== */

function Detail({ label, value }) {
  return (

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">

      <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400">

        {label}

      </p>

      <p className="mt-1 truncate text-xs font-bold text-slate-700">

        {value}

      </p>

    </div>

  );
}

/* =====================================================
   ADD / EDIT FORM
===================================================== */

function DocumentFormModal({
  title,
  document,
  close,
  onSave,
}) {
  const [form, setForm] = useState({
  id: document?.id,
  name: document?.name || "",
  category: document?.category || "Identity",
  holder: document?.holder || "Kajal",
  documentNo: document?.documentNo || 
  "",
    added: document?.added || "",
    expiry: document?.expiry || "No Expiry",
    status: document?.status || "New",
    image: document?.image || "",
    icon: document?.icon || FileText,
  });

  const [preview, setPreview] = useState(
    document?.image || ""
  );

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFile = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please choose an image file.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image must be smaller than 5MB.");
    return;
  }

  const reader = new FileReader();

  reader.onloadend = () => {
    const imageData = reader.result;

    setPreview(imageData);
    update("image", imageData);
    update("image_type", file.type);
  };

  reader.readAsDataURL(file);
};

  const submit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter document name.");
      return;
    }

    if (!form.documentNo.trim()) {
      alert("Please enter document number.");
      return;
    }

    onSave({
      ...form,
      added: form.added || "12 Aug 2026",
      image:
        preview ||
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=90",
    });
  };

  return (

    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-md">

      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-slate-200 bg-white shadow-2xl">

        {/* MODAL HEADER */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-7">

          <div>

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-600">

              MyHome OS Vault

            </p>

            <h2 className="mt-1 text-xl font-extrabold text-slate-900">

              {title}

            </h2>

          </div>

          <button
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
          >

            <X size={17} />

          </button>

        </div>

        <form
          onSubmit={submit}
          className="space-y-4 p-5 sm:p-7"
        >

          <div className="grid gap-4 sm:grid-cols-2">

            <Field
              label="Document Name *"
              placeholder="Aadhaar Card"
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
            />

            <div>

              <label className="mb-1.5 block text-[10px] font-bold text-slate-600">

                Category

              </label>

              <select
                value={form.category}
                onChange={(e) =>
                  update("category", e.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none focus:border-emerald-300 focus:bg-white"
              >

                {categories.slice(1).map((item) => (

                  <option
                    key={item}
                    value={item}
                  >

                    {item}

                  </option>

                ))}

              </select>

            </div>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <Field
              label="Holder Name"
              placeholder="Kajal"
              value={form.holder}
              onChange={(e) =>
                update("holder", e.target.value)
              }
            />

            <Field
              label="Document Number *"
              placeholder="XXXX XXXX 4821"
              value={form.documentNo}
              onChange={(e) =>
                update("documentNo", e.target.value)
              }
            />

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            <Field
              label="Added Date"
              placeholder="12 Aug 2026"
              value={form.added}
              onChange={(e) =>
                update("added", e.target.value)
              }
            />

            <Field
              label="Expiry"
              placeholder="No Expiry"
              value={form.expiry}
              onChange={(e) =>
                update("expiry", e.target.value)
              }
            />

          </div>

          {/* IMAGE UPLOAD */}

          <div>

            <label className="mb-1.5 block text-[10px] font-bold text-slate-600">

              Document Image

            </label>

            {preview ? (

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                <div className="h-56 p-3">

                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full rounded-xl object-contain"
                  />

                </div>

                <div className="border-t border-slate-200 p-3">

                  <label
                    htmlFor="change-document"
                    className="block cursor-pointer rounded-xl bg-white py-2.5 text-center text-[10px] font-bold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  >

                    Change Image

                    <input
                      id="change-document"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFile}
                      className="hidden"
                    />

                  </label>

                </div>

              </div>

            ) : (

              <label
                htmlFor="document-image"
                className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">

                  <Upload size={21} />

                </div>

                <p className="mt-3 text-xs font-bold text-slate-800">

                  Upload document image

                </p>

                <p className="mt-1 text-[9px] text-slate-400">

                  JPG, PNG or WEBP · Maximum 5MB

                </p>

                <input
                  id="document-image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFile}
                  className="hidden"
                />

              </label>

            )}

          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 border-t border-slate-100 pt-5">

            <button
              type="button"
              onClick={close}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >

              Cancel

            </button>

            <button
              type="submit"
              className="flex-1 rounded-xl bg-slate-900 py-3 text-xs font-extrabold text-white shadow-lg hover:bg-slate-800"
            >

              Save Document

            </button>

          </div>

        </form>

      </div>

    </div>

  );
}

/* =====================================================
   FIELD
===================================================== */

function Field({
  label,
  placeholder,
  value,
  onChange,
}) {
  return (

    <div>

      <label className="mb-1.5 block text-[10px] font-bold text-slate-600">

        {label}

      </label>

      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
      />

    </div>

  );
}

export default Documents;