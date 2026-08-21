import {
  Tv,
  Snowflake,
  Car,
  Laptop,
  ChevronRight,
} from "lucide-react";

const assets = [
  {
    name: "Samsung TV",
    category: "Electronics",
    price: "₹45,000",
    status: "Warranty active",
    icon: Tv,
  },
  {
    name: "LG Split AC",
    category: "Appliance",
    price: "₹38,000",
    status: "Service due",
    icon: Snowflake,
  },
  {
    name: "Honda City",
    category: "Vehicle",
    price: "₹9.5L",
    status: "Insurance active",
    icon: Car,
  },
  {
    name: "Dell Laptop",
    category: "Electronics",
    price: "₹72,000",
    status: "Warranty active",
    icon: Laptop,
  },
];

function AssetPreview() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            My assets
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Recently added household assets.
          </p>
        </div>

        <button className="text-xs font-medium text-slate-600 hover:text-slate-900">
          View all
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        {assets.map((asset) => {
          const Icon = asset.icon;

          return (
            <div
              key={asset.name}
              className="group rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Icon size={19} className="text-slate-700" />
                </div>

                <ChevronRight
                  size={16}
                  className="text-slate-300 transition group-hover:text-slate-600"
                />
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  {asset.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {asset.category}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">
                  {asset.price}
                </span>

                <span className="text-[11px] font-medium text-emerald-600">
                  {asset.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AssetPreview;