import React, { useState ,useContext, useEffect, createContext} from 'react'
import { authDataContext } from './AuthContext'
import axios from 'axios'

export const userDataContext = createContext()

function UserContext({children}) {
  let [userData,setUserData] = useState("loading")
  let {serverUrl} = useContext(authDataContext)
  

  const getCurrentUser = async()=>{
    try {
      setUserData("loading")
      let result = await axios.get(serverUrl+'/api/user/currentuser',{withCredentials : true})
      console.log(result);
      setUserData(result?.data?.user)
    } catch (error) {
      console.log(error,"****");
      setUserData({})
    }
  }

  useEffect(()=>{
    getCurrentUser()
  },[])


  const value = {userData,setUserData}
  return (
    <div>
      <userDataContext.Provider value = {value}>
      {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext