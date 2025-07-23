export default function WardrobesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Skeleton */}
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
              <div className="text-gray-400">|</div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-700 rounded-full animate-pulse"></div>
                <div className="w-32 h-6 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 h-8 bg-gray-700 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
              <div className="w-16 h-8 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="w-64 h-8 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="w-96 h-4 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="w-40 h-10 bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Wardrobes Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-lg p-6 animate-pulse"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div>
                    <div className="w-24 h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="w-32 h-3 bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                  <div className="w-4 h-4 bg-gray-700 rounded"></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-8 h-6 bg-gray-600 rounded mx-auto mb-1"></div>
                  <div className="w-12 h-3 bg-gray-600 rounded mx-auto"></div>
                </div>
                <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-12 h-6 bg-gray-600 rounded mx-auto mb-1"></div>
                  <div className="w-10 h-3 bg-gray-600 rounded mx-auto"></div>
                </div>
              </div>

              {/* Status */}
              <div className="text-center py-4 mb-4">
                <div className="w-8 h-8 bg-gray-600 rounded mx-auto mb-2"></div>
                <div className="w-20 h-3 bg-gray-600 rounded mx-auto mb-1"></div>
                <div className="w-24 h-3 bg-gray-600 rounded mx-auto"></div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <div className="flex-1 h-8 bg-gray-700 rounded"></div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
