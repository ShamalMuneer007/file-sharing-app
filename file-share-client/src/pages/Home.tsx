import { Link } from "react-router-dom";
import { useWebSocketContext } from "../Contexts/WebSocketProvider";
function Home() {
  const { userDeviceId } = useWebSocketContext();

  return (
    <div>
      <div className="text-center font-bold my-10">Peer to Peer File Share</div>
      <div className="text-center font-bold my-2 mb-10">
        ID : {userDeviceId}
      </div>

      <div className="flex justify-center">
        <div className="flex justify-center w-[30%]">
          <Link to="/send">
            <button className="bg-green-500 hover:bg-green-600 transition-colors font-bold text-center px-5 py-2 rounded text-white">
              Connect
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
