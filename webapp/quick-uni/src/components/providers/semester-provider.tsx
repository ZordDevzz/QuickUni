"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SemesterContextType {
  selectedSemesterId: number | null;
  setSelectedSemesterId: (id: number | null) => void;
}

const SemesterContext = createContext<SemesterContextType | undefined>(undefined);

export function SemesterProvider({
  children,
  defaultSemesterId,
}: {
  children: React.ReactNode;
  defaultSemesterId: number | null;
}) {
  const [selectedSemesterId, setSelectedSemesterIdState] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from defaultSemesterId to ensure active semester is selected on login/load
  useEffect(() => {
    if (defaultSemesterId) {
      setSelectedSemesterIdState(defaultSemesterId);
      localStorage.setItem("selectedSemesterId", defaultSemesterId.toString());
    } else {
      const savedId = localStorage.getItem("selectedSemesterId");
      if (savedId) {
        setSelectedSemesterIdState(parseInt(savedId));
      }
    }
    setIsInitialized(true);
  }, [defaultSemesterId]);

  const setSelectedSemesterId = (id: number | null) => {
    setSelectedSemesterIdState(id);
    if (id) {
      localStorage.setItem("selectedSemesterId", id.toString());
    } else {
      localStorage.removeItem("selectedSemesterId");
    }
  };

  return (
    <SemesterContext.Provider value={{ selectedSemesterId, setSelectedSemesterId }}>
      {isInitialized ? children : null}
    </SemesterContext.Provider>
  );
}

export function useSemester() {
  const context = useContext(SemesterContext);
  if (context === undefined) {
    throw new Error("useSemester must be used within a SemesterProvider");
  }
  return context;
}
