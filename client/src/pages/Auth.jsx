import { useState } from "react";
import { API } from "../api";

// ... rest of your code
export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const register = async () => {
    await API.post("/auth/register", { email, password });
    alert("Registered");
  };

  const login = async () => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    alert("Logged in");
  };

  return (
    <div>
      <input onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={register}>Register</button>
      <button onClick={login}>Login</button>
    </div>
  );
}