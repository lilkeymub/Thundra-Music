import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Camera, Mail, Phone, Globe, Calendar, Edit2, Save, X,
  Link as LinkIcon, Twitter, Instagram, Music, CheckCircle, Shield, Clock, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { RoleBadge, VerifiedTick } from '@/components/dashboard/RoleBadge';
import ApplicationModal from '@/components/dashboard/ApplicationModal';
import thundraLogo from '@/assets/thundra-logo.jpg';
import ionToken from '@/assets/ion-token.png';

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", 
  "Japan", "Brazil", "India", "Nigeria", "South Africa", "Kenya", "Ghana",
  "Democratic Republic of Congo", "Rwanda", "Uganda", "Tanzania", "Ethiopia"
];

export default function ProfileSection() {
  const { user, profile, refreshProfile } = useAuth();
  const { isArtist, isModerator, primaryRole, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [applicationType, setApplicationType] = useState<'artist' | 'moderator'>('artist');

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
    country: profile?.country || '',
    date_of_birth: profile?.date_of_birth || ''
  });

  const openApplicationModal = (type: 'artist' | 'moderator') => {
    setApplicationType(type);
    setApplicationModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      await refreshProfile();
      toast({ title: "Avatar updated!", description: "Your profile picture has been changed" });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({ title: "Error", description: "Failed to upload avatar", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          bio: formData.bio,
          phone: formData.phone,
          country: formData.country,
          date_of_birth: formData.date_of_birth || null
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      toast({ title: "Profile updated!", description: "Your changes have been saved" });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Your Profile
        </h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(false)} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-xl"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="relative">
            <Avatar className="w-28 h-28 border-4 border-primary/20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                {profile?.username?.charAt(0).toUpperCase() || profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h3 className="text-2xl font-bold">{profile?.full_name || 'User'}</h3>
              <VerifiedTick size="md" />
            </div>
            <p className="text-muted-foreground">@{profile?.username || 'username'}</p>
            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
              <RoleBadge role={primaryRole} />
              <span className="text-xs bg-secondary px-3 py-1 rounded-full">
                Joined {new Date(profile?.created_at || '').toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'THDR Balance', value: profile?.thdr_balance || 0, icon: thundraLogo, isImage: true },
            { label: 'ION Balance', value: profile?.ion_balance || 0, icon: ionToken, isImage: true },
            { label: 'Total Streams', value: profile?.total_streams || 0, icon: '🎧', isImage: false },
            { label: 'Total Likes', value: profile?.total_likes || 0, icon: '❤️', isImage: false },
          ].map((stat) => (
            <div key={stat.label} className="bg-secondary/50 rounded-lg p-4 text-center">
              {stat.isImage ? (
                <img src={stat.icon as string} alt={stat.label} className="w-8 h-8 rounded-full mx-auto" />
              ) : (
                <span className="text-2xl">{stat.icon}</span>
              )}
              <p className="text-xl font-bold mt-1">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Full Name
              </label>
              {isEditing ? (
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
              ) : (
                <p className="p-3 bg-secondary/50 rounded-lg">{profile?.full_name || 'Not set'}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="text-muted-foreground">@</span>
                Username
              </label>
              {isEditing ? (
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="username"
                />
              ) : (
                <p className="p-3 bg-secondary/50 rounded-lg">@{profile?.username || 'Not set'}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email
            </label>
            <p className="p-3 bg-secondary/50 rounded-lg">{profile?.email || 'Not set'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            {isEditing ? (
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            ) : (
              <p className="p-3 bg-secondary/50 rounded-lg min-h-[100px]">{profile?.bio || 'No bio yet'}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone
              </label>
              {isEditing ? (
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                />
              ) : (
                <p className="p-3 bg-secondary/50 rounded-lg">{profile?.phone || 'Not set'}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Country
              </label>
              {isEditing ? (
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Select your country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : (
                <p className="p-3 bg-secondary/50 rounded-lg">{profile?.country || 'Not set'}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Date of Birth
            </label>
            {isEditing ? (
              <Input
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleInputChange}
              />
            ) : (
              <p className="p-3 bg-secondary/50 rounded-lg">
                {profile?.date_of_birth 
                  ? new Date(profile.date_of_birth).toLocaleDateString() 
                  : 'Not set'}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Role Applications */}
      {!roleLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Upgrade Your Role
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Artist Application */}
            <div className={`p-4 rounded-lg ${isArtist ? 'bg-red-500/10 border border-red-500/30' : 'bg-secondary/50'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Music className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-bold">Verified Artist</p>
                  <p className="text-xs text-muted-foreground">Upload & monetize music</p>
                </div>
              </div>
              {isArtist ? (
                <Badge className="bg-red-500 text-white w-full justify-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> Verified
                </Badge>
              ) : profile?.is_artist_pending ? (
                <Badge variant="outline" className="w-full justify-center text-yellow-500 border-yellow-500">
                  <Clock className="w-3 h-3 mr-1" /> Application Pending
                </Badge>
              ) : (
                <Button 
                  onClick={() => openApplicationModal('artist')}
                  className="w-full bg-red-500 hover:bg-red-600"
                  size="sm"
                >
                  Apply Now
                </Button>
              )}
            </div>

            {/* Moderator Application */}
            <div className={`p-4 rounded-lg ${isModerator ? 'bg-gray-500/10 border border-gray-500/30' : 'bg-secondary/50'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="font-bold">Moderator</p>
                  <p className="text-xs text-muted-foreground">Help keep community safe</p>
                </div>
              </div>
              {isModerator ? (
                <Badge className="bg-gray-500 text-white w-full justify-center">
                  <CheckCircle className="w-3 h-3 mr-1" /> Verified
                </Badge>
              ) : profile?.is_moderator_pending ? (
                <Badge variant="outline" className="w-full justify-center text-yellow-500 border-yellow-500">
                  <Clock className="w-3 h-3 mr-1" /> Application Pending
                </Badge>
              ) : (
                <Button 
                  onClick={() => openApplicationModal('moderator')}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-6 rounded-xl"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-primary" />
          Social Links
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Twitter className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Not connected</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Instagram className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Not connected</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Music className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Not connected</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Not connected</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">Social linking coming soon!</p>
      </motion.div>

      {/* Referral Code */}
      {profile?.referral_code && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-xl"
        >
          <h3 className="text-lg font-bold mb-4">Your Referral Code</h3>
          <div className="flex items-center gap-3">
            <code className="flex-1 p-4 bg-primary/10 rounded-lg text-lg font-mono text-center text-primary font-bold">
              {profile.referral_code}
            </code>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(profile.referral_code || '');
                toast({ title: "Copied!", description: "Referral code copied to clipboard" });
              }}
            >
              Copy
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Share your code and earn 50 THDR for each friend who signs up!
          </p>
        </motion.div>
      )}

      {/* Application Modal */}
      <ApplicationModal 
        isOpen={applicationModalOpen} 
        onClose={() => setApplicationModalOpen(false)}
        type={applicationType}
      />
    </div>
  );
}
