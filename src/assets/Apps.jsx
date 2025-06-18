import { useCallback,useEffect,useCallback, useState } from "react";

function Apps(){
    const [password,setPassword] = useState("");
    const [lengths,setLength]  = useState(8);
    const [charAllowed,setCharAllowed] = useState(false);
    const [numAllowed,setNumAllowed]  = useState(false);

    const generator = useCallback(()=>{
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
         
    },[lengths,charAllowed,numAllowed,setPassword]);

    
      


    return(
        <>
        </>
    )
}

export default Apps