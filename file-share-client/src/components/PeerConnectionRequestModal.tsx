import { useWebSocketContext } from "../Contexts/WebSocketProvider";

function PeerConnectionRequestModal() {
  const {
    setReceiveRequest,
    receiveRequest,
    stompClient,
    userDeviceId,
    toUserRef,
  } = useWebSocketContext();

  const acceptHandler = () => {
    toUserRef.current = receiveRequest;
    stompClient.send(
      "/app/connection",
      {},
      JSON.stringify({
        toUser: receiveRequest,
        fromUser: userDeviceId,
      })
    );
    setReceiveRequest(null);
  };
  const rejectHandler = () => {
    setReceiveRequest(null);
  };
  return (
    <div className="bg-black/20 w-[100vw] h-[100vh] flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[50%] ">
        <h2 className="font-bold text-center text-xl">Request Recieved</h2>
        <p className="text-lg mt-2 text-center">
          A request for you recieved to connect with {receiveRequest}
        </p>
        <div className="w-full flex justify-center mt-5">
          <div className="flex w-[50%] justify-between text-white">
            <button
              onClick={acceptHandler}
              className="bg-green-600 p-2 font-bold text-center rounded-lg"
            >
              Accept
            </button>
            <button
              onClick={rejectHandler}
              className="bg-red-600 p-2 font-bold text-center rounded-lg"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeerConnectionRequestModal;
