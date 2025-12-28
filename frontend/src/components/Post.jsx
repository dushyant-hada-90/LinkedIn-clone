import React, { useContext, useEffect, useRef, useState } from 'react'
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
import { BsThreeDotsVertical } from "react-icons/bs";
import Popover from './Popover';
const socket = io(import.meta.env.VITE_SERVER_URL);



function Post({ post, onPostUpdate, onPostDelete }) {

  const {
    _id,
    author,
    like,
    comment,
    description,
    image,
    createdAt,
    status
  } = post;


  let [more, setMore] = useState(false)
  let { serverUrl } = useContext(authDataContext)
  let { userData } = useContext(userDataContext)
  let [likes, setLikes] = useState(like || [])
  let [likeStatus, setLikeStatus] = useState(false)
  let [commentContent, setCommentContent] = useState("")
  let [commentStatus, setCommentStatus] = useState(false)
  let [showComments, setShowComments] = useState(false)
  const [popupPos, setPopupPos] = useState({})
  let commentRef = useRef(null)
  const [activeComment, setActiveComment] = useState(null);
  const [isEditing, setIsEditing] = useState(null)
  const [editText, setEditText] = useState("");


  const handleLikePost = async () => {
    try {
      setLikeStatus("loading")
      let result = await axios.get(serverUrl + `/api/post/like/${_id}`, { withCredentials: true })

      // setLikes(result.data.post.like);
      setLikeStatus(result.status)
      onPostUpdate(result.data.post)
      // console.log(likes);

    } catch (error) {
      console.log(error);
      toast.error("unable to like post")
      setLikeStatus(500)

    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    // console.log(commentContent)
    try {
      if (commentStatus == "loading") { return }
      if (commentContent === "") {
        toast("⚠️ Can't file an empty comment")
        return
      }
      setCommentStatus("loading")
      let result = await axios.post(serverUrl + `/api/post/comment/${_id}`, { content: commentContent }, { withCredentials: true })
      console.log(result);

      toast.success("commented successfully")
      setCommentStatus(result.status)
      setCommentContent("")
      onPostUpdate(result.data.post)

    } catch (error) {
      console.log(error);
      toast.error("unable to comment, please try again")
      setCommentStatus(500)

    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      console.log(commentId, post._id)
      let result = await axios.delete(`${serverUrl}/api/post/deletecomment/${post._id}/${commentId}`, { withCredentials: true })

      // setComments(result.data.post.comments)
      console.log(result)
      onPostUpdate(result.data.post)
      setActiveComment(null)
      toast.success("comment deleted successfully")

      console.log((result))
    } catch (error) {
      console.log(error)
      toast.error("Couldn't delete comment")
    }
  }

  const handleEditComment = async (commentId) => {
    try {
      console.log(editText)
      let result = await axios.post(`${serverUrl}/api/post/editcomment/${post._id}/${commentId}`, { newContent: editText }, { withCredentials: true })
      toast.success("comment edited successfully")
      onPostUpdate(result.data.post)
      setEditText("")
      setIsEditing(null)
      console.log(result)
    } catch (error) {
      toast.error("failed to edit comment")
      console.log(error)
    }

  }
  const handleReportComment = async (commentId) => {
    toast.success("reported")
  }
  const handleReplyComment = async (commentId) => {

  }


  // useEffect(() => {
  //   socket.on("likeUpdated", ({ postId, likes }) => {
  //     if (postId == _id) {
  //       setLikes(likes)
  //     }
  //   })
  //   socket.on("commentAdded", ({ postId, comm }) => {
  //     if (postId == _id) {
  //       setComments(comm)
  //     }
  //   })
  //   return () => {
  //     socket.off("likeUpdated")
  //     socket.off("commentAdded")
  //   }
  // }, [_id])



  return (
    <div className='w-full min-h-[200px] flex flex-col gap-[10px] bg-white rounded-lg shadow-lg p-[20px]'>

      {/* post header */}
      <div className='flex justify-between items-center'>
        {/* author details */}
        <div className='flex justify-center items-center gap-[10px]'>
          <div className='w-[70px] h-[70px] rounded-full overflow-hidden flex items-center justify-center cursor-pointer ' >
            <img src={author.profileImage || noProfile} alt="dp" className='h-full' />
          </div>
          <div>
            <div className='text-[22px] font-bold'>{`${author.firstName} ${author.lastName}`}</div>
            <div className='text-[16px]'>{`${author.headline}`}</div>
            <div className='text-[16px]'>{moment(createdAt).fromNow()}</div>
          </div>
        </div>
        {/* connection button */}
        <div>
          {
            userData._id != author._id &&
            <ConnectionButton userId={author._id} status={status} />
          }
        </div>
      </div>

      {/* description */}
      <div className={`w-full ${more ? "" : "max-h-[100px] overflow-hidden"} pl-[50px]`}>
        {description}
      </div>

      {/* Read more */}
      <div className='pl-[50px]  font-semibold cursor-pointer' onClick={() => setMore(prev => !prev)}>
        {more ? "read less" : "read more .."}
      </div>

      {/* Image */}
      {image &&
        <div className="w-full overflow-hidden rounded-lg">
          <img
            src={image}
            alt=""
            loading="lazy"
            className="w-full h-auto block"
          />
        </div>
      }

      {/* post footer */}
      <div>
        {/* likes and comments count */}
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

        {/* 4 icons */}
        <div className='flex justify-between items-center w-full p-[20px] gap-[20px]'>

          {/* Like */}
          <div className={`flex flex-col justify-center items-center gap-[5px] cursor-pointer  ${likeStatus === 'loading' ? 'pointer-events-none' : ''}`} onClick={handleLikePost}>
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
          <div className='flex flex-col justify-center items-center gap-[5px] cursor-pointer ' onClick={() => setShowComments(prev => !prev)}>
            <TfiCommentAlt className=' w-[24px] h-[24px]  stroke-[0.4px]' />
            <span>Comment</span>
          </div>
          {/* Repost */}
          <div className='flex flex-col justify-center items-center gap-[5px]'>
            <BiRepost className=' w-[34px] h-[34px] ' />
            <span>repost</span>
          </div>
          {/* send */}
          <div className='flex flex-col justify-center items-center gap-[5px]'>
            <LuSend className=' w-[25px] h-[25px] ' />
            <span>Send</span>
          </div>
        </div>

        {/* comments */}
        {showComments &&
          <div>
            {/* make a comment */}
            <form action="" className=' w-full flex justify-between items-center border-b-2 border-b-gray-300 p-[10px]' onSubmit={handleComment}>
              <input type="text" placeholder='leave a comment' className='outline-none  border-none w-full' value={commentContent} onChange={(e) => { e.stopPropagation(); setCommentContent(e.target.value) }} />
              <button><AiOutlineSend className='text-[#07a4ff] w-[22px] h-[22px]' /></button>
            </form>

            {/* existing comments */}
            <div className='flex flex-col gap-[20px]'>
              {post.comments.map((com) => (
                <div className='flex flex-col gap-[20px] border-b-2 border-b-gray-300 p-[20px]' key={com._id}>
                  {/* comment header */}
                  <div className='flex items-center'>
                    {/* left part */}
                    <div className='w-full flex justify-start items-center gap-[10px]'>
                      {/* image */}
                      <div className='w-[40px] h-[40px] rounded-full overflow-hidden flex items-center justify-center  cursor-pointer ' >
                        <img src={com.user.profileImage || noProfile} alt="dp" className='h-full' />
                      </div>
                      {/* details */}
                      <div>
                        <div className='text-[22px] font-semibold'>{`${com.user.firstName} ${com.user.lastName}`}</div>
                        <div>{moment(com.createdAt).fromNow()}</div>
                      </div>
                    </div>
                    {/* dots (right part) */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        setPopupPos({
                          top: rect.bottom + window.scrollY,
                          left: rect.left + window.scrollX - 110,
                        });

                        setActiveComment(prev => prev === com ? null : com);
                      }}

                      className="cursor-pointer p-1" // Added for better UX
                    >
                      <BsThreeDotsVertical />
                    </div>
                  </div>
                  {/* comment content */}
                  {isEditing === com._id ? (
                    <div className="flex flex-col gap-2 w-full pl-[30px] pr-2">
                      <textarea
                        autoFocus
                        className="w-full resize-none rounded-lg border border-blue-500 bg-white p-2 text-sm text-gray-800 outline-none ring-1 ring-blue-500"
                        rows="1"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onFocus={(e) => e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length)}
                      />
                      <div className="flex gap-3 text-xs font-semibold">
                        <button
                          onClick={() => handleEditComment(com._id)}
                          className="text-blue-600 hover:underline"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => { setIsEditing(null); setEditText("") }}
                          className="text-gray-500 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-[30px] text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {com.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        }

        {/* comment Functions */}
        <Popover
          isOpen={activeComment !== null}
          onClose={() => setActiveComment(null)}
          ref={commentRef}
        >

          <div
            style={{
              top: `${popupPos.top}px`,
              left: `${popupPos.left}px`,
            }}
            className="absolute z-[90]  overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {activeComment?.user._id === userData._id ? (
              <div className="flex flex-col">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(activeComment._id)
                    setEditText(activeComment.content)
                    setActiveComment(null)
                  }
                  }
                  className="flex items-center px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50 hover:text-blue-600 text-left"
                >
                  <span className="flex-1">Edit Comment</span>
                </button>

                <div className="my-1 border-t border-gray-100" />

                <button
                  onClick={() => handleDeleteComment(activeComment._id)}
                  className="flex items-center px-4 py-2 text-sm text-red-600 transition-colors duration-150 hover:bg-red-50 text-left font-medium"
                >
                  <span className="flex-1">Delete</span>
                </button>
              </div>
            ) : (
              <button className="flex w-full items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 text-left">
                Report this comment
              </button>
            )}
          </div>
        </Popover>
      </div>



    </div >
  )
}

export default Post