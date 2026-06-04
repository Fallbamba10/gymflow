export function toCsv(rows: Array<Record<string, string | number | null | undefined>>) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          const text = String(value).replace(/"/g, '""');
          return `"${text}"`;
        })
        .join(","),
    ),
  ];

  return lines.join("\n");
}

export function csvResponse(filename: string, content: string) {
  return new Response(`\uFEFF${content}`, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
