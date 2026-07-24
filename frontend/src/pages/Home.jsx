import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from "../assets/ai.gif"
import { CgMenuRight } from "react-icons/cg";
import { RxCross1 } from "react-icons/rx";
import userImg from "../assets/user.gif"
function Home() {
  const {userData,serverUrl,setUserData,getaiResponse}=useContext(userDataContext)
  const navigate=useNavigate()
  const [listening,setListening]=useState(false)
  const [userText,setUserText]=useState("")
  const [aiText,setAiText]=useState("")
  const [imageUrl, setImageUrl] = useState("");
  const isSpeakingRef=useRef(false)
  const recognitionRef=useRef(null)
  const [ham,setHam]=useState(false)
  const isRecognizingRef=useRef(false)
  const synth=window.speechSynthesis

  const handleLogOut=async ()=>{
    try {
      const result=await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
      setUserData(null)
      navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error)
    }
  }

  const startRecognition = () => {
    
   if (!isSpeakingRef.current && !isRecognizingRef.current) {
    try {
      recognitionRef.current?.start();
      console.log("Recognition requested to start");
    } catch (error) {
      if (error.name !== "InvalidStateError") {
        console.error("Start error:", error);
      }
    }
  }
    
  }

  const speak=(text)=>{
    const utterence=new SpeechSynthesisUtterance(text)
    utterence.lang = 'hi-IN';
    const voices =window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) {
      utterence.voice = hindiVoice;
    }


    isSpeakingRef.current=true
    utterence.onend=()=>{
        setAiText("");
  isSpeakingRef.current = false;
  setTimeout(() => {
    startRecognition(); // ⏳ Delay se race condition avoid hoti hai
  }, 800);
    }
   synth.cancel(); // 🛑 pehle se koi speech ho to band karo
synth.speak(utterence);
  }

  const handleCommand = (data) => {
  console.log("Received data:", data);

  const { type, userInput, response, imageUrl } = data;

  console.log("Type:", type);
  console.log("User Input:", userInput);

  speak(response);

  switch (type) {

     case "generate-image":
      setImageUrl(imageUrl);
      speak("Here is your generated image.");
      break;

    case "google-search":
      window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, "_blank");
      break;

    case "youtube-search":
    case "youtube-play":
      // alert("Opening YouTube");
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, "_blank");
      break;

    case "calculator-open":
      window.open("https://www.google.com/search?q=calculator", "_blank");
      break;

    case "instagram-open":
      window.open("https://www.instagram.com/", "_blank");
      break;

    case "facebook-open":
      window.open("https://www.facebook.com/", "_blank");
      break;

    case "weather-show":
      window.open("https://www.google.com/search?q=weather", "_blank");
      break;

    default:
      console.log("Unknown command type:", type);
  }
};

useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognitionRef.current = recognition;

  let isMounted = true;  // flag to avoid setState on unmounted component

  // Start recognition after 1 second delay only if component still mounted
  const startTimeout = setTimeout(() => {
    if (isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognition.start();
        console.log("Recognition requested to start");
      } catch (e) {
        if (e.name !== "InvalidStateError") {
          console.error(e);
        }
      }
    }
  }, 1000);

  recognition.onstart = () => {
    isRecognizingRef.current = true;
    setListening(true);
  };

  recognition.onend = () => {
    isRecognizingRef.current = false;
    setListening(false);
    if (isMounted && !isSpeakingRef.current) {
      setTimeout(() => {
        if (isMounted) {
          try {
            recognition.start();
            console.log("Recognition restarted");
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }
      }, 1000);
    }
  };

  recognition.onerror = (event) => {
    console.warn("Recognition error:", event.error);
    isRecognizingRef.current = false;
    setListening(false);
    if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
      setTimeout(() => {
        if (isMounted) {
          try {
            recognition.start();
            console.log("Recognition restarted after error");
          } catch (e) {
            if (e.name !== "InvalidStateError") console.error(e);
          }
        }
      }, 1000);
    }
  };

  recognition.onresult = async (e) => {
    const transcript = e.results[e.results.length - 1][0].transcript.trim();
    if (
  userData &&
  transcript.toLowerCase().includes(userData.assistantName.toLowerCase())
) {
      setAiText("");
      setUserText(transcript);
      recognition.stop();
      isRecognizingRef.current = false;
      setListening(false);
      const data = await getaiResponse(transcript);

console.log("Frontend received:", data);

if (!data) {
    console.log("No response received from backend");
    return;
}

handleCommand(data);
setAiText(data.response);
setUserText("");
    }
  };


    const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with?`);
    greeting.lang = 'hi-IN';
   
    window.speechSynthesis.speak(greeting);
 

  return () => {
    isMounted = false;
    clearTimeout(startTimeout);
    recognition.stop();
    setListening(false);
    isRecognizingRef.current = false;
  };
}, []);




  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>
      <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(true)}/>
      <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000053] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform`}>
 <RxCross1 className=' text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(false)}/>
 <button className="min-w-[170px] h-[60px] rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 text-white font-bold text-[18px] shadow-lg hover:scale-105 hover:shadow-red-400/50 transition-all duration-300 active:scale-95" onClick={handleLogOut}>Log Out</button>
      <button
    onClick={handleLogOut}
    className="group relative overflow-hidden min-w-[180px] h-[60px]
    rounded-2xl bg-gradient-to-r from-red-500 to-pink-600
    text-white font-bold text-lg shadow-lg
    transition-all duration-500 hover:scale-105 hover:shadow-red-500/50"
  >
    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
    <span className="relative z-10 flex items-center justify-center gap-2">
      🚪 Log Out
    </span>
  </button>

  <button
    onClick={() => navigate("/customize")}
    className="group relative overflow-hidden min-w-[260px] h-[60px]
    rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700
    text-white font-bold text-lg shadow-lg
    transition-all duration-500 hover:scale-105 hover:shadow-cyan-500/50"
  >
    <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
    <span className="relative z-10 flex items-center justify-center gap-2">
      🤖 Customize Assistant
    </span>
  </button>

<div className='w-full h-[2px] bg-gray-400'></div>
<h1 className='text-white font-semibold text-[19px]'>History</h1>

<div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col truncate'>
  {userData.history?.map((his, index) => (
  <div
    key={index}
    className="text-gray-200 text-[18px] w-full h-[30px]"
  >
    {his}
  </div>
))}

</div>

      </div>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold absolute hidden lg:block top-[20px] right-[20px]  bg-white rounded-full cursor-pointer text-[19px] ' onClick={handleLogOut}>Log Out</button>
      <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold  bg-white absolute top-[100px] right-[20px] rounded-full cursor-pointer text-[19px] px-[20px] py-[10px] hidden lg:block ' onClick={()=>navigate("/customize")}>Customize your Assistant</button>
      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
<img src={userData?.assistantImage} alt="" className='h-full object-cover'/>
      </div>
      <h1 className='text-white text-[18px] font-semibold'>I'm {userData?.assistantName}</h1>
      {!aiText && <img src={userImg} alt="" className='w-[200px]'/>}
      {aiText && <img src={aiImg} alt="" className='w-[200px]'/>}
    
    <h1 className='text-white text-[18px] font-semibold text-wrap'>{userText?userText:aiText?aiText:null}</h1>
      
      {imageUrl && (
  <div className="mt-5 flex flex-col items-center gap-4">
    <img
      src={imageUrl}
      alt="Generated"
      className="w-[350px] rounded-2xl shadow-lg"
    />

    <button
      onClick={() => {
        const a = document.createElement("a");
        a.href = imageUrl;
        a.download = "elara-image.png";
        a.click();
      }}
      className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
    >
      ⬇ Download Image
    </button>
  </div>
)}
    </div>
  )
}

export default Home