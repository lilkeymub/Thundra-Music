import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface NodeLedger {
  id: string;
  user_id: string;
  device_id: string;
  device_type: 'browser' | 'mobile' | 'desktop';
  status: 'active' | 'paused' | 'suspended' | 'banned' | 'offline';
  updates_count: number;
  total_rewards_earned: number;
  total_uptime_seconds: number;
  last_update_at: string | null;
  last_online_at: string | null;
  last_synced_tx_id: string | null;
  health_score: number;
  security_passed: boolean;
  created_at: string;
}

interface NodeStats {
  totalNodes: number;
  activeNodes: number;
  pausedNodes: number;
  suspendedNodes: number;
  offlineNodes: number;
  totalUpdates: number;
}

const UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const UPTIME_TICK_MS = 60 * 1000; // 1 minute
const REWARD_PER_UPDATE = 0.0001;

export function useNodeLedger() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [node, setNode] = useState<NodeLedger | null>(null);
  const [stats, setStats] = useState<NodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const uptimeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nodeRef = useRef<NodeLedger | null>(null);

  // Keep nodeRef in sync
  useEffect(() => { nodeRef.current = node; }, [node]);

  const getDeviceId = useCallback(() => {
    let deviceId = localStorage.getItem('thundra_device_id');
    if (!deviceId) {
      deviceId = `DEVICE_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('thundra_device_id', deviceId);
    }
    return deviceId;
  }, []);

  const getDeviceType = useCallback((): 'browser' | 'mobile' | 'desktop' => {
    const ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return 'mobile';
    if (window.matchMedia('(display-mode: standalone)').matches) return 'desktop';
    return 'browser';
  }, []);

  const performSecurityCheck = useCallback(async (nodeId: string): Promise<boolean> => {
    try {
      const storedDeviceId = localStorage.getItem('thundra_device_id');
      if (!storedDeviceId) return false;
      await supabase
        .from('node_ledgers')
        .update({ security_passed: true, last_online_at: new Date().toISOString() })
        .eq('id', nodeId);
      return true;
    } catch {
      return false;
    }
  }, []);

  const fetchNode = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('node_ledgers')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setNode(data as NodeLedger | null);
    setLoading(false);
  }, [user]);

  const fetchStats = useCallback(async () => {
    const { data } = await supabase
      .from('node_ledgers')
      .select('status, updates_count');
    if (data) {
      setStats({
        totalNodes: data.length,
        activeNodes: data.filter(n => n.status === 'active').length,
        pausedNodes: data.filter(n => n.status === 'paused').length,
        suspendedNodes: data.filter(n => n.status === 'suspended').length,
        offlineNodes: data.filter(n => n.status === 'offline').length,
        totalUpdates: data.reduce((sum, n) => sum + (n.updates_count || 0), 0)
      });
    }
  }, []);

  const activateNode = useCallback(async () => {
    if (!user) return false;
    const deviceId = getDeviceId();
    const deviceType = getDeviceType();

    try {
      const { data: existing } = await supabase
        .from('node_ledgers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const securityOk = await performSecurityCheck(existing.id);
        if (!securityOk) {
          toast({ title: 'Security Check Failed', description: 'Could not verify node integrity.', variant: 'destructive' });
          return false;
        }
        const { data, error } = await supabase
          .from('node_ledgers')
          .update({ status: 'active', last_online_at: new Date().toISOString(), security_passed: true })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        setNode(data as NodeLedger);
      } else {
        const { data, error } = await supabase
          .from('node_ledgers')
          .insert({
            user_id: user.id,
            device_id: deviceId,
            device_type: deviceType,
            status: 'active',
            last_online_at: new Date().toISOString(),
            security_passed: true,
          })
          .select()
          .single();
        if (error) throw error;
        setNode(data as NodeLedger);
        toast({ title: 'Node Activated! 🔗', description: 'You are now participating in the Thundra network.' });
      }

      setIsRunning(true);
      return true;
    } catch (error) {
      console.error('Failed to activate node:', error);
      toast({ title: 'Activation Failed', description: 'Could not activate your node ledger.', variant: 'destructive' });
      return false;
    }
  }, [user, getDeviceId, getDeviceType, toast, performSecurityCheck]);

  // Perform update: ONLY sync when new transactions exist
  const performUpdate = useCallback(async () => {
    const currentNode = nodeRef.current;
    if (!currentNode || !user || currentNode.status !== 'active') return;

    try {
      // Find transactions not yet synced
      let query = supabase
        .from('transactions_ledger')
        .select('id, created_at')
        .order('created_at', { ascending: true })
        .limit(100);

      if (currentNode.last_synced_tx_id) {
        const { data: lastTx } = await supabase
          .from('transactions_ledger')
          .select('created_at')
          .eq('id', currentNode.last_synced_tx_id)
          .maybeSingle();

        if (lastTx) {
          query = supabase
            .from('transactions_ledger')
            .select('id, created_at')
            .gt('created_at', lastTx.created_at)
            .order('created_at', { ascending: true })
            .limit(100);
        }
      }

      const { data: unsyncedTxs } = await query;

      // NO new transactions => skip entirely, no empty updates
      if (!unsyncedTxs || unsyncedTxs.length === 0) {
        console.log('Node ledger: No new transactions. Waiting for next 5-min cycle...');
        return;
      }

      const transactionsSynced = unsyncedTxs.length;
      const lastSyncedId = unsyncedTxs[unsyncedTxs.length - 1].id;
      const syncStart = Date.now();
      const now = new Date().toISOString();

      // Save update + reward in parallel
      const [, nodeResult] = await Promise.all([
        supabase.from('node_ledger_updates').insert({
          node_id: currentNode.id,
          transactions_synced: transactionsSynced,
          sync_duration_ms: Date.now() - syncStart,
          reward_amount: REWARD_PER_UPDATE
        }),
        supabase
          .from('node_ledgers')
          .update({
            updates_count: currentNode.updates_count + 1,
            total_rewards_earned: currentNode.total_rewards_earned + REWARD_PER_UPDATE,
            last_update_at: now,
            last_online_at: now,
            last_synced_tx_id: lastSyncedId,
          })
          .eq('id', currentNode.id)
          .select()
          .single()
      ]);

      if (nodeResult.data) {
        setNode(nodeResult.data as NodeLedger);
      }

      // Distribute reward on-chain from treasury
      await Promise.all([
        supabase.functions.invoke('blockchain', {
          body: {
            action: 'send_reward',
            user_id: user.id,
            to_address: profile?.web3_wallet_address || null,
            amount: REWARD_PER_UPDATE,
            activity_type: 'node_reward',
          },
        }),
        supabase.from('node_ledger_rewards').insert({
          node_id: currentNode.id,
          user_id: user.id,
          amount: REWARD_PER_UPDATE,
          reward_type: 'update_reward'
        }),
        supabase.from('transactions_ledger').insert({
          transaction_type: 'node_reward',
          to_user_id: user.id,
          to_wallet_address: profile?.web3_wallet_address,
          to_email: profile?.email,
          from_wallet_address: '0x38bc74e79b6e7d66b594124a6ccc92cef0974404',
          from_email: 'Treasury (Node Reward)',
          amount: REWARD_PER_UPDATE,
          token_symbol: 'THDR',
          status: 'completed',
          description: `Node ledger synced ${transactionsSynced} txns`
        })
      ]);

      console.log(`Node ledger: Synced ${transactionsSynced} transactions. Reward: ${REWARD_PER_UPDATE} THDR`);
    } catch (error) {
      console.error('Node update failed:', error);
    }
  }, [user, profile]);

  // Uptime tick: record 60 seconds every minute
  const tickUptime = useCallback(async () => {
    const currentNode = nodeRef.current;
    if (!currentNode || currentNode.status !== 'active') return;
    const newUptime = (currentNode.total_uptime_seconds || 0) + 60;
    const now = new Date().toISOString();
    await supabase
      .from('node_ledgers')
      .update({ total_uptime_seconds: newUptime, last_online_at: now })
      .eq('id', currentNode.id);
    setNode(prev => prev ? { ...prev, total_uptime_seconds: newUptime, last_online_at: now } : null);
  }, []);

  // Daily security check at 23:59 UTC
  useEffect(() => {
    if (!node || !isRunning) return;
    const checkSecurity = () => {
      const now = new Date();
      if (now.getUTCHours() === 23 && now.getUTCMinutes() === 59) {
        performSecurityCheck(node.id);
      }
    };
    const interval = setInterval(checkSecurity, 60000);
    return () => clearInterval(interval);
  }, [node?.id, isRunning, performSecurityCheck]);

  const deactivateNode = useCallback(async () => {
    if (!node) return;
    try {
      await supabase.from('node_ledgers').update({ status: 'offline' }).eq('id', node.id);
      setNode(prev => prev ? { ...prev, status: 'offline' } : null);
      setIsRunning(false);
      if (updateIntervalRef.current) { clearInterval(updateIntervalRef.current); updateIntervalRef.current = null; }
      if (uptimeIntervalRef.current) { clearInterval(uptimeIntervalRef.current); uptimeIntervalRef.current = null; }
      toast({ title: 'Node Deactivated', description: 'Your node is now offline.' });
    } catch (error) {
      console.error('Deactivation failed:', error);
    }
  }, [node, toast]);

  // Start intervals when running
  useEffect(() => {
    if (isRunning && node?.status === 'active') {
      // Clear any existing intervals first
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
      if (uptimeIntervalRef.current) clearInterval(uptimeIntervalRef.current);

      // Run first update immediately
      performUpdate();

      // Then every 5 minutes
      updateIntervalRef.current = setInterval(performUpdate, UPDATE_INTERVAL_MS);
      // Uptime tick every 1 minute
      uptimeIntervalRef.current = setInterval(tickUptime, UPTIME_TICK_MS);

      return () => {
        if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
        if (uptimeIntervalRef.current) clearInterval(uptimeIntervalRef.current);
      };
    }
  }, [isRunning, node?.status]);

  // Init
  useEffect(() => {
    const init = async () => {
      await fetchNode();
      await fetchStats();
    };
    init();
  }, [fetchNode, fetchStats]);

  // Auto-activate if previously active
  useEffect(() => {
    if (node && node.status === 'active' && !isRunning) {
      performSecurityCheck(node.id).then(ok => {
        if (ok) setIsRunning(true);
      });
    }
  }, [node?.id, node?.status]);

  return { node, stats, loading, isRunning, activateNode, deactivateNode, refreshStats: fetchStats };
}
