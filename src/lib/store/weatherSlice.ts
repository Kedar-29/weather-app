


import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { CurrentWeatherResponse, OneCallPayload } from "@/types/weather";
import { fetchWithCache } from "@/lib/cache";

const API_URL =
  process.env.NEXT_PUBLIC_OWM_API_URL ??
  "https://api.openweathermap.org/data/2.5";
const API_KEY = process.env.NEXT_PUBLIC_OWM_API_KEY ?? "";

export interface WeatherState {
  byCity: Record<string, CurrentWeatherResponse>;
  oneCallByCoord: Record<string, OneCallPayload>;
  favorites: string[];
  units: "metric" | "imperial";
  loading: boolean;
  error?: string;
  userId: string | null;
}

const loadFavoritesFromStorage = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("favorites");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveFavoritesToStorage = (favorites: string[]): void => {
  try {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  } catch {}
};

const initialState: WeatherState = {
  byCity: {},
  oneCallByCoord: {},
  favorites: [],
  units: "metric",
  loading: false,
  error: undefined,
  userId: null,
};

export const fetchCurrentByCity = createAsyncThunk<
  { city: string; data: CurrentWeatherResponse },
  { city: string },
  { rejectValue: string }
>("weather/fetchCurrentByCity", async ({ city }, { rejectWithValue }) => {
  try {
    const url = `${API_URL}/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=metric`;
    const res = await axios.get<CurrentWeatherResponse>(url);
    return { city, data: res.data };
  } catch {
    return rejectWithValue("City fetch failed");
  }
});

export const fetchOneCall = createAsyncThunk<
  { lat: number; lon: number; payload: OneCallPayload | null },
  { lat: number; lon: number; units: "metric" | "imperial" }
>("weather/fetchOneCall", async ({ lat, lon, units }) => {
  try {
    const key = `onecall_${lat}_${lon}_${units}`;
    const payload = await fetchWithCache<OneCallPayload>(key, async () => {
      const url = `${API_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=${units}&appid=${API_KEY}`;
      const res = await axios.get<OneCallPayload>(url);
      return res.data;
    });
    return { lat, lon, payload };
  } catch {
    return { lat, lon, payload: null };
  }
});

const slice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<string>) {
      const city = action.payload;
      if (state.favorites.includes(city)) {
        state.favorites = state.favorites.filter((c) => c !== city);
      } else {
        state.favorites.push(city);
      }
      saveFavoritesToStorage(state.favorites);
    },
    loadFavorites(state) {
      state.favorites = loadFavoritesFromStorage();
    },
    setUnits(state, action: PayloadAction<"metric" | "imperial">) {
      state.units = action.payload;
    },
    setUserId(state, action: PayloadAction<string | null>) {
      state.userId = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCurrentByCity.pending, (s) => {
        s.loading = true;
        s.error = undefined;
      })
      .addCase(fetchCurrentByCity.fulfilled, (s, action) => {
        s.loading = false;
        s.byCity[action.payload.city] = action.payload.data;
      })
      .addCase(fetchCurrentByCity.rejected, (s, action) => {
        s.loading = false;
        s.error = action.payload;
      })
      .addCase(fetchOneCall.fulfilled, (s, action) => {
        if (action.payload.payload) {
          const key = `${action.payload.lat}_${action.payload.lon}_${s.units}`;
          s.oneCallByCoord[key] = action.payload.payload;
        }
      });
  },
});

export const { toggleFavorite, loadFavorites, setUnits, setUserId } =
  slice.actions;

export default slice.reducer;
