// Manual test script for announcements API endpoints
import fetch from 'node-fetch';

async function testHighlightedAnnouncements() {
  try {
    console.log("Testing GET /api/announcements/highlighted...");
    const response = await fetch('http://localhost:5000/api/announcements/highlighted');
    const data = await response.json();
    
    console.log(`Response status: ${response.status}`);
    console.log(`Highlighted announcements found: ${data.length}`);
    console.log("Highlighted announcements data:", JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error("Error testing highlighted announcements:", error);
    return [];
  }
}

async function testAllAnnouncements() {
  try {
    console.log("Testing GET /api/announcements...");
    const response = await fetch('http://localhost:5000/api/announcements');
    const data = await response.json();
    
    console.log(`Response status: ${response.status}`);
    console.log(`Total announcements found: ${data.length}`);
    console.log(`Announcements with isHighlighted=true: ${data.filter(a => a.isHighlighted).length}`);
    
    const highlightedAnnouncements = data.filter(a => a.isHighlighted);
    console.log("Highlighted announcements from all announcements:", 
      highlightedAnnouncements.map(a => ({ id: a.id, title: a.title, isHighlighted: a.isHighlighted })));
    
    return data;
  } catch (error) {
    console.error("Error testing all announcements:", error);
    return [];
  }
}

async function main() {
  console.log("=== TESTING ANNOUNCEMENTS API ===");
  await testHighlightedAnnouncements();
  console.log("\n");
  await testAllAnnouncements();
  console.log("=== TEST COMPLETE ===");
}

main();