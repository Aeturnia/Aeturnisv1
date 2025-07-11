import { ServiceLayer, initializeServices } from './services';

// Test configuration
const serviceConfig = {
  apiBaseUrl: 'http://localhost:3000',
  wsUrl: 'ws://localhost:3000',
  timeout: 30000,
  cacheConfig: {
    storage: 'memory' as const,
    maxSize: 1000,
    defaultTTL: 300000
  },
  offlineConfig: {
    storage: 'memory' as const,
    maxSize: 100,
    maxRetries: 3
  }
};

async function testServices() {
  console.log('Starting service connectivity tests...\n');
  
  let services: ServiceLayer;
  
  try {
    // Initialize services
    console.log('1. Initializing ServiceLayer...');
    services = initializeServices(serviceConfig);
    await services.initialize();
    console.log('✅ ServiceLayer initialized successfully\n');
  } catch (error) {
    console.error('❌ Failed to initialize ServiceLayer:', error);
    return;
  }
  
  // Check service registration
  console.log('2. Checking service registration...');
  const registeredServices = ['CharacterService', 'ZoneService', 'InventoryService'];
  
  registeredServices.forEach(serviceName => {
    const isRegistered = services.getState().selectSlice(serviceName.toLowerCase());
    console.log(`${serviceName}: ${isRegistered ? '✅ Registered' : '❌ Not registered'}`);
  });
  console.log('');
  
  // Test CharacterService
  console.log('3. Testing CharacterService...');
  try {
    const characterService = services.character;
    console.log('- Service instance:', characterService ? '✅' : '❌');
    console.log('- API endpoint check: /api/v1/characters/');
    
    // Check if the service has the expected methods
    const methods = ['getCharacter', 'getCharacters', 'updatePosition', 'addExperience', 'allocateStats', 'getStats'];
    methods.forEach(method => {
      console.log(`  - ${method}: ${typeof (characterService as any)[method] === 'function' ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('❌ CharacterService test failed:', error);
  }
  console.log('');
  
  // Test ZoneService
  console.log('4. Testing ZoneService...');
  try {
    const zoneService = services.zone;
    console.log('- Service instance:', zoneService ? '✅' : '❌');
    console.log('- API endpoint check: /api/v1/zones');
    
    // Check if the service has the expected methods
    const methods = ['getZones', 'getZone', 'getCurrentZone', 'getCharacterPosition', 'moveToZone', 'moveInDirection'];
    methods.forEach(method => {
      console.log(`  - ${method}: ${typeof (zoneService as any)[method] === 'function' ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('❌ ZoneService test failed:', error);
  }
  console.log('');
  
  // Test InventoryService
  console.log('5. Testing InventoryService...');
  try {
    const inventoryService = services.inventory;
    console.log('- Service instance:', inventoryService ? '✅' : '❌');
    console.log('- API endpoint check: /api/v1/equipment/{characterId}/inventory');
    
    // Check if the service has the expected methods
    const methods = ['getInventory', 'getEquipment', 'equipItem', 'unequipItem', 'dropItem', 'moveItem'];
    methods.forEach(method => {
      console.log(`  - ${method}: ${typeof (inventoryService as any)[method] === 'function' ? '✅' : '❌'}`);
    });
  } catch (error) {
    console.error('❌ InventoryService test failed:', error);
  }
  console.log('');
  
  // Check API client configuration
  console.log('6. Checking API client configuration...');
  const apiClient = services.getApiClient();
  console.log('- Base URL:', (apiClient as any).config?.baseURL || 'Not configured');
  console.log('- Timeout:', (apiClient as any).config?.timeout || 'Not configured');
  console.log('');
  
  // Check WebSocket configuration
  console.log('7. Checking WebSocket configuration...');
  const wsManager = services.getWebSocketManager();
  console.log('- WS URL:', (wsManager as any).config?.url || 'Not configured');
  console.log('- Auto-reconnect:', (wsManager as any).config?.autoReconnect || false);
  console.log('');
  
  // Check state management
  console.log('8. Checking state management...');
  const stateManager = services.getState();
  const stateKeys = [
    'character:current',
    'character:list',
    'character:stats',
    'zone:list',
    'zone:current',
    'zone:positions',
    'inventory:data',
    'equipment:data',
    'equipment:stats'
  ];
  
  stateKeys.forEach(key => {
    const hasKey = stateManager.has(key);
    console.log(`- ${key}: ${hasKey ? '✅ Initialized' : '❌ Not initialized'}`);
  });
  
  console.log('\n✅ Service connectivity test completed!');
  console.log('\nNote: To test actual API connectivity, ensure the backend server is running on http://localhost:3000');
  
  // Cleanup
  await services.destroy();
}

// Run the test
testServices().catch(console.error);