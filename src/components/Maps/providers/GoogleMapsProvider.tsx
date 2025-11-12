"use client";

import React, { createContext, useContext, PropsWithChildren } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { MAPS_LOADER_OPTIONS } from "../config/config";

type Ctx = {
  isLoaded: boolean;
  loadError: Error | undefined;
};

const MapsCtx = createContext<Ctx>({ isLoaded: false, loadError: undefined });

export function GoogleMapsProvider({ children }: PropsWithChildren) {
  const loaderOptions: Parameters<typeof useJsApiLoader>[0] = {
    ...MAPS_LOADER_OPTIONS,
    libraries: [...MAPS_LOADER_OPTIONS.libraries],
  };
  const { isLoaded, loadError } = useJsApiLoader(loaderOptions);
  return (
    <MapsCtx.Provider value={{ isLoaded, loadError }}>
      {children}
    </MapsCtx.Provider>
  );
}

export function useMapsLoader() {
  return useContext(MapsCtx);
}
