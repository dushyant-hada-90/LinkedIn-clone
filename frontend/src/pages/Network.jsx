import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { authDataContext } from '../context/AuthContext'
import toast from 'react-hot-toast';
import Nav from "../components/Nav"
import { FaRegCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import dp from "../assets/noProfile.svg"
function Network() {
  let { serverUrl } = useContext(authDataContext)
  let [connections, setConnections] = useState([])
  const handleGetRequests = async () => {
    try {
      let result = await axios.get(`${serverUrl}/api/connection/requests`, { withCredentials: true })
      console.log(result)
      setConnections(result.data.requests)
    } catch (error) {
      console.log(error)
      toast.error("Unable to fetch connections")
    }
  }

  const handleAcceptConnection = async (requestId)=>{
    try {
      let result = await axios.put(`${serverUrl}/api/connection/accept/${requestId}`,{},{withCredentials:true})
      setConnections(connections.filter((con)=>con._id==requestId))
      toast.success("accepted request")
    } catch (error) {
      console.log(error);
      toast.error("Unable to accept request")      
    }
  }

  const handleRejectConnection = async (requestId)=>{
    try {
      let result = await axios.put(`${serverUrl}/api/connection/reject/${requestId}`,{},{withCredentials:true})
      setConnections(connections.filter((con)=>con._id==requestId))
      toast.success("rejected request")
    } catch (error) {
      console.log(error);
      toast.error("Unable to reject request")      
    }
  }
  useEffect(() => {
    handleGetRequests()
  }, [])


  return (
    <div className='w-screen h-[100vh] bg-bg-[#f0efe7] pt-[100px] px-[20px] flex flex-col gap-[10px]'>
      <Nav />
      <div className='w-full h-[100px] bg-[white] shadow-lg rounded-lg flex items-center p-[10px] text-[22px] text-gray-600'>
        Invitations : {connections.length}
      </div>
      {connections.length > 0 &&
        <div className='w-[100%] max-w-[900px] shadow-lg rounded-lg flex flex-col gap-[20px] min-h-[100px] '>

          {connections.map((connection, index) => (
            <div className='w-full min-h-[100px] p-[20px]  flex justify-between items-center' key={index}>
              <div className='flex justify-center items-center gap-[10px]'>
                <div className='w-[60px] h-[60x] rounded-full overflow-hidden cursor-pointer'>
                  <img src={connection.sender.profileImage || dp} alt="" className='w-full h-full' />
                </div>
                <div className='text-[19px] font-semibold text-gray-700'>
                  {`${connection.sender.firstName} ${connection.sender.lastName}`}
                </div>
              </div>

              <div>
                <button className='text-[#18c5ff] font-semibold'  onClick={()=>handleAcceptConnection(connection._id)}>
                  <FaRegCheckCircle className='w-[40px] h-[40px]'/>
                </button> 
                <button className='text-[#ff4218] font-semibold'  onClick={()=>handleRejectConnection(connection._id)}>
                  <RxCrossCircled className='w-[40px] h-[40px]'/>
                </button>               
              </div>
            </div>

          ))}
        </div>
      }
    </div>
  )
}

export default Network