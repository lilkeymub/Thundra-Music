import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, Search, MessageCircle, FileText, Bug, 
  ChevronDown, ChevronRight, ExternalLink, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { faqs, privacyPolicy, termsOfService, codeOfConduct, legalGuidelines } from '@/data/legalContent';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HelpCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [bugSubject, setBugSubject] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forumPost, setForumPost] = useState('');

  const handleReportBug = async () => {
    if (!bugSubject.trim() || !bugDescription.trim()) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    if (!user) {
      toast({ title: 'Error', description: 'Please sign in to report bugs', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    
    const { error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        category: 'bug',
        subject: bugSubject,
        message: bugDescription,
        status: 'open'
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit bug report', variant: 'destructive' });
    } else {
      toast({ title: 'Bug Reported', description: 'Thank you! Our team will review your report.' });
      setBugSubject('');
      setBugDescription('');
    }
    setSubmitting(false);
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" />
          Help Center
        </h2>
        <p className="text-muted-foreground">Find answers, report issues, and get support</p>
      </div>

      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="bug">Report Bug</TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQs..."
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[500px]">
            {filteredFaqs.length > 0 ? (
              <div className="space-y-6">
                {filteredFaqs.map((category) => (
                  <Card key={category.category}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        {category.questions.map((item, idx) => (
                          <AccordionItem key={idx} value={`${category.category}-${idx}`}>
                            <AccordionTrigger className="text-left">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No FAQs match your search</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal" className="mt-6">
          <div className="grid gap-4">
            {[
              { title: 'Privacy Policy', content: privacyPolicy },
              { title: 'Terms of Service', content: termsOfService },
              { title: 'Code of Conduct', content: codeOfConduct },
              { title: 'Legal Guidelines', content: legalGuidelines },
            ].map((doc) => (
              <Card key={doc.title}>
                <Accordion type="single" collapsible>
                  <AccordionItem value={doc.title}>
                    <AccordionTrigger className="px-6">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div className="text-left">
                          <p className="font-medium">{doc.content.title}</p>
                          <p className="text-xs text-muted-foreground">Last updated: {doc.content.lastUpdated}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {doc.content.content.split('\n').map((line, i) => {
                            if (line.startsWith('## ')) {
                              return <h2 key={i} className="text-xl font-bold mt-6 mb-3">{line.replace('## ', '')}</h2>;
                            }
                            if (line.startsWith('### ')) {
                              return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.replace('### ', '')}</h3>;
                            }
                            if (line.startsWith('- **')) {
                              const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
                              if (match) {
                                return (
                                  <p key={i} className="mb-2">
                                    <strong>{match[1]}:</strong> {match[2]}
                                  </p>
                                );
                              }
                            }
                            if (line.startsWith('- ')) {
                              return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
                            }
                            if (line.trim()) {
                              return <p key={i} className="mb-2">{line}</p>;
                            }
                            return null;
                          })}
                        </div>
                      </ScrollArea>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Community Forum Tab */}
        <TabsContent value="community" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Community Forum
              </CardTitle>
              <CardDescription>
                Connect with other Thundra users, share tips, and get help from the community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-8 text-center bg-secondary/50 rounded-lg">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Join the Discussion</h3>
                <p className="text-muted-foreground mb-4">
                  Share your thoughts, ask questions, and help others in the Thundra community
                </p>
                <div className="space-y-3">
                  <Textarea
                    value={forumPost}
                    onChange={(e) => setForumPost(e.target.value)}
                    placeholder="Share something with the community..."
                    rows={3}
                  />
                  <Button 
                    className="w-full"
                    onClick={() => {
                      toast({ title: 'Coming Soon', description: 'Community forum will be available soon!' });
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post to Community
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  { title: 'Tips & Tricks', desc: 'Share and discover platform tips', posts: 156 },
                  { title: 'Music Production', desc: 'Discuss music creation and AI tools', posts: 89 },
                  { title: 'Token Economy', desc: 'THDR & ION token discussions', posts: 234 },
                  { title: 'Feature Requests', desc: 'Suggest new features', posts: 67 },
                ].map((topic) => (
                  <motion.button
                    key={topic.title}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg text-left hover:bg-secondary/80 transition-colors"
                    onClick={() => toast({ title: 'Coming Soon', description: 'Forum topics will be available soon!' })}
                  >
                    <div>
                      <p className="font-medium">{topic.title}</p>
                      <p className="text-sm text-muted-foreground">{topic.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-sm">{topic.posts} posts</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report Bug Tab */}
        <TabsContent value="bug" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-red-500" />
                Report a Bug
              </CardTitle>
              <CardDescription>
                Found an issue? Let us know and our team will investigate. Bug reports are sent to our moderation team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={bugSubject}
                  onChange={(e) => setBugSubject(e.target.value)}
                  placeholder="Brief description of the bug"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={bugDescription}
                  onChange={(e) => setBugDescription(e.target.value)}
                  placeholder="Please describe the bug in detail. Include steps to reproduce if possible..."
                  rows={6}
                />
              </div>
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  <strong>Tip:</strong> Include device type, browser, and any error messages you see to help us investigate faster.
                </p>
              </div>
              <Button
                onClick={handleReportBug}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Submitting...' : 'Submit Bug Report'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
