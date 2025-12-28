import React, { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import { FaPlus } from 'react-icons/fa'
import { HiPencil } from 'react-icons/hi2'
import { MdOutlineCameraAlt } from 'react-icons/md'
import noProfile from "../assets/noProfile.svg"
import { useContext } from 'react'
import { userDataContext } from '../context/UserContext'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import EditProfile from '../components/EditProfile'
import { useInfinitePosts } from "../hooks/useInfinitePosts";

function Profile() {
    let { userData, setUserData, edit, setEdit, postData, setPostData } = useContext(userDataContext)
    let { serverUrl } = useContext(authDataContext)
    let [userConnection,setUserConnection] = useState([])
    let {posts} = useInfinitePosts(serverUrl)

    const handleGetUserConnection = async ()=>{
        try {
            let result = await axios.get(`${serverUrl}/api/connection/connection`,{withCredentials:true})
            // console.log(result);
            
            setUserConnection(result.data.connection)
        } catch (error) {
            console.log(error);
            
        }
    }

    useEffect(()=>{
        handleGetUserConnection()
    },[])
    return (
        <div className='w-full min-h-[100vh] bg-[#f0efe7] flex flex-col items-center pt-[100px] '>
            <Nav />
            {edit && <EditProfile/>}
            <div className='w-full max-w-[900px] min-h-[100vh] flex flex-col gap-[10px]'>

                <div className='relative bg-[white] pb-[40px] rounded shadow-lg'>
                    <div className='w-full h-[100px] bg-gray-400 rounded overflow-hidden flex items-center justify-center  relative cursor-pointer' onClick={() => setEdit(true)}>
                        <img src={userData.coverImage || null} alt="" className='w-full' />
                        <MdOutlineCameraAlt className='absolute right-[20px] top-[20px] w-[25px] h-[25px] text-white' />
                    </div>

                    <div className='w-[70px] h-[70px] rounded-full overflow-hidden flex items-center justify-center absolute top-[65px] left-[35px] cursor-pointer ' onClick={() => setEdit(true)}>
                        <img src={userData.profileImage || noProfile} alt="dp" className='h-full' />
                    </div>
                    <div className='w-[20px] h-[20px] bg-[#17c1ff] absolute top-[105px] left-[90px] rounded-full flex justify-center items-center  cursor-pointer' onClick={() => setEdit(true)}>
                        <FaPlus className='text-white' />
                    </div>
                    <div className='font-semibold text-gray-700 mt-[30px] pl-[20px]'>
                        <div className='text-[24px] font-bold'>{`${userData.firstName} ${userData.lastName}`}</div>
                        <div className='text-[18px] font-semibold text-gray-600'>{`${userData.headline || "sample headline"}`}</div>
                        <div className='text-[16px] text-gray-600'>{userData.location}</div>
                        <div className='text-[16px] text-gray-600'>{`${userConnection.length} connections`}</div>
                    </div>

                    <button className='min-w-[250px] h-[40px] mx-[20px] rounded-full border-2 my-[20px] border-[#2dc0ff] text-[#2dc0ff] cursor-pointer transition duration-200 hover:bg-[#2dc0ff] hover:text-white hover:shadow-md flex justify-center items-center gap-[10px]' onClick={() => setEdit(true)}>View Profile <HiPencil />
                    </button>

                </div>
                <div className='w-full h-[100px] flex items-center p-[20px] text-[22px] text-gray-600 font-semibold bg-white shadow-lg rounded-lg'>{`Posts (${posts.length})`}</div>
            </div>
        </div>
    )
}

export default Profile