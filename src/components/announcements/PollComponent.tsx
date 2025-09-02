import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { BarChart3, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PollOption {
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  expires_at?: string;
  allow_multiple_choices: boolean;
  is_anonymous: boolean;
  is_active: boolean;
  created_at: string;
  user_has_voted: boolean;
  user_votes: string[];
  total_votes: number;
  options: PollOption[];
}

interface PollComponentProps {
  pollId: string;
  showResults?: boolean;
}

export default function PollComponent({ pollId, showResults = false }: PollComponentProps) {
  const { language, user } = useAuth();
  const { toast } = useToast();
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [viewResults, setViewResults] = useState(showResults);

  const text = {
    en: {
      poll: 'Poll',
      vote: 'Vote',
      results: 'Results',
      viewResults: 'View Results',
      hideResults: 'Hide Results',
      expired: 'Expired',
      active: 'Active',
      anonymous: 'Anonymous',
      multipleChoice: 'Multiple Choice',
      totalVotes: 'Total Votes',
      voted: 'You have voted',
      expires: 'Expires',
      expired_: 'Expired',
      selectOption: 'Select an option',
      selectOptions: 'Select one or more options',
      submitVote: 'Submit Vote',
      voteSubmitted: 'Vote submitted successfully!',
      pleaseSelect: 'Please select at least one option',
      errorVoting: 'Error submitting vote',
      errorLoading: 'Error loading poll'
    },
    ms: {
      poll: 'Undian',
      vote: 'Undi',
      results: 'Keputusan',
      viewResults: 'Lihat Keputusan',
      hideResults: 'Sembunyikan Keputusan',
      expired: 'Tamat',
      active: 'Aktif',
      anonymous: 'Tanpa Nama',
      multipleChoice: 'Pilihan Berganda',
      totalVotes: 'Jumlah Undian',
      voted: 'Anda telah mengundi',
      expires: 'Tamat',
      expired_: 'Tamat',
      selectOption: 'Pilih satu pilihan',
      selectOptions: 'Pilih satu atau lebih pilihan',
      submitVote: 'Hantar Undian',
      voteSubmitted: 'Undian berjaya dihantar!',
      pleaseSelect: 'Sila pilih sekurang-kurangnya satu pilihan',
      errorVoting: 'Ralat menghantar undian',
      errorLoading: 'Ralat memuatkan undian'
    }
  };

  const t = text[language];

  useEffect(() => {
    fetchPoll();
  }, [pollId]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      
      // Fetch poll details
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      // Fetch poll options
      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('option_order');

      if (optionsError) throw optionsError;

      // Check if user has voted
      let userVotes: string[] = [];
      if (user) {
        const { data: votesData } = await supabase
          .from('poll_votes')
          .select('option_id')
          .eq('poll_id', pollId)
          .eq('user_id', user.id);

        userVotes = votesData?.map(v => v.option_id) || [];
      }

      // Get poll results
      const { data: resultsData, error: resultsError } = await supabase
        .rpc('get_poll_results', { poll_id: pollId });

      if (resultsError) throw resultsError;

      // Get total votes count
      const { data: totalVotesData } = await supabase
        .from('poll_votes')
        .select('id', { count: 'exact' })
        .eq('poll_id', pollId);

      const totalVotes = totalVotesData?.length || 0;

      const transformedPoll: Poll = {
        ...pollData,
        user_has_voted: userVotes.length > 0,
        user_votes: userVotes,
        total_votes: totalVotes,
        options: resultsData || []
      };

      setPoll(transformedPoll);
      setSelectedOptions(userVotes);
      
      // Show results if user has voted or poll is expired
      if (userVotes.length > 0 || (pollData.expires_at && new Date(pollData.expires_at) < new Date())) {
        setViewResults(true);
      }
    } catch (error) {
      console.error('Error fetching poll:', error);
      toast({
        title: t.errorLoading,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!user || !poll || selectedOptions.length === 0) {
      toast({
        title: t.pleaseSelect,
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      // Delete existing votes if updating
      if (poll.user_has_voted) {
        await supabase
          .from('poll_votes')
          .delete()
          .eq('poll_id', pollId)
          .eq('user_id', user.id);
      }

      // Insert new votes
      const votes = selectedOptions.map(optionId => ({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id
      }));

      const { error } = await supabase
        .from('poll_votes')
        .insert(votes);

      if (error) throw error;

      toast({
        title: t.voteSubmitted
      });

      // Refresh poll data
      await fetchPoll();
      setViewResults(true);
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: t.errorVoting,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (!poll) return;

    if (poll.allow_multiple_choices) {
      setSelectedOptions(prev => 
        checked 
          ? [...prev, optionId]
          : prev.filter(id => id !== optionId)
      );
    } else {
      setSelectedOptions(checked ? [optionId] : []);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!poll) return null;

  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
  const canVote = !poll.user_has_voted && !isExpired && poll.is_active;

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            {poll.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={poll.is_active && !isExpired ? "default" : "secondary"}>
              {isExpired ? t.expired : t.active}
            </Badge>
            {poll.is_anonymous && (
              <Badge variant="outline">{t.anonymous}</Badge>
            )}
            {poll.allow_multiple_choices && (
              <Badge variant="outline">{t.multipleChoice}</Badge>
            )}
          </div>
        </div>
        {poll.description && (
          <CardDescription>{poll.description}</CardDescription>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {poll.total_votes} {t.totalVotes}
          </div>
          {poll.expires_at && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {isExpired ? t.expired_ : t.expires}: {new Date(poll.expires_at).toLocaleString()}
            </div>
          )}
          {poll.user_has_voted && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              {t.voted}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {viewResults ? (
          // Results View
          <div className="space-y-3">
            {poll.options.map((option) => (
              <div key={option.option_id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{option.option_text}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {option.vote_count} {option.vote_count === 1 ? 'vote' : 'votes'}
                    </span>
                    <Badge variant="secondary">{option.percentage}%</Badge>
                    {poll.user_votes.includes(option.option_id) && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
                <Progress value={option.percentage} className="h-2" />
              </div>
            ))}
            
            {!poll.user_has_voted && canVote && (
              <Button
                variant="outline"
                onClick={() => setViewResults(false)}
                className="w-full"
              >
                {t.vote}
              </Button>
            )}
          </div>
        ) : (
          // Voting View
          <div className="space-y-4">
            {poll.allow_multiple_choices ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t.selectOptions}</p>
                {poll.options.map((option) => (
                  <div key={option.option_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.option_id}
                      checked={selectedOptions.includes(option.option_id)}
                      onCheckedChange={(checked) => 
                        handleOptionChange(option.option_id, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.option_id} className="flex-1">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup 
                value={selectedOptions[0] || ''} 
                onValueChange={(value) => setSelectedOptions([value])}
              >
                <p className="text-sm text-muted-foreground">{t.selectOption}</p>
                {poll.options.map((option) => (
                  <div key={option.option_id} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.option_id} id={option.option_id} />
                    <Label htmlFor={option.option_id} className="flex-1">
                      {option.option_text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleVote}
                disabled={submitting || selectedOptions.length === 0}
                className="flex-1"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t.submitVote}
                  </div>
                ) : (
                  t.submitVote
                )}
              </Button>
              
              {poll.total_votes > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setViewResults(true)}
                >
                  {t.viewResults}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}