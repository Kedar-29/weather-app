"use client";

import React, { JSX } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CurrentWeatherResponse } from "@/types/weather";
import { iconUrl } from "@/lib/utils";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { fetchOneCall, toggleFavorite } from "@/lib/store/weatherSlice";
import { Star, RefreshCcw } from "lucide-react";

interface Props {
  city: string;
  data: CurrentWeatherResponse;
  onOpen: (city: string) => void;
  isFavorite: boolean;
}

export default function CityCard({
  city,
  data,
  onOpen,
  isFavorite,
}: Props): JSX.Element {
  const dispatch = useAppDispatch();

  const handleRefresh = async (e: React.MouseEvent): Promise<void> => {
    e.stopPropagation();
    await dispatch(
      fetchOneCall({
        lat: data.coord.lat,
        lon: data.coord.lon,
        units: "metric",
      })
    ).unwrap();
  };

  const handleToggleFav = (e: React.MouseEvent): void => {
    e.stopPropagation();
    dispatch(toggleFavorite(city));
  };

  return (
    <Card
      onClick={() => onOpen(city)}
      className="group relative overflow-hidden p-6 cursor-pointer rounded-2xl border border-transparent bg-white dark:bg-gray-900 shadow-md hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 ease-in-out"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 capitalize tracking-tight">
            {city}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {data.weather[0].description}
          </p>
          <div className="mt-3 text-4xl font-extrabold text-blue-600 dark:text-blue-400">
            {Math.round(data.main.temp)}°C
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {data.weather[0].main}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <img
            src={iconUrl(data.weather[0].icon)}
            alt={data.weather[0].main}
            className="w-14 h-14 drop-shadow-md"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isFavorite ? "default" : "outline"}
              onClick={handleToggleFav}
              className={`rounded-full ${
                isFavorite
                  ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              } transition-all duration-200`}
            >
              <Star
                className={`w-4 h-4 ${
                  isFavorite ? "fill-yellow-500 text-yellow-600" : ""
                }`}
              />
              <span className="ml-1 text-xs font-medium">
                {isFavorite ? "Saved" : "Fav"}
              </span>
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={handleRefresh}
              className="rounded-full hover:bg-blue-600 hover:text-white transition-all duration-200"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
}
