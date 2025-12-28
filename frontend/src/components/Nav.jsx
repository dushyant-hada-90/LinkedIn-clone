import React, { useContext, useState, useRef } from 'react'
import logo2 from "../assets/logo2.png"
import { IoSearch } from "react-icons/io5";
import { TiHome } from "react-icons/ti";
import { FaUserFriends } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import noProfile from "../assets/noProfile.svg"
import { userDataContext } from "../context/UserContext"
import { authDataContext } from '../context/AuthContext';
import { useNavigate } from "react-router-dom"
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

  // Common styles for Nav Items to replicate LinkedIn look
  const navItemClass = "flex flex-col items-center justify-center text-gray-500 hover:text-black cursor-pointer min-w-[60px] md:min-w-[80px] transition-colors duration-200 relative group h-full border-b-2 border-transparent hover:border-black/0"; 
  // Note: LinkedIn usually has an active border, but since we aren't passing active state props, I left the border transparent/subtle.

  return (
    <>
      {/* Placeholder div to prevent content jump because Navbar is fixed */}
      <div className="w-full h-[60px]"></div>

      {/* Main Navbar Container */}
      <div className='w-full h-[55px] sm:h-[60px] bg-white fixed top-0 left-0 border-b border-[#e5e7eb] z-50 px-4'>
        
        {/* Inner Content Limiter (Max Width for Large Screens like LinkedIn) */}
        <div className='max-w-[1128px] h-full mx-auto flex justify-between items-center'>

          {/* LEFT SIDE: Logo & Search */}
          <div className='flex items-center gap-2 md:gap-4'>
            {/* Logo */}
            <div 
              onClick={() => {
                setActiveSearch(false);
                navigate("/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="cursor-pointer flex-shrink-0"
            >
              <img src={logo2} alt="logo2" className='w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] object-contain' />
            </div>

            {/* Mobile Search Icon (Only shows when search inactive on small screens) */}
            {!activeSearch && (
              <div className='lg:hidden p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-all'>
                <IoSearch className='w-[24px] h-[24px] text-gray-600' onClick={() => setActiveSearch(true)} />
              </div>
            )}

            {/* Search Input Bar */}
            <form 
              className={`
                items-center bg-[#edf3f8] px-3 rounded-md transition-all duration-300 ease-in-out
                ${activeSearch ? "flex w-[200px] sm:w-[280px]" : "hidden lg:flex w-[280px]"}
                h-[34px]
              `}
            >
              <IoSearch className='w-[20px] h-[20px] text-gray-600 mr-2' />
              <input 
                type="text" 
                className='bg-transparent w-full outline-none border-0 text-sm text-gray-900 placeholder-gray-500' 
                placeholder='Search' 
              />
            </form>
          </div>

          {/* RIGHT SIDE: Navigation Icons */}
          <div className='flex items-center h-full gap-1 sm:gap-2 md:gap-6'>
            
            {/* Home */}
            <div className={navItemClass} onClick={() => navigate("/")}>
              <TiHome className='w-[24px] h-[24px] sm:w-[26px] sm:h-[26px]' />
              <span className='hidden md:block text-[12px] mt-0.5 font-medium'>Home</span>
            </div>

            {/* Network */}
            <div className={navItemClass} onClick={() => navigate("/network")}>
              <FaUserFriends className='w-[24px] h-[24px] sm:w-[26px] sm:h-[26px]' />
              <span className='hidden md:block text-[12px] mt-0.5 font-medium'>My Network</span>
            </div>

            {/* Notifications */}
            <div className={navItemClass}>
              <IoIosNotifications className='w-[24px] h-[24px] sm:w-[26px] sm:h-[26px]' />
              <span className='hidden md:block text-[12px] mt-0.5 font-medium'>Notifications</span>
            </div>

            {/* Profile Avatar Section (The "Me" part) */}
            <div 
              className={`${navItemClass} border-l border-gray-100 pl-2 sm:pl-6 md:border-none`}
              ref={avatarRef}
              onClick={(e) => {
                e.stopPropagation();
                const rect = avatarRef.current.getBoundingClientRect();
                setPopupPos({
                  top: rect.bottom + 10,
                  left: rect.right - 300, // Adjust alignment logic as needed
                });
                setShowPopup(prev => !prev);
              }}
            >
              <div className='w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] rounded-full overflow-hidden border border-gray-200'>
                <img src={userData.profileImage || noProfile} alt="dp" className='w-full h-full object-cover' />
              </div>
              <div className='hidden md:flex items-center gap-1'>
                 <span className='text-[12px] mt-0.5 font-medium'>Me</span>
                 {/* Optional Down Arrow could go here */}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Profile Card Popover (Logic unchanged, minimal style tweaks for consistency) */}
      <Popover
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        triggerRef={avatarRef}>
        <div
          className="fixed w-[280px] sm:w-[300px] min-h-[300px] bg-white shadow-xl rounded-lg border border-gray-100 flex flex-col items-center p-[20px] gap-[20px] z-[999]"
          style={{
            top: popupPos.top,
            left: popupPos.left,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='w-[70px] h-[70px] rounded-full overflow-hidden border border-gray-200'>
            <img src={userData.profileImage || noProfile} alt="dp" className='w-full h-full object-cover' />
          </div>
          <div className='text-[18px] font-semibold text-gray-800 text-center leading-tight'>
            {`${userData.firstName || "User"} ${userData.lastName || ""}`}
          </div>
          
          <button className='w-full h-[35px] rounded-full border border-[#0a66c2] text-[#0a66c2] font-semibold text-sm cursor-pointer transition duration-200 hover:bg-[#ebf4fd] hover:border-[#004182]' onClick={() => navigate("/profile")}>
            View Profile
          </button>
          
          <div className='w-full h-[1px] bg-gray-200 my-1'></div>
          
          <div className='flex items-center justify-start w-full text-gray-600 gap-[10px] cursor-pointer hover:bg-gray-100 p-2 rounded' onClick={() => navigate("/network")}>
            <FaUserFriends className='w-[20px] h-[20px] text-gray-600' />
            <div className='text-sm font-medium'>My Network</div>
          </div>
          
          <button className="w-full h-[35px] mt-2 text-gray-500 font-semibold text-sm cursor-pointer hover:bg-gray-100 rounded" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </Popover>
    </>
  )
}

export default Nav