"use client";

import React, { JSX, useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import CityCard from "@/components/CityCard";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import {
  loadFavorites,
  setUserId,
  fetchCurrentByCity,
} from "@/lib/store/weatherSlice";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";

export default function Page(): JSX.Element {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { data: session } = useSession();
  const { byCity, favorites, loading, error } = useAppSelector(
    (s) => s.weather
  );

  const [showSigninPopup, setShowSigninPopup] = useState(false);

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

  async function handleSearch(city: string): Promise<void> {
    if (!session) {
      setShowSigninPopup(true);
      return;
    }

    if (!city.trim()) return;

    try {
      await dispatch(fetchCurrentByCity({ city })).unwrap();
    } catch {
      console.error("Failed to fetch city data.");
    }
  }

  return (
    <main className="container mx-auto p-6">
      {/* Header */}
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

      <SearchBar onSearch={handleSearch} />

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

      <AlertDialog open={showSigninPopup} onOpenChange={setShowSigninPopup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign in required</AlertDialogTitle>
            <AlertDialogDescription>
              Please sign in with your Google account before searching for
              cities.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => signIn("google")}>
              Sign in with Google
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
