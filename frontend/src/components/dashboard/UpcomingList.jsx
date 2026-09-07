import {
  CalendarDays,
  Wrench,
  ShieldCheck,
  FileText,
  ChevronRight,
} from "lucide-react";

const upcomingItems = [
  {
    title: "AC Service",
    subtitle: "LG Split AC",
    date: "Tomorrow",
    icon: Wrench,
  },
  {
    title: "TV Warranty",
    subtitle: "Samsung Smart TV",
    date: "12 days",
    icon: ShieldCheck,
  },
  {
    title: "Bike Insurance",
    subtitle: "Honda Shine",
    date: "24 days",
    icon: FileText,
  },
  {
    title: "Car Service",
    subtitle: "Honda City",
    date: "45 days",
    icon: CalendarDays,
  },
];

function UpcomingList() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            Upcoming
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your next important dates.
          </p>
        </div>

        <button className="text-xs font-medium text-slate-600 hover:text-slate-900">
          View all
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {upcomingItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Icon size={18} className="text-slate-700" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {item.title}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {item.subtitle}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {item.date}
                </span>

                <ChevronRight size={15} className="text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UpcomingList;