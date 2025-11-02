"use client";

import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store } from "@/lib/store";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { loadFavorites } from "@/lib/store/weatherSlice";

function StartupLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadFavorites());
  }, [dispatch]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <StartupLoader />
          {children}
        </ThemeProvider>
      </Provider>
    </SessionProvider>
  );
}
