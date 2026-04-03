export interface DataRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  city: string;
}

export const sampleData: DataRow[] = [
  { id: 1, name: "Alice Johnson", email: "alice@email.com", phone: "555-0101", age: 29, city: "New York" },
  { id: 2, name: "Bob Smith", email: "bob.smith@corp.io", phone: "555-0202", age: 34, city: "San Francisco" },
  { id: 3, name: "Carol Davis", email: "carol.d@mail.org", phone: "555-0303", age: 42, city: "Chicago" },
  { id: 4, name: "David Lee", email: "david.lee@biz.net", phone: "555-0404", age: 27, city: "Austin" },
  { id: 5, name: "Eva Martinez", email: "eva.m@startup.co", phone: "555-0505", age: 31, city: "Seattle" },
  { id: 6, name: "Frank Wilson", email: "frank@company.com", phone: "555-0606", age: 55, city: "Denver" },
  { id: 7, name: "Grace Kim", email: "grace.kim@web.io", phone: "555-0707", age: 23, city: "Portland" },
  { id: 8, name: "Henry Brown", email: "henry.b@tech.dev", phone: "555-0808", age: 38, city: "Miami" },
];

export function anonymizeData(
  data: DataRow[],
  options: { maskNames: boolean; removeEmails: boolean; generalizeAges: boolean; hidePhones: boolean }
): DataRow[] {
  return data.map((row) => ({
    ...row,
    name: options.maskNames ? row.name.charAt(0) + "***" : row.name,
    email: options.removeEmails ? "[REDACTED]" : row.email,
    phone: options.hidePhones ? "***-****" : row.phone,
    age: options.generalizeAges ? Math.floor(row.age / 10) * 10 : row.age,
  }));
}

export function computeRiskStats(data: DataRow[]) {
  const fields = data.length * 4; // name, email, phone, age per row
  const sensitive = data.length * 3; // name, email, phone are sensitive
  const safe = fields - sensitive;
  return [
    { name: "Sensitive", value: sensitive, fill: "hsl(0, 75%, 55%)" },
    { name: "Safe", value: safe, fill: "hsl(150, 60%, 40%)" },
  ];
}
