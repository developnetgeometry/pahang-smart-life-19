import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Plus, Search, Download, Calendar, DollarSign } from 'lucide-react';

interface Payment {
  id: string;
  payment_type: string;
  amount: number;
  description: string;
  due_date: string;
  paid_date?: string | null;
  status: string;
  reference_number?: string;
  created_at: string;
  user_id: string;
  district_id?: string;
}

export default function MyPayments() {
  const { user, language } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPayment, setNewPayment] = useState({
    payment_type: '',
    amount: '',
    description: '',
    due_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to load payments' : 'Gagal memuatkan pembayaran',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!user || !newPayment.payment_type || !newPayment.amount) return;

    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          payment_type: newPayment.payment_type,
          amount: parseFloat(newPayment.amount),
          description: newPayment.description,
          due_date: newPayment.due_date,
          status: 'pending',
          reference_number: `PAY${Date.now()}`
        }]);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Success' : 'Berjaya',
        description: language === 'en' ? 'Payment record created successfully' : 'Rekod pembayaran berjaya dicipta'
      });

      setNewPayment({
        payment_type: '',
        amount: '',
        description: '',
        due_date: ''
      });

      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to create payment record' : 'Gagal mencipta rekod pembayaran',
        variant: 'destructive'
      });
    }
  };

  const markAsPaid = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: language === 'en' ? 'Success' : 'Berjaya',
        description: language === 'en' ? 'Payment marked as paid' : 'Pembayaran ditanda sebagai selesai'
      });

      fetchPayments();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: language === 'en' ? 'Error' : 'Ralat',
        description: language === 'en' ? 'Failed to update payment' : 'Gagal mengemaskini pembayaran',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Paid</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return <div className="p-6">Loading payments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            {language === 'en' ? 'My Payments' : 'Pembayaran Saya'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Manage your bills and payment history' : 'Urus bil dan sejarah pembayaran anda'}
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {language === 'en' ? 'Add Payment' : 'Tambah Pembayaran'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{language === 'en' ? 'Add New Payment' : 'Tambah Pembayaran Baru'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="payment_type">{language === 'en' ? 'Payment Type' : 'Jenis Pembayaran'}</Label>
                <Input
                  id="payment_type"
                  value={newPayment.payment_type}
                  onChange={(e) => setNewPayment({ ...newPayment, payment_type: e.target.value })}
                  placeholder={language === 'en' ? 'e.g., Maintenance Fee' : 'cth: Yuran Penyelenggaraan'}
                />
              </div>
              <div>
                <Label htmlFor="amount">{language === 'en' ? 'Amount (RM)' : 'Jumlah (RM)'}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="description">{language === 'en' ? 'Description' : 'Penerangan'}</Label>
                <Input
                  id="description"
                  value={newPayment.description}
                  onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })}
                  placeholder={language === 'en' ? 'Payment description' : 'Penerangan pembayaran'}
                />
              </div>
              <div>
                <Label htmlFor="due_date">{language === 'en' ? 'Due Date' : 'Tarikh Akhir'}</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newPayment.due_date}
                  onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
                />
              </div>
              <Button onClick={handleCreatePayment} className="w-full">
                {language === 'en' ? 'Create Payment' : 'Cipta Pembayaran'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {language === 'en' ? 'Total Pending' : 'Jumlah Belum Selesai'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">RM {totalPending.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {language === 'en' ? 'Total Paid' : 'Jumlah Selesai'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">RM {totalPaid.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {language === 'en' ? 'Total Payments' : 'Jumlah Pembayaran'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search payments...' : 'Cari pembayaran...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Export' : 'Eksport'}
        </Button>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{payment.payment_type}</CardTitle>
                  <CardDescription>{payment.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(payment.status)}
                  <div className="text-right">
                    <div className="text-xl font-bold">RM {payment.amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      Due: {new Date(payment.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Ref: {payment.reference_number}</span>
                  <span>Created: {new Date(payment.created_at).toLocaleDateString()}</span>
                  {payment.paid_date && (
                    <span>Paid: {new Date(payment.paid_date).toLocaleDateString()}</span>
                  )}
                </div>
                {payment.status === 'pending' && (
                  <Button 
                    onClick={() => markAsPaid(payment.id)}
                    size="sm"
                  >
                    {language === 'en' ? 'Mark as Paid' : 'Tanda Selesai'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredPayments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === 'en' ? 'No payments found' : 'Tiada pembayaran ditemui'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}