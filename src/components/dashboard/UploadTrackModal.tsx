import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, Music, Image, Film, FileText, 
  Plus, Check, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UploadTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const genres = [
  'Afrobeats', 'Hip Hop', 'R&B', 'Electronic', 'Amapiano', 
  'Reggae', 'Jazz', 'Gospel', 'Pop', 'Rock', 'Rumba', 'Soul', 'Other'
];

export default function UploadTrackModal({ isOpen, onClose, onSuccess }: UploadTrackModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [story, setStory] = useState('');
  const [duration, setDuration] = useState('');
  
  // File state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  
  // Preview
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStep, setUploadStep] = useState('');
  
  // Refs
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // Try to get duration
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        const mins = Math.floor(audio.duration / 60);
        const secs = Math.floor(audio.duration % 60);
        setDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
      };
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleUpload = async () => {
    if (!user || !profile) {
      toast({ title: 'Error', description: 'Please sign in to upload', variant: 'destructive' });
      return;
    }

    if (!title || !genre || !audioFile) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let audioUrl = '';
      let coverUrl = '';
      let videoUrl = '';

      // Upload audio
      setUploadStep('Uploading audio...');
      if (audioFile) {
        const audioExt = audioFile.name.split('.').pop();
        const audioPath = `${user.id}/${Date.now()}-audio.${audioExt}`;
        
        // Note: In real implementation, we'd use Supabase Storage
        // For now, we'll simulate the upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUploadProgress(30);
        audioUrl = `https://storage.thundra.music/tracks/${audioPath}`;
      }

      // Upload cover
      setUploadStep('Uploading cover...');
      if (coverFile) {
        const coverExt = coverFile.name.split('.').pop();
        const coverPath = `${user.id}/${Date.now()}-cover.${coverExt}`;
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadProgress(50);
        coverUrl = `https://storage.thundra.music/covers/${coverPath}`;
      }

      // Upload video if exists
      if (videoFile) {
        setUploadStep('Uploading video clip...');
        const videoExt = videoFile.name.split('.').pop();
        const videoPath = `${user.id}/${Date.now()}-video.${videoExt}`;
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setUploadProgress(80);
        videoUrl = `https://storage.thundra.music/videos/${videoPath}`;
      }

      // Save to database
      setUploadStep('Saving track data...');
      const { data, error } = await supabase
        .from('tracks')
        .insert({
          title,
          artist: profile.username || profile.full_name || 'Unknown Artist',
          genre,
          duration,
          lyrics: lyrics || null,
          audio_url: audioUrl || null,
          cover_url: coverUrl || coverPreview || null,
          plays_count: 0,
          likes_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      setUploadProgress(100);
      setUploadStep('Complete!');
      
      toast({ 
        title: 'Track Uploaded!', 
        description: `"${title}" has been uploaded successfully` 
      });

      // Reset form
      setTimeout(() => {
        setTitle('');
        setGenre('');
        setLyrics('');
        setStory('');
        setDuration('');
        setAudioFile(null);
        setCoverFile(null);
        setVideoFile(null);
        setCoverPreview(null);
        setUploading(false);
        setUploadProgress(0);
        setUploadStep('');
        onSuccess?.();
        onClose();
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Upload Failed', 
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
      setUploading(false);
      setUploadProgress(0);
      setUploadStep('');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && !uploading && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Track
            </h2>
            <button 
              onClick={onClose} 
              disabled={uploading}
              className="p-2 hover:bg-accent rounded-full disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {uploading ? (
              <div className="py-12 text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full"
                />
                <p className="text-lg font-medium">{uploadStep}</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cover & Audio Upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cover Upload */}
                  <div 
                    onClick={() => coverInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center bg-secondary/30 overflow-hidden"
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Image className="w-12 h-12 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Upload Cover Art</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG (1:1 ratio)</p>
                      </>
                    )}
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </div>

                  {/* Audio Upload */}
                  <div className="space-y-4">
                    <div 
                      onClick={() => audioInputRef.current?.click()}
                      className="h-24 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex items-center justify-center gap-3 bg-secondary/30"
                    >
                      {audioFile ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="text-sm truncate max-w-[150px]">{audioFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Music className="w-8 h-8 text-muted-foreground" />
                          <div className="text-left">
                            <p className="text-sm font-medium">Upload Audio *</p>
                            <p className="text-xs text-muted-foreground">MP3, WAV, FLAC</p>
                          </div>
                        </>
                      )}
                      <input
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioChange}
                        className="hidden"
                      />
                    </div>

                    {/* Video Upload (Optional) */}
                    <div 
                      onClick={() => videoInputRef.current?.click()}
                      className="h-24 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex items-center justify-center gap-3 bg-secondary/30"
                    >
                      {videoFile ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="text-sm truncate max-w-[150px]">{videoFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Film className="w-8 h-8 text-muted-foreground" />
                          <div className="text-left">
                            <p className="text-sm font-medium">Upload Video Clip</p>
                            <p className="text-xs text-muted-foreground">MP4, MOV (Optional)</p>
                          </div>
                        </>
                      )}
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Track Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Track Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter track title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre *</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lyrics">Lyrics</Label>
                  <Textarea
                    id="lyrics"
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder="Enter song lyrics..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="story">Story Behind the Track</Label>
                  <Textarea
                    id="story"
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    placeholder="Share the story behind this track..."
                    rows={3}
                  />
                </div>

                {duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Music className="w-4 h-4" />
                    Duration: {duration}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!uploading && (
            <div className="flex justify-end gap-3 p-4 border-t border-border">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={!title || !genre || !audioFile}
                className="bg-primary"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Track
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
