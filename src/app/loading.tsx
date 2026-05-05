export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="p-10 min-h-screen text-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white/50"></div>
    </div>
  )
}
