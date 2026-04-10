import { useState } from "react";
import { API } from "../api";

export default function Dashboard() {
  const [title, setTitle] = useState("");

  const createEvent = async () => {
    await API.post("/events",
      { title },
      { headers: { Authorization: localStorage.getItem("token") } }
    );
    alert("Event Created");
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <input onChange={e => setTitle(e.target.value)} />
      <button onClick={createEvent}>Create Event</button>
    </div>
  );
}