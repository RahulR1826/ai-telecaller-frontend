import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

type NexusContextType = {
  isNexusOpen: boolean;
  setNexusOpen: (open: boolean) => void;
  toggleNexus: () => void;
  contextData: any;
  setContextData: (data: any) => void;
};

const NexusContext = createContext<NexusContextType | undefined>(undefined);

export function NexusProvider({ children }: { children: React.ReactNode }) {
  const [isNexusOpen, setNexusOpen] = useState(false);
  const [contextData, setContextData] = useState<any>({});
  const location = useLocation();

  useEffect(() => {
    // Update context whenever location changes
    setContextData((prev: any) => ({
      ...prev,
      currentPage: location.pathname
    }));
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setNexusOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleNexus = () => setNexusOpen(!isNexusOpen);

  return (
    <NexusContext.Provider value={{ isNexusOpen, setNexusOpen, toggleNexus, contextData, setContextData }}>
      {children}
    </NexusContext.Provider>
  );
}

export function useNexus() {
  const context = useContext(NexusContext);
  if (context === undefined) {
    throw new Error("useNexus must be used within a NexusProvider");
  }
  return context;
}
