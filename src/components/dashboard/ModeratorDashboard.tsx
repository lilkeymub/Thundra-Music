import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, Clock, 
  Users, ThumbsUp, ThumbsDown, Flag, Eye, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ModerationAction {
  id: string;
  action_type: string;
  reason: string | null;
  status: string;
  votes_received: number;
  votes_required: number;
  created_at: string;
}

export default function ModeratorDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [myVotes, setMyVotes] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchModerationData = async () => {
      // Fetch pending actions
      const { data: actionsData, count } = await supabase
        .from('moderation_actions')
        .select('*', { count: 'exact' })
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

      if (actionsData) {
        setActions(actionsData);
        setPendingCount(count || 0);
      }

      // Fetch my votes count
      const { count: votesCount } = await supabase
        .from('moderation_votes')
        .select('*', { count: 'exact', head: true })
        .eq('moderator_id', user.id);

      setMyVotes(votesCount || 0);
    };

    fetchModerationData();
  }, [user]);

  const handleVote = async (actionId: string, vote: 'approve' | 'reject') => {
    if (!user) return;

    const { error } = await supabase
      .from('moderation_votes')
      .insert({
        action_id: actionId,
        moderator_id: user.id,
        vote
      });

    if (error) {
      toast({ title: "Error", description: "Failed to submit vote", variant: "destructive" });
      return;
    }

    // Update local state
    setActions(prev => prev.map(a => 
      a.id === actionId 
        ? { ...a, votes_received: a.votes_received + 1 }
        : a
    ));
    setMyVotes(prev => prev + 1);
    toast({ title: "Vote submitted!", description: `You voted to ${vote} this action` });
  };

  const stats = [
    { label: 'Pending Reviews', value: pendingCount, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'My Votes', value: myVotes, icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Accuracy Score', value: '98%', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Mod Rank', value: 'Level 1', icon: Award, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'ban': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'remove_content': return <Flag className="w-4 h-4 text-orange-500" />;
      default: return <Eye className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-gray-400" />
            Moderator Dashboard
          </h2>
          <p className="text-muted-foreground">Help keep the community safe and positive</p>
        </div>
        <Badge variant="outline" className="text-gray-400 border-gray-400">
          <Shield className="w-3 h-3 mr-1" />
          Moderator
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Moderator Rank Card */}
      <Card className="bg-gradient-to-r from-gray-500/20 to-slate-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Moderator Level 1</h3>
                <p className="text-muted-foreground">Complete more reviews to level up</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-400 font-medium">1.75x Reward Multiplier</span>
                  <span className="text-xs text-muted-foreground">• Silver Badge</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-400">75%</p>
              <p className="text-sm text-muted-foreground">Bonus Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-primary" />
            Pending Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {actions.length > 0 ? (
            <div className="space-y-4">
              {actions.map((action) => (
                <div key={action.id} className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                        {getActionIcon(action.action_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium capitalize">{action.action_type.replace('_', ' ')}</p>
                          <Badge variant="outline" className="text-xs">
                            {action.votes_received}/{action.votes_required} votes
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.reason || 'No reason provided'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Reported {new Date(action.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-green-500 border-green-500 hover:bg-green-500/10"
                        onClick={() => handleVote(action.id, 'approve')}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-red-500 border-red-500 hover:bg-red-500/10"
                        onClick={() => handleVote(action.id, 'reject')}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50 text-green-500" />
              <p>All caught up! 🎉</p>
              <p className="text-sm">No pending reviews at the moment</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Moderation Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: 'Be Fair', desc: 'Review evidence carefully before voting' },
              { title: 'Be Consistent', desc: 'Apply rules equally to all users' },
              { title: 'Stay Neutral', desc: "Don't let personal bias affect decisions" },
              { title: 'Protect Privacy', desc: 'Never share moderation details publicly' },
            ].map((guide) => (
              <div key={guide.title} className="p-3 bg-secondary/50 rounded-lg">
                <p className="font-medium">{guide.title}</p>
                <p className="text-sm text-muted-foreground">{guide.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
