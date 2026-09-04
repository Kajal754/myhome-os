import {
  X,
  Plus,
} from "lucide-react";

function CreateNote({
  open,
  onClose,
  noteTitle,
  setNoteTitle,
  noteText,
  setNoteText,
  onSave,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Create a Note
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Save something important to your second brain.
            </p>

          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <X size={17} />
          </button>

        </div>

        <div className="mt-6 space-y-4">

          <input
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note title"
            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-violet-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />

          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your note..."
            rows={6}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-violet-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />

          <button
            onClick={onSave}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-bold text-white"
          >
            <Plus size={17} />
            Save Note
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateNote;