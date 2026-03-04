import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Shield, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'artist' | 'moderator';
}

const genres = [
  'Afrobeats', 'Hip Hop', 'R&B', 'Pop', 'Electronic', 'Jazz', 'Reggae', 
  'Rock', 'Gospel', 'Classical', 'Dancehall', 'Amapiano', 'Other'
];

const languages = [
  'English', 'French', 'Spanish', 'Portuguese', 'Arabic', 'Swahili',
  'Yoruba', 'Hausa', 'Zulu', 'Amharic', 'Other'
];

export default function ApplicationModal({ isOpen, onClose, type }: ApplicationModalProps) {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Artist form state
  const [artistName, setArtistName] = useState('');
  const [genre, setGenre] = useState('');
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [sampleTrackUrl, setSampleTrackUrl] = useState('');

  // Moderator form state
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [availabilityHours, setAvailabilityHours] = useState('10');
  const [timezone, setTimezone] = useState('');

  const handleArtistSubmit = async () => {
    if (!user || !artistName || !genre) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('artist_applications')
        .insert({
          user_id: user.id,
          artist_name: artistName,
          genre,
          bio,
          portfolio_urls: portfolioUrl ? [portfolioUrl] : [],
          sample_track_url: sampleTrackUrl || null
        });

      if (error) throw error;

      // Update profile to show pending
      await supabase
        .from('profiles')
        .update({ is_artist_pending: true })
        .eq('user_id', user.id);

      await refreshProfile();
      setSuccess(true);
    } catch (error: any) {
      if (error.code === '23505') {
        toast({ title: "Already applied", description: "You have already submitted an artist application", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to submit application", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModeratorSubmit = async () => {
    if (!user || !motivation) {
      toast({ title: "Error", description: "Please tell us why you want to be a moderator", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('moderator_applications')
        .insert({
          user_id: user.id,
          motivation,
          experience: experience || null,
          languages: selectedLanguages,
          availability_hours: parseInt(availabilityHours) || 10,
          timezone: timezone || null
        });

      if (error) throw error;

      // Update profile to show pending
      await supabase
        .from('profiles')
        .update({ is_moderator_pending: true })
        .eq('user_id', user.id);

      await refreshProfile();
      setSuccess(true);
    } catch (error: any) {
      if (error.code === '23505') {
        toast({ title: "Already applied", description: "You have already submitted a moderator application", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to submit application", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) 
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const handleClose = () => {
    setSuccess(false);
    setArtistName('');
    setGenre('');
    setBio('');
    setPortfolioUrl('');
    setSampleTrackUrl('');
    setMotivation('');
    setExperience('');
    setSelectedLanguages(['English']);
    setAvailabilityHours('10');
    setTimezone('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'artist' ? (
              <>
                <Music className="w-5 h-5 text-red-500" />
                Apply to Become an Artist
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-gray-400" />
                Apply to Become a Moderator
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Application Submitted! 🎉</h3>
            <p className="text-muted-foreground mb-4">
              Your {type} application has been submitted for review. 
              We'll notify you once it's been processed.
            </p>
            <Button onClick={handleClose}>Close</Button>
          </motion.div>
        ) : type === 'artist' ? (
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Artist/Stage Name *</label>
              <Input
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Your artist name"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Primary Genre *</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Select your genre</option>
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself and your music journey..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Portfolio URL (SoundCloud, YouTube, etc.)</label>
              <Input
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://soundcloud.com/yourprofile"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Sample Track URL</label>
              <Input
                value={sampleTrackUrl}
                onChange={(e) => setSampleTrackUrl(e.target.value)}
                placeholder="Link to your best track"
                className="mt-1"
              />
            </div>

            <div className="p-4 bg-red-500/10 rounded-lg">
              <h4 className="font-medium text-red-500 mb-2">Artist Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Verified artist badge</li>
                <li>✓ 2.5x reward multiplier on earnings</li>
                <li>✓ Upload and monetize your music</li>
                <li>✓ Create and sell NFTs</li>
                <li>✓ Access to artist-exclusive features</li>
                <li>✓ 500 THDR welcome bonus</li>
              </ul>
            </div>

            <Button 
              onClick={handleArtistSubmit} 
              className="w-full bg-red-500 hover:bg-red-600"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Music className="w-4 h-4 mr-2" />}
              Submit Application
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Why do you want to be a moderator? *</label>
              <Textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Tell us why you'd make a great moderator..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Previous moderation experience</label>
              <Textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Any relevant experience (Discord, forums, etc.)"
                rows={2}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Languages you speak</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {languages.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedLanguages.includes(lang)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Hours per week available</label>
              <Input
                type="number"
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(e.target.value)}
                min="5"
                max="40"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Your Timezone</label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., GMT+1, EST, WAT"
                className="mt-1"
              />
            </div>

            <div className="p-4 bg-gray-500/10 rounded-lg">
              <h4 className="font-medium text-gray-400 mb-2">Moderator Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Silver moderator badge</li>
                <li>✓ 1.75x reward multiplier</li>
                <li>✓ Access to moderation tools</li>
                <li>✓ Community leadership role</li>
                <li>✓ 300 THDR welcome bonus</li>
              </ul>
            </div>

            <Button 
              onClick={handleModeratorSubmit} 
              className="w-full"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
              Submit Application
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
