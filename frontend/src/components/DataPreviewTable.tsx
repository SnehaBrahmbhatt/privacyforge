import { useState, useMemo } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataRow } from "@/lib/mockData";

interface Props {
  data: DataRow[];
  title?: string;
  highlightSensitive?: boolean;
}

export function DataPreviewTable({ data, title, highlightSensitive = false }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof DataRow>("id");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return [...rows].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
      return sortAsc ? cmp : -cmp;
    });
  }, [data, search, sortKey, sortAsc]);

  const toggleSort = (key: keyof DataRow) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const isEmail = (v: string) => /\S+@\S+\.\S+/.test(v);
  const isPhone = (v: string) => /\d{3}-\d{4}/.test(v);

  const columns: (keyof DataRow)[] = ["id", "name", "email", "phone", "age", "city"];

  return (
    <div className="space-y-4">
      {title && <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search data..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 text-sm rounded-xl bg-muted/50 border-border focus:border-primary/30 transition-colors"
        />
      </div>
      <div className="rounded-xl border border-border overflow-auto max-h-72">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2.5 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => toggleSort(col)}
                >
                  <span className="flex items-center gap-1.5">
                    {col}
                    <ArrowUpDown className="h-3 w-3" />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                {columns.map((col) => {
                  const val = String(row[col]);
                  let cellClass = "px-4 py-2.5";
                  if (highlightSensitive) {
                    if (col === "email" && isEmail(val)) cellClass += " text-sensitive-email font-medium";
                    else if (col === "phone" && isPhone(val)) cellClass += " text-sensitive-phone font-medium";
                  }
                  return <td key={col} className={cellClass}>{val}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
