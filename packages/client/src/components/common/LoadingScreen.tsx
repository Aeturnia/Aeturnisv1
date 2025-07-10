import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo or icon */}
        <motion.div
          className="text-6xl mb-4"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360] 
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ⚔️
        </motion.div>
        
        {/* Loading text */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Aeturnis Online
        </h1>
        
        <p className="text-dark-400 mb-6">
          Loading your adventure...
        </p>
        
        {/* Loading bar */}
        <div className="w-48 h-2 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        
        {/* Loading dots */}
        <div className="flex justify-center space-x-1 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-primary-500 rounded-full"
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}