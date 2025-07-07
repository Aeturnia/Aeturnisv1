import { ServiceProvider, initializeProviders } from '../../index';
import { IMonsterService } from '../../interfaces/IMonsterService';
import { INPCService } from '../../interfaces/INPCService';
import { ICurrencyService } from '../../interfaces/ICurrencyService';

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  opsPerSecond: number;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  async runBenchmark(
    name: string,
    fn: () => Promise<any>,
    iterations: number = 1000
  ): Promise<BenchmarkResult> {
    const times: number[] = [];
    
    // Warmup
    for (let i = 0; i < 10; i++) {
      await fn();
    }
    
    // Actual benchmark
    const startTotal = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      await fn();
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1_000_000); // Convert to milliseconds
    }
    
    const endTotal = process.hrtime.bigint();
    const totalTime = Number(endTotal - startTotal) / 1_000_000;
    
    const result: BenchmarkResult = {
      name,
      iterations,
      totalTime,
      averageTime: totalTime / iterations,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      opsPerSecond: (iterations / totalTime) * 1000
    };
    
    this.results.push(result);
    return result;
  }

  printResults() {
    console.log('\n=== Performance Benchmark Results ===\n');
    
    const headers = ['Benchmark', 'Iterations', 'Total (ms)', 'Avg (ms)', 'Min (ms)', 'Max (ms)', 'Ops/sec'];
    const colWidths = [30, 12, 12, 12, 12, 12, 12];
    
    // Print headers
    console.log(headers.map((h, i) => h.padEnd(colWidths[i])).join(''));
    console.log('-'.repeat(102));
    
    // Print results
    this.results.forEach(result => {
      const row = [
        result.name.padEnd(colWidths[0]),
        result.iterations.toString().padEnd(colWidths[1]),
        result.totalTime.toFixed(2).padEnd(colWidths[2]),
        result.averageTime.toFixed(4).padEnd(colWidths[3]),
        result.minTime.toFixed(4).padEnd(colWidths[4]),
        result.maxTime.toFixed(4).padEnd(colWidths[5]),
        result.opsPerSecond.toFixed(0).padEnd(colWidths[6])
      ];
      console.log(row.join(''));
    });
    
    console.log('\n');
  }

  compareResults(baseline: string, comparison: string): void {
    const baselineResult = this.results.find(r => r.name === baseline);
    const comparisonResult = this.results.find(r => r.name === comparison);
    
    if (!baselineResult || !comparisonResult) {
      console.error('Could not find results for comparison');
      return;
    }
    
    const speedup = baselineResult.averageTime / comparisonResult.averageTime;
    const percentDiff = ((comparisonResult.averageTime - baselineResult.averageTime) / baselineResult.averageTime) * 100;
    
    console.log(`\n=== Comparison: ${baseline} vs ${comparison} ===`);
    console.log(`${comparison} is ${speedup.toFixed(2)}x ${speedup > 1 ? 'faster' : 'slower'}`);
    console.log(`Difference: ${percentDiff > 0 ? '+' : ''}${percentDiff.toFixed(2)}%`);
  }
}

async function runAllBenchmarks() {
  const benchmark = new PerformanceBenchmark();
  
  console.log('Setting up Mock Services...');
  process.env.USE_MOCKS = 'true';
  await initializeProviders(true);
  const mockProvider = ServiceProvider.getInstance();
  
  console.log('Running Mock Service Benchmarks...\n');
  
  // Benchmark 1: Monster Service - Get Monsters
  await benchmark.runBenchmark(
    'Mock: getMonstersInZone',
    async () => {
      const service = mockProvider.get<IMonsterService>('MonsterService');
      await service.getMonstersInZone('starter-zone');
    }
  );
  
  // Benchmark 2: NPC Service - Get NPCs
  await benchmark.runBenchmark(
    'Mock: getNPCsInZone',
    async () => {
      const service = mockProvider.get<INPCService>('NPCService');
      await service.getNPCsInZone('starter-zone');
    }
  );
  
  // Benchmark 3: Currency Service - Get Balance
  await benchmark.runBenchmark(
    'Mock: getBalance',
    async () => {
      const service = mockProvider.get<ICurrencyService>('CurrencyService');
      await service.getBalance('test-character');
    }
  );
  
  // Benchmark 4: Currency Service - Add Currency
  await benchmark.runBenchmark(
    'Mock: addCurrency',
    async () => {
      const service = mockProvider.get<ICurrencyService>('CurrencyService');
      await service.addCurrency(`char-${Math.random()}`, 100n, 'test');
    },
    500 // Fewer iterations for write operations
  );
  
  // Benchmark 5: Service Provider - Get Service
  await benchmark.runBenchmark(
    'Mock: ServiceProvider.get',
    async () => {
      mockProvider.get<IMonsterService>('MonsterService');
    },
    10000 // More iterations for simple operations
  );
  
  // Now test with real services (if desired)
  console.log('\nSetting up Real Services...');
  (ServiceProvider as any).instance = undefined;
  process.env.USE_MOCKS = 'false';
  await initializeProviders(false);
  const realProvider = ServiceProvider.getInstance();
  
  console.log('Running Real Service Benchmarks...\n');
  
  // Benchmark 6: Real Service Provider - Get Service
  await benchmark.runBenchmark(
    'Real: ServiceProvider.get',
    async () => {
      realProvider.get<IMonsterService>('MonsterService');
    },
    10000
  );
  
  // Print all results
  benchmark.printResults();
  
  // Compare mock vs real service provider
  benchmark.compareResults('Mock: ServiceProvider.get', 'Real: ServiceProvider.get');
  
  // Memory usage report
  console.log('\n=== Memory Usage ===');
  const memUsage = process.memoryUsage();
  console.log(`Heap Used: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Total: ${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`RSS: ${(memUsage.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`External: ${(memUsage.external / 1024 / 1024).toFixed(2)} MB`);
}

// Run benchmarks if this file is executed directly
if (require.main === module) {
  runAllBenchmarks()
    .then(() => {
      console.log('\nBenchmarks completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Benchmark failed:', error);
      process.exit(1);
    });
}

export { PerformanceBenchmark, runAllBenchmarks };