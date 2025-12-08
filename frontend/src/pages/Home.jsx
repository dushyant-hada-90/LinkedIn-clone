import React, { useContext } from 'react'
import Nav from '../components/Nav'
import noProfile from "../assets/noProfile.svg"
import { FaPlus } from "react-icons/fa";
import { MdOutlineCameraAlt } from "react-icons/md";
import { userDataContext } from '../context/UserContext';

function Home() {
  let {userData,setUserData} = useContext(userDataContext)
  return (
    <div className='w-full min-h-[100vh]  bg-[#f0efe7] pt-[100px] flex justify-center gap-[20px] items-start px-[20px] flex-col lg:flex-row'>
      <Nav/>

      <div className='w-full lg:w-[25%] min-h-[200px] bg-[white] shadow-lg rounded-lg p-[10px] relative'>

        <div className='w-full h-[100px] bg-gray-400 rounded overflow-hidden flex items-center justify-center  relative cursor-pointer'>
          <img src={null} alt="" className='w-full'/>
          <MdOutlineCameraAlt className='absolute right-[20px] top-[20px] w-[25px] h-[25px] text-gray-800' />
        </div>

        <div className='w-[70px] h-[70px] rounded-full overflow-hidden flex items-center justify-center absolute top-[65px] left-[35px] cursor-pointer'>
          <img src={noProfile} alt="dp" className='h-full' />
        </div>
        <div className='w-[20px] h-[20px] bg-[#17c1ff] absolute top-[105px] left-[90px] rounded-full flex justify-center items-center  cursor-pointer'>
            <FaPlus className='text-white' />
        </div>
        <div className='text-[19px] font-semibold text-gray-700 mt-[30px] pl-[20px]'>{`${userData.firstName} ${userData.lastName}`}</div>
      </div>

      <div className='w-full lg:w-[50%] min-h-[200px] bg-[white] shadow-lg'>

      </div>

      <div className='w-full lg:w-[25%] min-h-[200px] bg-[white] shadow-lg'>

      </div>
      
    </div>
  )
}

export default Home