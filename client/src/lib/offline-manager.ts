
import { queryClient } from './queryClient';
import FrontendMonitoring from './monitoring';

interface PendingAction {
  id: string;
  type: 'property_upload' | 'form_submit' | 'image_upload';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = navigator.onLine;
  private pendingActions: PendingAction[] = [];
  private syncInProgress: boolean = false;
  private listeners: ((isOnline: boolean) => void)[] = [];

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  constructor() {
    this.loadPendingActions();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.isOnline = true;
      this.notifyListeners();
      this.syncPendingActions();
      FrontendMonitoring.captureMessage('Network connection restored', 'info', 'offline_manager');
    });

    window.addEventListener('offline', () => {
      console.log('📴 Connection lost');
      this.isOnline = false;
      this.notifyListeners();
      FrontendMonitoring.captureMessage('Network connection lost', 'warning', 'offline_manager');
    });

    // Monitor fetch failures to detect network issues
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok && response.status >= 500) {
          this.handleServerError(response.status);
        }
        return response;
      } catch (error) {
        this.handleNetworkError(error);
        throw error;
      }
    };
  }

  private handleNetworkError(error: any) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.log('🚨 Network error detected, switching to offline mode');
      this.isOnline = false;
      this.notifyListeners();
    }
  }

  private handleServerError(status: number) {
    if (status >= 500) {
      console.log(`🚨 Server error detected (${status}), treating as offline`);
      FrontendMonitoring.captureMessage(`Server error: ${status}`, 'error', 'offline_manager');
    }
  }

  public addListener(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public async queueAction(type: PendingAction['type'], data: any): Promise<string> {
    const action: PendingAction = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.pendingActions.push(action);
    this.savePendingActions();

    console.log(`📥 Queued ${type} action for later sync:`, action.id);
    FrontendMonitoring.captureMessage(`Queued offline action: ${type}`, 'info', 'offline_manager');

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingActions();
    }

    return action.id;
  }

  private async syncPendingActions() {
    if (this.syncInProgress || !this.isOnline || this.pendingActions.length === 0) {
      return;
    }

    this.syncInProgress = true;
    console.log(`🔄 Syncing ${this.pendingActions.length} pending actions`);

    const actionsToSync = [...this.pendingActions];
    const successfulActions: string[] = [];

    for (const action of actionsToSync) {
      try {
        const success = await this.executePendingAction(action);
        if (success) {
          successfulActions.push(action.id);
          console.log(`✅ Successfully synced action: ${action.id}`);
        } else {
          action.retryCount++;
          if (action.retryCount >= 3) {
            console.error(`❌ Action failed after 3 retries: ${action.id}`);
            successfulActions.push(action.id); // Remove failed actions
            FrontendMonitoring.captureError(
              `Offline action failed after retries: ${action.type}`,
              'offline_sync',
              action.id
            );
          }
        }
      } catch (error) {
        console.error(`❌ Error syncing action ${action.id}:`, error);
        action.retryCount++;
      }

      // Small delay between actions to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Remove successful actions
    this.pendingActions = this.pendingActions.filter(
      action => !successfulActions.includes(action.id)
    );
    this.savePendingActions();

    this.syncInProgress = false;
    console.log(`🎉 Sync completed. ${successfulActions.length} actions processed`);

    // Refresh relevant queries after sync
    if (successfulActions.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
    }
  }

  private async executePendingAction(action: PendingAction): Promise<boolean> {
    try {
      switch (action.type) {
        case 'property_upload':
          return await this.syncPropertyUpload(action.data);
        case 'form_submit':
          return await this.syncFormSubmit(action.data);
        case 'image_upload':
          return await this.syncImageUpload(action.data);
        default:
          console.error('Unknown action type:', action.type);
          return false;
      }
    } catch (error) {
      console.error(`Failed to execute ${action.type}:`, error);
      return false;
    }
  }

  private async syncPropertyUpload(data: any): Promise<boolean> {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'images' && Array.isArray(data[key])) {
        data[key].forEach((file: File) => formData.append('images', file));
      } else {
        formData.append(key, data[key]);
      }
    });

    const response = await fetch('/api/properties', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    return response.ok;
  }

  private async syncFormSubmit(data: any): Promise<boolean> {
    const response = await fetch(data.endpoint, {
      method: data.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...data.headers
      },
      body: JSON.stringify(data.body),
      credentials: 'include'
    });

    return response.ok;
  }

  private async syncImageUpload(data: any): Promise<boolean> {
    const formData = new FormData();
    formData.append('image', data.file);
    formData.append('propertyId', data.propertyId);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    return response.ok;
  }

  private savePendingActions() {
    try {
      localStorage.setItem('offline_pending_actions', JSON.stringify(this.pendingActions));
    } catch (error) {
      console.error('Failed to save pending actions:', error);
    }
  }

  private loadPendingActions() {
    try {
      const saved = localStorage.getItem('offline_pending_actions');
      if (saved) {
        this.pendingActions = JSON.parse(saved);
        console.log(`📋 Loaded ${this.pendingActions.length} pending actions from storage`);
      }
    } catch (error) {
      console.error('Failed to load pending actions:', error);
      this.pendingActions = [];
    }
  }

  public getPendingActionsCount(): number {
    return this.pendingActions.length;
  }

  public clearPendingActions() {
    this.pendingActions = [];
    this.savePendingActions();
  }
}

export const offlineManager = OfflineManager.getInstance();
