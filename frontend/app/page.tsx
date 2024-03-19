"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeftIcon } from "lucide-react";
import { CallUser } from "@/components/call-user";
import DraggableVideo from "@/components/draggable-video";
import { useEffect, useMemo, useRef, useState } from "react";
import { CallModal } from "@/components/modal/call-modal";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
export default function Home() {
  const [username, setUsername] = useState("slim");
  const isAlreadyCalling = useRef(false);
  const getCalled = useRef<Record<string, any> | undefined>(undefined);
  const [inCall, setInCall] = useState(false);
  const [isCalled, setIsCalled] = useState(false);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useMemo(() => {
    if (typeof window !== "undefined") {
      const { RTCPeerConnection } = window;
      return new RTCPeerConnection()
    }
    return undefined
  }, []);

  useEffect(() => {
    // const storedInfo = localStorage.getItem('username');
    // if (storedInfo) setUsername(storedInfo)
    // else {
    //   const username = prompt("Enter your username") as string
    //   setUsername(username)
    //   localStorage.setItem('username', username)
    // }
    // return () => {
    //   localStorage.removeItem('username')
    // }
  }, []);

  useEffect(() => {
    if (peerConnection && videoRef.current) {
      console.log("Setting up peer connection");
      peerConnection.ontrack = function ({ streams: [stream] }) {
        if (videoRef.current === null) return;
        videoRef.current.srcObject = stream;
      };
    }
  }, [peerConnection, videoRef.current]);


  useEffect(() => {
    if (username !== "") {
      const newSocket = io("http://localhost:8080", {});
      setSocket(newSocket);
    }
  }, [username]);

  useEffect(() => {
    if (socket) {
      socket.on("update-user-list", ({ users }) => {
        delete users[socket.id as string];
        setUsers(users);
      });

      socket.on("call-made", async data => {
        console.log("Call made: ", getCalled.current);
        if (getCalled.current) {
          getCalled.current = { ...getCalled.current, visible: true };
          setIsCalled(true);
        } else {
          getCalled.current = { socket: data.socket, offer: data.offer, username: data.username};
          answerCall(data.socket, data.offer);
        }
      });

      socket.on("answer-made", async data => {
        await peerConnection?.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        console.log("Answer made: ", data.answer, isAlreadyCalling.current);
        if (!isAlreadyCalling.current) {
          isAlreadyCalling.current = true;
          callUser(data.socket);
          setInCall(true);
        }
      });

      socket.on("call-rejected", data => {
        alert(`User: "Socket: ${data.user}" rejected your call.`);
      });

      socket.emit("add-user", { username });
      return () => {
        socket.disconnect();
      }
    }
  }, [socket]);

  async function answerCall(socketId: string, offer: RTCSessionDescriptionInit) {
    await peerConnection?.setRemoteDescription(
      new RTCSessionDescription(offer)
    );
    const answer = await peerConnection?.createAnswer();
    await peerConnection?.setLocalDescription(new RTCSessionDescription(answer as RTCSessionDescriptionInit));

    socket?.emit("make-answer", {
      answer,
      to: socketId
    });
  };

  async function callUser(socketId: string) {
    if (!socketId || getCalled.current) return;
    const offer = await peerConnection?.createOffer();
    await peerConnection?.setLocalDescription(new RTCSessionDescription(offer as RTCSessionDescriptionInit));
    console.log("Calling user: ", socketId);
    socket?.emit("call-user", {
      offer,
      to: socketId
    });
  };

  async function respond(response: boolean) {
    if (response) {
      answerCall(getCalled.current?.socket, getCalled.current?.offer)
      setInCall(true);
      isAlreadyCalling.current = true;
    } else {
      socket?.emit("reject-call", {
        socket: getCalled.current?.socket
      });
    }
    getCalled.current = undefined;
    setIsCalled(false);
  };

  return (
    <>
      <DraggableVideo peerConnection={peerConnection} />
      <CallModal visible={isCalled} name={getCalled.current?.username as string} respond={(response)=>respond(response)} />
      
      <div className="grid h-dvh max-w-vw items-start lg:grid-cols-[28rem_1fr]">
        <div className="hidden lg:flex flex-col border-l border-r border-gray-800 h-full">
          <div className="flex items-center p-4 border-b border-gray-800 ">
            <Button size="icon">
              <ChevronLeftIcon className="w-6 h-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <h2 className="text-lg font-semibold ml-2">Online</h2>
          </div>
          <div className="">
            <div className="grid gap-4 p-4 overflow-y-scroll">
              {
                Object.keys(users).map((id) => (
                  <CallUser
                    key={id}
                    username={users[id]}
                    callUser={() => callUser(id)}
                  />
                ))
              }
            </div>
          </div>
        </div>
        <div className="flex flex-grow flex-col min-h-0 border-t border-gray-800 max-h-vh">
          <header className="flex items-center justify-between p-4 border-b border-gray-800 lg:hidden">
            <Button size="icon">
              <ChevronLeftIcon className="w-6 h-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <h1 className="text-lg font-semibold">Online</h1>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center gap-4 w-full h-full">
            <div className="grid w-full gap-2 h-full">
              <div className="flex flex-col gap-2 h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  className="rounded-lg object-cover w-full h-[calc(100vh-50px)] bg-black-900"
                  style={{
                    aspectRatio: "20/20",
                    objectFit: "cover",
                  }}
                />
                <div className="flex items-center gap-2">
                  <h1 className="ml-1 text-2xl font-bold">{getCalled.current?.username || "Call a user" }</h1>
                  {getCalled.current?.username && <Badge>Online</Badge>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>

  );
}
