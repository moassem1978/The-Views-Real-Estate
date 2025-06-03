
const { ManualRestoreService } = require('./server/manual-restore-service.ts');
const { pool } = require('./server/db.ts');

async function emergencyRestore() {
  console.log('🚨 Starting emergency restoration...');
  
  try {
    // Check database connection
    console.log('Testing database connection...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
    
    // Initialize restore service
    const restoreService = new ManualRestoreService();
    
    // Get restoration report
    console.log('📊 Getting restoration report...');
    const report = await restoreService.getRestorationReport();
    console.log('Report:', report);
    
    // Restore images from attached_assets
    console.log('🖼️ Restoring images...');
    await restoreService.restoreImagesFromAssets();
    
    // Rebuild property image associations
    console.log('🔗 Rebuilding property associations...');
    await restoreService.rebuildPropertyImages();
    
    console.log('✅ Emergency restoration completed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Emergency restoration failed:', error);
    process.exit(1);
  }
}

emergencyRestore();
