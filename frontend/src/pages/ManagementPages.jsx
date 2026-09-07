import {
  FileText,
  ShieldCheck,
  Wrench,
  WalletCards,
  Bell,
  Users,
  CalendarDays,
  BarChart3,
  Settings,
  UsersRound,
  Plus,
  Search,
  CheckCircle2,
  Clock3,
  MoreVertical,
  Eye,
  Download,
  Edit3,
  Trash2,
} from "lucide-react";

import { useState } from "react";

const pageData = {
  documents: {
    title: "Documents",
    subtitle:
      "Keep invoices, receipts, warranty cards and important home documents organized.",
    icon: FileText,
    items: [
      {
        name: "Samsung TV Invoice",
        type: "Invoice",
        date: "12 Aug 2026",
        size: "2.4 MB",
      },
      {
        name: "LG AC Warranty Card",
        type: "Warranty",
        date: "10 Aug 2026",
        size: "1.8 MB",
      },
      {
        name: "Honda City Insurance",
        type: "Insurance",
        date: "24 Aug 2026",
        size: "3.1 MB",
      },
      {
        name: "House Registration",
        type: "Property",
        date: "02 Jan 2026",
        size: "4.5 MB",
      },
    ],
  },

  warranties: {
    title: "Warranties",
    subtitle:
      "Track your active warranties and never miss an expiry date.",
    icon: ShieldCheck,
    items: [
      {
        name: "Samsung Smart TV",
        type: "Electronics",
        date: "18 Mar 2027",
        status: "Active",
      },
      {
        name: "LG Split AC",
        type: "Appliances",
        date: "10 Jun 2026",
        status: "Expiring",
      },
      {
        name: "Dell Laptop",
        type: "Electronics",
        date: "05 Sep 2027",
        status: "Active",
      },
      {
        name: "Washing Machine",
        type: "Appliances",
        date: "12 Jul 2026",
        status: "Active",
      },
    ],
  },

  maintenance: {
    title: "Maintenance",
    subtitle:
      "Schedule and track all your home maintenance activities.",
    icon: Wrench,
    items: [
      {
        name: "LG Split AC Service",
        type: "AC Maintenance",
        date: "Tomorrow",
        status: "Upcoming",
      },
      {
        name: "Honda City Service",
        type: "Vehicle",
        date: "18 Aug",
        status: "Scheduled",
      },
      {
        name: "Plumbing Inspection",
        type: "Home Repair",
        date: "21 Aug",
        status: "Upcoming",
      },
      {
        name: "Washing Machine Service",
        type: "Appliance",
        date: "29 Aug",
        status: "Scheduled",
      },
    ],
  },

  expenses: {
    title: "Expenses",
    subtitle:
      "Monitor household spending and understand where your money goes.",
    icon: WalletCards,
    items: [
      {
        name: "AC Service",
        type: "Maintenance",
        date: "11 Aug 2026",
        amount: "₹600",
      },
      {
        name: "Bike Service",
        type: "Vehicle",
        date: "09 Aug 2026",
        amount: "₹1,200",
      },
      {
        name: "Electricity Bill",
        type: "Utilities",
        date: "05 Aug 2026",
        amount: "₹2,340",
      },
      {
        name: "Internet Bill",
        type: "Utilities",
        date: "03 Aug 2026",
        amount: "₹999",
      },
    ],
  },

  reminders: {
    title: "Reminders",
    subtitle:
      "Stay ahead of important maintenance, bills and renewals.",
    icon: Bell,
    items: [
      {
        name: "AC Service",
        type: "Maintenance",
        date: "Tomorrow",
        status: "High Priority",
      },
      {
        name: "TV Warranty",
        type: "Warranty",
        date: "12 Aug",
        status: "Important",
      },
      {
        name: "Bike Insurance",
        type: "Insurance",
        date: "24 Aug",
        status: "Upcoming",
      },
      {
        name: "Electricity Bill",
        type: "Utilities",
        date: "28 Aug",
        status: "Upcoming",
      },
    ],
  },

  family: {
    title: "Family",
    subtitle:
      "Manage your household members and their access.",
    icon: Users,
    items: [
      {
        name: "Rahul",
        type: "Home Owner",
        date: "Full Access",
        status: "Active",
      },
      {
        name: "Priya",
        type: "Family Member",
        date: "Full Access",
        status: "Active",
      },
      {
        name: "Aarav",
        type: "Family Member",
        date: "Limited Access",
        status: "Active",
      },
      {
        name: "Anaya",
        type: "Family Member",
        date: "Limited Access",
        status: "Pending",
      },
    ],
  },

  "service-providers": {
    title: "Service Providers",
    subtitle:
      "Keep your trusted electricians, plumbers and technicians in one place.",
    icon: UsersRound,
    items: [
      {
        name: "Cool Care Services",
        type: "AC Service",
        date: "98765 43210",
        status: "Trusted",
      },
      {
        name: "Raj Electricals",
        type: "Electrician",
        date: "98765 12345",
        status: "Trusted",
      },
      {
        name: "AquaFix Plumbing",
        type: "Plumber",
        date: "91234 56789",
        status: "Trusted",
      },
      {
        name: "Honda Service Center",
        type: "Vehicle",
        date: "1800 123 456",
        status: "Official",
      },
    ],
  },

  calendar: {
    title: "Calendar",
    subtitle:
      "See all upcoming home activities in one place.",
    icon: CalendarDays,
    items: [
      {
        name: "AC Service",
        type: "Maintenance",
        date: "12 Aug 2026",
        status: "Upcoming",
      },
      {
        name: "TV Warranty Check",
        type: "Warranty",
        date: "15 Aug 2026",
        status: "Upcoming",
      },
      {
        name: "Honda Service",
        type: "Vehicle",
        date: "18 Aug 2026",
        status: "Scheduled",
      },
      {
        name: "Insurance Renewal",
        type: "Insurance",
        date: "24 Aug 2026",
        status: "Important",
      },
    ],
  },

  analytics: {
    title: "Analytics",
    subtitle:
      "Understand your home's expenses, assets and maintenance.",
    icon: BarChart3,
    items: [
      {
        name: "Monthly Expenses",
        type: "August",
        date: "₹24,590",
        status: "+8%",
      },
      {
        name: "Total Asset Value",
        type: "Current",
        date: "₹22.4L",
        status: "Healthy",
      },
      {
        name: "Maintenance",
        type: "This Month",
        date: "₹4,850",
        status: "Normal",
      },
      {
        name: "Warranty Coverage",
        type: "Active",
        date: "83%",
        status: "Good",
      },
    ],
  },

  settings: {
    title: "Settings",
    subtitle:
      "Customize your MyHome OS experience.",
    icon: Settings,
    items: [
      {
        name: "Profile",
        type: "Account",
        date: "Rahul",
        status: "Configured",
      },
      {
        name: "Notifications",
        type: "Alerts",
        date: "All Alerts",
        status: "Enabled",
      },
      {
        name: "Family Permissions",
        type: "Access",
        date: "4 Members",
        status: "Managed",
      },
      {
        name: "Appearance",
        type: "Theme",
        date: "Light",
        status: "Active",
      },
    ],
  },
};

function ManagementPage({ type }) {
  const page = pageData[type];

  const Icon = page.icon;

  const [search, setSearch] = useState("");

  const filtered = page.items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

        <div>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <Icon size={16} />
            MyHome OS
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {page.title}
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            {page.subtitle}
          </p>

        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700">
          <Plus size={15} />
          Add New
        </button>

      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <Summary
          icon={Icon}
          title="Total"
          value={page.items.length}
        />

        <Summary
          icon={CheckCircle2}
          title="Active"
          value="8"
        />

        <Summary
          icon={Clock3}
          title="Upcoming"
          value="3"
        />

        <Summary
          icon={BarChart3}
          title="This Month"
          value="12"
        />

      </div>

      {/* SEARCH */}

      <div className="flex rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">

        <Search
          size={17}
          className="my-auto text-slate-400"
        />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${page.title.toLowerCase()}...`}
          className="h-12 flex-1 bg-transparent px-3 text-xs outline-none"
        />

      </div>

      {/* CARDS */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {filtered.map((item, index) => (

          <div
            key={index}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={19} />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-800">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {item.type}
                  </p>

                </div>

              </div>

              <button className="text-slate-300 hover:text-slate-600">
                <MoreVertical size={17} />
              </button>

            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-slate-50 p-3">

                <p className="text-[9px] text-slate-400">
                  Date / Details
                </p>

                <p className="mt-1 text-xs font-bold text-slate-700">
                  {item.date}
                </p>

              </div>

              <div className="rounded-xl bg-emerald-50 p-3">

                <p className="text-[9px] text-emerald-500">
                  Status
                </p>

                <p className="mt-1 text-xs font-bold text-emerald-700">
                  {item.status || "Active"}
                </p>

              </div>

            </div>

            <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">

              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-50 py-2 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600">
                <Eye size={13} />
                View
              </button>

              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-50 py-2 text-[10px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600">
                <Edit3 size={13} />
                Edit
              </button>

              {type === "documents" && (
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Download size={13} />
                </button>
              )}

              {type !== "documents" && (
                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                  <Trash2 size={13} />
                </button>
              )}

            </div>

          </div>

        ))}

      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

          <Icon
            size={32}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-3 text-sm font-bold">
            Nothing found
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Try a different search.
          </p>

        </div>
      )}

    </div>
  );
}

function Summary({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <Icon size={17} />
      </div>

      <p className="mt-3 text-[10px] text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-xl font-extrabold text-slate-900">
        {value}
      </p>

    </div>
  );
}

export default ManagementPage;