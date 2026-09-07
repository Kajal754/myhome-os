import {
  X,
  Upload,
  FileText,
} from "lucide-react";

function UploadDocument({
  open,
  onClose,
  onFileSelect,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Upload Document
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add an important document to your knowledge.
            </p>

          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <X size={17} />
          </button>

        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center transition hover:border-violet-400 hover:bg-violet-50 dark:border-white/10 dark:bg-slate-950 dark:hover:bg-violet-500/5">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
            <Upload size={26} />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-white">
            Choose a document
          </p>

          <p className="mt-1 text-xs text-slate-400">
            PDF, DOCX, JPG, PNG
          </p>

          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={onFileSelect}
          />

        </label>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">

          <FileText
            size={16}
            className="text-slate-400"
          />

          <p className="text-[11px] text-slate-500">
            Your document will become searchable knowledge.
          </p>

        </div>

      </div>

    </div>
  );
}

export default UploadDocument;