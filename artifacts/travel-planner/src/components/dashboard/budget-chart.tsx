import React from "react";
import { GlassCard } from "../shared";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TravelPlanResponse } from "@workspace/api-client-react";

const INR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

interface BudgetChartProps {
  plan: TravelPlanResponse;
  request: { budget: number };
}

export function BudgetChart({ plan, request }: BudgetChartProps) {
  const itineraryCost = (plan.itinerary ?? []).reduce((sum: number, day: any) => sum + (day.estimatedCost ?? 0), 0);
  // Only use recommended transport option price
  const recommendedTransport = (plan.transport ?? []).find((t: any) => t.isRecommended) ?? (plan.transport ?? [])[0];
  const transportCost = recommendedTransport?.price ?? recommendedTransport?.pricePerPerson ?? 0;
  // Only use recommended hotel total cost
  const recommendedHotel = (plan.hotels ?? []).find((h: any) => h.isRecommended) ?? (plan.hotels ?? [])[0];
  const hotelCost = recommendedHotel?.totalCost ?? 0;
  const total = plan.totalEstimatedCost ?? 0;
  const activityCost = Math.max(0, total - transportCost - hotelCost);
  const remaining = Math.max(0, request.budget - total);

  const data = [
    { name: "Activities & Food", value: activityCost, color: "#FF6B35" },
    { name: "Transport", value: transportCost, color: "#6366f1" },
    { name: "Hotels", value: hotelCost, color: "#0ea5e9" },
    { name: "Remaining", value: remaining, color: "#22c55e" },
  ].filter(d => d.value > 0);

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold text-lg mb-4">Budget Breakdown</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" labelLine={false} label={renderLabel} outerRadius={110} dataKey="value">
            {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(value: number) => INR(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <div>
              <p className="text-xs text-muted-foreground">{name}</p>
              <p className="font-bold text-sm">{INR(value)}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
