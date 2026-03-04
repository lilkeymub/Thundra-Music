import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Plus, Trash2, Music, Image as ImageIcon, Disc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Track {
  title: string;
  file: File | null;
  duration: string;
}

interface UploadAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const genres = ['Afrobeats', 'Hip Hop', 'R&B', 'Pop', 'Electronic', 'Jazz', 'Rock', 'Classical', 'Reggae', 'Gospel'];

export default function UploadAlbumModal({ isOpen, onClose, onSuccess }: UploadAlbumModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[]>([{ title: '', file: null, duration: '' }]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profile, setProfile] = useState<{ username: string | null } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', user.id)
        .single();
      setProfile(data);
    };
    fetchProfile();
  }, [user]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const addTrack = () => {
    setTracks([...tracks, { title: '', file: null, duration: '' }]);
  };

  const removeTrack = (index: number) => {
    if (tracks.length > 1) {
      setTracks(tracks.filter((_, i) => i !== index));
    }
  };

  const updateTrack = (index: number, field: keyof Track, value: any) => {
    const updated = [...tracks];
    updated[index] = { ...updated[index], [field]: value };
    setTracks(updated);
  };

  const handleTrackFileChange = (index: number, file: File | null) => {
    updateTrack(index, 'file', file);
    if (file && !tracks[index].title) {
      updateTrack(index, 'title', file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!user || !title.trim() || !genre || tracks.length === 0) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const validTracks = tracks.filter(t => t.title.trim() && t.file);
    if (validTracks.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one track with audio', variant: 'destructive' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload cover
      let coverUrl = null;
      if (coverFile) {
        const coverPath = `albums/${user.id}/${Date.now()}-cover.${coverFile.name.split('.').pop()}`;
        const { error: coverError } = await supabase.storage.from('tracks').upload(coverPath, coverFile);
        if (!coverError) {
          const { data: { publicUrl } } = supabase.storage.from('tracks').getPublicUrl(coverPath);
          coverUrl = publicUrl;
        }
      }

      setUploadProgress(20);

      // Create album
      const { data: album, error: albumError } = await supabase
        .from('albums')
        .insert({
          artist_id: user.id,
          title,
          description,
          genre,
          cover_url: coverUrl,
          is_published: true,
          release_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (albumError) throw albumError;

      setUploadProgress(40);

      // Upload each track
      const totalTracks = validTracks.length;
      for (let i = 0; i < validTracks.length; i++) {
        const track = validTracks[i];
        if (!track.file) continue;

        const audioPath = `tracks/${user.id}/${Date.now()}-${i}.${track.file.name.split('.').pop()}`;
        const { error: audioError } = await supabase.storage.from('tracks').upload(audioPath, track.file);
        
        if (!audioError) {
          const { data: { publicUrl: audioUrl } } = supabase.storage.from('tracks').getPublicUrl(audioPath);

          await supabase.from('tracks').insert({
            artist: profile?.username || 'Unknown Artist',
            album_id: album.id,
            title: track.title,
            audio_url: audioUrl,
            cover_url: coverUrl,
            genre,
            duration: track.duration || '3:30'
          });
        }

        setUploadProgress(40 + ((i + 1) / totalTracks) * 50);
      }

      setUploadProgress(100);
      toast({ title: 'Album uploaded!', description: `${title} with ${validTracks.length} tracks is now live!` });
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Error', description: 'Failed to upload album', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setGenre('');
    setCoverFile(null);
    setCoverPreview(null);
    setTracks([{ title: '', file: null, duration: '' }]);
    setUploadProgress(0);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Disc className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-display font-bold">Upload Album</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Album Cover */}
          <div className="flex gap-6">
            <div className="w-40 h-40 rounded-xl bg-secondary flex items-center justify-center overflow-hidden relative group">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Album Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Amazing Album" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Genre *</label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
                  <SelectContent>
                    {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-muted-foreground">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell listeners about this album..."
              rows={3}
            />
          </div>

          {/* Tracks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Music className="w-5 h-5" />
                Tracks ({tracks.length})
              </h3>
              <Button size="sm" variant="outline" onClick={addTrack}>
                <Plus className="w-4 h-4 mr-1" /> Add Track
              </Button>
            </div>

            <div className="space-y-3">
              {tracks.map((track, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                  <span className="text-muted-foreground font-medium w-6">{i + 1}.</span>
                  <Input
                    value={track.title}
                    onChange={(e) => updateTrack(i, 'title', e.target.value)}
                    placeholder="Track title"
                    className="flex-1"
                  />
                  <div className="relative">
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => handleTrackFileChange(i, e.target.files?.[0] || null)}
                      className="w-32 text-xs"
                    />
                    {track.file && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-xs">✓</span>}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeTrack(i)}
                    disabled={tracks.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={uploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={uploading || !title || !genre}>
            {uploading ? 'Uploading...' : 'Upload Album'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
