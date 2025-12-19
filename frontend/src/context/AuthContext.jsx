import React, { createContext } from 'react'


const serverUrl = import.meta.env.VITE_SERVER_URL;


export const authDataContext = createContext()
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