import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { listUnits, loadSettings } from './content';
import { units as staticUnits } from '../data/content';

// Dados globais vindos da API (unidades para menu/filtros e configurações institucionais).
// Enquanto carregam, ou se a API falhar, valem os dados estáticos de apresentação (nada fica vazio).
const SiteDataContext = createContext({ units: staticUnits, settings: {}, apiUnits: false });

export function SiteDataProvider({ children }) {
  const [units, setUnits] = useState(null);
  const [settings, setSettings] = useState({});
  useEffect(() => {
    let active = true;
    listUnits().then(list => { if (active && list.length) setUnits(list.map(unit => ({ ...unit, href: unit.path }))); }).catch(() => {});
    loadSettings().then(value => { if (active) setSettings(value); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const value = useMemo(() => ({ units: units || staticUnits, settings, apiUnits: Boolean(units) }), [units, settings]);
  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}
export const useSiteData = () => useContext(SiteDataContext);
