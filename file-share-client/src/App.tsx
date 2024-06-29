import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Send from "./pages/Send";
import { useWebSocketContext } from "./Contexts/WebSocketProvider";
import { useEffect, useState } from "react";
import PeerConnectionRequestModal from "./components/PeerConnectionRequestModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShareFile from "./pages/ShareFile";
function App() {
  const { receiveRequest, connectionEstablished } = useWebSocketContext();
  const navigate = useNavigate();
  const [modal, setModal] = useState(false);
  useEffect(() => {
    if (receiveRequest) setModal(true);
    else setModal(false);
  }, [receiveRequest]);
  useEffect(() => {
    if (connectionEstablished) {
      navigate("/share");
    } else {
      navigate("/");
    }
  }, [connectionEstablished]);
  return (
    <>
      <ToastContainer theme="dark" />
      {/* <ToastContainer /> */}

      {modal && <PeerConnectionRequestModal />}
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/send" element={<Send />}></Route>
        <Route path="/share" element={<ShareFile />}></Route>
      </Routes>
    </>
  );
}

export default App;
