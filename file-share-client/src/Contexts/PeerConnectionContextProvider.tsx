import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
} from "react";

interface PeerConnectionContextData {
  userDeviceId: string | null;
  stompClient: any;
  sendFile: (e: any) => void;
  selectFile: (e: any) => void;
  download: () => void;
  connectionEstablished: boolean;
  createPeerConnection: () => void;
  setConnection: Dispatch<SetStateAction<boolean>>;
  toUserRef: any;
}

const PeerConnectionContext = createContext<PeerConnectionContextData | null>(
  null
);

export const usePeerConnectionContext = () => {
  const context = useContext(PeerConnectionContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
export const PeerConnectionContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  return <div></div>;
};

export default PeerConnectionContext;
