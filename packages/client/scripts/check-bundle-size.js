import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(__dirname, '../dist/assets')

// Performance budgets
const budgets = {
  'index-*.js': { limit: 25 * 1024, name: 'App Bundle' },
  'react-vendor-*.js': { limit: 145 * 1024, name: 'React Vendor' },
  'router-vendor-*.js': { limit: 20 * 1024, name: 'Router Vendor' },
  'query-vendor-*.js': { limit: 30 * 1024, name: 'Query Vendor' },
  'gesture-vendor-*.js': { limit: 30 * 1024, name: 'Gesture Vendor' },
  'index-*.css': { limit: 15 * 1024, name: 'CSS Bundle' },
  '*Screen-*.js': { limit: 8 * 1024, name: 'Screen Chunks (avg)' }
}

// Total initial bundle budget
const totalInitialBudget = 200 * 1024 // 200KB

console.log('📊 Bundle Size Report\n')
console.log('=' .repeat(60))

let totalInitialSize = 0
let hasFailures = false
const results = []

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Build directory not found. Run "npm run build" first.')
  process.exit(1)
}

// Get all files in dist/assets
const files = fs.readdirSync(distPath)

// Check each budget
for (const [pattern, config] of Object.entries(budgets)) {
  const regex = new RegExp(pattern.replace('*', '.*'))
  const matchingFiles = files.filter(file => regex.test(file))
  
  if (matchingFiles.length === 0) continue
  
  let totalSize = 0
  let fileCount = 0
  
  matchingFiles.forEach(file => {
    const stats = fs.statSync(path.join(distPath, file))
    totalSize += stats.size
    fileCount++
  })
  
  const avgSize = fileCount > 1 ? totalSize / fileCount : totalSize
  const sizeToCheck = pattern.includes('Screen') ? avgSize : totalSize
  const passed = sizeToCheck <= config.limit
  
  if (!passed) hasFailures = true
  
  // Add to initial bundle if not a lazy chunk
  if (!pattern.includes('Screen')) {
    totalInitialSize += totalSize
  }
  
  results.push({
    name: config.name,
    size: sizeToCheck,
    limit: config.limit,
    passed,
    isAverage: fileCount > 1
  })
}

// Display results
results.forEach(result => {
  const icon = result.passed ? '✅' : '❌'
  const sizeKB = (result.size / 1024).toFixed(2)
  const limitKB = (result.limit / 1024).toFixed(2)
  const percentage = ((result.size / result.limit) * 100).toFixed(1)
  const avgText = result.isAverage ? ' (avg)' : ''
  
  console.log(
    `${icon} ${result.name.padEnd(20)} ${sizeKB.padStart(8)} KB / ${limitKB.padStart(8)} KB (${percentage}%)${avgText}`
  )
})

console.log('=' .repeat(60))

// Check total initial bundle
const totalPassed = totalInitialSize <= totalInitialBudget
if (!totalPassed) hasFailures = true

const totalIcon = totalPassed ? '✅' : '❌'
const totalKB = (totalInitialSize / 1024).toFixed(2)
const totalLimitKB = (totalInitialBudget / 1024).toFixed(2)
const totalPercentage = ((totalInitialSize / totalInitialBudget) * 100).toFixed(1)

console.log(
  `${totalIcon} Total Initial Bundle ${totalKB.padStart(8)} KB / ${totalLimitKB.padStart(8)} KB (${totalPercentage}%)`
)

// Calculate gzipped sizes (rough estimate)
const gzipEstimate = totalInitialSize * 0.3
console.log(`\n💨 Estimated gzipped: ~${(gzipEstimate / 1024).toFixed(2)} KB`)

console.log('\n' + '=' .repeat(60))

if (hasFailures) {
  console.log('\n❌ Bundle size check failed! Some bundles exceed their limits.')
  console.log('\n📝 Suggestions:')
  console.log('  - Review large dependencies')
  console.log('  - Enable more code splitting')
  console.log('  - Remove unused code')
  console.log('  - Consider dynamic imports')
  process.exit(1)
} else {
  console.log('\n✅ All bundle sizes within limits!')
}