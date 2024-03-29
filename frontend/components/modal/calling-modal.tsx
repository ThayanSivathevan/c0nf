/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/O8W4xOCSIKH
 */
import { CardContent, CardFooter, Card } from "@/components/ui/modal-card"
import { Button } from "@/components/ui/modal-button"
import { PhoneIncomingIcon } from "@/components/ui/icons"
import { Modal } from "@/components/ui/modal"

interface Props {
    name: string,
    visible: boolean
}
export function CallingModal({ name, visible }: Props) {
    if (visible)
        return (
            <Modal>
                <Card className="max-w-sm w-full mx-auto">
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                            <PhoneIncomingIcon className="h-6 w-6" />
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold">Calling</h2>
                                <p className="text-sm text-gray-500">{name}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Modal>
        )
    return <></>

}


