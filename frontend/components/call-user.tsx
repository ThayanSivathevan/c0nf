import Link from "next/link"
import { VideoIcon } from "@/components/ui/icons"
interface Props {
    username: string;
    callUser: () => Promise<void>;
}

export function CallUser({ username, callUser }: Props) {
    return (
        <button onClick={callUser} className="flex w-full items-center rounded-lg p-3 bg-gray-100">
            <img
                alt="User 1"
                className="rounded-full"
                height="48"
                src="/placeholder-user.jpg"
                style={{
                    aspectRatio: "48/48",
                    objectFit: "cover",
                }}
                width="48"
            />
            <div className="flex-1 ml-3">
                <div className="font-semibold">{username}</div>
            </div>
            <VideoIcon className="w-5 h-5" />
        </button>
    )
}