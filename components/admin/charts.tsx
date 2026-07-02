"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function GraficoVentasTipologia({
  data,
}: {
  data: Array<{ tipologia: string; vendidas: number }>;
}) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Sin ventas todavía.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis dataKey="tipologia" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
        <Tooltip />
        <Bar dataKey="vendidas" name="Vendidas" fill="#d4a437" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GraficoVentasTiempo({
  data,
}: {
  data: Array<{ mes: string; operaciones: number; monto: number }>;
}) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Sin operaciones todavía.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="operaciones"
          name="Operaciones"
          stroke="#d4a437"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
