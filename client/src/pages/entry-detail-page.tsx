import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { formatDate, getMoodIcon } from "@/lib/utils";
import { 
  Card, CardContent, CardFooter, CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Button, buttonVariants 
} from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, Globe, Lock, Trash2, AlertTriangle,
  Loader2, ArrowLeft
} from "lucide-react";
import { EntryForm } from "@/components/journal/entry-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function EntryDetailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [match, params] = useRoute("/entries/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const entryId = match ? parseInt(params.id) : 0;
  
  const { data: entry, isLoading, error } = useQuery({
    queryKey: [`/api/entries/${entryId}`],
    enabled: !!entryId,
  });
  
  const deleteEntryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/entries/${entryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Entry deleted",
        description: "Your journal entry has been deleted",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error deleting entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-800 p-6">
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (error || !entry) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-800 p-6">
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-medium mb-2">Entry Not Found</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                      The journal entry you're looking for doesn't exist or you don't have permission to view it.
                    </p>
                    <Link href="/">
                      <a className={buttonVariants()}>
                        Back to Dashboard
                      </a>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  if (isEditing) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-800 p-6">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Edit className="h-5 w-5 mr-2 text-primary-400" />
                    Edit Journal Entry
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EntryForm
                    defaultValues={{
                      title: entry.title,
                      content: entry.content,
                      isPublic: entry.isPublic,
                      mood: entry.mood,
                      imageUrl: entry.imageUrl,
                    }}
                    onSuccess={() => setIsEditing(false)}
                    onCancel={() => setIsEditing(false)}
                    isEdit={true}
                    entryId={entry.id}
                  />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  const moodData = getMoodIcon(entry.mood);
  const sentimentAnalysis = entry.sentimentAnalysis ? JSON.parse(JSON.stringify(entry.sentimentAnalysis)) : null;
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-800 p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="text-neutral-600 dark:text-neutral-400"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
              </Button>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{entry.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {entry.isPublic ? (
                        <>
                          <Globe className="h-3 w-3" /> Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" /> Private
                        </>
                      )}
                    </Badge>
                    {entry.mood && (
                      <Badge variant="outline" className={`${moodData.bgColor} ${moodData.darkBgColor} border-0`}>
                        <i className={`fas fa-${moodData.icon} mr-1 ${moodData.color}`}></i> {entry.mood}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  {formatDate(entry.createdAt)}
                </div>
              </CardHeader>
              <CardContent>
                {entry.imageUrl && (
                  <div className="mb-6">
                    <img 
                      src={entry.imageUrl} 
                      alt={entry.title}
                      className="w-full h-auto max-h-80 object-cover rounded-md"
                    />
                  </div>
                )}
                
                <div className="prose dark:prose-invert max-w-none">
                  {entry.content.split("\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <div></div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you sure you want to delete this entry?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your journal entry.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => deleteEntryMutation.mutate()}
                          disabled={deleteEntryMutation.isPending}
                        >
                          {deleteEntryMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardFooter>
            </Card>
            
            {sentimentAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    <i className="fas fa-brain mr-2 text-accent-400"></i>
                    AI Emotional Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sentimentAnalysis.emotionalInsight && (
                      <div>
                        <h4 className="font-medium mb-1">Emotional Insight</h4>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {sentimentAnalysis.emotionalInsight}
                        </p>
                      </div>
                    )}
                    
                    {sentimentAnalysis.suggestion && (
                      <div>
                        <h4 className="font-medium mb-1">Suggestion</h4>
                        <p className="text-neutral-600 dark:text-neutral-400">
                          {sentimentAnalysis.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
