
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  WifiOff, 
  Wifi, 
  AlertTriangle, 
  Play, 
  Square, 
  RefreshCw,
  Database,
  Upload,
  Activity
} from 'lucide-react';
import { recoveryTestManager } from '@/lib/recovery-test-utils';
import { offlineManager } from '@/lib/offline-manager';
import { useToast } from '@/hooks/use-toast';

export function RecoveryTestDashboard() {
  const [activeTests, setActiveTests] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState(0);
  const [testResults, setTestResults] = useState<string[]>([]);
  const { toast } = useToast();

  const testScenarios = recoveryTestManager.getTestScenarios();

  useEffect(() => {
    const unsubscribe = offlineManager.addListener((online) => {
      setIsOnline(online);
      setPendingActions(offlineManager.getPendingActionsCount());
    });

    const interval = setInterval(() => {
      setPendingActions(offlineManager.getPendingActionsCount());
      
      // Update active tests
      const currentActiveTests = new Set<string>();
      testScenarios.forEach(scenario => {
        if (recoveryTestManager.isTestActive(scenario.name.toLowerCase().replace(/\s+/g, '_'))) {
          currentActiveTests.add(scenario.name);
        }
      });
      setActiveTests(currentActiveTests);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const startTest = async (scenario: any) => {
    try {
      await scenario.execute();
      setTestResults(prev => [...prev, `✅ Started: ${scenario.name}`]);
      toast({
        title: "Test Started",
        description: `${scenario.name} simulation is now active`,
      });
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Failed to start: ${scenario.name}`]);
      toast({
        title: "Test Failed",
        description: `Failed to start ${scenario.name}`,
        variant: "destructive",
      });
    }
  };

  const stopTest = (scenario: any) => {
    try {
      scenario.cleanup();
      setTestResults(prev => [...prev, `🛑 Stopped: ${scenario.name}`]);
      toast({
        title: "Test Stopped",
        description: `${scenario.name} simulation stopped`,
      });
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Failed to stop: ${scenario.name}`]);
    }
  };

  const runAutomatedTest = async () => {
    setTestResults(prev => [...prev, `🤖 Starting automated test sequence...`]);
    try {
      await recoveryTestManager.runAutomatedTest();
      setTestResults(prev => [...prev, `✅ Automated test completed successfully`]);
      toast({
        title: "Automated Test Complete",
        description: "All recovery scenarios tested successfully",
      });
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Automated test failed: ${error}`]);
      toast({
        title: "Automated Test Failed",
        description: "Check console for details",
        variant: "destructive",
      });
    }
  };

  const stopAllTests = () => {
    recoveryTestManager.stopAllTests();
    setTestResults(prev => [...prev, `🛑 All tests stopped`]);
    toast({
      title: "All Tests Stopped",
      description: "Network restored to normal operation",
    });
  };

  const getIconForScenario = (name: string) => {
    if (name.includes('Network') || name.includes('Offline')) return WifiOff;
    if (name.includes('Database')) return Database;
    if (name.includes('Image')) return Upload;
    if (name.includes('Server')) return AlertTriangle;
    return Activity;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recovery & Offline Testing</h2>
        <div className="flex items-center space-x-2">
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {pendingActions > 0 && (
            <Badge variant="secondary">
              {pendingActions} Pending Actions
            </Badge>
          )}
        </div>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </div>
              <p className="text-sm text-muted-foreground">Network Status</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingActions}</div>
              <p className="text-sm text-muted-foreground">Pending Actions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{activeTests.size}</div>
              <p className="text-sm text-muted-foreground">Active Tests</p>
            </div>
          </div>

          {activeTests.size > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Active simulations: {Array.from(activeTests).join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {testScenarios.map((scenario, index) => {
              const Icon = getIconForScenario(scenario.name);
              const isActive = activeTests.has(scenario.name);
              
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <h4 className="font-medium">{scenario.name}</h4>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isActive && <Badge variant="destructive">Active</Badge>}
                    <Button
                      size="sm"
                      variant={isActive ? "destructive" : "outline"}
                      onClick={() => isActive ? stopTest(scenario) : startTest(scenario)}
                    >
                      {isActive ? <Square className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                      {isActive ? 'Stop' : 'Start'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex space-x-4 pt-4 border-t">
            <Button onClick={runAutomatedTest} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Run Automated Test
            </Button>
            <Button onClick={stopAllTests} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Stop All Tests
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results Log */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">No test results yet. Start a test to see results here.</p>
            ) : (
              testResults.slice(-20).map((result, index) => (
                <div key={index} className="text-sm font-mono p-2 bg-muted rounded">
                  {new Date().toLocaleTimeString()} - {result}
                </div>
              ))
            )}
          </div>
          {testResults.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => setTestResults([])}
            >
              Clear Log
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Browser DevTools Testing:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Open Chrome DevTools (F12)</li>
              <li>Go to Network tab</li>
              <li>Click "Offline" checkbox to simulate network disconnection</li>
              <li>Try uploading a property or image</li>
              <li>Check that data is queued for later sync</li>
              <li>Re-enable network and verify automatic sync</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Console Testing:</h4>
            <p className="text-sm text-muted-foreground">
              Open browser console and use: <code className="bg-muted px-1 rounded">window.testRecovery</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RecoveryTestDashboard;
