import React, { createContext, useContext, useState } from 'react';

const PlanContext = createContext(null);

export const PlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [plan, setPlan] = useState('free');
  // Aquí puedes agregar lógica para cambiar de plan
  return (
    <PlanContext.Provider value={{ plan, setPlan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => useContext(PlanContext); 