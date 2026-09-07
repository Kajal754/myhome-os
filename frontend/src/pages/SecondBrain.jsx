import { useEffect, useMemo, useState } from "react";
import AskMyLife from "../components/brain/AskMyLife";
import {
  AlertTriangle,
  BellRing,
  Brain,
  CalendarClock,
  Car,
  ChevronRight,
  Clock3,
  FileSearch,
  FileText,
  House,
  Landmark,
  MessageCircle,
  NotebookPen,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  Wallet,
  X,
} from "lucide-react";

const initialKnowledge = [
  {
    id: 1,
    title: "Car Insurance",
    content:
      "Honda City insurance policy. Renewal and policy details are stored here. Renewal is due in 23 days.",
    type: "Document",
    tag: "Vehicle",
    date: "Today",
  },
  {
    id: 2,
    title: "Home Maintenance",
    content:
      "AC servicing, plumbing and electrical maintenance information. Last AC service was completed 4 months ago.",
    type: "Note",
    tag: "Home",
    date: "Yesterday",
  },
  {
    id: 3,
    title: "Important Documents",
    content:
      "Personal and household documents that need regular tracking. Includes insurance, warranty and utility records.",
    type: "Document",
    tag: "Documents",
    date: "2 days ago",
  },
  {
    id: 4,
    title: "Electricity Bill Pattern",
    content:
      "Average bill spike over the last 3 months and possible anomaly detection. Electricity usage is 18% above the trailing average.",
    type: "Note",
    tag: "Bills",
    date: "This week",
  },
  {
    id: 5,
    title: "Warranty Tracker",
    content:
      "AC, appliances and electronics warranties with coverage and service reminders. Active warranties: AC unit, washing machine, home inverter.",
    type: "Document",
    tag: "Warranties",
    date: "This month",
  },
  {
    id: 6,
    title: "Family Calendar",
    content:
      "Appointments, service reminders and recurring household events in one timeline. Includes insurance and maintenance reminders.",
    type: "Note",
    tag: "Calendar",
    date: "Updated now",
  },
  {
    id: 7,
    title: "Household Expense Summary",
    content:
      "This month expenses are ₹18,640 across home and essentials. Household spend is 2.8% below the previous average.",
    type: "Note",
    tag: "Expenses",
    date: "Updated now",
  },
  {
    id: 8,
    title: "Vehicle Service History",
    content:
      "Vehicle maintenance has been kept on track. Service cycle is healthy and the next maintenance check is due soon.",
    type: "Document",
    tag: "Vehicle",
    date: "Recently",
  },
];

const quickQuestions = [
  "Which documents expire soon?",
  "How much did I spend this month?",
  "When was my last vehicle service?",
  "Show my active warranties",
];

const insightCards = [];
const detectionAlerts = [];

const starterMessages = [];

const legacyStarterMessages = [
  {
    role: "assistant",
    text: "I scanned your home data and noticed your AC spend pattern is trending higher than usual.",
  },
  {
    role: "user",
    text: "What should I check before the next bill cycle?",
  },
  {
    role: "assistant",
    text: "Your electricity usage has risen 18% in the last 3 months. I’d review AC filters, room temperature settings, and service history first.",
  },
];


const formatDate = (dateValue) => {
  if (!dateValue) return "Not available";

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return String(dateValue);
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDaysUntil = (dateValue) => {
  if (!dateValue) return null;

  const target = new Date(dateValue);

  if (Number.isNaN(target.getTime())) return null;

  const diffMs = target.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};




export default function SecondBrain() {
  const [activeTab, setActiveTab] = useState("knowledge");

  const currentUser = JSON.parse(
    localStorage.getItem("myhomeUser") || "null"
  );

  const userId = currentUser?.id;

  console.log("SECOND BRAIN USER ID:", userId);

  const [search, setSearch] = useState("");
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState("");
  const [memoryContent, setMemoryContent] = useState("");
  const [memoryDate, setMemoryDate] = useState("");
  const [knowledge, setKnowledge] = useState([]);
  
 useEffect(() => {
  const loadKnowledge = async () => {
    if (!userId) return;

    try {
      const [knowledgeRes, documentsRes, assetsRes] = await Promise.all([
        fetch(
          `http://localhost:5000/api/brain/knowledge?user_id=${userId}`
        ),
        fetch(
          `http://localhost:5000/api/documents?user_id=${userId}`
        ),
        fetch(
          `http://localhost:5000/api/assets?user_id=${userId}`
        ),
      ]);

      const knowledgeData = knowledgeRes.ok
        ? await knowledgeRes.json()
        : [];

      const documentsPayload = documentsRes.ok
        ? await documentsRes.json()
        : {};

      const assetsPayload = assetsRes.ok
        ? await assetsRes.json()
        : {};

      const documentsData = documentsPayload.documents || [];
      const assetsData = assetsPayload.assets || [];

      const memories = knowledgeData.map((item) => ({
        id: `memory-${item.id}`,
        title: item.title || "Memory",
        content: item.content || "",
        type: item.source_type || "Note",
        tag: item.tag || "Personal",
        date: item.created_at
          ? item.reminder_date
            ? `Due ${formatDate(item.reminder_date)}`
            : formatDate(item.created_at)
          : "Recently",
      }));

      const documents = documentsData.map((item) => ({
        id: `document-${item.id}`,
        title:
          item.title ||
          item.name ||
          item.document_name ||
          "Document",
        content: `
          Document: ${item.title || item.name || item.document_name || ""}
          ${item.category ? `Category: ${item.category}` : ""}
          ${item.description ? `Description: ${item.description}` : ""}
          ${item.file_name ? `File: ${item.file_name}` : ""}
          ${item.file_url ? `Location: ${item.file_url}` : ""}
        `,
        type: "Document",
        tag: item.category || "Documents",
        date: item.created_at
          ? formatDate(item.created_at)
          : "Recently",
      }));

      const assets = assetsData.map((item) => ({
        id: `asset-${item.id}`,
        title: item.name || item.title || "Asset",
        content: `
          Asset: ${item.name || item.title || ""}
          ${item.category ? `Category: ${item.category}` : ""}
          ${item.brand ? `Brand: ${item.brand}` : ""}
          ${item.model ? `Model: ${item.model}` : ""}
          ${item.location ? `Location: ${item.location}` : ""}
        `,
        type: "Asset",
        tag: item.category || "Assets",
        date: item.created_at
          ? formatDate(item.created_at)
          : "Recently",
      }));

      const combinedKnowledge = [
        ...memories,
        ...documents,
        ...assets,
      ];

      console.log("SECOND BRAIN KNOWLEDGE:", combinedKnowledge);

      setKnowledge(combinedKnowledge);
    } catch (error) {
      console.error("LOAD SECOND BRAIN ERROR:", error);
    }
  };

  loadKnowledge();
}, [userId]);

  
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(starterMessages);

  const showSearchResults = () => {
    setActiveTab("search");
  };

  const filteredKnowledge = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return knowledge;

    return knowledge.filter(
      (item) =>
        item.title.toLowerCase().includes(value) ||
        item.content.toLowerCase().includes(value) ||
        item.tag.toLowerCase().includes(value)
    );
  }, [search, knowledge]);

  const deleteKnowledgeItem = async (item) => {
    if (!window.confirm(`Delete "${item.title}" from your knowledge?`)) {
      return;
    }

    const itemMatch = item.id.match(/^(memory|upload|asset|document)-(.+)$/);

    if (!itemMatch) return;

    const [, itemType, itemId] = itemMatch;
    let endpoint;

    if (itemType === "asset") {
      endpoint = `http://localhost:5000/api/assets/${itemId}?user_id=${userId}`;
    } else if (itemType === "document") {
      endpoint = `http://localhost:5000/api/documents/${itemId}?user_id=${userId}`;
    } else {
      endpoint = `http://localhost:5000/api/brain/knowledge/${itemId}?user_id=${userId}`;
    }

    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Knowledge item delete nahi hua");
      }

      setKnowledge((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (error) {
      console.error("DELETE KNOWLEDGE ERROR:", error);
      alert(error.message || "Knowledge item delete nahi hua.");
    }
  };

 const addMemory = async () => {
  if (!memoryTitle.trim() || !memoryContent.trim()) {
    alert("Title aur content dono bharna zaroori hai.");
    return;
  }

  if (!userId) {
    alert("User ID nahi mila. Please login again.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/brain/knowledge",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          title: memoryTitle.trim(),
          content: memoryContent.trim(),
          reminder_date: memoryDate || null,
          type: "Note",
          tag: "Personal",
        }),
      }
    );

    const data = await response.json();

    console.log("MEMORY SAVE RESPONSE:", data);

    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Memory save nahi hui"
      );
    }

    const newMemory = {
      id: `memory-${data.id || Date.now()}`,
      title: data.title || memoryTitle.trim(),
      content: data.content || memoryContent.trim(),
      type: data.type || "Note",
      tag: data.tag || "Personal",
      date: "Just now",
    };

    setKnowledge((prev) => [newMemory, ...prev]);

    setMemoryTitle("");
    setMemoryContent("");
    setMemoryDate("");
    setShowMemoryModal(false);
    setActiveTab("notes");

    console.log("MEMORY SAVED SUCCESSFULLY:", newMemory);
  } catch (error) {
    console.error("SAVE MEMORY ERROR:", error);

    alert(
      error.message || "Memory save nahi hui. Backend check karo."
    );
  }
};
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setShowUploadModal(false);
      return;
    }

    let extractedText = `${file.name} was uploaded and saved in your personal knowledge vault.`;

    if (file.type.startsWith("text/") || /\.(txt|md|csv|json|log)$/i.test(file.name)) {
      try {
        const text = await file.text();
        extractedText = text.slice(0, 1200) || extractedText;
      } catch {
        extractedText = `${file.name} was uploaded. The file was saved in your document vault for AI review.`;
      }
    } else if (file.type.startsWith("image/")) {
      extractedText = `${file.name} was uploaded as an image asset. This asset is available for review and can be referenced in future questions.`;
    }

    const uploadedItem = {
      title: file.name.replace(/\.[^/.]+$/, "") || "Uploaded file",
      content: extractedText,
      source_type: "upload",
    };

    if (!userId) {
      alert("User ID nahi mila. Please login again.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/brain/knowledge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            title: uploadedItem.title,
            content: uploadedItem.content,
            source_type: uploadedItem.source_type,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "File save nahi hui");
      }

      setKnowledge((prev) => [
        {
          id: `upload-${data.id || Date.now()}`,
          title: data.title || uploadedItem.title,
          content: data.content || uploadedItem.content,
          type: "Document",
          tag: "Uploaded",
          date: "Just now",
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("UPLOAD SAVE ERROR:", error);
      alert(error.message || "File save nahi hui. Backend check karo.");
      return;
    }

    setShowUploadModal(false);
    setActiveTab("knowledge");
    event.target.value = "";
  };

 ;
  const askQuestion = async (text = question) => {
  const value = text.trim();

  if (!value) return;

  console.log("QUESTION:", value);
  console.log("CURRENT USER ID:", userId);

  try {
    const response = await fetch(
      "http://localhost:5000/api/brain/ask",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          question: value,
        }),
      }
    );

    const data = await response.json();

    console.log("BRAIN RESPONSE:", data);

    const assistantReply =
      data.answer ||
      "Mujhe aapke saved data mein is question se related information nahi mili.";

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: value,
      },
      {
        role: "assistant",
        text: assistantReply,
      },
    ]);

    setQuestion("");
  } catch (error) {
    console.error("BRAIN ASK ERROR:", error);

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: value,
      },
      {
        role: "assistant",
        text: "Second Brain se connect nahi ho pa raha. Please make sure backend server is running.",
      },
    ]);
  }
};

  const tabs = [
    { id: "knowledge", label: "My Knowledge", icon: Brain },
    { id: "upload", label: "Upload Document", icon: Upload },
    { id: "notes", label: "Notes", icon: StickyNote },
    { id: "search", label: "Smart Search", icon: Search },
    { id: "ask", label: "Ask My Life", icon: MessageCircle },
  ];

  return (
  <div className="relative min-h-screen overflow-hidden bg-[#eef2f7] p-4 text-slate-800 sm:p-6 lg:p-8">

    {/* PREMIUM BACKGROUND */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      {/* Indigo glow */}
      <div
        className="
          absolute -left-40 -top-40
          h-[520px] w-[520px]
          rounded-full
          bg-indigo-300/30
          blur-[120px]
        "
      />

      {/* Cyan glow */}
      <div
        className="
          absolute -right-40 top-20
          h-[480px] w-[480px]
          rounded-full
          bg-cyan-300/25
          blur-[120px]
        "
      />

      {/* Violet bottom glow */}
      <div
        className="
          absolute bottom-[-250px] left-[25%]
          h-[550px] w-[550px]
          rounded-full
          bg-violet-300/20
          blur-[140px]
        "
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(100,116,139,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.06) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
    </div>

    <div className="relative z-10 mx-auto max-w-7xl"></div>
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 text-white shadow-lg shadow-slate-900/20">
                <Brain size={20} />
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Life Detective
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Second Brain
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              AI-powered memory, documents, spending, maintenance, insurance and personal pattern intelligence in one private command center.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => setShowMemoryModal(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Memory
            </button>

           <button
  onClick={() => setShowUploadModal(true)}
  className="
    group flex items-center justify-center gap-2
    rounded-xl
    border border-slate-300/70
    bg-white/70
    px-5 py-3
    text-sm font-semibold text-slate-700
    shadow-sm
    backdrop-blur-xl
    transition-all duration-300
    hover:-translate-y-0.5
    hover:border-indigo-300
    hover:bg-white
    hover:text-indigo-700
    hover:shadow-[0_10px_30px_rgba(99,102,241,0.12)]
  "
>
  <Upload
    size={18}
    className="transition-transform duration-300 group-hover:-translate-y-0.5"
  />
  Upload
</button>
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 shadow-2xl shadow-slate-900/10 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-white">
            <Sparkles size={18} />
            <span className="text-sm font-semibold">Search your life</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents, memories, notes, bills, documents..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/90 py-3.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-sky-400"
              />
            </div>

            <button
              onClick={showSearchResults}
              className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon size={17} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "knowledge" && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {insightCards.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        item.tone === "amber"
                          ? "bg-amber-100 text-amber-700"
                          : item.tone === "blue"
                            ? "bg-sky-100 text-sky-700"
                            : item.tone === "rose"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                      }`}>
                        <Icon size={18} />
                      </div>

                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Trend
                      </span>
                    </div>

                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      {item.title}
                    </p>
                    <p className="mt-3 text-3xl font-black text-slate-900">
                      {item.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.detail}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">My Knowledge</h2>
                    <p className="text-sm text-slate-500">Everything important you've saved.</p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {knowledge.length} memories
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {filteredKnowledge.map((item) => (
                    <KnowledgeCard
                      key={item.id}
                      item={item}
                      onDelete={deleteKnowledgeItem}
                    />
                  ))}
                </div>

                {filteredKnowledge.length === 0 && (
                  <EmptyState text="No memories found." />
                )}
              </div>

              <div className="space-y-5">
                <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white shadow-lg shadow-slate-900/10">
                  <div className="mb-4 flex items-center gap-2">
                    <BellRing size={18} className="text-sky-300" />
                    <h3 className="text-lg font-bold">AI Life Signals</h3>
                  </div>

                  <div className="space-y-3">
                    {detectionAlerts.map((alert) => {
                      const Icon = alert.icon;
                      return (
                        <div
                          key={alert.label}
                          className="rounded-2xl border border-white/10 bg-white/5 p-3"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${alert.accent}`}>
                              <Icon size={15} />
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                              {alert.label}
                            </span>
                          </div>
                          <p className="text-sm leading-6 text-slate-200">{alert.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FileSearch size={18} className="text-slate-700" />
                    <h3 className="font-bold text-slate-900">Detected patterns</h3>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-center">
  <p className="text-sm text-slate-500">
    No patterns detected yet.
  </p>

  <p className="mt-1 text-xs text-slate-400">
    Add some data to your Second Brain and patterns will appear here.
  </p>
</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <UploadSection onUpload={() => setShowUploadModal(true)} />
        )}

        {activeTab === "notes" && (
          <NotesSection
            knowledge={knowledge.filter((item) => item.type === "Note")}
            onAdd={() => setShowMemoryModal(true)}
            onDelete={deleteKnowledgeItem}
          />
        )}

        {activeTab === "search" && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">Smart Search</h2>
              <p className="text-sm text-slate-500">
                Search through your personal knowledge, patterns and memory vault.
              </p>
            </div>

            <div className="grid gap-4">
              {filteredKnowledge.map((item) => (
                <KnowledgeCard
                  key={item.id}
                  item={item}
                  horizontal
                  onDelete={deleteKnowledgeItem}
                />
              ))}
            </div>

            {filteredKnowledge.length === 0 && (
              <EmptyState text="Nothing matched your search." />
            )}
          </div>
        )}

        {activeTab === "ask" && (
  <AskMyLife
    question={question}
    setQuestion={setQuestion}
    messages={messages}
    askQuestion={askQuestion}
  />
)}
       
      </div>

      {showMemoryModal && (
        <Modal title="Add Memory" onClose={() => setShowMemoryModal(false)}>
          <div className="space-y-4">
            <input
              value={memoryTitle}
              onChange={(e) => setMemoryTitle(e.target.value)}
              placeholder="Memory title"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            <textarea
              value={memoryContent}
              onChange={(e) => setMemoryContent(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  addMemory();
                }
              }}
              placeholder="Write something you want MYHOME OS to remember..."
              rows={6}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            <input
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              aria-label="Note reminder date"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            <button
              onClick={addMemory}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  addMemory();
                }
              }}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save Memory
            </button>
          </div>
        </Modal>
      )}

      {showUploadModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xl">

    {/* Upload Modal */}
    <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/20 bg-[#0b0f19] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-indigo-500/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-cyan-500/15 blur-[100px]" />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-white/10 px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-indigo-300 shadow-lg">
            <Brain size={20} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-300">
              Second Brain
            </p>

            <h2 className="mt-0.5 text-lg font-bold text-white">
              Add to your knowledge
            </h2>
          </div>

        </div>

        <button
          onClick={() => setShowUploadModal(false)}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={19} />
        </button>

      </div>

      {/* Content */}
      <div className="relative p-6">

        <div className="mb-6">

          <h3 className="text-2xl font-black tracking-tight text-white">
            Upload a document
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
            Store important files inside your private knowledge vault and
            make them available to your Second Brain.
          </p>

        </div>

        {/* Upload Zone */}
        <label
          className="
            group relative flex cursor-pointer flex-col items-center
            justify-center overflow-hidden rounded-[28px]
            border border-dashed border-white/15
            bg-white/[0.035]
            px-6 py-12 text-center
            transition-all duration-300
            hover:border-indigo-400/50
            hover:bg-indigo-500/[0.06]
          "
        >

          {/* Hover glow */}
          <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/15 blur-[70px]" />
          </div>

          {/* Upload Icon */}
          <div
            className="
              relative flex h-20 w-20 items-center justify-center
              rounded-[24px]
              border border-white/10
              bg-gradient-to-br from-white/10 to-white/[0.02]
              text-indigo-300
              shadow-[0_15px_40px_rgba(0,0,0,0.25)]
              transition-all duration-300
              group-hover:-translate-y-1
              group-hover:scale-105
            "
          >
            <Upload size={30} strokeWidth={1.6} />
          </div>

          <p className="relative mt-6 text-base font-bold text-white">
            Drop your file here
          </p>

          <p className="relative mt-2 text-sm text-slate-400">
            or{" "}
            <span className="font-semibold text-indigo-300">
              browse from your computer
            </span>
          </p>

          {/* File types */}
          <div className="relative mt-6 flex flex-wrap justify-center gap-2">

            {["PDF", "JPG", "PNG", "DOCX", "TXT"].map((type) => (
              <span
                key={type}
                className="
                  rounded-full
                  border border-white/10
                  bg-white/[0.04]
                  px-3 py-1.5
                  text-[10px]
                  font-semibold
                  tracking-[0.12em]
                  text-slate-400
                "
              >
                {type}
              </span>
            ))}

          </div>

          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
          />

        </label>

        {/* Privacy message */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">

          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <ShieldCheck size={16} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-200">
              Private knowledge vault
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your uploaded information stays connected to your personal
              Second Brain and can be referenced in future queries.
            </p>
          </div>

        </div>

      </div>

    </div>
  </div>
)}
    </div>
  );
}

function KnowledgeCard({ item, horizontal = false, onDelete }) {
  return (
    <div
      className={`group rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        horizontal ? "flex items-start gap-4" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {item.type === "Document" ? <FileText size={20} /> : <StickyNote size={20} />}
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {item.type}
          </span>

          <button
            type="button"
            onClick={() => onDelete(item)}
            title="Delete saved item"
            aria-label={`Delete ${item.title}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className={horizontal ? "flex-1" : ""}>
        <h3 className="font-bold text-slate-900">{item.title}</h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {item.content}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Tag size={13} />
            {item.tag}
          </span>

          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock3 size={13} />
            {item.date}
          </span>
        </div>
      </div>
    </div>
  );
}
function UploadSection({ onUpload }) {
  return (
    <div
      className="
        relative overflow-hidden
        rounded-[34px]
        border border-white/70
        bg-white/60
        shadow-[0_25px_80px_rgba(30,41,59,0.08)]
        backdrop-blur-2xl
      "
    >
      {/* ========================================
          AMBIENT BACKGROUND
      ======================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Indigo glow */}
        <div
          className="
            absolute -left-32 -top-32
            h-[420px] w-[420px]
            rounded-full
            bg-indigo-300/25
            blur-[120px]
          "
        />

        {/* Cyan glow */}
        <div
          className="
            absolute -right-32 top-10
            h-[400px] w-[400px]
            rounded-full
            bg-cyan-300/20
            blur-[120px]
          "
        />

        {/* Violet bottom glow */}
        <div
          className="
            absolute bottom-[-220px]
            left-1/2
            h-[450px] w-[450px]
            -translate-x-1/2
            rounded-full
            bg-violet-300/15
            blur-[130px]
          "
        />

        {/* Decorative circles */}
        <div
          className="
            absolute left-[8%] top-[20%]
            h-20 w-20
            rounded-full
            border border-indigo-200/30
          "
        />

        <div
          className="
            absolute right-[8%] bottom-[18%]
            h-28 w-28
            rounded-full
            border border-cyan-200/30
          "
        />

      </div>


      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <div className="relative z-10 px-5 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">

        <div className="mx-auto max-w-3xl text-center">

          {/* Brain badge */}
          <div className="mb-7 flex justify-center">

            <div className="relative">

              {/* Outer glow */}
              <div
                className="
                  absolute inset-0
                  rounded-[28px]
                  bg-indigo-400/20
                  blur-2xl
                "
              />

              {/* Icon container */}
              <div
                className="
                  relative flex h-20 w-20
                  items-center justify-center
                  rounded-[26px]
                  border border-white/20
                  bg-gradient-to-br
                  from-slate-950
                  via-slate-800
                  to-indigo-950
                  text-white
                  shadow-[0_20px_50px_rgba(15,23,42,0.25)]
                "
              >
                <Upload
                  size={30}
                  strokeWidth={1.6}
                />

                {/* Tiny sparkle */}
                <div
                  className="
                    absolute -right-1 -top-1
                    flex h-6 w-6
                    items-center justify-center
                    rounded-full
                    border border-white/20
                    bg-indigo-500
                    shadow-lg
                  "
                >
                  <Sparkles size={12} />
                </div>
              </div>

            </div>
          </div>


          {/* Eyebrow */}
          <div
            className="
              mb-3
              text-[10px]
              font-bold
              uppercase
              tracking-[0.35em]
              text-indigo-500
            "
          >
            PRIVATE KNOWLEDGE VAULT
          </div>


          {/* Heading */}
          <h2
            className="
              text-3xl
              font-black
              tracking-tight
              text-slate-950
              sm:text-4xl
              lg:text-[42px]
            "
          >
            Upload to your{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 bg-clip-text text-transparent">
              Second Brain
            </span>
          </h2>


          {/* Description */}
          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-7
              text-slate-500
              sm:text-base
            "
          >
            Add invoices, insurance policies, warranties, receipts and
            important personal documents. Your knowledge stays organized
            inside your private digital vault.
          </p>


          {/* ========================================
              UPLOAD DROP ZONE
          ======================================== */}

          <div
            className="
              group
              relative
              mx-auto
              mt-10
              max-w-2xl
              overflow-hidden
              rounded-[30px]
              border
              border-dashed
              border-indigo-200/80
              bg-white/55
              p-2
              shadow-[0_15px_50px_rgba(79,70,229,0.06)]
              backdrop-blur-xl
              transition-all
              duration-500
              hover:border-indigo-400/70
              hover:bg-white/75
              hover:shadow-[0_25px_70px_rgba(79,70,229,0.12)]
            "
          >

            {/* Inner upload area */}
            <div
              className="
                relative
                rounded-[24px]
                border
                border-white/80
                bg-gradient-to-br
                from-white/80
                via-white/50
                to-indigo-50/40
                px-6
                py-10
                sm:px-10
                sm:py-12
              "
            >

              {/* Hover glow */}
              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  h-48
                  w-48
                  -translate-x-1/2
                  -translate-y-1/2
                  rounded-full
                  bg-indigo-400/10
                  blur-[70px]
                  opacity-0
                  transition
                  duration-500
                  group-hover:opacity-100
                "
              />


              {/* Upload icon */}
              <div
                className="
                  relative
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-indigo-100
                  bg-gradient-to-br
                  from-indigo-50
                  to-violet-50
                  text-indigo-600
                  shadow-sm
                  transition-all
                  duration-500
                  group-hover:-translate-y-1
                  group-hover:scale-105
                "
              >
                <Upload
                  size={25}
                  strokeWidth={1.7}
                />
              </div>


              {/* Drop text */}
              <p
                className="
                  relative
                  mt-5
                  text-base
                  font-bold
                  text-slate-800
                "
              >
                Drop your document here
              </p>

              <p
                className="
                  relative
                  mt-1.5
                  text-sm
                  text-slate-400
                "
              >
                or select a file from your computer
              </p>


              {/* Select button */}
              <button
                onClick={onUpload}
                className="
                  relative
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  rounded-2xl
                  bg-gradient-to-r
                  from-slate-950
                  via-slate-900
                  to-indigo-950
                  px-7
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-[0_12px_30px_rgba(15,23,42,0.22)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_18px_40px_rgba(79,70,229,0.22)]
                "
              >
                <Upload size={17} />
                Select Document
              </button>


              {/* File types */}
              <div className="relative mt-7 flex flex-wrap justify-center gap-2">

                {[
                  "PDF",
                  "JPG",
                  "PNG",
                  "DOCX",
                  "TXT",
                ].map((type) => (
                  <span
                    key={type}
                    className="
                      rounded-full
                      border
                      border-slate-200/80
                      bg-white/70
                      px-3
                      py-1.5
                      text-[10px]
                      font-bold
                      tracking-[0.12em]
                      text-slate-400
                      shadow-sm
                    "
                  >
                    {type}
                  </span>
                ))}

              </div>

            </div>
          </div>


          {/* ========================================
              BOTTOM FEATURES
          ======================================== */}

          <div
            className="
              mt-8
              grid
              gap-3
              sm:grid-cols-3
            "
          >

            {/* Secure */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-white/70
                bg-white/45
                px-4
                py-3
                backdrop-blur-xl
              "
            >
              <ShieldCheck
                size={16}
                className="text-emerald-500"
              />

              <span className="text-xs font-semibold text-slate-500">
                Private & Secure
              </span>
            </div>


            {/* Organized */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-white/70
                bg-white/45
                px-4
                py-3
                backdrop-blur-xl
              "
            >
              <Brain
                size={16}
                className="text-indigo-500"
              />

              <span className="text-xs font-semibold text-slate-500">
                AI Ready
              </span>
            </div>


            {/* Instant */}
            <div
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-white/70
                bg-white/45
                px-4
                py-3
                backdrop-blur-xl
              "
            >
              <Sparkles
                size={16}
                className="text-violet-500"
              />

              <span className="text-xs font-semibold text-slate-500">
                Instant Access
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

function NotesSection({ knowledge, onAdd, onDelete }) {
  return (
    <div className="space-y-6">

      {/* =========================
          NOTES HEADER
      ========================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <StickyNote size={16} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-500">
              Personal Memory
            </span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Notes
          </h2>

          <p className="mt-1.5 text-sm text-slate-500">
            Personal thoughts, ideas and important information.
          </p>
        </div>

        <button
          onClick={onAdd}
          className="
            group
            flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-gradient-to-r
            from-slate-950
            via-slate-900
            to-indigo-950
            px-5
            py-3
            text-sm
            font-bold
            text-white
            shadow-[0_12px_30px_rgba(15,23,42,0.18)]
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-[0_18px_40px_rgba(79,70,229,0.20)]
          "
        >
          <Plus
            size={17}
            className="transition-transform duration-300 group-hover:rotate-90"
          />

          New Note
        </button>

      </div>


      {/* =========================
          NOTES CONTENT
      ========================= */}

      {knowledge.length === 0 ? (

        <div
          className="
            relative
            overflow-hidden
            rounded-[32px]
            border
            border-white/80
            bg-white/65
            shadow-[0_20px_70px_rgba(30,41,59,0.07)]
            backdrop-blur-2xl
          "
        >

          {/* Ambient glows */}

          <div
            className="
              pointer-events-none
              absolute
              -left-32
              -top-32
              h-80
              w-80
              rounded-full
              bg-indigo-300/20
              blur-[110px]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-32
              bottom-[-100px]
              h-80
              w-80
              rounded-full
              bg-cyan-300/15
              blur-[110px]
            "
          />


          {/* Empty state */}

          <div className="relative flex min-h-[390px] flex-col items-center justify-center px-6 py-16 text-center">

            {/* Decorative rings */}

            <div className="absolute left-[12%] top-[18%] hidden h-16 w-16 rounded-full border border-indigo-200/40 sm:block" />

            <div className="absolute right-[12%] bottom-[18%] hidden h-24 w-24 rounded-full border border-cyan-200/40 sm:block" />


            {/* Note icon */}

            <div className="relative">

              {/* glow */}

              <div
                className="
                  absolute
                  inset-0
                  rounded-[28px]
                  bg-indigo-400/20
                  blur-2xl
                "
              />

              {/* icon box */}

              <div
                className="
                  relative
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-[26px]
                  border
                  border-indigo-100
                  bg-gradient-to-br
                  from-indigo-50
                  via-white
                  to-violet-50
                  text-indigo-500
                  shadow-[0_15px_40px_rgba(79,70,229,0.10)]
                "
              >
                <NotebookPen
                  size={32}
                  strokeWidth={1.5}
                />

                {/* sparkle */}

                <div
                  className="
                    absolute
                    -right-2
                    -top-2
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white
                    bg-gradient-to-br
                    from-indigo-500
                    to-violet-500
                    text-white
                    shadow-lg
                  "
                >
                  <Sparkles size={12} />
                </div>

              </div>

            </div>


            {/* Text */}

            <div className="relative mt-7">

              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-indigo-500">
                Your private space
              </p>

              <h3 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">
                Nothing here yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Capture thoughts, reminders, ideas and anything you want
                your Second Brain to remember.
              </p>

            </div>


            {/* Create button */}

            <button
              onClick={onAdd}
              className="
                group
                relative
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-2xl
                border
                border-indigo-100
                bg-white/80
                px-5
                py-3
                text-sm
                font-bold
                text-slate-700
                shadow-sm
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-indigo-200
                hover:bg-white
                hover:text-indigo-700
                hover:shadow-[0_15px_35px_rgba(79,70,229,0.12)]
              "
            >
              <Plus
                size={16}
                className="transition-transform duration-300 group-hover:rotate-90"
              />

              Create your first note

            </button>


            {/* Bottom hint */}

            <div className="relative mt-8 flex items-center gap-2 text-[11px] text-slate-400">
              <Sparkles size={13} className="text-indigo-400" />
              Your notes become part of your personal knowledge vault.
            </div>

          </div>

        </div>

      ) : (

        /* =========================
           NOTES GRID
        ========================= */

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {knowledge.map((item) => (
            <KnowledgeCard
              key={item.id}
              item={item}
              onDelete={onDelete}
            />
          ))}

        </div>

      )}

    </div>
  );
}

function LegacyAskMyLife({ question, setQuestion, messages, askQuestion }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-900 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Sparkles size={21} />
            </div>

            <div>
              <h2 className="font-bold">Ask My Life</h2>
              <p className="text-xs text-slate-300">Personal AI assistant</p>
            </div>
          </div>
        </div>

        <div className="min-h-[350px] space-y-4 p-5">
          {messages.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <Brain size={42} className="text-slate-300" />

              <h3 className="mt-4 font-bold text-slate-800">Ask anything about your life</h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Your AI assistant will eventually search your documents, expenses, assets, warranties and memories.
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") askQuestion();
              }}
              placeholder="Ask something..."
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            <button
              onClick={() => askQuestion()}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-bold text-slate-900">Try asking</h3>

        <div className="mt-4 space-y-2">
          {quickQuestions.map((item) => (
            <button
              key={item}
              onClick={() => askQuestion(item)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span>{item}</span>
              <ChevronRight size={15} />
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white">
          <div className="mb-2 flex items-center gap-2">
            <CalendarClock size={16} className="text-sky-300" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Monthly insights
            </span>
          </div>
          <p className="text-2xl font-black">₹18,640</p>
          <p className="mt-2 text-sm text-slate-200">Household spend is stable and slightly lower than trend.</p>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <NotebookPen className="mx-auto text-slate-300" size={34} />
      <p className="mt-3 text-sm text-slate-500">{text}</p>
    </div>
  );
}
