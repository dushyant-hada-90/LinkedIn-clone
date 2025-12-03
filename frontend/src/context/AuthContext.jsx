import React, { createContext } from 'react'

export const authDataContext = createContext()
const serverUrl = "http://localhost:8000"
let value = {
    serverUrl,
}
function AuthContext({children}) {
  return (
    <div>
        <authDataContext.Provider value={value}>
        {children}
        </authDataContext.Provider>
    </div>
  )
}

export default AuthContext