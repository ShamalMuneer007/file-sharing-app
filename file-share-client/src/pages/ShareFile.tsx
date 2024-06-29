import { useEffect } from "react";
import { useWebSocketContext } from "../Contexts/WebSocketProvider";
import { useNavigate } from "react-router-dom";

function ShareFile() {
  const { selectFile, connectionEstablished, sendFile, toUser } =
    useWebSocketContext();
  const navigate = useNavigate();
  useEffect(() => {
    if (!connectionEstablished) navigate("/");
  }, [connectionEstablished]);
  return (
    <div className="px-10 py-10">
      <div>
        <p>Connection established to {toUser}</p>
      </div>
      <div>
        <input onChange={selectFile} type="file" />
        <button
          className="bg-green-600 p-2 font-bold text-center rounded-lg"
          onClick={sendFile}
        >
          Send file
        </button>
      </div>
      <button className="hover:bg-red-600 mt-10 text-red-600 border hover:text-white border-red-600 transition-colors rounded-lg font-xl font-bold text-center p-2">
        Disconnect
      </button>
    </div>
  );
}

export default ShareFile;
