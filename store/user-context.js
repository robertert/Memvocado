import { createContext, useState } from "react";

export const UserContext = createContext({
  id: "",
  name: "",
  getUser: (name,id) => {},
  delUser: () => {},
});

function UserContextProvider({ children }) {
  const [name, setName] = useState("");
  const [id, setId] = useState();

  function getUser(gotName, gotId) {
    setId(gotId);
    setName(gotName);
  }

  function delUser() {
    setId(null);
    setName(null);
  }


  const value = {
    id: id,
    name: name,
    getUser: getUser,
    delUser: delUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export default UserContextProvider;
