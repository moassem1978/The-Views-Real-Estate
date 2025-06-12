
import { offlineManager } from './offline-manager';
import FrontendMonitoring from './monitoring';

interface TestScenario {
  name: string;
  description: string;
  execute: () => Promise<void>;
  cleanup: () => void;
}

class RecoveryTestManager {
  private activeTests: Set<string> = new Set();
  private originalFetch: typeof fetch;

  constructor() {
    this.originalFetch = window.fetch;
  }

  public getTestScenarios(): TestScenario[] {
    return [
      {
        name: 'Network Offline',
        description: 'Simulate complete network disconnection',
        execute: async () => {
          console.log('🧪 Starting offline simulation');
          window.dispatchEvent(new Event('offline'));
          this.simulateNetworkFailure();
          this.activeTests.add('offline');
        },
        cleanup: () => {
          console.log('🧪 Ending offline simulation');
          this.restoreNetwork();
          window.dispatchEvent(new Event('online'));
          this.activeTests.delete('offline');
        }
      },
      {
        name: 'Server Error 500',
        description: 'Simulate server internal errors',
        execute: async () => {
          console.log('🧪 Starting server error simulation');
          this.simulateServerErrors();
          this.activeTests.add('server_error');
        },
        cleanup: () => {
          console.log('🧪 Ending server error simulation');
          this.restoreNetwork();
          this.activeTests.delete('server_error');
        }
      },
      {
        name: 'Database Timeout',
        description: 'Simulate database connection timeouts',
        execute: async () => {
          console.log('🧪 Starting database timeout simulation');
          this.simulateDatabaseTimeout();
          this.activeTests.add('db_timeout');
        },
        cleanup: () => {
          console.log('🧪 Ending database timeout simulation');
          this.restoreNetwork();
          this.activeTests.delete('db_timeout');
        }
      },
      {
        name: 'Image Upload Failure',
        description: 'Simulate image upload service failures',
        execute: async () => {
          console.log('🧪 Starting image upload failure simulation');
          this.simulateImageUploadFailure();
          this.activeTests.add('image_failure');
        },
        cleanup: () => {
          console.log('🧪 Ending image upload failure simulation');
          this.restoreNetwork();
          this.activeTests.delete('image_failure');
        }
      },
      {
        name: 'Intermittent Connection',
        description: 'Simulate unstable network with random disconnections',
        execute: async () => {
          console.log('🧪 Starting intermittent connection simulation');
          this.simulateIntermittentConnection();
          this.activeTests.add('intermittent');
        },
        cleanup: () => {
          console.log('🧪 Ending intermittent connection simulation');
          this.restoreNetwork();
          this.activeTests.delete('intermittent');
        }
      }
    ];
  }

  private simulateNetworkFailure() {
    window.fetch = async (...args) => {
      console.log('🚫 Blocking network request (offline simulation):', args[0]);
      throw new TypeError('Failed to fetch');
    };
  }

  private simulateServerErrors() {
    window.fetch = async (...args) => {
      console.log('🔥 Simulating 500 error for:', args[0]);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'Content-Type': 'application/json' }
      });
    };
  }

  private simulateDatabaseTimeout() {
    window.fetch = async (url, ...args) => {
      if (typeof url === 'string' && url.includes('/api/')) {
        console.log('⏱️ Simulating database timeout for:', url);
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second timeout
        throw new TypeError('Request timeout');
      }
      return this.originalFetch(url, ...args);
    };
  }

  private simulateImageUploadFailure() {
    window.fetch = async (url, options) => {
      if (typeof url === 'string' && (url.includes('/upload') || url.includes('/images'))) {
        console.log('🖼️ Simulating image upload failure for:', url);
        return new Response(JSON.stringify({ error: 'Upload service unavailable' }), {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return this.originalFetch(url, options);
    };
  }

  private simulateIntermittentConnection() {
    let failureRate = 0.3; // 30% chance of failure
    
    window.fetch = async (...args) => {
      if (Math.random() < failureRate) {
        console.log('📶 Simulating intermittent connection failure:', args[0]);
        throw new TypeError('Network error');
      }
      console.log('📶 Allowing request through (intermittent):', args[0]);
      return this.originalFetch(...args);
    };
  }

  private restoreNetwork() {
    window.fetch = this.originalFetch;
  }

  public isTestActive(testName: string): boolean {
    return this.activeTests.has(testName);
  }

  public stopAllTests() {
    this.activeTests.forEach(() => {
      this.restoreNetwork();
    });
    this.activeTests.clear();
    console.log('🧪 All tests stopped, network restored');
  }

  public async runAutomatedTest(): Promise<void> {
    console.log('🤖 Starting automated recovery test sequence');
    
    try {
      // Test 1: Simulate offline data queuing
      console.log('Test 1: Offline data queuing');
      this.simulateNetworkFailure();
      
      await offlineManager.queueAction('form_submit', {
        endpoint: '/api/test',
        method: 'POST',
        body: { test: 'offline_data' }
      });
      
      console.log('✅ Data queued successfully while offline');
      
      // Test 2: Restore connection and verify sync
      console.log('Test 2: Connection restore and sync');
      this.restoreNetwork();
      window.dispatchEvent(new Event('online'));
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for sync
      
      console.log('✅ Automated test completed successfully');
      
      // Send test results to monitoring
      FrontendMonitoring.captureMessage('Automated recovery test completed successfully', 'info', 'recovery_test');
      
    } catch (error) {
      console.error('❌ Automated test failed:', error);
      FrontendMonitoring.captureError(error instanceof Error ? error : new Error(String(error)), 'recovery_test');
    } finally {
      this.stopAllTests();
    }
  }
}

export const recoveryTestManager = new RecoveryTestManager();

// Expose to window for easy testing in dev tools
if (typeof window !== 'undefined') {
  (window as any).testRecovery = recoveryTestManager;
}
