import {
  Sparkles,
  Lightbulb,
  Paperclip,
  Send,
} from "lucide-react";

function AskMyLife({
  question,
  setQuestion,
  messages,
  askQuestion,
}) {
  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-5 flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
          <Sparkles size={19} />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Ask My Life
          </h2>

          <p className="text-xs text-slate-500">
            Your personal knowledge assistant
          </p>
        </div>

      </div>

      {/* Suggestions */}
      <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">

        <div className="flex gap-3">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
            <Lightbulb size={17} />
          </div>

          <div>

            <p className="text-xs font-semibold text-slate-700 dark:text-white">
              Try asking:
            </p>

            <button
              type="button"
              onClick={() =>
                askQuestion("Where is my Aadhar Card?")
              }
              className="mt-2 block text-left text-xs leading-5 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
            >
              "Where is my Aadhar Card?"
            </button>

            <button
              type="button"
              onClick={() =>
                askQuestion("Maine is month kitna spend kiya?")
              }
              className="mt-1 block text-left text-xs leading-5 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
            >
              "Maine is month kitna spend kiya?"
            </button>

            <button
              type="button"
              onClick={() =>
                askQuestion("Meri kaunsi warranties active hain?")
              }
              className="mt-1 block text-left text-xs leading-5 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
            >
              "Meri kaunsi warranties active hain?"
            </button>

          </div>

        </div>

      </div>

      {/* Input */}
      <div className="mt-5 flex items-end gap-3">

        <div className="relative flex-1">

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                askQuestion();
              }
            }}
            rows={3}
            placeholder="Ask something about your life..."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 pr-12 text-sm outline-none focus:border-violet-400 dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />

          <button
            type="button"
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <Paperclip size={16} />
          </button>

        </div>

        <button
          type="button"
          onClick={() => askQuestion()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transition hover:scale-105"
        >
          <Send size={17} />
        </button>

      </div>

      {/* Messages */}
      {messages?.length > 0 && (
        <div className="mt-5 space-y-3">

          {messages.map((message, index) => (
            <div
              key={index}
              className={`rounded-2xl p-4 text-sm ${
                message.role === "user"
                  ? "ml-10 bg-violet-600 text-white"
                  : "mr-10 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              {message.text}
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default AskMyLife;
