import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, Play, Clock, Award, CheckCircle, 
  BookOpen, Video, Star, ChevronRight, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

interface Course {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  reward_thdr: number;
  instructor_id: string;
  instructor_name?: string;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Music Production Basics',
    description: 'Learn the fundamentals of creating music from scratch.',
    cover_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    category: 'Production',
    difficulty: 'beginner',
    duration_minutes: 120,
    reward_thdr: 50,
    instructor_id: '1',
    instructor_name: 'DJ Thunder'
  },
  {
    id: '2',
    title: 'Web3 & Music NFTs',
    description: 'Understand how blockchain is revolutionizing music ownership.',
    cover_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
    category: 'Web3',
    difficulty: 'intermediate',
    duration_minutes: 90,
    reward_thdr: 75,
    instructor_id: '2',
    instructor_name: 'Crypto Luna'
  },
  {
    id: '3',
    title: 'Building Your Fanbase',
    description: 'Strategies to grow your audience as an independent artist.',
    cover_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    category: 'Marketing',
    difficulty: 'beginner',
    duration_minutes: 60,
    reward_thdr: 30,
    instructor_id: '3',
    instructor_name: 'Luna Wave'
  },
  {
    id: '4',
    title: 'Advanced Mixing Techniques',
    description: 'Professional mixing and mastering for your tracks.',
    cover_url: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=400',
    category: 'Production',
    difficulty: 'advanced',
    duration_minutes: 180,
    reward_thdr: 100,
    instructor_id: '4',
    instructor_name: 'Metro Sound'
  },
];

const categories = ['All', 'Production', 'Web3', 'Marketing', 'Business'];
const difficulties = ['All Levels', 'beginner', 'intermediate', 'advanced'];

export default function LearningSection() {
  const { user } = useAuth();
  const { isModerator } = useUserRole();
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Levels');
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const fetchEnrollments = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('learning_progress')
      .select('course_id, progress_percent')
      .eq('user_id', user.id);

    if (data) {
      const enrolled = [...new Set(data.map(d => d.course_id))];
      setEnrolledCourses(enrolled);
      
      const progress: Record<string, number> = {};
      data.forEach(d => {
        if (!progress[d.course_id] || d.progress_percent > progress[d.course_id]) {
          progress[d.course_id] = d.progress_percent;
        }
      });
      setCourseProgress(progress);
    }
  };

  const filteredCourses = courses.filter(course => {
    const categoryMatch = selectedCategory === 'All' || course.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'All Levels' || course.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const enrollInCourse = async (courseId: string) => {
    if (!user) return;

    await supabase.from('learning_progress').insert({
      user_id: user.id,
      course_id: courseId,
      progress_percent: 0,
    });

    setEnrolledCourses([...enrolledCourses, courseId]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/10 text-green-500';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-500';
      case 'advanced': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            Thundra Learning
          </h2>
          <p className="text-muted-foreground">Learn, grow, and earn $THDR rewards</p>
        </div>
        {isModerator && (
          <Button className="gap-2">
            <BookOpen className="w-4 h-4" />
            Create Course
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {difficulties.map(diff => (
            <Button
              key={diff}
              variant={selectedDifficulty === diff ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedDifficulty(diff)}
              className="capitalize"
            >
              {diff === 'All Levels' ? diff : diff}
            </Button>
          ))}
        </div>
      </div>

      {/* My Progress */}
      {user && enrolledCourses.length > 0 && (
        <div className="glass-card p-4 rounded-xl">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Continue Learning
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.filter(c => enrolledCourses.includes(c.id)).map(course => (
              <motion.div
                key={course.id}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg cursor-pointer"
              >
                <img 
                  src={course.cover_url} 
                  alt={course.title} 
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{course.title}</p>
                  <Progress value={courseProgress[course.id] || 0} className="h-2 mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {courseProgress[course.id] || 0}% complete
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCourses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl overflow-hidden group"
          >
            <div className="relative aspect-video">
              <img 
                src={course.cover_url} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="lg" className="rounded-full w-14 h-14">
                  <Play className="w-6 h-6" />
                </Button>
              </div>
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                {course.difficulty}
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-xs text-primary font-medium mb-1">{course.category}</p>
              <h3 className="font-semibold mb-2 line-clamp-1">{course.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration_minutes}min
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-primary" />
                  +{course.reward_thdr} THDR
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20" />
                  <span className="text-sm">{course.instructor_name}</span>
                </div>
                {enrolledCourses.includes(course.id) ? (
                  <Button size="sm" variant="outline" className="gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Enrolled
                  </Button>
                ) : user ? (
                  <Button size="sm" onClick={() => enrollInCourse(course.id)}>
                    Enroll Free
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="gap-1">
                    <Lock className="w-4 h-4" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
