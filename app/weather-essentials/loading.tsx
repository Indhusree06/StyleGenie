export default function WeatherEssentialsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Skeleton */}
      <nav className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
              <div className="text-gray-400">|</div>
              <div className="h-8 w-40 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-10 w-80 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Category Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-800/80 border border-gray-700 rounded-lg p-4">
              <div className="w-10 h-10 bg-gray-700 rounded-lg mb-2 animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-700 rounded animate-pulse mb-1"></div>
              <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64 h-10 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-48 h-10 bg-gray-700 rounded animate-pulse"></div>
          <div className="w-48 h-10 bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Items Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800/80 border border-gray-700 rounded-lg overflow-hidden">
              <div className="w-full h-48 bg-gray-700 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="h-5 w-24 bg-gray-700 rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-16 bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-3 w-3/4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
