import logo from '../assets/logo.svg'
import React,{useContext, useState} from 'react'
import {useNavigate} from "react-router-dom"
import { authDataContext } from '../context/AuthContext'
import axios from "axios"
import { ClipLoader } from "react-spinners";

function Signup() {

  let [show, setShow] = useState(false)
  let navigate = useNavigate()
  let {serverUrl} = useContext(authDataContext)
  let [firstName,setFirstName] = useState("")
  let [lastName,setLastName] = useState("")
  let [userName,setUserName] = useState("")
  let [email,setEmail] = useState("")
  let [password,setPassword] = useState("")
  let [loading,setLoading] = useState(false)
  let [message,setMessage] = useState("")
  let [status, setStatus] = useState(""); // "error" | "success"


  const handleSignup = async (e)=>{
    e.preventDefault()
    setLoading(true)
    console.log(firstName,
        lastName,
        userName,
        email,
        password,);
    
    try {
      let result = await axios.post(serverUrl+"/api/auth/signup",{
        firstName,
        lastName,
        userName,
        email,
        password,
      },{withCredentials : true})
      setLoading(false)
      console.log(result,"try");
      setMessage(result?.data.message);
      setStatus("success")
      
      setFirstName("")
      setLastName("")
      setUserName("")
      setEmail("")
      setPassword("")
      
    } catch (error) {
      console.log(error,"catch");
      setMessage(error.response.data.message);
      setLoading(false)
      setStatus("error")
    }
  }
  return (
    <div className='w-full h-screen bg-white flex flex-col items-center justify-start gap-[10px]'>

        <div className='p-[30px] lg:p-[35px] w-full h-[80px] flex items-center'>
          <img src={logo} alt="" />
        </div>

        <form
          className='w-[90%] max-w-[400px] h-[600px] md:shadow-xl flex flex-col justify-center  gap-[10px] p-[15px] '
          onSubmit={handleSignup}>

            <h1 className='text-gray-800 text-[30px] font-semibold mb-[30px]'>Sign up</h1>

            <input 
            type="text"  
            placeholder='firstname' 
            value={firstName}
            required  
            className='w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px] px-[20px] py-[10px] rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-300 ' 
            onChange={(e)=>setFirstName(e.target.value)}
            /> 

            <input 
            type="text"  
            placeholder='lastname'
            value={lastName}
            required 
            className='w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px] px-[20px] py-[10px] rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-300' 
            onChange={(e)=>setLastName(e.target.value)}
            />

            <input 
            type="text"  
            placeholder='username' 
            value={userName}
            required 
            className='w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px] px-[20px] py-[10px] rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-300' 
            onChange={(e)=>setUserName(e.target.value)}
            />

            <input 
            type="email"  
            placeholder='email' 
            value={email}
            required 
            className='w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px] px-[20px] py-[10px] rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-300' 
            onChange={(e)=>setEmail(e.target.value)}
            />


            <div className='w-[100%] h-[50px] border-none text-gray-800 text-[18px]  rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-300 relative'>
              <input 
              type={show?"text":"password"}  
              placeholder='password' 
              value={password}
              required  
              className='w-[100%] h-[50px] border-2 border-gray-600 text-gray-800 text-[18px] px-[20px] py-[10px] rounded-md focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-300' 
              onChange={(e)=>setPassword(e.target.value)}
              />

              <span 
              className='absolute right-[20px] top-[10px] text-[#24b2ff] cursor-pointer' 
              onClick={()=>setShow(prev=>!prev)}>
                {show?"hide":"show"}
              </span>
            </div>


            <button 
            className='w-[100%] h-[50px] rounded-full bg-[#24b2ff] mt-[40px] text-white cursor-pointer'>{loading? <ClipLoader size={18} /> :"Sign up"}</button>
            
            <p className='text-center cursor-pointer' onClick={()=>navigate("/login")}>Already have an account ? <span className='text-[#2a9bd8] '>Sign in</span> </p>
            <h1  className={`text-center ${status === "error" ? "text-red-500" : "text-green-600"  }`} >{message}</h1>
        </form>

    </div>
  )
}

export default Signup