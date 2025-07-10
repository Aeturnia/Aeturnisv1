import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals'
import App from './App.tsx'
import './index.css'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Mobile-specific settings
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

// Web Vitals reporting
function sendToAnalytics(metric: Metric) {
  // Log to console for now
  const value = Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value)
  console.log(`[Web Vitals] ${metric.name}: ${value}`, {
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType
  })
  
  // In production, you would send this to your analytics endpoint
  // Example: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(metric) })
}

// Monitor Core Web Vitals
onCLS(sendToAnalytics)  // Cumulative Layout Shift
onFCP(sendToAnalytics)  // First Contentful Paint
onLCP(sendToAnalytics)  // Largest Contentful Paint
onTTFB(sendToAnalytics) // Time to First Byte
onINP(sendToAnalytics)  // Interaction to Next Paint (replaced FID)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)