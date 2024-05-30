import { createContext, useState } from "react";

export const SettingsContext = createContext({
  notif: true,
  getSettings: (notif) => {},
});

function SettingsContextProvider({ children }) {
  const [notif, setNoitf] = useState(true);

  function getSettings(gotNotif) {
    setNoitf(gotNotif);
  }

  const value = {
    notif: notif,
    getSettings: getSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export default SettingsContextProvider;
