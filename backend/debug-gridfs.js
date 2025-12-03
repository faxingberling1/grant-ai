// /backend/debug-gridfs.js
console.log('🔍 Debugging GridFS service export...\n');

// Try to import the service
try {
  const gridfsService = require('./services/gridfsService');
  
  console.log('1. Import successful');
  console.log('   Type:', typeof gridfsService);
  console.log('   Is object?', typeof gridfsService === 'object' && gridfsService !== null);
  console.log('   Is class instance?', gridfsService.constructor && gridfsService.constructor.name);
  
  console.log('\n2. Available methods:');
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(gridfsService));
  methods.forEach(method => {
    if (method !== 'constructor') {
      console.log(`   - ${method}: ${typeof gridfsService[method]}`);
    }
  });
  
  console.log('\n3. Direct properties:');
  Object.keys(gridfsService).forEach(key => {
    console.log(`   - ${key}: ${typeof gridfsService[key]}`);
  });
  
  console.log('\n4. Trying to call healthCheck:');
  if (typeof gridfsService.healthCheck === 'function') {
    console.log('   ✅ healthCheck is a function');
    try {
      const result = await gridfsService.healthCheck();
      console.log('   ✅ healthCheck result:', result);
    } catch (error) {
      console.log('   ❌ healthCheck error:', error.message);
    }
  } else {
    console.log('   ❌ healthCheck is NOT a function');
    console.log('   healthCheck type:', typeof gridfsService.healthCheck);
  }
  
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n🎯 Common issues:');
console.log('1. Check if gridfsService.js has: module.exports = gridfsService;');
console.log('2. Check if the class has healthCheck method');
console.log('3. Check for circular dependencies');