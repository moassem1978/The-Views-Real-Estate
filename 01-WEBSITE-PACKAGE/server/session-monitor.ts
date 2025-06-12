
import { pool } from "./db";

export class SessionMonitor {
  private static instance: SessionMonitor;
  private cleanupInterval: NodeJS.Timeout | null = null;

  static getInstance(): SessionMonitor {
    if (!SessionMonitor.instance) {
      SessionMonitor.instance = new SessionMonitor();
    }
    return SessionMonitor.instance;
  }

  // Start monitoring sessions
  startMonitoring() {
    console.log("Starting session monitoring and cleanup...");
    
    // Clean up expired sessions every 30 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 30 * 60 * 1000); // 30 minutes

    // Initial cleanup
    this.cleanupExpiredSessions();
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log("Session monitoring stopped");
    }
  }

  // Clean up expired sessions
  async cleanupExpiredSessions() {
    try {
      const result = await pool.query(
        'DELETE FROM session WHERE expire < NOW()'
      );
      
      if (result.rowCount && result.rowCount > 0) {
        console.log(`Cleaned up ${result.rowCount} expired sessions`);
      }
    } catch (error) {
      console.error("Error cleaning up expired sessions:", error);
    }
  }

  // Get session statistics
  async getSessionStats() {
    try {
      const totalResult = await pool.query('SELECT COUNT(*) as total FROM session');
      const expiredResult = await pool.query(
        'SELECT COUNT(*) as expired FROM session WHERE expire < NOW()'
      );
      const activeResult = await pool.query(
        'SELECT COUNT(*) as active FROM session WHERE expire >= NOW()'
      );

      return {
        total: parseInt(totalResult.rows[0].total),
        expired: parseInt(expiredResult.rows[0].expired),
        active: parseInt(activeResult.rows[0].active)
      };
    } catch (error) {
      console.error("Error getting session stats:", error);
      return { total: 0, expired: 0, active: 0 };
    }
  }

  // Force cleanup of all sessions for a specific user
  async cleanupUserSessions(userId: number) {
    try {
      // Sessions store user data in sess column as JSON
      const result = await pool.query(
        `DELETE FROM session WHERE sess::text LIKE '%"id":${userId}%'`
      );
      
      console.log(`Cleaned up ${result.rowCount || 0} sessions for user ${userId}`);
      return result.rowCount || 0;
    } catch (error) {
      console.error(`Error cleaning up sessions for user ${userId}:`, error);
      return 0;
    }
  }
}
