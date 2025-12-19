import React, { useContext, useEffect, useState } from 'react'
import moment from "moment"
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { TfiCommentAlt } from "react-icons/tfi";
import { LuSend } from "react-icons/lu";
import { BiRepost } from "react-icons/bi";
import { authDataContext } from "../context/AuthContext"
import axios from "axios"
import { userDataContext } from '../context/UserContext';
import toast from 'react-hot-toast';
import { AiOutlineSend } from "react-icons/ai";
import noProfile from "../assets/noProfile.svg";
import { io } from "socket.io-client"
import ConnectionButton from './ConnectionButton';

let socket = io("http://localhost:8000")
function Post({ index, id, author, like, comment, description, image, createdAt }) {
  let [more, setMore] = useState(false)
  let { serverUrl } = useContext(authDataContext)
  let { userData, setUserData, getPost, postData, setPostData } = useContext(userDataContext)
  let [likes, setLikes] = useState(like || [])
  let [likeStatus, setLikeStatus] = useState(false)
  let [commentContent, setCommentContent] = useState("")
  let [comments, setComments] = useState(comment || [])
  let [commentStatus, setCommentStatus] = useState(false)
  let [showComments, setShowComments] = useState(false)
  const handleLike = async () => {
    try {
      setLikeStatus("loading")
      let result = await axios.get(serverUrl + `/api/post/like/${id}`, { withCredentials: true })

      setLikes(result.data.post.like);
      setLikeStatus(result.status)
      // console.log(likes);

    } catch (error) {
      console.log(error);
      toast.error("unable to like post")
      setLikeStatus(500)

    }
  }
  const handleComment = async (e) => {
    e.preventDefault()
    try {
      setCommentStatus("loading")
      let result = await axios.post(serverUrl + `/api/post/comment/${id}`, { content: commentContent }, { withCredentials: true })
      console.log(result);

      setComments(result.data.post.comment);
      toast.success("commented successfully")
      setCommentStatus(result.status)
      setCommentContent("")

    } catch (error) {
      console.log(error);
      toast.error("unable to comment")
      setCommentStatus(500)

    }
  }
  useEffect(() => {
    socket.on("likeUpdated", ({ postId, likes }) => {
      if (postId == id) {
        setLikes(likes)
      }
    })
    socket.on("cpmmentAdded", ({ postId, comm }) => {
      if (postId == id) {
        setComments(comm)
      }
    })
    return () => {
      socket.off("likeUpdated")
      socket.off("commentAdded")
    }
  }, [id])
  // useEffect(()=>{

  //   getPost()
  //   console.log("for",index);

  //   console.log("useEffect ran from pos.jsx",postData);
  //   console.log("likes from pos.jsx",likes);
  //   },[likes,setLikes])

  return (
    <div className='w-full min-h-[200px] flex flex-col gap-[10px] bg-white rounded-lg shadow-lg p-[20px]'>

      <div className='flex justify-between items-center'>

        <div className='flex justify-center items-start gap-[10px]'>
          <div className='w-[70px] h-[70px] rounded-full overflow-hidden flex items-center justify-center cursor-pointer ' >
            <img src={author.profileImage || noProfile} alt="dp" className='h-full' />
          </div>
          <div>
            <div className='text-[22px] font-bold'>{`${author.firstName} ${author.lastName}`}</div>
            <div className='text-[16px]'>{`${author.headline}`}</div>
            <div className='text-[16px]'>{moment(createdAt).fromNow()}</div>
          </div>
        </div>
        <div>
          {
            userData._id != author._id &&
            <ConnectionButton userId={author._id} />
          }
        </div>
      </div>

      <div className={`w-full ${more ? "" : "max-h-[100px] overflow-hidden"} pl-[50px]`}>{description}</div>
      <div className='pl-[50px]  font-semibold cursor-pointer' onClick={() => setMore(prev => !prev)}>{more ? "read less" : "read more .."}.</div>
      {image &&
        <div className='w-full h-[300px] overflow-hidden flex justify-center rounded-lg'>
          <img src={image} alt="" className='h-full rounded-lg' />
        </div>
      }
      <div>
        <div className='w-full flex justify-between items-center p-[20px] border-b-2'>
          <div className='flex items-center justify-center gap-[5px] text-[18px]'>
            <AiOutlineLike className='text-[#1ebbff] w-[20px] h-[20px] ' />
            <span>{likes.length}</span>
          </div>

          <div className='flex items-center justify-center gap-[5px] text-[18px]  cursor-pointer' onClick={() => setShowComments(prev => !prev)}>
            <TfiCommentAlt className='w-[20px] h-[20px] text-black' />
            <span>{comment.length}</span>
          </div>
        </div>

        <div className='flex justify-start items-center w-full p-[20px] gap-[20px]'>

          {/* Like */}
          <div className={`flex justify-center items-center gap-[5px] cursor-pointer  ${likeStatus === 'loading' ? 'pointer-events-none' : ''}`} onClick={handleLike}>
            {likeStatus === 'loading' ? (
              // Loading indicator
              <div className='w-[30px] h-[30px] border-4 border-gray-300 border-t-blue-400 rounded-full animate-spin'></div>
            ) : likes.includes(userData._id) ? (
              // Liked state
              <AiFillLike className='w-[30px] h-[30px] text-blue-400' />
            ) : (
              // Default like state
              <AiOutlineLike className='w-[30px] h-[30px]' />
            )}
            <span className='inline-block min-w-[50px] text-center'>
              {likeStatus === 'loading'
                ? ''
                : likes.includes(userData._id)
                  ? 'Liked'
                  : 'Like'}
            </span>
          </div>
          {/* comment */}
          <div className='flex justify-center items-center gap-[5px] cursor-pointer' onClick={() => setShowComments(prev => !prev)}>
            <TfiCommentAlt className=' w-[24px] h-[24px] ' />
            <span>Comment</span>
          </div>
          <div className='flex justify-center items-center gap-[5px]'>
            <BiRepost className=' w-[30px] h-[30px] ' />
            <span>repost</span>
          </div>
          <div className='flex justify-center items-center gap-[5px]'>
            <LuSend className=' w-[30px] h-[30px] ' />
            <span>Send</span>
          </div>
        </div>
        {
          showComments &&
          <div>
            <form action="" className=' w-full flex justify-between items-center border-b-2 border-b-gray-300 p-[10px]' onSubmit={handleComment}>
              <input type="text" placeholder='leave a comment' className='outline-none  border-none w-full' value={commentContent} onChange={(e) => setCommentContent(e.target.value)} />
              <button><AiOutlineSend className='text-[#07a4ff] w-[22px] h-[22px]' /></button>
            </form>
            <div className='flex flex-col gap-[20px]'>
              {comments.map((com) => (
                <div className='flex flex-col gap-[20px] border-b-2 border-b-gray-300 p-[20px]' key={com._id}>
                  <div className='w-full flex justify-start items-center gap-[0px]'>
                    <div className='w-[40px] h-[40px] rounded-full overflow-hidden flex items-center justify-center  cursor-pointer ' >
                      <img src={com.user.profileImage || noProfile} alt="dp" className='h-full' />
                    </div>
                    <div>
                      <div className='text-[22px] font-semibold'>{`${com.user.firstName} ${com.user.lastName}`}</div>
                      <div>{moment(com.createdAt).fromNow()}</div>
                    </div>

                  </div>
                  <div className='pl-[30px]'>{com.content}</div>
                </div>
              ))}
            </div>
          </div>
        }

      </div>


    </div>
  )
}

export default Post