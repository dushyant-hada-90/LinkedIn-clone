function PostSkeleton() {
  return (
    <div className="w-full min-h-[200px] flex flex-col gap-[10px] bg-white rounded-lg shadow-lg p-[20px] animate-pulse">
      
      {/* Header Section: Profile Image + Name */}
      <div className="flex justify-between items-center">
        <div className="flex justify-center items-center gap-[10px]">
          {/* Avatar Circle */}
          <div className="w-[70px] h-[70px] rounded-full bg-gray-200" />
          
          <div className="space-y-2">
            {/* Name Line */}
            <div className="h-5 bg-gray-200 rounded-md w-32" />
            {/* Headline Line */}
            <div className="h-4 bg-gray-200 rounded-md w-48" />
            {/* Time Line */}
            <div className="h-3 bg-gray-200 rounded-md w-20" />
          </div>
        </div>
        
        {/* Connection Button Placeholder */}
        <div className="w-24 h-8 bg-gray-100 rounded-full" />
      </div>

      {/* Description Section */}
      <div className="pl-[50px] space-y-2 mt-2">
        <div className="h-4 bg-gray-200 rounded-md w-full" />
        <div className="h-4 bg-gray-200 rounded-md w-[90%]" />
      </div>

      {/* Image Placeholder (Optional - simulating a large post image) */}
      <div className="w-full h-64 bg-gray-200 rounded-lg mt-2" />

      {/* Footer / Action Buttons Section */}
      <div className="border-t-2 border-gray-100 mt-4 pt-4">
        <div className="flex justify-between items-center px-[20px]">
          {/* Simulating Like, Comment, Repost, Send icons */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-md" />
            <div className="w-10 h-3 bg-gray-100 rounded" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-md" />
            <div className="w-10 h-3 bg-gray-100 rounded" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-md" />
            <div className="w-10 h-3 bg-gray-100 rounded" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-md" />
            <div className="w-10 h-3 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonFeed({ count = 2 }) {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  );
}