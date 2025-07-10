export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div
        className="text-center"
      >
        {/* Logo or icon */}
        <div
          className="text-6xl mb-4"
        >
          ⚔️
        </div>
        
        {/* Loading text */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Aeturnis Online
        </h1>
        
        <p className="text-dark-400 mb-6">
          Loading your adventure...
        </p>
        
        {/* Loading bar */}
        <div className="w-48 h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full"
            style={{ width: '100%' }}
          />
        </div>
        
        {/* Loading dots */}
        <div className="flex justify-center space-x-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  )
}