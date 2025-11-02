"use client";

import React, { JSX } from "react";
import { OneCallPayload } from "@/types/weather";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import dayjs from "dayjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WeatherDetailsModal({
  payload,
  onClose,
}: {
  payload: OneCallPayload;
  onClose: () => void;
}): JSX.Element {
  const hourly = payload.hourly
    .slice(0, 24)
    .map((h) => ({ time: dayjs.unix(h.dt).format("HH:mm"), temp: h.temp }));
  const daily = payload.daily.slice(0, 7).map((d) => ({
    date: dayjs.unix(d.dt).format("DD MMM"),
    temp: Math.round(d.temp.day),
  }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">
            Details — {payload.timezone}
          </h3>
          <Button onClick={onClose}>Close</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-600 mb-2">Hourly</div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="temp" stroke="#3b82f6" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-600 mb-2">7-day</div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="temp" stroke="#10b981" dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-slate-500">Temp</div>
            <div className="text-2xl font-bold">
              {Math.round(payload.current.temp)}°
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Humidity</div>
            <div>{payload.current.humidity}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Pressure</div>
            <div>{payload.current.pressure} hPa</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
