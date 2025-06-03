
const { ManualRestoreService } = require('./server/manual-restore-service.ts');

async function runRestore() {
  const restoreService = new ManualRestoreService();
  
  try {
    console.log('🔍 Getting restoration report...');
    const report = await restoreService.getRestorationReport();
    
    console.log('\n📊 RESTORATION REPORT:');
    console.log('='.repeat(50));
    console.log(`Available backups: ${report.availableBackups.length}`);
    console.log(`Attached assets: ${report.attachedAssets} files`);
    console.log(`Public images: ${report.publicImages} files`);
    console.log(`Total properties: ${report.totalProperties}`);
    console.log(`Properties with images: ${report.propertiesWithImages}`);
    console.log(`Properties without images: ${report.propertiesWithoutImages}`);
    console.log('='.repeat(50));
    
    if (report.attachedAssets > 0) {
      console.log('\n🚀 Starting full restoration...');
      await restoreService.fullRestore();
      
      // Get updated report
      const updatedReport = await restoreService.getRestorationReport();
      console.log('\n📊 AFTER RESTORATION:');
      console.log('='.repeat(50));
      console.log(`Public images: ${updatedReport.publicImages} files`);
      console.log(`Properties with images: ${updatedReport.propertiesWithImages}`);
      console.log(`Properties without images: ${updatedReport.propertiesWithoutImages}`);
      console.log('='.repeat(50));
    } else {
      console.log('\n⚠️  No attached assets found to restore from');
    }
    
  } catch (error) {
    console.error('❌ Restoration failed:', error);
    process.exit(1);
  }
}

// Run the restoration
runRestore();
