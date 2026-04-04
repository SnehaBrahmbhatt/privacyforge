import { useState, useMemo } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type AnyRow = Record<string, unknown>;

interface Props {
  data: AnyRow[];
  title?: string;
  highlightSensitive?: boolean;
}

const SENSITIVE_TYPES = ["email", "phone", "name", "credit_card"];

export function DataPreviewTable({ data, title, highlightSensitive = false }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortAsc, setSortAsc] = useState(true);

  // Derive columns dynamically from the first row
  const columns = useMemo(() => {
    if (!data.length) return [];
    return Object.keys(data[0]);
  }, [data]);

  const filtered = useMemo(() => {
    let rows = data;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av).localeCompare(String(bv));
        return sortAsc ? cmp : -cmp;
      });
    }
    return rows;
  }, [data, search, sortKey, sortAsc]);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const isSensitiveColumn = (col: string) =>
    SENSITIVE_TYPES.some((t) => col.toLowerCase().includes(t));

  if (!data.length) {
    return (
      <div className="rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">
        No data to preview
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-sm font-bold text-foreground tracking-tight">{title}</h3>
      )}
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
                  className={`px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors ${
                    highlightSensitive && isSensitiveColumn(col)
                      ? "text-orange-500"
                      : "text-muted-foreground"
                  }`}
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
            {filtered.map((row, i) => (
              <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                {columns.map((col) => {
                  const val = String(row[col] ?? "");
                  const sensitive = highlightSensitive && isSensitiveColumn(col);
                  return (
                    <td
                      key={col}
                      className={`px-4 py-2.5 ${sensitive ? "text-orange-500 font-medium" : ""}`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground text-right">
        {filtered.length} of {data.length} rows
      </p>
    </div>
  );
}