// Debug script to trace dynamic buffer requires
const originalRequire = global.require;

global.require = function(id) {
  if (id === 'buffer') {
    console.log('🔍 BUFFER REQUIRE DETECTED!');
    console.log('Stack trace:');
    console.trace();
    console.log('---');
  }
  return originalRequire.apply(this, arguments);
};

console.log('Buffer require debugging enabled'); 