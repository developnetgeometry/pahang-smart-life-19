import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Vote, Clock, Users, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Poll {
  id: string;
  title: string;
  description?: string;
  expires_at?: string;
  is_anonymous: boolean;
  allow_multiple_votes: boolean;
  created_at: string;
}

interface PollOption {
  id: string;
  option_text: string;
  option_order: number;
  vote_count: number;
}

interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at?: string;
}

interface PollComponentProps {
  announcementId: string;
}

export default function PollComponent({ announcementId }: PollComponentProps) {
  const { user, language } = useAuth();
  const { toast } = useToast();
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [userVotes, setUserVotes] = useState<PollVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const t = {
    poll: language === 'en' ? 'Poll' : 'Undian',
    votes: language === 'en' ? 'votes' : 'undi',
    vote: language === 'en' ? 'Vote' : 'Undi',
    voted: language === 'en' ? 'Voted' : 'Telah Mengundi',
    expires: language === 'en' ? 'Expires' : 'Tamat',
    expired: language === 'en' ? 'Expired' : 'Tamat Tempoh',
    anonymous: language === 'en' ? 'Anonymous Poll' : 'Undian Tanpa Nama',
    multipleVotes: language === 'en' ? 'Multiple votes allowed' : 'Undi berbilang dibenarkan',
    totalVotes: language === 'en' ? 'Total votes' : 'Jumlah undi',
    votingError: language === 'en' ? 'Error submitting vote' : 'Ralat menghantar undi',
    votingSuccess: language === 'en' ? 'Vote submitted successfully' : 'Undi berjaya dihantar',
    loadingError: language === 'en' ? 'Error loading poll' : 'Ralat memuatkan undian'
  };

  useEffect(() => {
    fetchPoll();
  }, [announcementId]);

  const fetchPoll = async () => {
    try {
      setLoading(true);

      // Fetch poll data
      const { data: pollData, error: pollError } = await supabase
        .from('announcement_polls')
        .select('*')
        .eq('announcement_id', announcementId)
        .single();

      if (pollError) {
        if (pollError.code !== 'PGRST116') { // Not found is OK
          throw pollError;
        }
        return;
      }

      setPoll(pollData);

      // Fetch poll options
      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollData.id)
        .order('option_order');

      if (optionsError) throw optionsError;
      setOptions(optionsData || []);

      // Fetch user votes if user is logged in
      if (user) {
        const { data: votesData, error: votesError } = await supabase
          .from('poll_votes')
          .select('*')
          .eq('poll_id', pollData.id)
          .eq('user_id', user.id);

        if (votesError) throw votesError;
        setUserVotes(votesData || []);
      }
    } catch (error) {
      console.error('Error fetching poll:', error);
      toast({
        title: t.loadingError,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionId: string) => {
    if (!user || !poll) return;

    try {
      setVoting(true);

      const existingVote = userVotes.find(vote => vote.option_id === optionId);
      
      if (existingVote) {
        // Remove vote
        const { error } = await supabase
          .from('poll_votes')
          .delete()
          .eq('id', existingVote.id);

        if (error) throw error;

        setUserVotes(prev => prev.filter(vote => vote.id !== existingVote.id));
      } else {
        // Add vote (check if multiple votes allowed)
        if (!poll.allow_multiple_votes && userVotes.length > 0) {
          // Remove existing vote first
          const { error: deleteError } = await supabase
            .from('poll_votes')
            .delete()
            .eq('poll_id', poll.id)
            .eq('user_id', user.id);

          if (deleteError) throw deleteError;
          setUserVotes([]);
        }

        // Add new vote
        const { data, error } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: poll.id,
            option_id: optionId,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;
        
        if (!poll.allow_multiple_votes) {
          setUserVotes([data]);
        } else {
          setUserVotes(prev => [...prev, data]);
        }
      }

      // Refresh options to get updated vote counts
      const { data: updatedOptions, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', poll.id)
        .order('option_order');

      if (optionsError) throw optionsError;
      setOptions(updatedOptions || []);

      toast({
        title: t.votingSuccess
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: t.votingError,
        variant: 'destructive'
      });
    } finally {
      setVoting(false);
    }
  };

  const isExpired = poll?.expires_at && new Date(poll.expires_at) < new Date();
  const totalVotes = options.reduce((sum, option) => sum + option.vote_count, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!poll) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Vote className="w-5 h-5" />
              {poll.title}
            </CardTitle>
            {poll.description && (
              <CardDescription className="mt-2">{poll.description}</CardDescription>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {isExpired && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t.expired}
              </Badge>
            )}
            {poll.expires_at && !isExpired && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t.expires}: {new Date(poll.expires_at).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {poll.is_anonymous && (
            <Badge variant="secondary">{t.anonymous}</Badge>
          )}
          {poll.allow_multiple_votes && (
            <Badge variant="outline">{t.multipleVotes}</Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {totalVotes} {t.votes}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {options.map((option) => {
            const hasVoted = userVotes.some(vote => vote.option_id === option.id);
            const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{option.option_text}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {option.vote_count} {t.votes} ({percentage.toFixed(1)}%)
                    </span>
                    {user && !isExpired && (
                      <Button
                        variant={hasVoted ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleVote(option.id)}
                        disabled={voting}
                        className="min-w-[60px]"
                      >
                        {hasVoted ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {t.voted}
                          </>
                        ) : (
                          t.vote
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>

        {!user && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Sign in to participate in this poll' 
                : 'Log masuk untuk mengambil bahagian dalam undian ini'
              }
            </p>
          </div>
        )}

        {isExpired && (
          <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-center">
            <p className="text-sm text-destructive">
              {language === 'en' 
                ? 'This poll has expired and is no longer accepting votes' 
                : 'Undian ini telah tamat dan tidak lagi menerima undi'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}