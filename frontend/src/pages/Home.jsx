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
// import Post from '../components/Post';
import Feed from '../components/Feed';

function Home() {
  let { userData, setUserData, edit, setEdit } = useContext(userDataContext)
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
    <div className='w-full min-h-screen bg-[#f3f2ef] font-sans pb-10'>
      
      {edit && <EditProfile />}
      <Nav />

      {/* --- Main Layout Grid --- */}
      {/* Added pt-[75px] to clear the fixed Nav (approx 60px) + 15px gap */}
      <div className='max-w-[1128px] mx-auto px-2 md:px-4 pt-[15px] grid grid-cols-1 md:grid-cols-12 gap-5'>

        {/* --- LEFT SIDEBAR (Profile) --- */}
        {/* Mobile: Full Width, Tablet: 4 cols, Desktop: 3 cols */}
        <div className='md:col-span-4 lg:col-span-3 flex flex-col gap-2'>
          <div className='bg-white shadow-sm border border-gray-300 rounded-lg overflow-hidden relative'>
            
            {/* Banner Image */}
            <div
              className='w-full h-[60px] bg-[#a0b4b7] relative cursor-pointer hover:opacity-90 transition-opacity'
              onClick={() => setEdit(true)}
            >
              {userData.coverImage &&
                <img src={userData.coverImage || null} alt="cover" className='w-full h-full object-cover' />}
              {/* Optional Camera Icon for Owner */}
              {/* <div className='absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-[#0a66c2]'>
                <MdOutlineCameraAlt className='w-4 h-4' />
              </div> */}
            </div>

            {/* Profile Picture Area */}
            <div className='relative px-4 pb-4 text-center border-b border-gray-200'>
              <div
                className='relative -mt-[38px] mx-auto w-[72px] h-[72px] bg-white rounded-full p-0.5 cursor-pointer'
                onClick={() => setEdit(true)}
              >
                <img
                  src={userData.profileImage || noProfile}
                  alt="dp"
                  className='w-full h-full rounded-full object-cover border-2 border-white box-content'
                />
              </div>

              {/* User Info */}
              <div className='mt-3 cursor-pointer hover:underline decoration-1' onClick={() => setEdit(true)}>
                <div className='text-[16px] font-semibold text-gray-900 leading-tight'>
                  {`${userData.firstName} ${userData.lastName}`}
                </div>
              </div>
              <div className='text-[12px] text-gray-500 mt-1 leading-snug line-clamp-2'>
                {userData.headline || "Add a headline"}
              </div>
            </div>

            {/* Stats / Widget Links */}
            <div className='py-3'>
              <div className='px-3 py-1 hover:bg-gray-100 cursor-pointer flex justify-between items-center'>
                 <div className='text-xs font-semibold text-gray-500'>Who's viewed your profile</div>
                 <div className='text-xs font-semibold text-[#0a66c2]'>32</div>
              </div>
              <div className='px-3 py-1 hover:bg-gray-100 cursor-pointer flex justify-between items-center'>
                 <div className='text-xs font-semibold text-gray-500'>Connections</div>
                 <div className='text-xs font-semibold text-[#0a66c2]'>{userData.connections || 150}</div>
              </div>
            </div>

            {/* Edit Button (Mobile Only or Bottom Link) */}
            <div className='border-t border-gray-200 hover:bg-gray-100 transition cursor-pointer p-3 flex items-center gap-2 text-xs font-semibold text-gray-600' onClick={() => setEdit(true)}>
               <HiPencil /> Edit Profile
            </div>
          </div>
        </div>


        {/* --- MIDDLE COLUMN (Feed) --- */}
        {/* Mobile: Full Width, Tablet: 8 cols, Desktop: 6 cols */}
        <div className='md:col-span-8 lg:col-span-6 flex flex-col gap-4'>

          {/* Start Post Widget */}
          <div className='bg-white shadow-sm border border-gray-300 rounded-lg p-3 sm:p-4 flex flex-col gap-2'>
            <div className='flex gap-3 items-center'>
              <div className='w-12 h-12 flex-shrink-0 rounded-full overflow-hidden cursor-pointer border border-gray-200'>
                <img src={userData.profileImage || noProfile} alt="dp" className='w-full h-full object-cover' />
              </div>

              <button
                className='flex-grow h-12 border border-gray-400 rounded-full text-left px-5 text-gray-500 font-semibold hover:bg-gray-100 transition duration-200 bg-white text-sm'
                onClick={() => { setUploadPost(true); setDescription(""); setPostingStatus(false) }}
              >
                Start a post
              </button>
            </div>

            <div className='flex justify-between items-center pt-1 px-2 sm:px-4'>
              <div className='flex items-center gap-2 p-2 sm:p-3 hover:bg-gray-100 rounded-md cursor-pointer transition' onClick={() => { setUploadPost(true); }}>
                <BsImage className='text-[#378fe9] text-lg' />
                <span className='text-sm font-semibold text-gray-600'>Media</span>
              </div>
              {/* Added Dummy Buttons for Visual Completeness */}
              <div className='hidden sm:flex items-center gap-2 p-3 hover:bg-gray-100 rounded-md cursor-pointer transition'>
                <span className='text-[#c37d16] font-bold text-lg'>📅</span>
                <span className='text-sm font-semibold text-gray-600'>Event</span>
              </div>
              <div className='hidden sm:flex items-center gap-2 p-3 hover:bg-gray-100 rounded-md cursor-pointer transition'>
                <span className='text-[#e06847] font-bold text-lg'>📰</span>
                <span className='text-sm font-semibold text-gray-600'>Article</span>
              </div>
            </div>
          </div>

          {/* Sort Divider */}
          <div className='flex items-center gap-1 mb-1'>
            <div className='h-[1px] bg-gray-300 flex-1'></div>
            <span className='text-xs text-gray-500'>Sort by: <span className='font-bold text-gray-900 cursor-pointer'>Top</span></span>
          </div>

          {/* Feed Component */}
          <Feed />
        </div>


        {/* --- RIGHT COLUMN (Widgets/News) --- */}
        {/* Hidden on Tablet/Mobile, Visible on Desktop (3 cols) */}
        <div className='hidden lg:block lg:col-span-3'>
          <div className='bg-white shadow-sm border border-gray-300 rounded-lg p-4'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-[16px] font-semibold text-gray-900'>LinkedIn News</h2>
              <div className='text-gray-500 cursor-pointer hover:text-gray-700'>
                 <span className='text-xl'>ⓘ</span>
              </div>
            </div>
            <ul className='space-y-4'>
              <li className='cursor-pointer group'>
                <div className='flex items-center gap-2'>
                   <div className='w-2 h-2 bg-gray-500 rounded-full'></div>
                   <div className='text-sm font-semibold text-gray-700 line-clamp-1 group-hover:text-[#0a66c2] group-hover:underline'>Top skills in 2025</div>
                </div>
                <div className='text-xs text-gray-500 pl-4'>2d ago • 10,934 readers</div>
              </li>
              <li className='cursor-pointer group'>
                 <div className='flex items-center gap-2'>
                   <div className='w-2 h-2 bg-gray-500 rounded-full'></div>
                   <div className='text-sm font-semibold text-gray-700 line-clamp-1 group-hover:text-[#0a66c2] group-hover:underline'>Tech hiring stabilizes</div>
                </div>
                <div className='text-xs text-gray-500 pl-4'>18h ago • 5,213 readers</div>
              </li>
              <li className='cursor-pointer group'>
                 <div className='flex items-center gap-2'>
                   <div className='w-2 h-2 bg-gray-500 rounded-full'></div>
                   <div className='text-sm font-semibold text-gray-700 line-clamp-1 group-hover:text-[#0a66c2] group-hover:underline'>New AI regulations</div>
                </div>
                <div className='text-xs text-gray-500 pl-4'>5h ago • 2,099 readers</div>
              </li>
            </ul>
            <button className='mt-4 text-sm text-gray-500 font-semibold flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition'>
              Show more <span className='text-lg'>⌄</span>
            </button>
          </div>
        </div>

      </div>

      {/* --- MODAL (Upload Post) --- */}
      {/* Increased z-index to 60 to appear above the Navbar (z-50) */}
      {uploadPost && (
        <div className='fixed inset-0 z-[60] bg-black/70 flex items-start sm:items-center justify-center p-0 sm:p-4'>
          <div className="w-full h-full sm:h-auto sm:max-w-[552px] bg-white sm:rounded-xl shadow-xl flex flex-col max-h-screen sm:max-h-[90vh] overflow-hidden animate-fadeIn">

            {/* Modal Header */}
            <div className='flex justify-between items-center px-6 py-4 border-b border-gray-200'>
              <h2 className='text-xl font-normal text-gray-700'>Create a post</h2>
              <button
                onClick={() => setUploadPost(false)}
                className='p-2 rounded-full hover:bg-gray-100 text-gray-600 transition'
              >
                <RxCross1 size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className='flex-1 overflow-y-auto p-6 scrollbar-hide'>
              {/* User Identity in Modal */}
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 rounded-full overflow-hidden border border-gray-100'>
                  <img src={userData.profileImage || noProfile} alt="dp" className='w-full h-full object-cover' />
                </div>
                <div className='flex flex-col'>
                  <span className='font-semibold text-gray-800 text-lg'>
                    {`${userData.firstName} ${userData.lastName}`}
                  </span>
                  <button className='text-sm text-gray-500 border border-gray-500 px-3 py-1 rounded-full w-fit font-semibold hover:bg-gray-100 transition flex items-center gap-1'>
                    Anyone <span>▼</span>
                  </button>
                </div>
              </div>

              <textarea
                className={`w-full ${frontendImage ? "h-[100px]" : 'h-[200px]'} outline-none border-none text-lg text-gray-800 placeholder:text-gray-500 resize-none`}
                placeholder='What do you want to talk about?'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />

              {/* Image Preview */}
              {frontendImage && (
                <div className='w-full mt-2 rounded-lg overflow-hidden border border-gray-200 relative bg-gray-50'>
                  <button onClick={() => { setFrontendImage(""); setBackendImage("") }} className='absolute top-2 right-2 bg-gray-800/80 text-white p-1 rounded-full hover:bg-black transition'><RxCross1 /></button>
                  <img src={frontendImage} alt="preview" className='w-full object-contain max-h-[300px]' />
                </div>
              )}

              <input type="file" ref={image} hidden onChange={handleImage} />
            </div>

            {/* Modal Footer */}
            <div className='px-6 py-4 flex items-center justify-between border-t border-gray-100'>
              <div className='flex items-center gap-2'>
                <button
                  className='p-2 hover:bg-gray-100 rounded-full text-gray-600 transition'
                  title="Add Media"
                  onClick={() => image.current.click()}
                >
                  <BsImage size={20} />
                </button>
                {/* Visual Only Buttons */}
                <button className='p-2 hover:bg-gray-100 rounded-full text-gray-600 transition hidden sm:block'><span className='font-bold'>📅</span></button>
                <button className='p-2 hover:bg-gray-100 rounded-full text-gray-600 transition hidden sm:block'><span className='font-bold'>➕</span></button>
              </div>

              <div className='flex items-center gap-3'>
                <Message status={postingStatus} />
                <button
                  className='px-6 py-1.5 rounded-full bg-[#0a66c2] text-white font-semibold text-sm hover:bg-[#004182] disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                  disabled={postingStatus === "loading" || (!description && !backendImage)}
                  onClick={handleUploadPost}
                >
                  Post
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Home