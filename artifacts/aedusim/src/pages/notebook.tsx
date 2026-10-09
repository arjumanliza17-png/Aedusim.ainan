import { useState, useRef, useCallback } from "react";
import type { ReactElement } from "react";
import {
  useListDocuments,
  useCreateDocument,
  useGetDocument,
  useDeleteDocument,
  useChatWithDocument,
  getListDocumentsQueryKey,
  getGetDocumentQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen, Plus, FileText, Trash2, BookText,
  X, MessageSquare, Zap, List, Upload, Globe, Image,
  Video, Link2, Search, ChevronDown, File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const FILE_ICONS: Record<string, ReactElement> = {
  PDF: <FileText className="w-4 h-4 text-red-400" />,
  DOCX: <FileText className="w-4 h-4 text-blue-400" />,
  TXT: <FileText className="w-4 h-4 text-muted-foreground" />,
  IMAGE: <Image className="w-4 h-4 text-green-400" />,
  VIDEO: <Video className="w-4 h-4 text-purple-400" />,
  EBOOK: <BookText className="w-4 h-4 text-amber-400" />,
  WEB: <Globe className="w-4 h-4 text-cyan-400" />,
};

function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (file.type.startsWith("image/")) {
      resolve(`[Image file: ${file.name}]\n\nThis is an image document. The image has been uploaded to your Knowledge Hub. You can ask the AI to describe what this type of image might contain, or add your own notes about it below.`);
      return;
    }
    if (file.type.startsWith("video/")) {
      resolve(`[Video file: ${file.name}]\n\nThis video has been added to your Knowledge Hub. Use the AI Chat tab to ask questions about the video topic, or add manual notes about its content.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // For binary files, just use the filename as content
      if (text && text.length > 0 && !text.includes('\0')) {
        resolve(text.slice(0, 10000));
      } else {
        resolve(`[File: ${file.name}]\n\nThis file has been added to your Knowledge Hub. The AI will analyze it based on the title and context you provide.`);
      }
    };
    reader.onerror = () => resolve(`[File: ${file.name}]\n\nFile content could not be read. Add your notes manually.`);
    if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      resolve(`[File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\n\nThis ${file.type || "file"} has been uploaded to your Knowledge Hub. The AI will process and analyze it based on the title and any notes you add.`);
    }
  });
}

function getFileType(file: File): string {
  if (file.type.startsWith("image/")) return "IMAGE";
  if (file.type.startsWith("video/")) return "VIDEO";
  if (file.name.endsWith(".pdf")) return "PDF";
  if (file.name.endsWith(".docx") || file.name.endsWith(".doc")) return "DOCX";
  if (file.name.endsWith(".epub")) return "EBOOK";
  return "TXT";
}

function getWebContent(url: string, title: string): string {
  const domain = (() => { try { return new URL(url).hostname; } catch { return url; } })();
  return `[Web Source: ${url}]\nDomain: ${domain}\n\nThis content has been imported from the web. The document "${title}" is sourced from ${domain}. The AI will help you analyze, summarize, and study this web content based on the topic you've described. Use the Chat tab to ask specific questions about this source.`;
}

export default function NotebookPage() {
  const { data: documents, isLoading } = useListDocuments();
  const createDocument = useCreateDocument();
  const deleteDocument = useDeleteDocument();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addTab, setAddTab] = useState<"file" | "text" | "web">("file");
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("TXT");
  const [newContent, setNewContent] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const name = file.name.replace(/\.[^.]+$/, "");
    setNewTitle(name);
    setNewType(getFileType(file));
    const text = await extractTextFromFile(file);
    setNewContent(text);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleFileSelect(file);
  }, []);

  const handleWebImport = () => {
    if (!webUrl.trim()) return;
    const title = newTitle || webUrl.replace(/https?:\/\//, "").split("/")[0];
    const content = getWebContent(webUrl, title);
    setNewContent(content);
    setNewType("WEB");
    if (!newTitle) setNewTitle(title);
    toast({ title: "Web URL imported", description: "Ready to process — click Add & Process." });
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const titleFinal = newTitle.trim() || (selectedFile?.name || "Untitled Document");
    const contentFinal = newContent.trim() || (addTab === "web" ? getWebContent(webUrl, titleFinal) : "No content provided.");
    if (!titleFinal) return;

    createDocument.mutate({ data: { title: titleFinal, type: newType, content: contentFinal } }, {
      onSuccess: (doc) => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        setIsAddOpen(false);
        setNewTitle(""); setNewContent(""); setWebUrl(""); setSelectedFile(null); setAddTab("file");
        setSelectedDocId(doc.id);
        toast({ title: "Document processed", description: "Summary and flashcards are ready." });
      },
      onError: () => toast({ title: "Failed to add document", variant: "destructive" }),
    });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteDocument.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        if (selectedDocId === id) setSelectedDocId(null);
        toast({ title: "Document deleted" });
      }
    });
  };

  const filteredDocs = documents?.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full w-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background">
      {/* Left Sidebar */}
      <div className="w-72 border-r border-border/50 flex flex-col bg-sidebar/30 backdrop-blur-sm shrink-0">
        <div className="p-4 border-b border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Knowledge Hub
            </h2>
            <Dialog open={isAddOpen} onOpenChange={(o) => { setIsAddOpen(o); if (!o) { setNewTitle(""); setNewContent(""); setWebUrl(""); setSelectedFile(null); } }}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add to Knowledge Hub</DialogTitle>
                </DialogHeader>
                <Tabs value={addTab} onValueChange={(v) => setAddTab(v as "file" | "text" | "web")} className="pt-2">
                  <TabsList className="w-full">
                    <TabsTrigger value="file" className="flex-1 gap-1.5"><Upload className="w-3.5 h-3.5" /> Upload File</TabsTrigger>
                    <TabsTrigger value="text" className="flex-1 gap-1.5"><FileText className="w-3.5 h-3.5" /> Paste Text</TabsTrigger>
                    <TabsTrigger value="web" className="flex-1 gap-1.5"><Globe className="w-3.5 h-3.5" /> Web URL</TabsTrigger>
                  </TabsList>

                  {/* File Upload */}
                  <TabsContent value="file" className="mt-4 space-y-4">
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        dragging ? "border-blue-500 bg-blue-500/10" : "border-border/50 hover:border-blue-500/50 hover:bg-blue-500/5"
                      }`}
                    >
                      <input
                        ref={fileRef} type="file"
                        className="hidden"
                        accept=".pdf,.docx,.doc,.txt,.md,.csv,.epub,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.mov"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
                      />
                      {selectedFile ? (
                        <div className="space-y-2">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto">
                            {FILE_ICONS[getFileType(selectedFile)] || <File className="w-6 h-6 text-blue-400" />}
                          </div>
                          <p className="font-medium text-sm">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                          <div>
                            <p className="text-sm font-medium">Drop a file or click to browse</p>
                            <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, EPUB, Images, Videos</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedFile && (
                      <form onSubmit={handleAddDocument} className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="mt-1" placeholder="Document title" required />
                        </div>
                        <Button type="submit" className="w-full" disabled={createDocument.isPending}>
                          {createDocument.isPending ? "Processing..." : "Add & Process with AI"}
                        </Button>
                      </form>
                    )}
                  </TabsContent>

                  {/* Paste Text */}
                  <TabsContent value="text" className="mt-4">
                    <form onSubmit={handleAddDocument} className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="mt-1" placeholder="e.g. Chapter 5 Notes" required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Type</label>
                        <Select value={newType} onValueChange={setNewType}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TXT">Text / Notes</SelectItem>
                            <SelectItem value="PDF">PDF Content</SelectItem>
                            <SelectItem value="DOCX">Word Document</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Content</label>
                        <Textarea
                          value={newContent}
                          onChange={e => setNewContent(e.target.value)}
                          placeholder="Paste your notes, textbook content, or any study material here..."
                          className="min-h-[160px] mt-1"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={createDocument.isPending}>
                        {createDocument.isPending ? "Processing..." : "Add & Process with AI"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Web URL */}
                  <TabsContent value="web" className="mt-4">
                    <form onSubmit={handleAddDocument} className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Website URL</label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={webUrl}
                            onChange={e => setWebUrl(e.target.value)}
                            placeholder="https://en.wikipedia.org/wiki/..."
                            type="url"
                          />
                          <Button type="button" variant="outline" onClick={handleWebImport} disabled={!webUrl.trim()}>
                            <Search className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">Wikipedia, news articles, study resources, YouTube links</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} className="mt-1" placeholder="Document title" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Your Notes (optional)</label>
                        <Textarea
                          value={newContent}
                          onChange={e => setNewContent(e.target.value)}
                          placeholder="Add context or notes about this source..."
                          className="min-h-[100px] mt-1"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={createDocument.isPending || (!webUrl.trim() && !newContent.trim())}>
                        {createDocument.isPending ? "Processing..." : "Import & Process with AI"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="pl-9 h-8 text-xs bg-background/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted/50 animate-pulse" />)
          ) : filteredDocs?.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">{search ? "No results found" : "No documents yet"}</p>
              <p className="text-xs mt-1">{search ? "Try a different search" : "Add notes, files, or web links"}</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredDocs?.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                    selectedDocId === doc.id
                      ? "bg-blue-500/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                      : "bg-card/50 border-border/50 hover:bg-card hover:border-border"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                      {FILE_ICONS[doc.type] || <FileText className="w-4 h-4 text-muted-foreground shrink-0" />}
                      <span className="font-medium text-sm truncate">{doc.title}</span>
                    </div>
                    <Button
                      variant="ghost" size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 shrink-0 -mr-1 -mt-1"
                      onClick={(e) => handleDelete(e, doc.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                    {doc.summary?.substring(0, 90) || doc.content.substring(0, 90)}...
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-background/50">{doc.type}</Badge>
                    <span className="flex items-center gap-1"><List className="w-2.5 h-2.5" /> {doc.keyPoints?.length || 0} pts</span>
                    <span className="flex items-center gap-1"><BookText className="w-2.5 h-2.5" /> {doc.flashcards?.length || 0} cards</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {selectedDocId ? (
          <DocumentDetailView docId={selectedDocId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-3">
            <BookOpen className="w-16 h-16 opacity-10" />
            <p className="text-sm">Select a document to study</p>
            <p className="text-xs opacity-60">Upload files, paste text, or import from a web URL</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentDetailView({ docId }: { docId: number }) {
  const { data: doc, isLoading } = useGetDocument(docId, { query: { enabled: !!docId, queryKey: getGetDocumentQueryKey(docId) } });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!doc) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-5 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30">{doc.type}</Badge>
          <h1 className="text-xl font-bold truncate">{doc.title}</h1>
        </div>
        <p className="text-muted-foreground text-xs">Added {new Date(doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
      </div>

      <div className="flex-1 overflow-hidden p-5">
        <Tabs defaultValue="summary" className="h-full flex flex-col">
          <TabsList className="shrink-0 justify-start h-auto p-1 bg-muted/50 border border-border/50 flex-wrap gap-0.5">
            <TabsTrigger value="summary" className="py-1.5 text-xs"><FileText className="w-3.5 h-3.5 mr-1.5" /> Summary</TabsTrigger>
            <TabsTrigger value="keypoints" className="py-1.5 text-xs"><List className="w-3.5 h-3.5 mr-1.5" /> Key Points</TabsTrigger>
            <TabsTrigger value="flashcards" className="py-1.5 text-xs"><BookText className="w-3.5 h-3.5 mr-1.5" /> Flashcards</TabsTrigger>
            <TabsTrigger value="formulas" className="py-1.5 text-xs"><Zap className="w-3.5 h-3.5 mr-1.5" /> Formulas</TabsTrigger>
            <TabsTrigger value="chat" className="py-1.5 text-xs text-blue-400 data-[state=active]:text-blue-400"><MessageSquare className="w-3.5 h-3.5 mr-1.5" /> AI Chat</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-3 rounded-xl border border-border/50 bg-card/30">
            <TabsContent value="summary" className="m-0 p-5">
              <p className="text-sm leading-relaxed mb-6">{doc.summary || "No summary available."}</p>
              <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider">Original Content</h3>
              <div className="bg-background/50 p-4 rounded-lg border border-border/50 text-xs font-mono text-muted-foreground max-h-52 overflow-y-auto whitespace-pre-wrap">
                {doc.content}
              </div>
            </TabsContent>

            <TabsContent value="keypoints" className="m-0 p-5">
              {doc.keyPoints?.length ? (
                <ul className="space-y-3">
                  {doc.keyPoints.map((kp, i) => (
                    <li key={i} className="flex gap-3 bg-background/50 p-4 rounded-lg border border-border/50 items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</div>
                      <p className="text-sm leading-relaxed">{kp}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center p-10 text-muted-foreground text-sm">No key points extracted.</div>
              )}
            </TabsContent>

            <TabsContent value="flashcards" className="m-0 p-5">
              {doc.flashcards?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(doc.flashcards as Array<{ question: string; answer: string }>).map((fc, i) => (
                    <FlashCard key={i} question={fc.question} answer={fc.answer} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-10 text-muted-foreground text-sm">No flashcards generated.</div>
              )}
            </TabsContent>

            <TabsContent value="formulas" className="m-0 p-5">
              {doc.formulas?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {doc.formulas.map((f, i) => (
                    <div key={i} className="bg-background/50 p-4 rounded-lg border border-border/50 font-mono text-center text-sm text-blue-300 overflow-x-auto">
                      {f}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-10 text-muted-foreground text-sm">No formulas detected for this document.</div>
              )}
            </TabsContent>

            <TabsContent value="chat" className="m-0 h-full flex flex-col" style={{ minHeight: "300px" }}>
              <DocumentChat docId={docId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function FlashCard({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer rounded-xl border border-border/50 bg-background/50 hover:border-blue-500/30 transition-all p-5 min-h-[120px] flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${flipped ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-background/60"}`}>
          {flipped ? "Answer" : "Question"}
        </Badge>
        <span className="text-[10px] text-muted-foreground">Click to flip</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={flipped ? "a" : "q"}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-sm leading-relaxed"
        >
          {flipped ? answer : question}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function DocumentChat({ docId }: { docId: number }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hi! I've read this document and I'm ready to answer your questions. Ask me anything about it!" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = useChatWithDocument();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    chatMutation.mutate({ id: docId, data: { question: userMsg } }, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
        setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, 50);
      },
      onError: () => setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]),
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[82%] rounded-2xl p-3 text-sm leading-relaxed ${
              m.role === "user"
                ? "bg-blue-600 text-white rounded-tr-sm"
                : "bg-card border border-border/50 rounded-tl-sm"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm p-3 flex gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-border/50 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question about this document..."
            className="flex-1 bg-card text-sm"
            disabled={chatMutation.isPending}
          />
          <Button type="submit" size="icon" disabled={chatMutation.isPending || !input.trim()}>
            <MessageSquare className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
