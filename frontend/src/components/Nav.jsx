import React, { useContext, useState, useRef } from 'react'
import logo2 from "../assets/logo2.png"
import { IoSearch } from "react-icons/io5";
import { TiHome } from "react-icons/ti";
import { FaUserFriends } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import noProfile from "../assets/noProfile.svg"
import { userDataContext } from "../context/UserContext"
import { authDataContext } from '../context/AuthContext';
import { Navigate, useNavigate } from "react-router-dom"
import axios from 'axios';
import Popover from './Popover';

function Nav() {
  let [activeSearch, setActiveSearch] = useState(false)
  let { userData, setUserData } = useContext(userDataContext)
  let { serverUrl } = useContext(authDataContext)
  let navigate = useNavigate()
  let [showPopup, setShowPopup] = useState(false)
  const avatarRef = useRef(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });



  const handleSignOut = async () => {
    try {
      let result = await axios.get(serverUrl + "/api/auth/logout", { withCredentials: true })
      setUserData({})
      navigate("/login")
      console.log(result);
    } catch (error) {
      console.log(error);

    }
  }

  return (
    <>
      <div className='w-full h-[80px] bg-[white] fixed top-0 shadow-lg flex flex-row justify-between px-[10px] left-0 md:justify-around items-center z-80'>
        {/* left div */}
        <div className='flex justify-center items-center gap-[10px] cursor-pointer'>
          <div onClick={() => { setActiveSearch(false);navigate("/") }}>
            <img src={logo2} alt="logo2" className='w-[50px]' />
          </div>

          {!activeSearch && <div><IoSearch className='w-[23px] h-[23px] text-gray-700 lg:hidden' onClick={() => { setActiveSearch(true) }} /></div>}


          <form action="" className={`lg:flex items-center gap-[10px] w-[190px] lg:w-[350px] h-[40px] bg-[#f0efe7] px-[10px] py-[5px] rounded-md  ${activeSearch ? "flex" : "hidden"}`}>
            <div><IoSearch className='w-[23px] h-[23px] text-gray-700' /></div>
            <input type="text" className='bg-transparent w-[80%] h-full outline-none border-0' placeholder='search users...' />
          </form>
        </div>

        {/* right div */}
        <div className='flex justify-center items-center gap-[20px] relative'>
          <div className='lg:flex flex-col items-center justify-center text-gray-600 hidden'>
            <TiHome className='w-[23px] h-[23px] text-gray-600' />
            <div>Home</div>
          </div>
          <div className='md:flex flex-col items-center justify-center text-gray-600 hidden cursor-pointer' onClick={()=>navigate("/network")}>
            <FaUserFriends className='w-[23px] h-[23px] text-gray-600' />
            <div>My Networks</div>
          </div>
          <div className='flex flex-col items-center justify-center text-gray-600'>
            <IoIosNotifications className='w-[23px] h-[23px] text-gray-600' />
            <div className='hidden md:block'>Notifications</div>
          </div>
          <div className='w-[50px] h-[50px] rounded-full overflow-hidden flex items-center justify-center cursor-pointer' ref={avatarRef}
            onClick={(e) => {
              e.stopPropagation();
              const rect = avatarRef.current.getBoundingClientRect();
              setPopupPos({
                top: rect.bottom + 30,  // 8px below icon
                left: rect.right - 300,// align left edges
              });
              setShowPopup(prev => !prev);
            }}>
            <img src={userData.profileImage || noProfile} alt="dp" className='h-full' />
          </div>
        </div>
      </div>

      <Popover isOpen={showPopup} onClose={() => setShowPopup(false)} triggerRef={avatarRef}>
        <div
          className="fixed w-[300px] min-h-[300px] bg-white shadow-lg rounded-lg flex flex-col items-center p-[20px] gap-[20px] z-[999]"
          style={{
            top: popupPos.top,
            left: popupPos.left,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='w-[70px] h-[70px] rounded-full overflow-hidden'>
            <img src={userData.profileImage || noProfile} alt="dp" className='w-full h-full' />
          </div>
          <div className='text-[19px] font-semibold text-gray-700'>{`${userData.firstName} ${userData.lastName}`}</div>
          <button className='w-[100%] h-[40px] rounded-full border-2 border-[#2dc0ff] text-[#2dc0ff] cursor-pointer transition duration-200 hover:bg-[#2dc0ff] hover:text-white hover:shadow-md'>View Profile</button>
          <div className='w-full h-[1px] bg-gray-700'></div>
          <div className='flex items-center justify-start w-full text-gray-600 gap-[10px]  cursor-pointer' onClick={()=>navigate("/network")}>
            <FaUserFriends className='w-[23px] h-[23px] text-gray-600' />
            <div>My Networks</div>
          </div>
          <button className="w-[100%] h-[40px] rounded-full border-2 border-[#ec4545] text-[#ec4545] cursor-pointer transition duration-200 hover:bg-[#ec4545] hover:text-white hover:shadow-md" onClick={handleSignOut}>Sign out</button>
        </div>
      </Popover>
    </>


  )
}

export default Nav