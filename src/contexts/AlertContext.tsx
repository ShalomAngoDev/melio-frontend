import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
  keywords: string[];
  context: string;
  schoolCode: string;
}

interface AlertContextType {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void;
  resolveAlert: (alertId: string) => void;
  getUnresolvedAlerts: (schoolCode?: string) => Alert[];
  getAlertStats: (schoolCode?: string) => {
    total: number;
    resolved: number;
    unresolved: number;
    byRiskLevel: Record<Alert['riskLevel'], number>;
  };
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('melio_alerts');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      }));
    }
    return [];
  });

  const addAlert = (alertData: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date()
    };

    const updatedAlerts = [newAlert, ...alerts];
    setAlerts(updatedAlerts);
    localStorage.setItem('melio_alerts', JSON.stringify(updatedAlerts));
  };

  const resolveAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('melio_alerts', JSON.stringify(updatedAlerts));
  };

  const getUnresolvedAlerts = (schoolCode?: string) => 
    alerts.filter(alert => 
      !alert.resolved && 
      (!schoolCode || alert.schoolCode === schoolCode)
    );

  const getAlertStats = (schoolCode?: string) => {
    const filteredAlerts = schoolCode 
      ? alerts.filter(alert => alert.schoolCode === schoolCode)
      : alerts;
    
    const total = filteredAlerts.length;
    const resolved = filteredAlerts.filter(alert => alert.resolved).length;
    const unresolved = total - resolved;
    
    const byRiskLevel = filteredAlerts.reduce((acc, alert) => {
      acc[alert.riskLevel] = (acc[alert.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<Alert['riskLevel'], number>);

    return { total, resolved, unresolved, byRiskLevel };
  };

  return (
    <AlertContext.Provider value={{
      alerts,
      addAlert,
      resolveAlert,
      getUnresolvedAlerts,
      getAlertStats
    }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}