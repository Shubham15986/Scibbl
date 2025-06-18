import React from "react";
import { useState, useCallback, useEffect } from "react";

function App(){
    
    const [password, setPassword ] = useState("");
const [charAllow, setCharAllow] = useState(false);
const [numAllow, setNumAllow] = useState(false);
const [leng, setLeng]  = useState(8);

const passwordGenerator = useCallback(()=>{
  let pass = "";
  let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
   if(numAllow){
    str+="0123456789";
   }
   if(charAllow){
    str+=".,?!:+*&^%$#@!;'—()]{}…"
   }
    for(let i =0;i<leng;i++){
      let char = Math.floor(Math.random() * str.length);
      pass += str.charAt(char);
    }
    setPassword(pass);
},[setPassword,numAllow,charAllow,leng])
const copyC = useCallback(()=>{
    window.navigator.clipboard.writeText(password)
},[password])
useEffect(()=>{
    passwordGenerator();
},[setPassword,numAllow,charAllow,leng])
    return(
        <>
           <div className='w-full max-w-md mx-auto shadow-md rounded-lg px-4 my-8 text-orange-500 bg-gray-800'>
            <div className='flex shadow rounded-lg overflow-hidden mb-4'>
                <input
                  type="text"
                  value={password}
                  placeholder="password"
                />
                <button
                onClick={copyC} >copy</button>
                

            </div>
            <div clasName='flex items-center gap-x-2'>
                <div className='flex items-center gap-x-1'>
                    <input
                    type="range"

                    min={6}
                    max={100}
                    value ={leng}
                    className='cursor-pointer'
                    onChange={(e)=>{setLeng(e.target.value)}}/>
                    <label>length :{leng}</label> 67890- xdfse 
                </div>
                <div>
                    <input 
                    type="checkbox"
                    defaultChecked = {numAllow}
                    id="numberInput"
                    onChange={()=>{
                        setNumAllow((e)=>!e);
                    }}/>
                    <label>number</label>

                </div>
                <div>
                    <input 
                    type="checkbox"
                    defaultChecked = {charAllow}
                    id="CharInput"
                    onChange={()=>{
                        setCharAllow((e)=>!e);
                    }}/>
                    <label>char</label>

                </div>

            </div>
           </div>
        </>
    )
}

export default App;