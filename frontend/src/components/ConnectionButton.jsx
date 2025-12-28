import React, { useContext, useEffect, useState } from 'react'
import { authDataContext } from '../context/AuthContext'
import io from "socket.io-client"
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


// const socket = io(import.meta.env.VITE_SERVER_URL);


function ConnectionButton({userId,status}) {
    // console.log(userId)
    if(!userId){return}
    let { serverUrl } = useContext(authDataContext)
    let { userData, setUserData } = useContext(userDataContext)
    let navigate = useNavigate()
    
    const handleSendConnection = async () => {
        try {
            let result = await axios.post(`${serverUrl}/api/connection/send/${userId}`, {}, { withCredentials: true })
            console.log(result);
        } catch (error) {
            console.log(error);
        }
    }

    const handleRemoveConnection = async () => {
        try {
            let result = await axios.delete(`${serverUrl}/api/connection/remove/${userId}`,  { withCredentials: true })
            console.log(result);
        } catch (error) {
            console.log(error);
        }
    }

    // const handleGetStatus = async () => {
    //     try {
    //         let result = await axios.get(`${serverUrl}/api/connection/getstatus/${userId}`, { withCredentials: true })
    //         // console.log(result);
    //         setStatus(result.data.status)
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // useEffect(() => {
    //     socket.emit("register", userData._id)
    //     handleGetStatus()

    //     socket.on("statusUpdated", ({ updatedUserId, newStatus }) => {
    //         // console.log(updatedUserId, newStatus)
    //         if (updatedUserId == userId) {
    //             setStatus(newStatus)
    //         }
    //     })
    // }, [userId])

    const handleClick = async ()=>{
        if (status=="disconnect"){
            await handleRemoveConnection()
        }else if(status=="received"){
            navigate("/network")
        }else{ 
            await handleSendConnection()
        }
    }
    return (
        <button className='sm:min-w-[100px] sm:h-[40px] min-w-[75px] h-[30px] rounded-full border-2 my-[20px] border-[#2dc0ff] text-[#2dc0ff] cursor-pointer transition duration-200 hover:bg-[#2dc0ff] hover:text-white hover:shadow-md flex justify-center items-center gap-[10px]' onClick={handleClick} disabled={status=="pending"}>
            {status}
        </button>
    )
}

export default ConnectionButton