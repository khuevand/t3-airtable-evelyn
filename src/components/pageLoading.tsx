export default function PageLoading() {
  return(
      <div className="absolute inset-0 bg-white flex justify-center items-center z-10">
        <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-gray-800">
        </div>
      </div>
    );
}