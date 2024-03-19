"use client"

type Props = {
    children: string | JSX.Element | JSX.Element[],
}

export function Modal({ children }: Props) {
    return (
        <div id="default-modal" tabIndex={-1} aria-hidden="true" className="overflow-y-auto overflow-x-hidden flex fixed top-0 right-0 left-0 z-50 justify-center w-full md:inset-0 h-full bg-gray-600 bg-opacity-50">
                <div className="relative bg-white rounded-lg shadow h-fit mt-48">
                    {children}
                </div>
        </div>
    )
}