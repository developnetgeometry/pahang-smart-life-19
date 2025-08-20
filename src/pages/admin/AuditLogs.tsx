import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, Filter, Calendar, User, Activity, AlertTriangle,
  Eye, Download, RefreshCw, Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  ip_address: string | null;
  user_agent: string;
  old_values: any;
  new_values: any;
  module_name: string;
  user_role: string;
}

export default function AuditLogs() {
  const { user, language } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 20;

  useEffect(() => {
    fetchAuditLogs();
  }, [page, selectedAction, selectedUser, searchTerm]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('enhanced_audit_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      if (selectedAction !== 'all') {
        query = query.eq('action', selectedAction);
      }

      if (selectedUser !== 'all') {
        query = query.eq('user_id', selectedUser);
      }

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,resource_type.ilike.%${searchTerm}%,module_name.ilike.%${searchTerm}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      setLogs((data || []).map(log => ({
        ...log,
        ip_address: log.ip_address?.toString() || null
      })));
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return 'default';
      case 'update':
        return 'secondary';
      case 'delete':
        return 'destructive';
      case 'login':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return '+';
      case 'update':
        return '~';
      case 'delete':
        return '×';
      case 'login':
        return '→';
      default:
        return '•';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'Module', 'IP Address'].join(','),
      ...logs.map(log => [
        log.timestamp,
        log.user_id,
        log.action,
        log.resource_type,
        log.resource_id,
        log.module_name,
        log.ip_address
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            {language === 'en' ? 'Audit Logs' : 'Log Audit'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'System activity and user action tracking' : 'Penjejakan aktiviti sistem dan tindakan pengguna'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAuditLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Refresh' : 'Muat Semula'}
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            {language === 'en' ? 'Export' : 'Eksport'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {language === 'en' ? 'Filters' : 'Penapis'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'en' ? 'Search logs...' : 'Cari log...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select 
              className="px-3 py-2 border border-input bg-background rounded-md"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="all">{language === 'en' ? 'All Actions' : 'Semua Tindakan'}</option>
              <option value="create">{language === 'en' ? 'Create' : 'Cipta'}</option>
              <option value="update">{language === 'en' ? 'Update' : 'Kemaskini'}</option>
              <option value="delete">{language === 'en' ? 'Delete' : 'Padam'}</option>
              <option value="login">{language === 'en' ? 'Login' : 'Log Masuk'}</option>
            </select>

            <select 
              className="px-3 py-2 border border-input bg-background rounded-md"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="all">{language === 'en' ? 'All Users' : 'Semua Pengguna'}</option>
            </select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedAction('all');
              setSelectedUser('all');
              setPage(1);
            }}>
              {language === 'en' ? 'Clear Filters' : 'Kosongkan Penapis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {language === 'en' ? 'Recent Activity' : 'Aktiviti Terkini'}
          </CardTitle>
          <CardDescription>
            {language === 'en' ? 'Showing system audit trail and user actions' : 'Menunjukkan jejak audit sistem dan tindakan pengguna'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              {language === 'en' ? 'Loading audit logs...' : 'Memuatkan log audit...'}
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'en' ? 'Timestamp' : 'Masa'}</TableHead>
                    <TableHead>{language === 'en' ? 'User' : 'Pengguna'}</TableHead>
                    <TableHead>{language === 'en' ? 'Action' : 'Tindakan'}</TableHead>
                    <TableHead>{language === 'en' ? 'Resource' : 'Sumber'}</TableHead>
                    <TableHead>{language === 'en' ? 'Module' : 'Modul'}</TableHead>
                    <TableHead>{language === 'en' ? 'IP Address' : 'Alamat IP'}</TableHead>
                    <TableHead>{language === 'en' ? 'Details' : 'Butiran'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="truncate max-w-[100px]">
                            {log.user_id?.substring(0, 8)}...
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          <span className="mr-1">{getActionIcon(log.action)}</span>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{log.resource_type}</div>
                          {log.resource_id && (
                            <div className="text-xs text-muted-foreground font-mono">
                              {log.resource_id.substring(0, 12)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.module_name || 'System'}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ip_address || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {logs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'en' ? 'No audit logs found' : 'Tiada log audit dijumpai'}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {language === 'en' ? `Page ${page} of ${totalPages}` : `Halaman ${page} daripada ${totalPages}`}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      {language === 'en' ? 'Previous' : 'Sebelum'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      {language === 'en' ? 'Next' : 'Seterusnya'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}