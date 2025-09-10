import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Receipt,
  CreditCard,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const transactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  transaction_type: z.enum(["debit", "credit"]),
  account_id: z.string().min(1, "Account is required"),
  reference_type: z.string().optional(),
  receipt_number: z.string().optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

const accountSchema = z.object({
  account_name: z.string().min(1, "Account name is required"),
  account_type: z.enum(["income", "expense", "asset", "liability", "equity"]),
  account_code: z.string().min(1, "Account code is required"),
  description: z.string().optional(),
});

type Transaction = {
  id: string;
  transaction_code: string;
  description: string;
  amount: number;
  transaction_type: string;
  transaction_date: string;
  reference_type?: string;
  receipt_number?: string;
  payment_method?: string;
  status: string;
  created_at: string;
  financial_accounts?: {
    account_name: string;
    account_type: string;
  };
} & any;

type Account = {
  id: string;
  account_name: string;
  account_type: string;
  account_code: string;
  description?: string;
  is_active: boolean;
} & any;

export default function FinancialManagement() {
  const { hasRole, language, user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");

  const transactionForm = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: "",
      amount: "",
      transaction_type: "credit",
      account_id: "",
      reference_type: "",
      receipt_number: "",
      payment_method: "",
      notes: "",
    },
  });

  const accountForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      account_name: "",
      account_type: "expense",
      account_code: "",
      description: "",
    },
  });

  const paymentMethods = [
    "cash",
    "bank_transfer",
    "credit_card",
    "cheque",
    "online",
  ];

  const referenceTypes = [
    "maintenance_fee",
    "facility_booking",
    "service_payment",
    "expense",
    "utility_bill",
    "insurance",
    "other",
  ];

  const accountTypes = [
    { value: "income", label: "Income", color: "bg-green-500" },
    { value: "expense", label: "Expense", color: "bg-red-500" },
    { value: "asset", label: "Asset", color: "bg-blue-500" },
    { value: "liability", label: "Liability", color: "bg-orange-500" },
    { value: "equity", label: "Equity", color: "bg-purple-500" },
  ];

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "approved", label: "Approved", color: "bg-green-500" },
    { value: "rejected", label: "Rejected", color: "bg-red-500" },
    { value: "cancelled", label: "Cancelled", color: "bg-gray-500" },
  ];

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("financial_accounts")
        .select("*")
        .eq("is_active", true)
        .order("account_code");

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast({
        title: "Error",
        description: "Failed to load financial accounts",
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select(
          `
          *,
          financial_accounts (
            account_name,
            account_type
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const generateTransactionCode = () => {
    return `TXN-${Date.now().toString().slice(-8)}`;
  };

  const onSubmitTransaction = async (
    values: z.infer<typeof transactionSchema>
  ) => {
    try {
      // Get user's district from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("district_id")
        .eq("user_id", user?.id)
        .single();

      const transactionData = {
        account_id: values.account_id,
        description: values.description,
        amount: parseFloat(values.amount),
        transaction_type: values.transaction_type,
        transaction_code: generateTransactionCode(),
        transaction_date: new Date().toISOString().split("T")[0],
        reference_type: values.reference_type || null,
        receipt_number: values.receipt_number || null,
        payment_method: values.payment_method || null,
        notes: values.notes || null,
        processed_by: user?.id || "",
        district_id: profile?.district_id || null,
      };

      const { error } = await supabase
        .from("financial_transactions")
        .insert([transactionData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction recorded successfully",
      });

      setTransactionDialogOpen(false);
      transactionForm.reset();
      fetchTransactions();
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record transaction",
        variant: "destructive",
      });
    }
  };

  const onSubmitAccount = async (values: z.infer<typeof accountSchema>) => {
    try {
      // Get user's district from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("district_id")
        .eq("user_id", user?.id)
        .single();

      const accountData = {
        account_name: values.account_name,
        account_type: values.account_type,
        account_code: values.account_code,
        description: values.description || null,
        district_id: profile?.district_id || null,
      };

      const { error } = await supabase
        .from("financial_accounts")
        .insert([accountData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Account created successfully",
      });

      setAccountDialogOpen(false);
      accountForm.reset();
      fetchAccounts();
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    }
  };

  const updateTransactionStatus = async (
    transactionId: string,
    status: string
  ) => {
    try {
      const updateData: any = { status };

      if (status === "approved") {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = user?.id;
      }

      const { error } = await supabase
        .from("financial_transactions")
        .update(updateData)
        .eq("id", transactionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Transaction status updated successfully",
      });

      fetchTransactions();
    } catch (error: any) {
      console.error("Error updating transaction status:", error);
      toast({
        title: "Error",
        description: "Failed to update transaction status",
        variant: "destructive",
      });
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.transaction_code
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesType =
      !typeFilter ||
      typeFilter === "all" ||
      transaction.transaction_type === typeFilter;
    const matchesStatus =
      !statusFilter ||
      statusFilter === "all" ||
      transaction.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const canManage =
    hasRole("community_admin") ||
    hasRole("district_coordinator") ||
    hasRole("state_admin");

  const getAccountTypeBadge = (type: string) => {
    const typeConfig = accountTypes.find((t) => t.value === type);
    return (
      <Badge className={`${typeConfig?.color || "bg-gray-500"} text-white`}>
        {typeConfig?.label || type}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find((s) => s.value === status);
    return (
      <Badge className={`${statusConfig?.color || "bg-gray-500"} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getTotalBalance = () => {
    return transactions
      .filter((t) => t.status === "approved")
      .reduce((total, transaction) => {
        return transaction.transaction_type === "credit"
          ? total + transaction.amount
          : total - transaction.amount;
      }, 0);
  };

  const getTotalIncome = () => {
    return transactions
      .filter((t) => t.status === "approved" && t.transaction_type === "credit")
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter((t) => t.status === "approved" && t.transaction_type === "debit")
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <DollarSign className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {language === "en" ? "Financial Management" : "Pengurusan Kewangan"}
          </h1>
          <p className="text-muted-foreground">
            {language === "en"
              ? "Track income, expenses, and manage financial accounts"
              : "Jejaki pendapatan, perbelanjaan, dan urus akaun kewangan"}
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              RM{" "}
              {getTotalBalance().toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              RM{" "}
              {getTotalIncome().toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              RM{" "}
              {getTotalExpenses().toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Income</SelectItem>
                  <SelectItem value="debit">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {canManage && (
              <Dialog
                open={transactionDialogOpen}
                onOpenChange={setTransactionDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Record New Transaction</DialogTitle>
                    <DialogDescription>
                      Enter the transaction details below
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...transactionForm}>
                    <form
                      onSubmit={transactionForm.handleSubmit(
                        onSubmitTransaction
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={transactionForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Transaction description"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={transactionForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount (RM)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={transactionForm.control}
                          name="transaction_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="credit">Income</SelectItem>
                                  <SelectItem value="debit">Expense</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={transactionForm.control}
                        name="account_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {accounts.map((account) => (
                                  <SelectItem
                                    key={account.id}
                                    value={account.id}
                                  >
                                    {account.account_name} (
                                    {account.account_code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={transactionForm.control}
                          name="reference_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reference Type (Optional)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select reference type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {referenceTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type.replace("_", " ").toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={transactionForm.control}
                          name="payment_method"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Payment Method (Optional)</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {paymentMethods.map((method) => (
                                    <SelectItem key={method} value={method}>
                                      {method.replace("_", " ").toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={transactionForm.control}
                        name="receipt_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Receipt Number (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Receipt or reference number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={transactionForm.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Additional notes..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setTransactionDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Record Transaction</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Transactions List */}
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">
                          {transaction.description}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {transaction.transaction_code}
                        </Badge>
                      </div>
                      <CardDescription>
                        {transaction.financial_accounts?.account_name}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col space-y-2 items-end">
                      <div
                        className={`text-lg font-bold ${
                          transaction.transaction_type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.transaction_type === "credit" ? "+" : "-"}
                        RM{" "}
                        {transaction.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(
                          transaction.transaction_date
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    {transaction.payment_method && (
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {transaction.payment_method
                            .replace("_", " ")
                            .toUpperCase()}
                        </span>
                      </div>
                    )}

                    {transaction.receipt_number && (
                      <div className="flex items-center space-x-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <span>{transaction.receipt_number}</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Badge
                        className={
                          transaction.transaction_type === "credit"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {transaction.transaction_type === "credit"
                          ? "Income"
                          : "Expense"}
                      </Badge>
                    </div>
                  </div>

                  {canManage && transaction.status === "pending" && (
                    <div className="flex space-x-2 border-t pt-4">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateTransactionStatus(transaction.id, "approved")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateTransactionStatus(transaction.id, "rejected")
                        }
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTransactions.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No transactions found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter || statusFilter
                    ? "Try adjusting your filters"
                    : "Get started by recording your first transaction"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Chart of Accounts</h2>

            {canManage && (
              <Dialog
                open={accountDialogOpen}
                onOpenChange={setAccountDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Account</DialogTitle>
                    <DialogDescription>
                      Add a new financial account to the chart of accounts
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...accountForm}>
                    <form
                      onSubmit={accountForm.handleSubmit(onSubmitAccount)}
                      className="space-y-4"
                    >
                      <FormField
                        control={accountForm.control}
                        name="account_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Account name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={accountForm.control}
                          name="account_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {accountTypes.map((type) => (
                                    <SelectItem
                                      key={type.value}
                                      value={type.value}
                                    >
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={accountForm.control}
                          name="account_code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Code</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., INC001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={accountForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Account description..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAccountDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Create Account</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Accounts List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {account.account_name}
                      </CardTitle>
                      <CardDescription>{account.account_code}</CardDescription>
                    </div>
                    {getAccountTypeBadge(account.account_type)}
                  </div>
                </CardHeader>
                {account.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {account.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {accounts.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No accounts found</h3>
                <p className="text-muted-foreground">
                  Get started by creating your first financial account
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
