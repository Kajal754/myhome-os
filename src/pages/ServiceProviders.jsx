import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Phone,
  Star,
  Wrench,
  Zap,
  Droplets,
  Car,
  Eye,
  Pencil,
  Trash2,
  X,
  Users,
  ShieldCheck,
  Clock3,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

const initialProviders = [
  {
    id: 1,
    name: "Rahul AC Services",
    category: "AC Technician",
    phone: "+91 98765 43210",
    rating: 4.8,
    icon: Wrench,
    lastVisit: "02 Aug 2026",
    visits: 8,
    location: "Delhi",
    status: "Trusted",
  },
  {
    id: 2,
    name: "Amit Electrician",
    category: "Electrician",
    phone: "+91 98765 12345",
    rating: 4.6,
    icon: Zap,
    lastVisit: "18 Jul 2026",
    visits: 5,
    location: "Delhi",
    status: "Trusted",
  },
  {
    id: 3,
    name: "Raj Plumbing",
    category: "Plumber",
    phone: "+91 98111 22334",
    rating: 4.7,
    icon: Droplets,
    lastVisit: "08 Aug 2026",
    visits: 6,
    location: "Noida",
    status: "Trusted",
  },
  {
    id: 4,
    name: "Mohan Auto Works",
    category: "Mechanic",
    phone: "+91 98989 55667",
    rating: 4.9,
    icon: Car,
    lastVisit: "01 Aug 2026",
    visits: 11,
    location: "Gurugram",
    status: "Preferred",
  },
];

const categories = [
  "All",
  "AC Technician",
  "Electrician",
  "Plumber",
  "Mechanic",
];

const iconMap = {
  "AC Technician": Wrench,
  Electrician: Zap,
  Plumber: Droplets,
  Mechanic: Car,
};

function ServiceProviders() {
  const [providers, setProviders] = useState(initialProviders);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showAdd, setShowAdd] = useState(false);
  const [viewProvider, setViewProvider] = useState(null);
  const [editProvider, setEditProvider] = useState(null);
  const [deleteProvider, setDeleteProvider] = useState(null);

  const filteredProviders = useMemo(() => {
    const query = search.toLowerCase().trim();

    return providers.filter((provider) => {
      const matchesSearch =
        !query ||
        provider.name.toLowerCase().includes(query) ||
        provider.category.toLowerCase().includes(query) ||
        provider.phone.toLowerCase().includes(query) ||
        provider.location.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || provider.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [providers, search, category]);

  const averageRating =
    providers.length > 0
      ? (
          providers.reduce(
            (total, provider) => total + provider.rating,
            0
          ) / providers.length
        ).toFixed(1)
      : "0.0";

  const totalVisits = providers.reduce(
    (total, provider) => total + provider.visits,
    0
  );

  const handleAdd = (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const providerCategory = form.get("category");

    const newProvider = {
      id: Date.now(),
      name: form.get("name"),
      category: providerCategory,
      phone: form.get("phone"),
      rating: Number(form.get("rating")) || 0,
      icon: iconMap[providerCategory] || Wrench,
      lastVisit: form.get("lastVisit") || "No visit yet",
      visits: 0,
      location: form.get("location") || "Not specified",
      status: "New",
    };

    setProviders((current) => [newProvider, ...current]);
    setShowAdd(false);
  };

  const handleEdit = (event) => {
    event.preventDefault();

    setProviders((current) =>
      current.map((provider) =>
        provider.id === editProvider.id
          ? {
              ...editProvider,
              rating: Number(editProvider.rating),
              icon:
                iconMap[editProvider.category] ||
                Wrench,
            }
          : provider
      )
    );

    setEditProvider(null);
  };

  const handleDelete = () => {
    if (!deleteProvider) return;

    setProviders((current) =>
      current.filter(
        (provider) => provider.id !== deleteProvider.id
      )
    );

    setDeleteProvider(null);
  };

  return (
    <div className="space-y-7">

      {/* HERO */}

      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="grid lg:grid-cols-[1.2fr_.8fr]">

          <div className="relative overflow-hidden p-7 sm:p-10">

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/10" />

            <div className="absolute -bottom-32 left-20 h-72 w-72 rounded-full bg-blue-500/10" />

            <div className="relative">

              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
                <Users size={13} />
                SERVICE DIRECTORY
              </div>

              <h1 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                Your trusted
                <br />
                service network.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Keep electricians, plumbers, mechanics and
                technicians organized so you can reach them
                whenever you need help.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <button
                  onClick={() => setShowAdd(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950"
                >
                  <Plus size={16} />
                  Add provider
                </button>

                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  <ShieldCheck size={15} />
                  {providers.length} providers
                </div>

              </div>

            </div>
          </div>

          {/* HERO RIGHT */}

          <div className="relative min-h-[300px] overflow-hidden bg-slate-950 p-7">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,.35),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(59,130,246,.30),transparent_38%)]" />

            <div className="relative flex h-full flex-col justify-between">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
                    Provider Network
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Your saved service contacts
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-3 text-violet-200">
                  <Users size={20} />
                </div>

              </div>

              <div className="flex items-center gap-4 py-8">

                <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/10 text-amber-300">
                  <Star
                    size={35}
                    fill="currentColor"
                  />
                </div>

                <div>

                  <p className="text-4xl font-black text-white">
                    {averageRating}
                  </p>

                  <div className="mt-1 flex gap-1 text-amber-300">
                    {Array.from({ length: 5 }).map(
                      (_, index) => (
                        <Star
                          key={index}
                          size={12}
                          fill={
                            index <
                            Math.round(
                              Number(averageRating)
                            )
                              ? "currentColor"
                              : "none"
                          }
                        />
                      )
                    )}
                  </div>

                  <p className="mt-2 text-[10px] text-slate-400">
                    Average provider rating
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    Total visits
                  </p>

                  <p className="mt-1 text-xl font-black text-white">
                    {totalVisits}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500">
                    Preferred
                  </p>

                  <p className="mt-1 text-xl font-black text-emerald-300">
                    {
                      providers.filter(
                        (provider) =>
                          provider.status ===
                          "Preferred"
                      ).length
                    }
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<Users size={20} />}
          label="Providers"
          value={providers.length}
          text="Saved contacts"
          iconClass="bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
        />

        <StatCard
          icon={<Star size={20} fill="currentColor" />}
          label="Average rating"
          value={averageRating}
          text="Provider quality"
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
        />

        <StatCard
          icon={<Phone size={20} />}
          label="Quick contacts"
          value="24/7"
          text="Always available"
          iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
        />

        <StatCard
          icon={<Clock3 size={20} />}
          label="Service visits"
          value={totalVisits}
          text="Recorded history"
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
        />

      </div>

      {/* SEARCH */}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">

        <div className="flex flex-col gap-3 lg:flex-row">

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search provider, service, phone or location..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />

          </div>

          <div className="flex gap-2 overflow-x-auto">

            {categories.map((item) => (

              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-xs font-bold transition ${
                  category === item
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {item}
              </button>

            ))}

          </div>

        </div>

      </section>

      {/* PROVIDER LIST */}

      <section>

        <div className="mb-5">

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">
            Your contacts
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
            Trusted service providers
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {filteredProviders.length} provider
            {filteredProviders.length !== 1 ? "s" : ""}
          </p>

        </div>

        {filteredProviders.length === 0 ? (

          <div className="rounded-[26px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">

            <Users
              size={40}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <h3 className="mt-4 font-bold text-slate-700 dark:text-slate-200">
              No providers found
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Try another search or category.
            </p>

          </div>

        ) : (

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

            {filteredProviders.map((provider) => {

              const Icon = provider.icon;

              return (
                <article
                  key={provider.id}
                  className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                >

                  <div className="h-1.5 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400" />

                  <div className="p-5">

                    <div className="flex items-start justify-between">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                        <Icon size={25} />
                      </div>

                      <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
                        <Star
                          size={12}
                          fill="currentColor"
                        />
                        {provider.rating}
                      </div>

                    </div>

                    <div className="mt-5">

                      <div className="flex items-center gap-2">

                        <h2 className="truncate text-lg font-black text-slate-900 dark:text-white">
                          {provider.name}
                        </h2>

                        {provider.status ===
                          "Preferred" && (
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[8px] font-bold text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                            PREFERRED
                          </span>
                        )}

                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {provider.category}
                      </p>

                    </div>

                    <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">

                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <Phone
                          size={14}
                          className="text-violet-500"
                        />
                        {provider.phone}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <MapPin
                          size={14}
                          className="text-blue-500"
                        />
                        {provider.location}
                      </div>

                      <div className="flex items-center justify-between">

                        <span className="text-[10px] text-slate-400">
                          Last visit
                        </span>

                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                          {provider.lastVisit}
                        </span>

                      </div>

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">

                      <a
                        href={`tel:${provider.phone.replace(
                          /\s/g,
                          ""
                        )}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white hover:bg-violet-700"
                      >
                        <Phone size={14} />
                        Call
                      </a>

                      <button
                        onClick={() =>
                          setViewProvider(provider)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <Eye size={14} />
                        View
                      </button>

                    </div>

                  </div>

                  <div className="flex justify-end gap-1 border-t border-slate-100 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-950">

                    <button
                      onClick={() =>
                        setEditProvider({
                          ...provider,
                        })
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-amber-600 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      onClick={() =>
                        setDeleteProvider(provider)
                      }
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

      {/* ADD MODAL */}

      {showAdd && (
        <Modal onClose={() => setShowAdd(false)}>

          <form onSubmit={handleAdd}>

            <ModalHeader
              title="Add service provider"
              subtitle="Save a trusted service contact"
              onClose={() => setShowAdd(false)}
            />

            <div className="space-y-4 p-6">

              <Input
                label="Provider name"
                name="name"
                placeholder="Rahul AC Services"
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Category
                  </label>

                  <select
                    name="category"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {categories
                      .filter((item) => item !== "All")
                      .map((item) => (
                        <option key={item}>
                          {item}
                        </option>
                      ))}
                  </select>
                </div>

                <Input
                  label="Phone"
                  name="phone"
                  placeholder="+91 98765 43210"
                  required
                />

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <Input
                  label="Rating"
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="4.8"
                />

                <Input
                  label="Location"
                  name="location"
                  placeholder="Delhi"
                />

              </div>

              <Input
                label="Last visit"
                name="lastVisit"
                placeholder="02 Aug 2026"
              />

            </div>

            <ModalFooter
              cancel={() => setShowAdd(false)}
              submit="Add provider"
            />

          </form>

        </Modal>
      )}

      {/* VIEW MODAL */}

      {viewProvider && (
        <Modal onClose={() => setViewProvider(null)}>

          <ModalHeader
            title={viewProvider.name}
            subtitle="Provider details"
            onClose={() => setViewProvider(null)}
          />

          <div className="grid gap-3 p-6 sm:grid-cols-2">

            <Detail
              label="Category"
              value={viewProvider.category}
            />

            <Detail
              label="Phone"
              value={viewProvider.phone}
            />

            <Detail
              label="Rating"
              value={`${viewProvider.rating} / 5`}
            />

            <Detail
              label="Location"
              value={viewProvider.location}
            />

            <Detail
              label="Last visit"
              value={viewProvider.lastVisit}
            />

            <Detail
              label="Total visits"
              value={viewProvider.visits}
            />

            <Detail
              label="Status"
              value={viewProvider.status}
            />

          </div>

          <div className="border-t border-slate-100 p-5 dark:border-slate-800">

            <a
              href={`tel:${viewProvider.phone.replace(
                /\s/g,
                ""
              )}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-xs font-bold text-white hover:bg-violet-700"
            >
              <Phone size={15} />
              Call provider
              <ArrowUpRight size={14} />
            </a>

          </div>

        </Modal>
      )}

      {/* EDIT MODAL */}

      {editProvider && (
        <Modal onClose={() => setEditProvider(null)}>

          <form onSubmit={handleEdit}>

            <ModalHeader
              title="Edit provider"
              subtitle="Update provider information"
              onClose={() => setEditProvider(null)}
            />

            <div className="space-y-4 p-6">

              <Input
                label="Provider name"
                value={editProvider.name}
                onChange={(event) =>
                  setEditProvider({
                    ...editProvider,
                    name: event.target.value,
                  })
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
                    Category
                  </label>

                  <select
                    value={editProvider.category}
                    onChange={(event) =>
                      setEditProvider({
                        ...editProvider,
                        category: event.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {categories
                      .filter((item) => item !== "All")
                      .map((item) => (
                        <option key={item}>
                          {item}
                        </option>
                      ))}
                  </select>
                </div>

                <Input
                  label="Phone"
                  value={editProvider.phone}
                  onChange={(event) =>
                    setEditProvider({
                      ...editProvider,
                      phone: event.target.value,
                    })
                  }
                />

              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <Input
                  label="Rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={editProvider.rating}
                  onChange={(event) =>
                    setEditProvider({
                      ...editProvider,
                      rating: event.target.value,
                    })
                  }
                />

                <Input
                  label="Location"
                  value={editProvider.location}
                  onChange={(event) =>
                    setEditProvider({
                      ...editProvider,
                      location: event.target.value,
                    })
                  }
                />

              </div>

            </div>

            <ModalFooter
              cancel={() => setEditProvider(null)}
              submit="Save changes"
            />

          </form>

        </Modal>
      )}

      {/* DELETE MODAL */}

      {deleteProvider && (
        <Modal
          onClose={() =>
            setDeleteProvider(null)
          }
        >

          <div className="p-7">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/50">
              <Trash2 size={21} />
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
              Delete provider?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Are you sure you want to remove{" "}
              <b className="text-slate-700 dark:text-slate-200">
                {deleteProvider.name}
              </b>{" "}
              from your service directory?
            </p>

            <div className="mt-6 flex justify-end gap-2">

              <button
                onClick={() =>
                  setDeleteProvider(null)
                }
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-600"
              >
                Delete
              </button>

            </div>

          </div>

        </Modal>
      )}

    </div>
  );
}


/* =========================================
   SMALL COMPONENTS
========================================= */

function StatCard({
  icon,
  label,
  value,
  text,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <p className="mt-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {text}
      </p>

    </div>
  );
}


function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white shadow-2xl dark:bg-slate-900">
        {children}
      </div>

    </div>
  );
}


function ModalHeader({
  title,
  subtitle,
  onClose,
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">

      <div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">
          {subtitle}
        </p>

        <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
          {title}
        </h3>

      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <X size={19} />
      </button>

    </div>
  );
}


function ModalFooter({
  cancel,
  submit,
}) {
  return (
    <div className="flex justify-end gap-2 border-t border-slate-100 p-5 dark:border-slate-800">

      <button
        type="button"
        onClick={cancel}
        className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        Cancel
      </button>

      <button
        type="submit"
        className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-700"
      >
        {submit}
      </button>

    </div>
  );
}


function Input({
  label,
  ...props
}) {
  return (
    <label className="block">

      <span className="mb-1.5 block text-xs font-bold text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <input
        {...props}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
      />

    </label>
  );
}


function Detail({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">

      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
        {value}
      </p>

    </div>
  );
}


export default ServiceProviders;