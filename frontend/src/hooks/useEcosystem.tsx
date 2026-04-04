import { createContext, useContext, useState, ReactNode } from 'react';

export type EcosystemType = 'aquatic' | 'terrestrial';

interface EcosystemContextValue {
  ecosystem: EcosystemType;
  setEcosystem: (e: EcosystemType) => void;
  isAquatic: boolean;
  isTerrestrial: boolean;
  label: string;
  accentColor: string;
  accentDim: string;
  accentBorder: string;
}

const EcosystemContext = createContext<EcosystemContextValue>({
  ecosystem: 'aquatic',
  setEcosystem: () => {},
  isAquatic: true,
  isTerrestrial: false,
  label: 'Aquatic',
  accentColor: '#14b8a6',
  accentDim: 'rgba(20,184,166,0.12)',
  accentBorder: 'rgba(20,184,166,0.30)',
});

export const EcosystemProvider = ({ children }: { children: ReactNode }) => {
  const [ecosystem, setEcosystem] = useState<EcosystemType>('aquatic');

  const isAquatic = ecosystem === 'aquatic';
  const isTerrestrial = ecosystem === 'terrestrial';

  const value: EcosystemContextValue = {
    ecosystem,
    setEcosystem,
    isAquatic,
    isTerrestrial,
    label: isAquatic ? 'Aquatic' : 'Terrestrial',
    accentColor: isAquatic ? '#14b8a6' : '#22c55e',
    accentDim: isAquatic ? 'rgba(20,184,166,0.12)' : 'rgba(34,197,94,0.12)',
    accentBorder: isAquatic ? 'rgba(20,184,166,0.30)' : 'rgba(34,197,94,0.30)',
  };

  return (
    <EcosystemContext.Provider value={value}>
      {children}
    </EcosystemContext.Provider>
  );
};

export const useEcosystem = () => useContext(EcosystemContext);