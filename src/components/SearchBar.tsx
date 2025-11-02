"use client";

import React, { JSX, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (city: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps): JSX.Element {
  const [city, setCity] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(city);
    }
  };

  const handleClick = (): void => {
    onSearch(city);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-4">
      <Input
        type="text"
        placeholder="Search for a city..."
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1"
      />
      <Button onClick={handleClick} className="whitespace-nowrap">
        Search
      </Button>
    </div>
  );
}
