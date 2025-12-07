import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-white">
            RFP Manager
          </Link>
          <div className="flex gap-6">
            <Link
              href="/dashboard"
              className="text-slate-300 hover:text-white transition"
            >
              Dashboard
            </Link>
            <Link
              href="/vendors"
              className="text-slate-300 hover:text-white transition"
            >
              Vendors
            </Link>
            <Link
              href="/rfps/create"
              className="bg-emerald-500 text-slate-950 px-4 py-1 rounded-md hover:bg-emerald-400 transition font-medium"
            >
              + Create RFP
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
