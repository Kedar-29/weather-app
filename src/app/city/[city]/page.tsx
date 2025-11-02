"use client";

import React, { JSX, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { iconUrl } from "@/lib/utils";
import { CurrentWeatherResponse } from "@/types/weather";

function paramAsString(value: string | string[] | undefined): string {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
}

export default function CityPage(): JSX.Element {
  const params = useParams();
  const cityParam = paramAsString(params?.city);

  const [current, setCurrent] = useState<CurrentWeatherResponse | null>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load(): Promise<void> {
      if (!cityParam) return;
      setError(null);
      setLoading(true);

      try {
        const API_URL = process.env.NEXT_PUBLIC_OWM_API_URL;
        const API_KEY = process.env.NEXT_PUBLIC_OWM_API_KEY;

        const res1 = await axios.get<CurrentWeatherResponse>(
          `${API_URL}/weather?q=${encodeURIComponent(
            cityParam
          )}&appid=${API_KEY}&units=metric`
        );

        const res2 = await axios.get(
          `${API_URL}/forecast?q=${encodeURIComponent(
            cityParam
          )}&appid=${API_KEY}&units=metric`
        );

        setCurrent(res1.data);

        const hourly = res2.data.list.slice(0, 12).map((f: any) => ({
          time: new Date(f.dt * 1000).toLocaleTimeString([], {
            hour: "2-digit",
          }),
          temp: f.main.temp,
        }));

        const dailyMap: Record<string, { min: number; max: number }> = {};
        res2.data.list.forEach((f: any) => {
          const day = new Date(f.dt * 1000).toLocaleDateString("en-US", {
            weekday: "short",
          });
          dailyMap[day] = dailyMap[day]
            ? {
                min: Math.min(dailyMap[day].min, f.main.temp_min),
                max: Math.max(dailyMap[day].max, f.main.temp_max),
              }
            : { min: f.main.temp_min, max: f.main.temp_max };
        });

        const daily = Object.entries(dailyMap).map(([day, { min, max }]) => ({
          day,
          min,
          max,
        }));

        setForecast([
          { label: "hourly", data: hourly },
          { label: "daily", data: daily },
        ]);
      } catch {
        setError("Failed to load forecast data");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [cityParam]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-500">
        Loading forecast...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        {error}
      </div>
    );

  if (!current)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        No weather data found.
      </div>
    );

  return (
    <main className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => history.back()}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4"
        >
          ← Back
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 transition-all">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={iconUrl(current.weather[0].icon)}
              alt={current.weather[0].main}
              className="w-20 h-20"
            />
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {current.name}
              </h2>
              <p className="capitalize text-gray-500 dark:text-gray-400">
                {current.weather[0].description}
              </p>
              <p className="mt-2 text-4xl font-semibold text-blue-600 dark:text-blue-400">
                {Math.round(current.main.temp)}°C
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className="font-semibold">Humidity</p>
              <p>{current.main.humidity}%</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className="font-semibold">Pressure</p>
              <p>{current.main.pressure} hPa</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className="font-semibold">Wind</p>
              <p>{current.wind.speed} m/s</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className="font-semibold">Feels Like</p>
              <p>{Math.round(current.main.feels_like)}°C</p>
            </div>
          </div>
        </section>

        <aside className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 transition-all">
          <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-4">
            Forecast Charts
          </h3>

          <div className="flex flex-col gap-8">
            <div>
              <h4 className="text-sm mb-2 font-medium text-gray-500 dark:text-gray-400">
                Next 12 Hours
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={forecast[0].data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis unit="°C" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-sm mb-2 font-medium text-gray-500 dark:text-gray-400">
                Next 7 Days
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={forecast[1].data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis unit="°C" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="min"
                    stroke="#60a5fa"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="max"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
