import { Link } from "lucide-react";

export default function Menu() {
    return (
        <main className="w-full h-screen bg-black justify-center items-center flex flex-col">
            <h1 className="text-white text-4xl mb-4">Menu Page</h1>
            <Link href="/" className="text-blue-500 underline">
                Go to Home
            </Link>
        </main>
    )
}