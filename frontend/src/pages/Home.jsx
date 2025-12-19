import React, { useContext, useRef, useState } from 'react'
import Nav from '../components/Nav'
import noProfile from "../assets/noProfile.svg"
import { FaPlus } from "react-icons/fa";
import { MdOutlineCameraAlt } from "react-icons/md";
import { userDataContext } from '../context/UserContext';
import { HiPencil } from "react-icons/hi2";
import EditProfile from '../components/EditProfile';
import { RxCross1 } from "react-icons/rx";
import { BsImage } from "react-icons/bs";
import { authDataContext } from '../context/AuthContext';
import axios from 'axios';
import Message from '../components/Message';
import toast from 'react-hot-toast';
import Post from '../components/Post';

function Home() {
  let { userData, setUserData, edit, setEdit, postData, setPostData } = useContext(userDataContext)
  let { serverUrl } = useContext(authDataContext)

  let [postingStatus, setPostingStatus] = useState(false)
  let [frontendImage, setFrontendImage] = useState("")
  let [backendImage, setBackendImage] = useState("")
  let [description, setDescription] = useState("")
  let [uploadPost, setUploadPost] = useState(false)
  const image = useRef()

  function handleImage(e) {
    let file = e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  async function handleUploadPost() {
    try {
      setPostingStatus("loading")
      if (description === "") {
        toast('Please provide a description for the post !');
        setPostingStatus(false)
        return
      }
      let formdata = new FormData()
      formdata.append("description", description)
      if (backendImage) {
        formdata.append("image", backendImage)
      }
      let result = await axios.post(serverUrl + "/api/post/create", formdata, { withCredentials: true })
      if (result.status === 201) {
        setTimeout(() => setUploadPost(false), 1200);
        toast.success("post created successfully")
        setPostingStatus(false)
        return
      }
      setPostingStatus(result.status)
      console.log(result);

    } catch (error) {
      setPostingStatus(500)
      console.log(error)
    }
  }

  return (
    <div className='w-full min-h-[100vh]  bg-[#f0efe7] pt-[100px] flex justify-center gap-[20px] items-center lg:items-start px-[20px] flex-col md:flex-row relative pb-[50px]'>
      {edit && <EditProfile />}
      <Nav />


      <div className='w-full lg:w-[25%] min-h-[200px] bg-[white] shadow-lg rounded-lg p-[10px] relative'>

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
          <div className='text-[22px]'>{`${userData.firstName} ${userData.lastName}`}</div>
          <div className='text-[18px] font-semibold text-gray-600'>{`${userData.headline || "sample headline"}`}</div>
          <div className='text-[16px] text-gray-600'>{userData.location}</div>
        </div>

        <button className='w-[100%] h-[40px] rounded-full border-2 my-[20px] border-[#2dc0ff] text-[#2dc0ff] cursor-pointer transition duration-200 hover:bg-[#2dc0ff] hover:text-white hover:shadow-md flex justify-center items-center gap-[10px]' onClick={() => setEdit(true)}>View Profile <HiPencil />
        </button>

      </div>


      {uploadPost &&
        <div className='w-full h-full bg-black fixed  top-0 z-[100] opacity-[0.6] left-0'></div>}
      {uploadPost &&
        <div className="w-[90%] max-w-[500px]  max-h-[85dvh] h-[600px]  bg-white shadow-lg rounded-lg  fixed left-1/2 top-1/2  -translate-x-1/2 -translate-y-1/2  z-[200]  p-[20px]  pb-[env(safe-area-inset-bottom)]  flex flex-col gap-[20px]  overflow-y-auto">

          {/* cross */}
          <div className='absolute top-[20px] right-[20px] cursor-pointer' onClick={() => setUploadPost(false)} ><RxCross1 className='w-[25x] h-[25px] text-gray-800 font-bold' /></div>
          <div className='flex justify-start items-center gap-[10px]'>
            {/* profile Image */}
            <div className='w-[70px] h-[70px] rounded-full overflow-hidden flex items-center justify-center cursor-pointer '>
              <img src={userData.profileImage || noProfile} alt="dp" className='h-full' />
            </div>
            <div className='text-[22px]'>{`${userData.firstName} ${userData.lastName}`}</div>
          </div>
          <textarea className={`w-full ${frontendImage ? "h-[200px]" : 'h-[550px]'} outline-none border-none p-[10px] resize-none text-[19px]`} placeholder='What do you wanna talk about ?' value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
          <input type="file" ref={image} hidden onChange={handleImage} />
          <div className='w-full h-[300px] overflow-hidden flex justify-center items-center'>
            <img src={frontendImage || null} alt="" className='h-full rounded-lg' />
          </div>
          <div className='w-full h-[200px] flex flex-col '>
            <div className='p-[20px] flex items-center justify-start border-b-2 border-gray-500'>
              <BsImage className='w-[24px] h-[24px] text-gray-500' onClick={() => image.current.click()} />
            </div>

            <div className='flex justify-end items-center gap-[10px]'>
              <Message status={postingStatus} />
              <button className='w-[100px] h-[50px]  rounded-full border-2 bg-[#24b2ff] text-[white] cursor-pointer transition duration-200  hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed' disabled={postingStatus === "loading"} onClick={handleUploadPost}>Post</button>
            </div>
          </div>
        </div>
      }

      <div className='w-full lg:w-[50%] min-h-[200px] bg-[#f0efe7] flex flex-col gap-[20px]'>
        <div className='w-full h-[120px] bg-white shadow-lg rounded-lg p-[20px] flex items-center justify-center gap-[10px]'>
          <div className='w-[70px] h-[70px] rounded-full overflow-hidden   flex items-center justify-center  cursor-pointer'>
            <img src={userData.profileImage || noProfile} alt="dp" className='h-full' />
          </div>
          <button className='w-[80%] h-[60%] border-2 border-gray-500 rounded-full flex items-center justify-start px-[20px] cursor-pointer hover:bg-gray-200' onClick={() => { setUploadPost(true); setDescription(""); setPostingStatus(false) }}>start a post</button>
        </div>
        {postData.map((post, index) => (
          <Post key={index} index={index} id={post._id} description={post.description} author={post.author} image={post.image} like={post.like} 
          comment={post.comment} createdAt={post.createdAt} />
        ))}
      </div>

      <div className='w-full lg:w-[25%] min-h-[200px] bg-[white] shadow-lg'>

      </div>

    </div>
  )
}

export default Home