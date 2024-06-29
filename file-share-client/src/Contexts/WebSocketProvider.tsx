import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
  useRef,
  SetStateAction,
  Dispatch,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { CompatClient, Stomp } from "@stomp/stompjs";
import { toast } from "react-toastify";
import SockJS from "sockjs-client";
interface SocketContextData {
  userDeviceId: string | null;
  stompClient: any;
  sendFile: (e: any) => void;
  selectFile: (e: any) => void;
  download: () => void;
  connectionEstablished: boolean;
  setReceiveRequest: Dispatch<SetStateAction<string | null>>;
  receiveRequest: string | null;
  createPeerConnection: () => void;
  setConnection: Dispatch<SetStateAction<boolean>>;
  toUserRef: any;
}

const WebSocketContext = createContext<SocketContextData | null>(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const WebSocketProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [userDeviceId, setUserDeviceId] = useState<string | null>(null);
  const [stompClient, setStompClient] = useState<any>(null);
  const [receiveRequest, setReceiveRequest] = useState<string | null>(null);
  const [connectionEstablished, setConnection] = useState(false);
  const [file, setFile] = useState<File>();
  const [gotFile, setGotFile] = useState(false);
  const chunksRef = useRef([]);
  const clientRef = useRef<CompatClient>();
  const toUserRef = useRef<string>();
  const peerConnectionRef = useRef<RTCPeerConnection>();
  const dataChannelRef = useRef<RTCDataChannel>();
  const fileNameRef = useRef("");

  useEffect(() => {
    const userDeviceId =
      localStorage.getItem("fileShareUID") ||
      (() => {
        const newId = uuidv4();
        localStorage.setItem("fileShareUID", newId);
        return newId;
      })();
    setUserDeviceId(userDeviceId);
  }, []);

  useEffect(() => {
    if (!userDeviceId) {
      return;
    }
    const socket = new SockJS(
      `http://localhost:8080/ws?userId=${userDeviceId}`
    );
    const stompClient = Stomp.over(socket);
    setStompClient(stompClient);
    stompClient.connect(
      { "user-id": userDeviceId },
      () => {
        stompClient.subscribe(
          `/user/${userDeviceId}/queue/receiveOffer`,
          (message) => {
            handleSignal(JSON.parse(message.body));
          }
        );
        stompClient.subscribe(
          `/user/${userDeviceId}/queue/receive/request`,
          (message) => {
            console.log(message);
            setReceiveRequest(message.body);
          }
        );
        stompClient.subscribe(
          `/user/${userDeviceId}/queue/connect`,
          (message) => {
            console.log("Connection established : ", message);

            toUserRef.current = message.body;
            createPeerConnection();
          }
        );

        stompClient.subscribe(
          `/user/${userDeviceId}/queue/receive/signal`,
          (message) => {
            console.log("SIGNAL MESSAGE : ", message);
            handleSignal(JSON.parse(message.body));
          }
        );
        setStompClient(stompClient);
        clientRef.current = stompClient;
      },
      (error: any) => {
        toast.error("Something went wrong while making connection to socket");
        console.error(error);
      }
    );
    return () => {
      if (stompClient && stompClient.connected) {
        console.log("<<<<<<<< DISCONNECTING FROM SOCKET >>>>>>>");
        stompClient.disconnect(() => {
          console.log("Disconnected from socket");
        });
      }
    };
  }, [userDeviceId]);

  const handleSignal = async (message: any) => {
    console.log("Sending signal to user : ", toUserRef.current);
    console.log(
      "Peer Connection In Handling Signal  : ",
      peerConnectionRef.current
    );
    if (message.signal) {
      console.log("SIGNAL : ", message.signal);
      const signal = message.signal;
      if (signal.type === "offer") {
        console.log("signal type offer");
        createPeerConnection(false);
        await peerConnectionRef.current?.setRemoteDescription(
          new RTCSessionDescription(signal)
        );
        console.log("sending answer");
        const answer = await peerConnectionRef.current?.createAnswer();
        console.log("Created Answer :", answer);
        await peerConnectionRef.current?.setLocalDescription(answer);
        console.log(peerConnectionRef.current);
        clientRef.current?.send(
          `/app/signal`,
          {},
          JSON.stringify({
            signal: peerConnectionRef.current?.localDescription,
            userId: toUserRef.current,
          })
        );
      } else if (signal.type === "answer") {
        console.log("Signal type answer :", signal);
        await peerConnectionRef.current?.setRemoteDescription(
          new RTCSessionDescription(signal)
        );
      }
    }
    if (message.candidate) {
      console.log("CANDIDATE : ", message.candidate);
      await peerConnectionRef.current?.addIceCandidate(
        new RTCIceCandidate(message.candidate)
      );
    }
  };

  const createPeerConnection = (initiator = true) => {
    if (!toUserRef.current) {
      console.error("No User connection established");
      return;
    }
    console.log("Creating peer connection");
    try {
      peerConnectionRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      console.log("PeerConnecion : ", peerConnectionRef.current);
      dataChannelRef.current =
        peerConnectionRef.current.createDataChannel("fileTransfer");
      console.log("Peer connection Ref : ", peerConnectionRef.current);
      dataChannelRef.current.onopen = () => {
        console.log("Data channel opened");
        setConnection(true);
      };

      dataChannelRef.current.onclose = () => {
        console.log("Data channel closed");
        setConnection(false);
      };

      dataChannelRef.current.onmessage = handleReceivingData;

      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending Candidate to ", toUserRef.current);
          clientRef.current?.send(
            `/app/signal`,
            {},
            JSON.stringify({
              candidate: event.candidate,
              userId: toUserRef.current,
            })
          );
        }
      };

      if (initiator) {
        createOffer();
      } else {
        peerConnectionRef.current.ondatachannel = (event) => {
          dataChannelRef.current = event.channel;
          dataChannelRef.current.onmessage = handleReceivingData;
          setConnection(true);
        };
      }
    } catch (e) {
      console.error("ERROR : ", e);
    }
  };

  const createOffer = async () => {
    const offer = await peerConnectionRef.current?.createOffer();
    await peerConnectionRef.current?.setLocalDescription(offer);
    clientRef.current?.send(
      `/app/signal`,
      {},
      JSON.stringify({ signal: offer, userId: toUserRef.current })
    );
  };

  const handleReceivingData = (event: MessageEvent) => {
    const data = event.data;
    console.log("RECIEVED DATA ", data);
    if (typeof data === "string" && data.includes("done")) {
      console.log("GOT FILE STRING");
      setGotFile(true);
      const parsed = JSON.parse(data);
      fileNameRef.current = parsed.fileName;
      download();
    } else {
      console.log("PUSHING DATA");
      chunksRef.current.push(data as never);
    }
  };

  const download = () => {
    setGotFile(false);
    console.log("Downloading file .....");
    const blob = new Blob(chunksRef.current);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = fileNameRef.current;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const sendFile = () => {
    if (!file) {
      console.error("No file has been selected");
      return;
    }

    const stream = file.stream();
    const reader = stream.getReader();
    console.log("SENDING FILE TO USER");
    const handleReading = (done: boolean, value: Uint8Array) => {
      if (done) {
        console.log("<<<<<< SENDING DONE >>>>>>");
        dataChannelRef.current?.send(
          JSON.stringify({ done: true, fileName: file.name })
        );
        return;
      }
      console.log("SENDING DATA");
      dataChannelRef.current?.send(value);
      reader.read().then(({ done, value }) => {
        handleReading(done, value as Uint8Array);
      });
    };

    reader.read().then(({ done, value }) => {
      handleReading(done, value as Uint8Array);
    });
  };

  const value: SocketContextData = {
    userDeviceId,
    sendFile,
    selectFile,
    download,
    connectionEstablished,

    setReceiveRequest,
    receiveRequest,
    createPeerConnection,
    stompClient,
    toUserRef,
    setConnection,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
