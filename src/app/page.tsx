"use client";

import React, { JSX, useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import CityCard from "@/components/CityCard";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import { loadFavorites, setUserId } from "@/lib/store/weatherSlice";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page(): JSX.Element {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: session } = useSession();
  const { byCity, favorites, loading, error } = useAppSelector(
    (s) => s.weather
  );

  useEffect(() => {
    const uid = session?.user?.email ?? null;
    dispatch(setUserId(uid));
  }, [session, dispatch]);

  useEffect(() => {
    dispatch(loadFavorites());
  }, [dispatch]);

  function openCity(city: string): void {
    router.push(`/city/${encodeURIComponent(city)}`);
  }

  return (
    <main className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Weather Analytics Dashboard</h1>
        <div>
          {!session ? (
            <Button onClick={() => signIn("google")}>Sign in</Button>
          ) : (
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="text-sm">{session.user?.name}</div>
              <Button variant="outline" onClick={() => signOut()}>
                Sign out
              </Button>
            </div>
          )}
        </div>
      </header>

      <SearchBar />

      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {Object.entries(byCity).map(([city, data]) => (
          <CityCard
            key={city}
            city={city}
            data={data}
            onOpen={openCity}
            isFavorite={favorites.includes(city)}
          />
        ))}
      </section>
    </main>
  );
}
