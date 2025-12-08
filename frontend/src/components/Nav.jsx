import React, { useContext, useState } from 'react'
import logo2 from "../assets/logo2.png"
import { IoSearch } from "react-icons/io5";
import { TiHome } from "react-icons/ti";
import { FaUserFriends } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import noProfile from "../assets/noProfile.svg"
import {userDataContext} from "../context/UserContext"
import { authDataContext } from '../context/AuthContext';
import {Navigate,useNavigate} from "react-router-dom"
import axios from 'axios';

function Nav() {
  let [activeSearch,setActiveSearch] = useState(false)
  let {userData,setUserData} = useContext(userDataContext)
  let {serverUrl} = useContext(authDataContext)
  let navigate = useNavigate()
  let [showPopup, setShowPopup] = useState(false)


  const handleSignOut = async ()=>{
    try {
      let result = await axios.get(serverUrl+"/api/auth/logout",{withCredentials:true})
      setUserData({})
      navigate("/login")
      console.log(result);
    } catch (error) {
      console.log(error);
      
    }
  }
  
  return (
    <div className='w-full h-[80px] bg-[white] fixed top-0 shadow-lg flex flex-row justify-between px-[10px] md:justify-around items-center'>
      {/* left div */}
      <div className='flex justify-center items-center gap-[10px]'>
        <div onClick={()=>{setActiveSearch(false)}}>
          <img src={logo2} alt="logo2"className='w-[50px]' />
        </div>

        {!activeSearch && <div><IoSearch className='w-[23px] h-[23px] text-gray-700 lg:hidden' onClick={()=>{setActiveSearch(true)}}/></div>}
        

        <form action="" className={`lg:flex items-center gap-[10px] w-[190px] lg:w-[350px] h-[40px] bg-[#f0efe7] px-[10px] py-[5px] rounded-md  ${activeSearch?"flex":"hidden"}`}>
          <div><IoSearch className='w-[23px] h-[23px] text-gray-700' /></div>
          <input type="text" className='bg-transparent w-[80%] h-full outline-none border-0' placeholder='search users...'/>
        </form>
      </div>

      {/* right div */}
      <div className='flex justify-center items-center gap-[20px] relative'>
        {showPopup && 
          <div className='w-[300px] min-h-[300px] bg-white shadow-lg absolute top-[75px] rounded-lg flex flex-col items-center p-[20px] gap-[20px]'>
            <div className='w-[70px] h-[70px] rounded-full overflow-hidden'>
              <img src={noProfile} alt="dp" className='w-full h-full' />
            </div>
            <div className='text-[19px] font-semibold text-gray-700'>{`${userData.firstName} ${userData.lastName}`}</div>
            <button className='w-[100%] h-[40px] rounded-full border-2 border-[#2dc0ff] text-[#2dc0ff] cursor-pointer transition duration-200 hover:bg-[#2dc0ff] hover:text-white hover:shadow-md'>View Profile</button>
            <div className='w-full h-[1px] bg-gray-700'></div>
            <div className='flex items-center justify-start w-full text-gray-600 gap-[10px]'>
              <FaUserFriends className='w-[23px] h-[23px] text-gray-600' />
              <div>My Networks</div>
            </div>
            <button className="w-[100%] h-[40px] rounded-full border-2 border-[#ec4545] text-[#ec4545] cursor-pointer transition duration-200 hover:bg-[#ec4545] hover:text-white hover:shadow-md" onClick={handleSignOut}>Sign out</button>
          </div>
        }


        <div className='lg:flex flex-col items-center justify-center text-gray-600 hidden'>
          <TiHome className='w-[23px] h-[23px] text-gray-600'/>
          <div>Home</div>
        </div>
        <div className='md:flex flex-col items-center justify-center text-gray-600 hidden'>
          <FaUserFriends className='w-[23px] h-[23px] text-gray-600' />
          <div>My Networks</div>
        </div>
        <div className='flex flex-col items-center justify-center text-gray-600'>
          <IoIosNotifications className='w-[23px] h-[23px] text-gray-600' />
          <div className='hidden md:block'>Notifications</div>
        </div>
        <div className='w-[50px] h-[50px] rounded-full overflow-hidden cursor-pointer' onClick={()=>setShowPopup(prev=>!prev)}>
          <img src={noProfile} alt="dp" />
        </div>
      </div>
    </div>

    
  )
}

export default Nav