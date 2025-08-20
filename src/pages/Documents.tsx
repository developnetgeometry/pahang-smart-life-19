import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, Search, Upload, Eye, Calendar, User } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  description: string;
  document_type: string;
  file_url: string;
  file_type: string;
  file_size: number;
  version: string;
  tags: string[];
  is_public: boolean;
  access_roles: string[];
  created_at: string;
  updated_at: string;
}

export default function Documents() {
  const { user, language } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.document_type === selectedType;
    return matchesSearch && matchesType;
  });

  const documentTypes = [...new Set(documents.map(doc => doc.document_type))];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-6 w-6 text-green-500" />;
      default:
        return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="p-6">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            {language === 'en' ? 'Document Library' : 'Perpustakaan Dokumen'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' ? 'Access community documents and resources' : 'Akses dokumen dan sumber komuniti'}
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          {language === 'en' ? 'Upload Document' : 'Muat Naik Dokumen'}
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'en' ? 'Search documents...' : 'Cari dokumen...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          {documentTypes.map(type => (
            <TabsTrigger key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(document.file_type)}
                      <div>
                        <CardTitle className="text-base line-clamp-2">{document.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {document.document_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            v{document.version}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {document.is_public && (
                      <Badge variant="default" className="text-xs">Public</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4 line-clamp-3">
                    {document.description}
                  </CardDescription>
                  
                  <div className="space-y-2 text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(document.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" />
                      {document.file_type?.toUpperCase()} • {formatFileSize(document.file_size || 0)}
                    </div>
                  </div>

                  {document.tags && document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {document.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {document.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{document.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      {language === 'en' ? 'View' : 'Lihat'}
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Download className="h-3 w-3 mr-1" />
                      {language === 'en' ? 'Download' : 'Muat Turun'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === 'en' ? 'No documents found' : 'Tiada dokumen ditemui'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'en' 
                    ? 'Try adjusting your search terms or check back later for new documents.'
                    : 'Cuba ubah suai istilah carian anda atau periksa semula kemudian untuk dokumen baru.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}