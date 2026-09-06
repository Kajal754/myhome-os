import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Crown,
  MoreHorizontal,
  Link2,
  X,
  Mail,
  Home,
  UserCheck,
} from "lucide-react";

function Family() {
  const storedUser = localStorage.getItem("myhomeUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;
  const [members, setMembers] = useState([]);
  useEffect(() => {
  setMembers([]);
  if (!userId) return;
  const loadMembers = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/family-members?user_id=${userId}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load family members"
        );
      }

      setMembers(data.members);
    } catch (error) {
      console.error("LOAD FAMILY MEMBERS ERROR:", error);
    }
  };

  loadMembers();
}, [userId]);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showDelete, setShowDelete] = useState(null);

  const filteredMembers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return members;

    return members.filter(
      (member) =>
        member.name.toLowerCase().includes(value) ||
        member.email.toLowerCase().includes(value) ||
        member.role.toLowerCase().includes(value) ||
        member.status.toLowerCase().includes(value)
    );
  }, [members, search]);

  const activeMembers = members.filter(
    (member) => member.status === "Active"
  ).length;

  const pendingMembers = members.filter(
    (member) => member.status === "Pending"
  ).length;

  const admins = members.filter(
    (member) => member.role === "Admin"
  ).length;
const deleteMember = async () => {
  if (!showDelete) return;

  try {
    const response = await fetch(
      `http://localhost:5000/api/family-members/${showDelete.id}?user_id=${userId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to delete family member"
      );
    }

    setMembers((current) =>
      current.filter((member) => member.id !== showDelete.id)
    );

    setShowDelete(null);

  } catch (error) {
    console.error("DELETE FAMILY MEMBER ERROR:", error);
    alert("DELETE MEMBER ERROR: " + error.message);
  }
};

  const saveEdit = async (updatedMember) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/family-members/${updatedMember.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...updatedMember,
            user_id: userId,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update family member");
      }

    setMembers((current) =>
      current.map((member) =>
        member.id === updatedMember.id
          ? data.member
          : member
      )
    );

    setEditingMember(null);
    } catch (error) {
      console.error("UPDATE FAMILY MEMBER ERROR:", error);
      alert("UPDATE MEMBER ERROR: " + error.message);
    }
  };

  const addMember = async (newMember) => {
  try {
    const memberData = {
      user_id: userId,
      ...newMember,
      status: "Pending",
      joined: "Invitation sent",
      avatar:
        newMember.avatar ||
        `https://i.pravatar.cc/150?u=${newMember.email}`,
    };

    const response = await fetch("http://localhost:5000/api/family-members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memberData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to add family member");
    }

    setMembers((current) => [
      ...current,
      data.member,
    ]);

    setShowInvite(false);

  } catch (error) {
    console.error("ADD MEMBER ERROR:", error);
    alert("ADD MEMBER ERROR: " + error.message);
  }
};


    
  return (
    <div className="space-y-6 pb-10">

      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">
            <Users size={15} />
            MyHome OS
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Family
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Manage your family members and control who can access
            your home information.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(
                "https://myhome-os.local/invite/ABCD1234"
              );
              alert("Invite link copied!");
            }}
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl border border-slate-200
              bg-white px-4 py-2.5
              text-sm font-semibold text-slate-700
              shadow-sm transition
              hover:bg-slate-50
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-200
              dark:hover:bg-slate-800
            "
          >
            <Link2 size={17} />
            Copy Invite Link
          </button>

          <button
            onClick={() => setShowInvite(true)}
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl bg-indigo-600
              px-5 py-2.5 text-sm font-semibold text-white
              shadow-lg shadow-indigo-600/20
              transition hover:bg-indigo-700
            "
          >
            <UserPlus size={17} />
            Invite Member
          </button>
        </div>
      </div>

      {/* ================= HERO ================= */}

      <div className="
        overflow-hidden rounded-3xl
        border border-slate-200
        bg-white shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      ">
        <div className="grid lg:grid-cols-[1.1fr_.9fr]">

          <div className="
            relative overflow-hidden
            bg-gradient-to-br
            from-indigo-50 via-white to-blue-50
            p-7 sm:p-9
            dark:from-indigo-950/40
            dark:via-slate-900
            dark:to-blue-950/30
          ">
            <div className="
              absolute -right-20 -top-20
              h-56 w-56 rounded-full
              bg-indigo-200/40 blur-3xl
              dark:bg-indigo-500/10
            " />

            <div className="relative">

              <div className="
                flex h-12 w-12 items-center justify-center
                rounded-2xl bg-indigo-600
                text-white shadow-lg shadow-indigo-600/20
              ">
                <Users size={23} />
              </div>

              <h2 className="
                mt-6 max-w-md text-2xl font-bold
                tracking-tight text-slate-900
                dark:text-white
              ">
                Your Family, Your Home
              </h2>

              <p className="
                mt-3 max-w-lg text-sm leading-6
                text-slate-500 dark:text-slate-400
              ">
                Bring your family together and manage your home,
                assets, reminders and important information from
                one place.
              </p>

              <button
                onClick={() => setShowInvite(true)}
                className="
                  mt-6 inline-flex items-center gap-2
                  rounded-xl bg-indigo-600
                  px-5 py-3 text-sm font-semibold text-white
                  shadow-lg shadow-indigo-600/20
                  hover:bg-indigo-700
                "
              >
                <UserPlus size={17} />
                Invite Family Member
              </button>
            </div>
          </div>

          {/* Home Image */}

          <div className="relative min-h-[270px] overflow-hidden">
          
<img
  src="/images/family.jpg"
  alt="My Family"
  className="
    absolute inset-0 h-full w-full
    rounded-[30px]
    border-[6px] border-white/90
    object-cover object-[center_25%]
    shadow-[0_15px_40px_rgba(0,0,0,0.25)]
    transition-all duration-500
    hover:scale-[1.02]
    hover:shadow-[0_20px_50px_rgba(79,70,229,0.30)]
  "
/>
            <div className="
              absolute inset-0
              bg-gradient-to-t from-slate-950/50
              via-transparent to-transparent
            " />

            <div className="
              absolute bottom-5 left-5
              rounded-2xl border border-white/20
              bg-white/90 px-4 py-3
              shadow-xl backdrop-blur
              dark:bg-slate-900/90
            ">
              <div className="flex items-center gap-2">
                <Home size={16} className="text-indigo-600" />

                <span className="
                  text-xs font-bold
                  text-slate-800 dark:text-white
                ">
                  Family Home
                </span>
              </div>

              <p className="
                mt-1 text-[11px]
                text-slate-500 dark:text-slate-400
              ">
                Managed together
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={Users}
          title="Total Members"
          value={members.length}
          text="All family members"
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
        />

        <StatCard
          icon={CheckCircle2}
          title="Active Members"
          value={activeMembers}
          text="Currently active"
          iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
        />

        <StatCard
          icon={Clock3}
          title="Pending Invites"
          value={pendingMembers}
          text="Awaiting response"
          iconClass="bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
        />

        <StatCard
          icon={ShieldCheck}
          title="Admins"
          value={admins}
          text="Manage home access"
          iconClass="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
        />

      </div>

      {/* ================= MEMBERS ================= */}

      <div className="
        overflow-hidden rounded-3xl
        border border-slate-200
        bg-white shadow-sm
        dark:border-slate-800
        dark:bg-slate-900
      ">

        <div className="
          flex flex-col gap-4
          border-b border-slate-100
          p-5 sm:p-6
          lg:flex-row lg:items-center lg:justify-between
          dark:border-slate-800
        ">

          <div>
            <h2 className="
              text-lg font-bold
              text-slate-900 dark:text-white
            ">
              Family Members
            </h2>

            <p className="
              mt-1 text-xs
              text-slate-500 dark:text-slate-400
            ">
              Manage members and their access permissions.
            </p>
          </div>

          <div className="
            flex w-full items-center gap-3
            rounded-xl border border-slate-200
            bg-slate-50 px-4 py-2.5
            lg:max-w-sm
            dark:border-slate-700
            dark:bg-slate-950
          ">
            <Search
              size={17}
              className="shrink-0 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search family members..."
              className="
                w-full bg-transparent
                text-sm text-slate-700
                outline-none
                placeholder:text-slate-400
                dark:text-slate-200
              "
            />
          </div>
        </div>

        {/* Desktop heading */}

        <div className="
          hidden grid-cols-[2fr_1fr_1fr_1fr_auto]
          gap-4 border-b border-slate-100
          bg-slate-50/70 px-6 py-3
          text-[11px] font-bold uppercase
          tracking-wider text-slate-400
          md:grid
          dark:border-slate-800
          dark:bg-slate-950/50
        ">
          <span>Member</span>
          <span>Role</span>
          <span>Status</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>

        {/* Members */}

        <div className="divide-y divide-slate-100 dark:divide-slate-800">

          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="
                grid gap-4 px-5 py-5
                transition hover:bg-slate-50/70
                md:grid-cols-[2fr_1fr_1fr_1fr_auto]
                md:items-center md:px-6
                dark:hover:bg-slate-800/40
              "
            >

              {/* Member */}

              <div className="flex items-center gap-3">

                <img
                  src={member.avatar}
                  alt={member.name}
                  className="
                    h-11 w-11 rounded-full
                    object-cover ring-2
                    ring-white shadow-sm
                    dark:ring-slate-800
                  "
                />

                <div className="min-w-0">
                  <p className="
                    truncate text-sm font-bold
                    text-slate-900 dark:text-white
                  ">
                    {member.name}
                  </p>

                  <p className="
                    truncate text-xs
                    text-slate-400
                  ">
                    {member.email}
                  </p>
                </div>
              </div>

              {/* Role */}

              <div>
                <RoleBadge role={member.role} />
              </div>

              {/* Status */}

              <div>
                <StatusBadge status={member.status} />
              </div>

              {/* Joined */}

              <div className="
                text-xs font-medium
                text-slate-500 dark:text-slate-400
              ">
                {member.joined}
              </div>

              {/* Actions */}

              <div className="flex items-center gap-2">

                <button
                  onClick={() => setSelectedMember(member)}
                  title="View"
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-lg border border-slate-200
                    text-slate-500 transition
                    hover:bg-slate-50 hover:text-indigo-600
                    dark:border-slate-700
                    dark:text-slate-400
                    dark:hover:bg-slate-800
                  "
                >
                  <Eye size={16} />
                </button>

                <button
                  onClick={() => setEditingMember(member)}
                  title="Edit"
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-lg border border-slate-200
                    text-slate-500 transition
                    hover:bg-slate-50 hover:text-indigo-600
                    dark:border-slate-700
                    dark:text-slate-400
                    dark:hover:bg-slate-800
                  "
                >
                  <Pencil size={16} />
                </button>

                <button
                  onClick={() => setShowDelete(member)}
                  title="Delete"
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-lg border border-red-100
                    text-red-500 transition
                    hover:bg-red-50
                    dark:border-red-900/50
                    dark:hover:bg-red-950/40
                  "
                >
                  <Trash2 size={16} />
                </button>

              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Users
                size={36}
                className="mx-auto text-slate-300"
              />

              <p className="
                mt-3 text-sm font-semibold
                text-slate-700 dark:text-slate-200
              ">
                No family members found
              </p>

              <p className="
                mt-1 text-xs
                text-slate-400
              ">
                Try another search.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ================= VIEW MODAL ================= */}

      {selectedMember && (
        <Modal
          title="Member Details"
          onClose={() => setSelectedMember(null)}
        >
          <div className="text-center">

            <img
              src={selectedMember.avatar}
              alt={selectedMember.name}
              className="
                mx-auto h-20 w-20
                rounded-full object-cover
                ring-4 ring-indigo-50
                dark:ring-indigo-950
              "
            />

            <h3 className="
              mt-4 text-xl font-bold
              text-slate-900 dark:text-white
            ">
              {selectedMember.name}
            </h3>

            <p className="text-sm text-slate-400">
              {selectedMember.email}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 text-left">

              <InfoBox
                title="Role"
                value={selectedMember.role}
              />

              <InfoBox
                title="Status"
                value={selectedMember.status}
              />

              <InfoBox
                title="Joined"
                value={selectedMember.joined}
              />

              <InfoBox
                title="Access"
                value={
                  selectedMember.role === "View Only"
                    ? "Limited"
                    : "Home"
                }
              />

            </div>
          </div>
        </Modal>
      )}

      {/* ================= EDIT MODAL ================= */}

      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={saveEdit}
        />
      )}

      {/* ================= INVITE MODAL ================= */}

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvite={addMember}
        />
      )}

      {/* ================= DELETE MODAL ================= */}

      {showDelete && (
        <Modal
          title="Remove Family Member"
          onClose={() => setShowDelete(null)}
        >
          <div className="text-center">

            <div className="
              mx-auto flex h-14 w-14
              items-center justify-center
              rounded-2xl bg-red-50
              text-red-500
              dark:bg-red-950/40
            ">
              <Trash2 size={23} />
            </div>

            <h3 className="
              mt-4 text-lg font-bold
              text-slate-900 dark:text-white
            ">
              Remove {showDelete.name}?
            </h3>

            <p className="
              mt-2 text-sm leading-6
              text-slate-500 dark:text-slate-400
            ">
              This member will no longer have access to your
              MyHome OS family account.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDelete(null)}
                className="
                  flex-1 rounded-xl
                  border border-slate-200
                  px-4 py-2.5 text-sm font-semibold
                  text-slate-700
                  dark:border-slate-700
                  dark:text-slate-200
                "
              >
                Cancel
              </button>

              <button
                onClick={deleteMember}
                className="
                  flex-1 rounded-xl
                  bg-red-500 px-4 py-2.5
                  text-sm font-semibold text-white
                  hover:bg-red-600
                "
              >
                Remove
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({
  icon: Icon,
  title,
  value,
  text,
  iconClass,
}) {
  return (
    <div className="
      rounded-2xl border border-slate-200
      bg-white p-5 shadow-sm
      dark:border-slate-800
      dark:bg-slate-900
    ">
      <div className="flex items-start justify-between">
        <div className={`
          flex h-11 w-11 items-center
          justify-center rounded-xl
          ${iconClass}
        `}>
          <Icon size={20} />
        </div>

        <MoreHorizontal
          size={18}
          className="text-slate-300"
        />
      </div>

      <p className="
        mt-5 text-xs font-medium
        text-slate-400
      ">
        {title}
      </p>

      <p className="
        mt-1 text-2xl font-bold
        text-slate-900 dark:text-white
      ">
        {value}
      </p>

      <p className="
        mt-1 text-xs
        text-slate-400
      ">
        {text}
      </p>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    Owner:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    Admin:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    Member:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    "View Only":
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <span className={`
      inline-flex items-center gap-1.5
      rounded-full px-3 py-1.5
      text-[11px] font-semibold
      ${styles[role] || styles.Member}
    `}>
      {role === "Owner" && <Crown size={12} />}
      {role === "Admin" && <ShieldCheck size={12} />}
      {role === "Member" && <UserCheck size={12} />}
      {role === "View Only" && <Eye size={12} />}
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const active = status === "Active";

  return (
    <span className={`
      inline-flex items-center gap-1.5
      rounded-full px-3 py-1.5
      text-[11px] font-semibold
      ${
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
      }
    `}>
      <span className={`
        h-1.5 w-1.5 rounded-full
        ${active ? "bg-emerald-500" : "bg-orange-500"}
      `} />
      {status}
    </span>
  );
}

function InfoBox({ title, value }) {
  return (
    <div className="
      rounded-xl bg-slate-50 p-3
      dark:bg-slate-800
    ">
      <p className="text-[10px] uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="
        mt-1 text-sm font-semibold
        text-slate-800 dark:text-white
      ">
        {value}
      </p>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="
      fixed inset-0 z-[100]
      flex items-center justify-center
      bg-slate-950/60 p-4
      backdrop-blur-sm
    ">
      <div className="
        w-full max-w-md
        overflow-hidden rounded-3xl
        border border-slate-200
        bg-white shadow-2xl
        dark:border-slate-700
        dark:bg-slate-900
      ">
        <div className="
          flex items-center justify-between
          border-b border-slate-100
          px-5 py-4
          dark:border-slate-800
        ">
          <h2 className="
            font-bold text-slate-900
            dark:text-white
          ">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
              flex h-8 w-8 items-center justify-center
              rounded-lg text-slate-400
              hover:bg-slate-100
              dark:hover:bg-slate-800
            "
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function EditMemberModal({ member, onClose, onSave }) {
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [status, setStatus] = useState(member.status);

  const handleSave = () => {
    onSave({
      ...member,
      name: name.trim() || member.name,
      role,
      status,
    });
  };

  return (
    <Modal title="Edit Member" onClose={onClose}>

      <div className="space-y-4">

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
            Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="
              h-11 w-full rounded-xl
              border border-slate-200
              bg-slate-50 px-3 text-sm
              outline-none focus:border-indigo-500
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-white
            "
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
            Role
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="
              h-11 w-full rounded-xl
              border border-slate-200
              bg-slate-50 px-3 text-sm
              outline-none
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-white
            "
          >
            <option>Owner</option>
            <option>Admin</option>
            <option>Member</option>
            <option>View Only</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
            Status
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="
              h-11 w-full rounded-xl
              border border-slate-200
              bg-slate-50 px-3 text-sm
              outline-none
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-white
            "
          >
            <option>Active</option>
            <option>Pending</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">

          <button
            onClick={onClose}
            className="
              flex-1 rounded-xl
              border border-slate-200
              py-2.5 text-sm font-semibold
              text-slate-700
              dark:border-slate-700
              dark:text-slate-200
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="
              flex-1 rounded-xl
              bg-indigo-600 py-2.5
              text-sm font-semibold text-white
              hover:bg-indigo-700
            "
          >
            Save Changes
          </button>

        </div>
      </div>
    </Modal>
  );
}

function InviteModal({ onClose, onInvite }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Member");
  const [avatar, setAvatar] = useState("");

  const handleInvite = () => {
    if (!name.trim() || !email.trim()) {
      alert("Please enter name and email.");
      return;
    }

    onInvite({
      name: name.trim(),
      email: email.trim(),
      role,
      avatar,
    });
  };

  return (
    <Modal title="Invite Family Member" onClose={onClose}>

      <div className="space-y-4">

        <div className="
          rounded-xl bg-indigo-50
          p-4 dark:bg-indigo-950/30
        ">
          <div className="flex gap-3">
            <Mail
              size={18}
              className="mt-0.5 text-indigo-600"
            />

            <p className="
              text-xs leading-5
              text-indigo-700
              dark:text-indigo-300
            ">
              Send an invitation to your family member.
              They will appear as pending until they accept.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
            Name
          </label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Family member name"
            className="
              h-11 w-full rounded-xl
              border border-slate-200
              bg-slate-50 px-3 text-sm
              outline-none focus:border-indigo-500
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-white
            "
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com"
            className="
              h-11 w-full rounded-xl
              border border-slate-200
              bg-slate-50 px-3 text-sm
              outline-none focus:border-indigo-500
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-white
            "
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
            Access Role
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="
              h-11 w-full rounded-xl
              border border-slate-200
              bg-slate-50 px-3 text-sm
              outline-none
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-white
            "
          >
            <option>Member</option>
            <option>Admin</option>
            <option>View Only</option>
          </select>
        </div>

        {/* Profile Photo */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">
            Profile Photo
          </label>

          <div className="flex items-center gap-4">
            {avatar ? (
              <img
                src={avatar}
                alt="Profile preview"
                className="h-14 w-14 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-950"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
                Photo
              </div>
            )}

            <label className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              Choose Photo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (file.size > 10 * 1024 * 1024) {
                    alert("Photo must be smaller than 10MB.");
                    return;
                  }

                  const reader = new FileReader();
                  reader.onload = () => setAvatar(reader.result);
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>

          <p className="mt-2 text-[11px] text-slate-400">
            JPG, PNG or WEBP · Maximum 10MB
          </p>
        </div>

        <button
          onClick={handleInvite}
          className="
            mt-2 flex w-full
            items-center justify-center gap-2
            rounded-xl bg-indigo-600
            py-3 text-sm font-semibold
            text-white hover:bg-indigo-700
          "
        >
          <UserPlus size={17} />
          Send Invitation
        </button>

      </div>
    </Modal>
  );
}

export default Family;