import React, { useContext, useRef, useState } from 'react';
import { FaCamera, FaPen, FaPlus, FaBriefcase, FaGraduationCap } from 'react-icons/fa';
import { MdArrowForwardIos, MdOutlineEmail, MdPeople } from 'react-icons/md';
import { BiWorld } from 'react-icons/bi';
import { userDataContext } from '../context/UserContext';
import { BsThreeDots } from "react-icons/bs";
import { MdCheckCircle } from 'react-icons/md';
import { BiRightArrowAlt } from 'react-icons/bi';
import { MdClose, MdEmail } from 'react-icons/md';
import { FaLinkedin, FaBirthdayCake, FaPhoneAlt } from 'react-icons/fa';
// Ensure these paths are correct for your project structure
import Popover from '../components/Popover';
import Modal from '../components/Modal';
import Nav from '../components/Nav';


const mockUserData = {
    id: "user_123",
    firstName: "Rohan",
    lastName: "Sharma",
    headline: "Full Stack Developer | MERN Stack Enthusiast | Building Cool Things",
    location: "Surat, Gujarat, India",
    followers: 543,
    connections: 500,
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    about: "I am a passionate developer focused on building scalable web applications using the MERN stack. Currently working on a LinkedIn clone and diving deep into system design.",
    experience: [], // Added to prevent map errors if empty in mock
    education: [],  // Added to prevent map errors if empty in mock
    skills: ["React", "Node.js", "MongoDB"] // Added mock skills
};

const Profile = (profileId) => {
    const { userData, setUserData } = useContext(userDataContext)
    
    // Fallback to mock data if context is empty (for testing UI)
    const activeUser = userData && userData.firstName ? userData : mockUserData;
    
    const isOwner = true

    const [isFollowing, setIsFollowing] = useState(false);
    const [showContactInfo, setShowContactInfo] = useState(false)
    const [showConnections, setShowConnections] = useState(false)
    const [editProfile, setEditProfile] = useState(false)
    const contactInfoRef = useRef(null)
    
    // Placeholder functions
    const editProfileImage = () => {}
    const editCoverImage = () => {}
    const setOpento = () => {}
    const setAddExperience = () => {}
    const setEditExperience = () => {}
    const setAddEducation = () => {}
    const setEditEducation = () => {}
    const setEditAbout = () => {}
    const setAddSkills = () => {}
    const setEditSkills = () => {}
    const setShowAllSkills = () => {}
    const setEditContactInfo = () => {}

    return (
        // FIXED: Removed flex justify-center, removed pt-[80px]
        <div className='w-full min-h-screen bg-[#f3f2ef] font-sans pb-10'>
            
            <Nav/>

            {/* --- Main Layout Grid --- */}
            {/* FIXED: Added mx-auto to center content, matching Nav's max-width logic. Added mt-4 for breathing room. */}
            <div className='max-w-[1128px] mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 '>

                {/* LEFT COLUMN (Main Content) */}
                <div className='md:col-span-8 flex flex-col gap-2'>

                    {/* --- CARD 1: HERO SECTION --- */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-300 overflow-hidden relative pb-4'>

                        {/* Cover Image */}
                        <div className='relative h-[150px] sm:h-[201px] w-full bg-gray-300'>
                            {(activeUser.coverImage || mockUserData.coverImage) && <img src={activeUser.coverImage || mockUserData.coverImage} alt="Cover" className='w-full h-full object-cover' />}
                            {isOwner && (
                                <button className='absolute top-4 right-4 bg-white p-2 rounded-full text-[#0a66c2] shadow-sm hover:text-blue-800 transition z-10' onClick={editCoverImage}>
                                    <FaCamera />
                                </button>
                            )}
                        </div>

                        <div className='px-6'>
                            {/* Profile Picture */}
                            <div className='relative -mt-[80px] sm:-mt-[100px] w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] rounded-full border-4 border-white overflow-hidden bg-white cursor-pointer group'>
                                <img src={activeUser.profileImage || mockUserData.profileImage} alt="Profile" className='w-full h-full object-cover' />
                            </div>

                            {/* Edit Button (Top Right of Content) */}
                            {isOwner && (
                                <div className='absolute top-[170px] sm:top-[220px] right-6 cursor-pointer text-gray-600 hover:bg-gray-100 p-2 rounded-full transition' onClick={editProfileImage}>
                                    <FaPen size={18} />
                                </div>
                            )}

                            {/* Text Info */}
                            <div className='mt-3 sm:mt-4'>
                                <h1 className='text-[24px] font-bold text-gray-900 leading-tight'>
                                    {activeUser.firstName} {activeUser.lastName}
                                </h1>
                                <p className='text-[16px] text-gray-900 mt-1 font-normal'>
                                    {activeUser.headline}
                                </p>

                                <div className='text-[14px] text-gray-500 mt-2 flex flex-wrap items-center gap-1'>
                                    <span>{activeUser.location}</span>
                                    <span className='mx-1'>•</span>
                                    <span className='text-[#0a66c2] font-bold cursor-pointer hover:underline' onClick={() => setShowContactInfo(true)} ref={contactInfoRef}>
                                        Contact info
                                    </span>
                                </div>

                                <div className={`text-[14px] font-bold mt-2 ${isOwner?"hover:underline cursor-pointer text-[#0a66c2]" : "text-gray-500"}`} onClick={() => setShowConnections(true)}>
                                    {activeUser.connections || 10}+ connections
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className='mt-4 flex flex-wrap gap-2 pb-2'>
                                {isOwner ? (
                                    <>
                                        <button className='bg-[#0a66c2] text-white px-6 py-1.5 rounded-full font-semibold hover:bg-[#004182] transition cursor-pointer' onClick={setOpento}>
                                            Open to
                                        </button>
                                        <button className='border border-[#0a66c2] text-[#0a66c2] px-6 py-1.5 rounded-full font-semibold hover:bg-blue-50 transition cursor-pointer' onClick={() => setEditProfile(true)}>
                                            Add profile section
                                        </button>
                                        <button className='border border-[#0a66c2] text-[#0a66c2] px-6 py-1.5 rounded-full font-semibold hover:bg-blue-50 transition cursor-pointer hidden sm:block' >
                                            Enhance Profile
                                        </button>
                                        <button className='border border-gray-500 text-gray-600 px-4 py-1.5 rounded-full font-semibold hover:bg-gray-100 transition cursor-pointer'>
                                            <BsThreeDots />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className='bg-[#0a66c2] text-white px-6 py-1.5 rounded-full font-semibold hover:bg-[#004182] transition flex items-center gap-2'>
                                            <FaPlus size={12} /> Connect
                                        </button>
                                        <button className='border border-[#0a66c2] text-[#0a66c2] px-6 py-1.5 rounded-full font-semibold hover:bg-blue-50 transition'>
                                            Message
                                        </button>
                                        <button
                                            onClick={() => setIsFollowing(!isFollowing)}
                                            className={`border ${isFollowing ? 'border-gray-500 text-gray-600' : 'border-gray-500 text-gray-600'} px-6 py-1.5 rounded-full font-semibold hover:bg-gray-100 transition`}>
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- CARD 2: ABOUT --- */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-300 p-6 relative'>
                        <div className='flex justify-between items-center mb-3'>
                            <h2 className='text-[20px] font-bold text-gray-900'>About</h2>
                            {isOwner && <FaPen className='cursor-pointer text-gray-500 hover:text-gray-700' onClick={setEditAbout} />}
                        </div>
                        <p className='text-[14px] text-gray-900 leading-relaxed whitespace-pre-line'>
                            {activeUser.about || mockUserData.about}
                        </p>
                    </div>

                    {/* --- CARD 3: EXPERIENCE --- */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-300 p-6 relative'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-[20px] font-bold text-gray-900'>Experience</h2>
                            {isOwner && (
                                <div className='flex gap-4'>
                                    <FaPlus className='cursor-pointer text-gray-500 hover:text-gray-700' onClick={setAddExperience} />
                                    <FaPen className='cursor-pointer text-gray-500 hover:text-gray-700' onClick={setEditExperience} />
                                </div>
                            )}
                        </div>

                        {activeUser.experience && activeUser.experience.map((exp, index) => (
                            <div key={index} className='flex gap-4 border-b border-gray-100 pb-4 mb-4 last:border-0 items-center last:mb-0 last:pb-0'>
                                <div className='w-12 h-12 bg-gray-100 flex items-center justify-center rounded-sm'>
                                    <FaBriefcase className='text-gray-500' />
                                </div>
                                <div>
                                    <h3 className='text-[16px] font-bold text-gray-900'>{exp.title}</h3>
                                    <p className='text-[14px] text-gray-900'>{exp.company}</p>
                                    <p className='text-[14px] text-gray-500'>{exp.time || "2000 - Present"}</p>
                                </div>
                            </div>
                        ))}
                        {(!activeUser.experience || activeUser.experience.length === 0) && (
                             <div className="text-gray-500 text-sm">No experience added yet.</div>
                        )}
                    </div>

                    {/* --- CARD 4: EDUCATION --- */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-300 p-6 relative'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-[20px] font-bold text-gray-900'>Education</h2>
                            {isOwner && (
                                <div className='flex gap-4'>
                                    <FaPlus className='cursor-pointer text-gray-500 hover:text-gray-700' onClick={setAddEducation} />
                                    <FaPen className='cursor-pointer text-gray-500 hover:text-gray-700' onClick={setEditEducation} />
                                </div>
                            )}
                        </div>

                        {activeUser.education && activeUser.education.map((edu, index) => (
                            <div key={index} className='flex gap-4 items-center mb-4 last:mb-0'>
                                <div className='w-12 h-12 bg-gray-100 flex items-center justify-center rounded-sm'>
                                    <FaGraduationCap className='text-gray-500' />
                                </div>
                                <div>
                                    <h3 className='text-[16px] font-bold text-gray-900'>{edu.college}</h3>
                                    <p className='text-[14px] text-gray-900'>{edu.degree}</p>
                                    <p className='text-[14px] text-gray-500'>{edu.fieldOfStudy}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- CARD 5: SKILLS --- */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-300 relative'>
                        <div className='p-5 pb-2'>
                            <div className='flex justify-between items-start mb-4'>
                                <h2 className='text-[20px] font-bold text-gray-900'>Skills</h2>
                                <div className='flex items-center gap-3'>
                                    {isOwner && (
                                        <>
                                            <button className='hidden md:block text-[#0a66c2] text-[16px] font-semibold hover:bg-blue-50 px-3 py-1 rounded-full transition border border-[#0a66c2]'>
                                                Demonstrate skills
                                            </button>
                                            <div className='flex gap-4'>
                                                <FaPlus className='cursor-pointer text-gray-500 hover:text-gray-700' onClick={setAddSkills} />
                                                <FaPen className='cursor-pointer text-gray-500 hover:text-gray-700' onClick={setEditSkills} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className='flex flex-col px-5'>
                            {activeUser.skills && activeUser.skills.slice(0, 3).map((skill, index) => (
                                <div key={index} className='border-b border-gray-200 py-3 last:border-0'>
                                    <h3 className='text-[16px] font-bold text-gray-900 hover:underline hover:text-[#0a66c2] cursor-pointer inline-block'>
                                        {skill}
                                    </h3>
                                    <div className='flex items-center gap-2 mt-1'>
                                        <MdPeople className='text-gray-500' size={16} />
                                        <span className='text-[14px] text-gray-500'>
                                            {isOwner ? "2 endorsements" : "Endorsed by 3 connections who know this skill"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {activeUser.skills?.length > 0 && (
                            <button className='w-full border-t border-gray-200 py-3 text-gray-600 font-semibold text-[16px] hover:bg-gray-100 hover:text-gray-700 transition rounded-b-lg flex justify-center items-center gap-1 mt-1' onClick={setShowAllSkills}>
                                Show all {activeUser.skills.length} skills <BiRightArrowAlt size={24} />
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN (Sidebar) */}
                <div className='md:col-span-4 flex flex-col gap-2'>
                    {/* Sidebar Card: People also viewed */}
                    <div className='bg-white rounded-lg shadow-sm border border-gray-300 p-4'>
                        <h3 className='font-semibold text-gray-700 mb-4'>People also viewed</h3>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className='flex gap-3 mb-4 last:mb-0'>
                                <div className='w-10 h-10 rounded-full bg-gray-300 flex-shrink-0'></div>
                                <div>
                                    <div className='font-bold text-sm text-gray-800 cursor-pointer hover:underline'>User Name</div>
                                    <div className='text-xs text-gray-500 line-clamp-2'>Software Engineer at Google | React Expert</div>
                                    <button className='mt-1 text-gray-500 border border-gray-500 rounded-full px-4 py-1 text-xs hover:bg-gray-50 hover:border-gray-800 transition'>
                                        Connect
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* --- CONTACT INFO MODAL --- */}
            <Modal
                isOpen={showContactInfo}
                onClose={() => setShowContactInfo(false)}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[552px] outline-none"
            >
                <div className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh] relative min-h-[300px]">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                        <h2 className="text-[20px] font-semibold text-gray-900">Contact info</h2>
                        <button onClick={() => setShowContactInfo(false)} className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition focus:outline-none cursor-pointer">
                            <MdClose size={24} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto mb-10">
                        <div className='flex items-center gap-4 mb-6'>
                            <div className='w-16 h-16 rounded-full overflow-hidden border border-gray-200'>
                                <img src={activeUser.profileImage || mockUserData.profileImage} alt="profile" className='w-full h-full object-cover' />
                            </div>
                            <div>
                                <h3 className='font-bold text-[16px] text-gray-900'>{activeUser.firstName} {activeUser.lastName}</h3>
                                <p className='text-[14px] text-gray-500 line-clamp-1'>{activeUser.headline}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="flex gap-4">
                                <FaLinkedin className="text-gray-600 flex-shrink-0 mt-1" size={24} />
                                <div>
                                    <h4 className="text-[16px] font-semibold text-gray-900">Your Profile</h4>
                                    <a href="#" className="text-[14px] text-[#0a66c2] font-semibold hover:underline break-all">
                                        linkedin.com/in/{activeUser.firstName?.toLowerCase() || 'user'}{activeUser.lastName?.toLowerCase()}
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <MdEmail className="text-gray-600 flex-shrink-0 mt-1" size={24} />
                                <div>
                                    <h4 className="text-[16px] font-semibold text-gray-900">Email</h4>
                                    <a href={`mailto:${activeUser.email}`} className="text-[14px] text-[#0a66c2] hover:underline">
                                        {activeUser.email || 'rohan.sharma@example.com'}
                                    </a>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <FaPhoneAlt className="text-gray-600 flex-shrink-0 mt-1" size={20} />
                                <div>
                                    <h4 className="text-[16px] font-semibold text-gray-900">Phone</h4>
                                    <span className="text-[14px] text-gray-900 block">{activeUser.mobileNumber || "+91 98765 43210"}</span>
                                    <span className="text-[12px] text-gray-500">Mobile</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isOwner && (
                        <div className='absolute bottom-4 right-4'>
                            <button className='p-3 bg-white border border-gray-300 rounded-full shadow-md text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition z-10 cursor-pointer' onClick={setEditContactInfo}>
                                <FaPen size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </Modal>

        </div>
    );
}

export default Profile;