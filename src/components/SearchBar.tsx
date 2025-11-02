"use client";

import React, { JSX, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { fetchCurrentByCity, fetchOneCall } from "@/lib/store/weatherSlice";
import { Button } from "@/components/ui/button";

export default function SearchBar(): JSX.Element {
  const dispatch = useAppDispatch();
  const units = useAppSelector((s) => s.weather.units);
  const [q, setQ] = useState<string>("");

  async function onSearch(): Promise<void> {
    const city = q.trim();
    if (!city) return;
    try {
      const action = await dispatch(fetchCurrentByCity({ city })).unwrap();
      const coords = action.data.coord;

      await dispatch(
        fetchOneCall({ lat: coords.lat, lon: coords.lon, units })
      ).unwrap();
      setQ("");
    } catch {}
  }

  return (
    <div className="flex gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search city (e.g. London)"
        className="border p-2 rounded flex-1"
        onKeyDown={(e) => {
          if (e.key === "Enter") void onSearch();
        }}
      />
      <Button onClick={() => void onSearch()}>Add</Button>
    </div>
  );
}
