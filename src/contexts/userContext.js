import React, { useState } from 'react'

const UserContext = React.createContext()

export const useUser = () => React.useContext(UserContext)

export const UserProvider = ({ children }) => {
  const [address, setAddress] = useState()

  const value = React.useMemo(() => ({ address, setAddress }), [address, setAddress])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
