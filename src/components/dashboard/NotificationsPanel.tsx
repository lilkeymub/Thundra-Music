import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Check, CheckCheck, X, DollarSign, Heart, MessageCircle, 
  Music, UserPlus, ShoppingBag, Crown, Flame, Settings, ExternalLink,
  ArrowRightLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'earning': return DollarSign;
    case 'like': return Heart;
    case 'comment': return MessageCircle;
    case 'follow': return UserPlus;
    case 'purchase': return ShoppingBag;
    case 'subscription': return Crown;
    case 'tip': return DollarSign;
    case 'new_release': return Music;
    case 'burn': return Flame;
    case 'transaction': return ArrowRightLeft;
    default: return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'earning': return 'text-green-500 bg-green-500/10';
    case 'like': return 'text-red-500 bg-red-500/10';
    case 'comment': return 'text-blue-500 bg-blue-500/10';
    case 'follow': return 'text-purple-500 bg-purple-500/10';
    case 'purchase': return 'text-yellow-500 bg-yellow-500/10';
    case 'subscription': return 'text-yellow-500 bg-yellow-500/10';
    case 'tip': return 'text-green-500 bg-green-500/10';
    case 'new_release': return 'text-primary bg-primary/10';
    case 'burn': return 'text-orange-500 bg-orange-500/10';
    case 'transaction': return 'text-blue-500 bg-blue-500/10';
    default: return 'text-muted-foreground bg-muted';
  }
};

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { t } = useLanguage();

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Navigate to explorer if transaction notification
    if (notification.type === 'transaction' && notification.data?.explorer_link) {
      navigate(notification.data.explorer_link);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-lg">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="px-2 py-0.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="h-[calc(100vh-80px)]">
            {notifications.length > 0 ? (
              <div className="p-2 space-y-1">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        notification.read 
                          ? 'hover:bg-accent/50' 
                          : 'bg-primary/5 hover:bg-primary/10'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          {notification.type === 'transaction' && notification.data?.transaction_hash && (
                            <div className="flex items-center gap-1 mt-2">
                              <ExternalLink className="w-3 h-3 text-primary" />
                              <span className="text-xs text-primary hover:underline">
                                View in Explorer
                              </span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Bell className="w-12 h-12 mb-3 opacity-50" />
                <p>No notifications yet</p>
              </div>
            )}
          </ScrollArea>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
