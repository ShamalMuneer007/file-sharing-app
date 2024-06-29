import { useState } from "react";
import { useWebSocketContext } from "../Contexts/WebSocketProvider";
import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";

function Send() {
  const [requestSend, setRequestSend] = useState(false);
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const { connectionEstablished, userDeviceId } = useWebSocketContext();
  const sendRequest = () => {
    setLoading(true);
    axios
      .get(
        `http://localhost:8080/api/v1/connection/request/send?from=${userDeviceId}&to=${id}`
      )
      .then((response: AxiosResponse) => {
        // setRequestSend(true);
        setLoading(false);
        toast.info("Request send !!!. Wait till user accepts the request!");
      })
      .catch((error: AxiosError) => {
        if (error.response && error.response.data) {
          toast.error(error.response.data as string);
          return;
        }
        toast.error(error.message);
      })
      .finally(() => setLoading(false));
  };
  return (
    <div>
      {connectionEstablished ? (
        <div></div>
      ) : (
        <div className="flex justify-center items-center flex-col h-[98vh]">
          <div className="text-xl font-bold">Request connection : </div>
          <div>
            <input
              onChange={(e: any) => setId(e.target.value)}
              className="border-2 border-gray-600 mt-5 p-2 rounded-lg focus:outline-blue-400"
              placeholder="ID"
            ></input>
          </div>
          <button
            onClick={sendRequest}
            disabled={requestSend}
            className={`mt-5 font-bold ${
              requestSend ? "bg-gray-400" : "bg-teal-400 hover:bg-teal-500 "
            } text-white transition-colors p-2 text-center rounded-lg ${
              loading && "border-1 animate-spin p-2 rounded-sm"
            }`}
          >
            {!loading && "Request"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Send;
