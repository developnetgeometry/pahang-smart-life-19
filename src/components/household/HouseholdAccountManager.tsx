import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useHouseholdAccounts } from '@/hooks/use-household-accounts';
import { Users, Trash2, Settings, Heart, Home } from 'lucide-react';

interface SpouseFormData {
  email: string;
  password: string;
  full_name: string;
  mobile_no: string;
}


export function HouseholdAccountManager() {
  const { accounts, loading, createSpouseAccount, removeAccount, updatePermissions, canAddSpouse, refetch } = useHouseholdAccounts();
  const { toast } = useToast();
  
  const [spouseDialogOpen, setSpouseDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Refreshed",
      description: "Household accounts updated",
    });
  };

  const spouseForm = useForm<SpouseFormData>();

  const handleCreateSpouse = async (data: SpouseFormData) => {
    try {
      await createSpouseAccount(data);
      toast({
        title: "Spouse Account Created",
        description: "Spouse account has been successfully created and linked to your account.",
      });
      setSpouseDialogOpen(false);
      spouseForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create spouse account",
        variant: "destructive",
      });
    }
  };


  const handleRemoveAccount = async (accountId: string) => {
    if (window.confirm('Are you sure you want to remove this account? This action cannot be undone.')) {
      try {
        await removeAccount(accountId);
        toast({
          title: "Account Removed",
          description: "The linked account has been successfully removed.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove account",
          variant: "destructive",
        });
      }
    }
  };

  const getRelationshipIcon = (type: string) => {
    return type === 'spouse' ? <Heart className="h-4 w-4" /> : <Home className="h-4 w-4" />;
  };

  const getRelationshipColor = (type: string) => {
    return type === 'spouse' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="animate-pulse">Loading household accounts...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Household Accounts
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="ml-auto">
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Manage spouse accounts linked to your primary account. For tenant accounts, contact your community admin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Account Buttons */}
        <div className="flex gap-2">
          {canAddSpouse() && (
            <Dialog open={spouseDialogOpen} onOpenChange={setSpouseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Add Spouse Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Spouse Account</DialogTitle>
                  <DialogDescription>
                    Create an account for your spouse with full access to community features.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={spouseForm.handleSubmit(handleCreateSpouse)} className="space-y-4">
                  <div>
                    <Label htmlFor="spouse-name">Full Name</Label>
                    <Input 
                      id="spouse-name"
                      {...spouseForm.register('full_name', { required: true })}
                      placeholder="Enter spouse's full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spouse-email">Email</Label>
                    <Input 
                      id="spouse-email"
                      type="email"
                      {...spouseForm.register('email', { required: true })}
                      placeholder="Enter spouse's email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spouse-password">Password</Label>
                    <Input 
                      id="spouse-password"
                      type="password"
                      {...spouseForm.register('password', { required: true, minLength: 6 })}
                      placeholder="Create a secure password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spouse-mobile">Mobile Number (Optional)</Label>
                    <Input 
                      id="spouse-mobile"
                      {...spouseForm.register('mobile_no')}
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Spouse Account
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

        </div>

        {/* Existing Accounts List */}
        {accounts.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium">Linked Accounts</h4>
            {accounts.map((account) => (
              <Card key={account.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRelationshipIcon(account.relationship_type)}
                    <div>
                      <p className="font-medium">{account.linked_profile?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{account.linked_profile?.email}</p>
                    </div>
                    <Badge className={getRelationshipColor(account.relationship_type)}>
                      {account.relationship_type === 'spouse' ? 'Spouse' : 'Tenant'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {account.relationship_type === 'tenant' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAccount(account.id);
                          setPermissionsDialogOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAccount(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No linked accounts yet</p>
            <p className="text-sm">Add a spouse account to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
