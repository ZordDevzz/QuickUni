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

  // Initialize from localStorage or default
  useEffect(() => {
    const savedId = localStorage.getItem("selectedSemesterId");
    if (savedId) {
// eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedSemesterIdState(parseInt(savedId));
    } else if (defaultSemesterId) {
      setSelectedSemesterIdState(defaultSemesterId);
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
