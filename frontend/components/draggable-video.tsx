"use client"
import { useEffect, useRef, useState } from 'react';

interface Props {
    peerConnection: RTCPeerConnection | undefined;
}
interface Position {
    x: number;
    y: number;
}

const width = 320;
const height = 180;
const offset = 50;
const decceleration = 0.95;
function DraggableVideo({ peerConnection }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState<Position>({ x: window.innerWidth - width - offset, y: window.innerHeight - height - offset });
    const [velocity, setVelocity] = useState<Position>({ x: 0, y: 0 });
    const videoRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
        if (!isDragging) {
            const interval = setInterval(() => {
                if (Math.abs(velocity.x) < 0.1 && Math.abs(velocity.y) < 0.1) {
                    setVelocity({ x: 0, y: 0 });
                    clearInterval(interval);
                } else {
                    setPosition((pos) => (getNewPosition(pos, velocity.x, velocity.y)));
                    setVelocity((vel) => ({
                        x: vel.x * decceleration,
                        y: vel.y * decceleration,
                    }));
                }
            }, 10);

            return () => clearInterval(interval);
        }
    }, [isDragging, velocity.x, velocity.y]);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia(
            { video: true, audio: true },
        ).then((stream) => {
            if (videoRef.current === null) return;
            videoRef.current.srcObject = stream;
            stream.getTracks().forEach(track => peerConnection?.addTrack(track, stream));
        }).catch((err) => {
            console.error(err);
        });;
    }, []);

    const startDragging = (e: React.PointerEvent<HTMLDivElement>) => {
        console.log('start dragging');
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
        setVelocity({ x: 0, y: 0 });
    };

    const onDrag = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        setPosition(getNewPosition(position, e.movementX, e.movementY));
        setVelocity({ x: e.movementX, y: e.movementY });
    };

    const stopDragging = () => {
        setIsDragging(false);
    };

    const getNewPosition = (position: Position, movementX: number, movementY: number) => {
        return {
            x: Math.min(Math.max(position.x + movementX, 0), window.innerWidth - width),
            y: Math.min(Math.max(position.y + movementY, 0), window.innerHeight - height)
        };
    }
    return (
        <div
            className="absolute cursor-move z-30"
            style={{ left: `${position.x}px`, top: `${position.y}px` }}
            onPointerDown={startDragging}
            onPointerMove={onDrag}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
        >
            <video
                className="w-80 h-48 bg-black"
                autoPlay
                muted
                ref={videoRef}
            >
            </video>
        </div>
    );
};

export default DraggableVideo;