import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface DonorAuthContextType {
  donorId: number | null;
  setDonorId: (id: number | null) => void;
  logout: () => void;
  isRegistered: boolean;
}

const DonorAuthContext = createContext<DonorAuthContextType | undefined>(undefined);

export function DonorAuthProvider({ children }: { children: ReactNode }) {
  const [donorId, setDonorIdState] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("blood_donor_id");
    if (stored) {
      setDonorIdState(parseInt(stored, 10));
    }
    setIsReady(true);
  }, []);

  const setDonorId = (id: number | null) => {
    if (id === null) {
      localStorage.removeItem("blood_donor_id");
    } else {
      localStorage.setItem("blood_donor_id", id.toString());
    }
    setDonorIdState(id);
  };

  const logout = () => setDonorId(null);

  if (!isReady) return null;

  return (
    <DonorAuthContext.Provider value={{ donorId, setDonorId, logout, isRegistered: !!donorId }}>
      {children}
    </DonorAuthContext.Provider>
  );
}

export function useDonorAuth() {
  const context = useContext(DonorAuthContext);
  if (context === undefined) {
    throw new Error("useDonorAuth must be used within a DonorAuthProvider");
  }
  return context;
}
