import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="p-10 min-h-screen text-black flex flex-col justify-center items-center">
        <div className="bg-white/30 backdrop-blur-lg p-10 rounded-2xl border border-white/40 shadow-lg text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
            <p className="text-white/80 mb-6">Could not find the requested page.</p>
            <Link href="/">
                <p className="bg-blue-500 text-white px-10 py-3 rounded-xl font-bold text-lg hover:-translate-y-1 active:scale-95 transition-all shadow-md">
                    Return Home
                </p>
            </Link>
        </div>
    </div>
  )
}
