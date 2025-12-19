import React, { useState ,useContext, useEffect, createContext} from 'react'
import { authDataContext } from './AuthContext'
import axios from 'axios'

export const userDataContext = createContext()

function UserContext({children}) {
  let [userData,setUserData] = useState("loading")
  let {serverUrl} = useContext(authDataContext)
  let [edit,setEdit] = useState(false)
  let [postData,setPostData] = useState([])

  const getCurrentUser = async()=>{
    try {
      setUserData("loading")
      let result = await axios.get(serverUrl+'/api/user/currentuser',{withCredentials : true})
      // console.log(result);
      setUserData(result?.data?.user)
    } catch (error) {
      console.log(error,"****");
      setUserData({})
    }
  }
  
  const getPost = async ()=> {
    try {
      let result = await axios.get(serverUrl+"/api/post/getpost",{withCredentials:true})
      // console.log(result.data.post)
      setPostData(result.data.post)
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(()=>{
    console.log("use effect from userContext.jsx ran");
    
    getCurrentUser()
    getPost()
  },[])


  const value = {userData,setUserData,edit,setEdit,postData,setPostData,getPost}
  return (
    <div>
      <userDataContext.Provider value = {value}>
      {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext