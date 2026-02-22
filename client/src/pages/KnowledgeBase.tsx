import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  BookOpen,
  Plus,
  Trash2,
  Upload,
  FileText,
  Image as ImageIcon,
  Loader2,
  Save,
  BarChart3,
  ListPlus,
} from "lucide-react";

type KnowledgeChunk = {
  id: number;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  drillType: string | null;
  sourceType: string | null;
};

const CATEGORY_KEYS = [
  "Skating",
  "Shooting",
  "Passing",
  "Stickhandling",
  "Tactics",
  "Checking",
  "Conditioning",
  "Goaltending",
];

export default function KnowledgeBase() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const kbT = (t as any).knowledge || {};

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [drillType, setDrillType] = useState("Drill");
  const [tags, setTags] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: chunks, isLoading } = useQuery<KnowledgeChunk[]>({
    queryKey: ["/api/knowledge"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      category: string;
      tags: string[];
      drillType: string;
      sourceType: string;
    }) => {
      return apiRequest("POST", "/api/knowledge", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge"] });
      toast({ title: kbT.drillSaved || "Drill saved successfully" });
      setTitle("");
      setDescription("");
      setCategory("");
      setDrillType("Drill");
      setTags("");
    },
    onError: () => {
      toast({
        title: kbT.error || "Error",
        description: kbT.saveFailed || "Failed to save drill",
        variant: "destructive",
      });
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data: { imageBase64: string; language: string }) => {
      const res = await apiRequest("POST", "/api/knowledge/analyze-image", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge"] });
      toast({ title: kbT.imageAnalyzed || "Image analyzed and drill saved" });
      setImagePreview(null);
      setImageBase64(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: () => {
      toast({
        title: kbT.error || "Error",
        description: kbT.analyzeFailed || "Failed to analyze image",
        variant: "destructive",
      });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (data: { text: string; language: string }) => {
      const res = await apiRequest("POST", "/api/knowledge/bulk-parse", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge"] });
      toast({
        title: kbT.bulkSuccess || "Drills imported",
        description: `${data.count} ${kbT.drillsImported || "drills imported successfully"}`,
      });
      setBulkText("");
    },
    onError: () => {
      toast({
        title: kbT.error || "Error",
        description: kbT.bulkFailed || "Failed to parse and import drills",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/knowledge/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge"] });
      toast({ title: kbT.drillDeleted || "Drill deleted" });
    },
  });

  const handleTextSubmit = () => {
    if (!title.trim() || !description.trim()) return;
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    createMutation.mutate({
      title: title.trim(),
      content: description.trim(),
      category,
      tags: tagList,
      drillType,
      sourceType: "text",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    if (!imageBase64) return;
    analyzeMutation.mutate({ imageBase64, language });
  };

  const handleDelete = (id: number) => {
    if (confirm(kbT.confirmDelete || "Are you sure you want to delete this drill?")) {
      deleteMutation.mutate(id);
    }
  };

  const catLabels = (t as any).knowledgeCategories || {};
  const categoryStats = CATEGORY_KEYS.reduce(
    (acc, cat) => {
      acc[cat] = chunks?.filter((c) => c.category === cat).length || 0;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in max-w-6xl mx-auto" data-testid="knowledge-base-page">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-7 h-7 text-accent" />
          <h1
            className="text-2xl font-bold font-display"
            data-testid="text-knowledge-title"
          >
            {kbT.title || "Drill Library"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {kbT.subtitle ||
            "Manage your personal drill library. Add drills via text or analyze images with AI."}
        </p>
      </div>

      <Card data-testid="stats-bar">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {kbT.totalDrills || "Total Drills"}: {chunks?.length || 0}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_KEYS.map((cat) => (
              <Badge
                key={cat}
                variant={categoryStats[cat] > 0 ? "default" : "outline"}
                className="text-xs"
                data-testid={`stat-category-${cat.toLowerCase()}`}
              >
                {catLabels[cat] || cat}: {categoryStats[cat]}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setShowAddSection(!showAddSection)}
          className="gap-2"
          data-testid="button-toggle-add-drill"
        >
          <Plus className="w-4 h-4" />
          {kbT.addDrill || "Add Drill"}
        </Button>
      </div>

      {showAddSection && (
        <Card data-testid="add-drill-section">
          <CardContent className="p-4">
            <Tabs defaultValue="text">
              <TabsList className="mb-4" data-testid="tabs-add-drill">
                <TabsTrigger value="text" data-testid="tab-text-entry">
                  <FileText className="w-4 h-4 mr-2" />
                  {kbT.textEntry || "Text Entry"}
                </TabsTrigger>
                <TabsTrigger value="image" data-testid="tab-image-upload">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {kbT.imageUpload || "Image Upload"}
                </TabsTrigger>
                <TabsTrigger value="bulk" data-testid="tab-bulk-upload">
                  <ListPlus className="w-4 h-4 mr-2" />
                  {kbT.bulkUpload || "Bulk Import"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    {kbT.drillTitle || "Title"}
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={kbT.drillTitle || "Drill title"}
                    data-testid="input-drill-title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    {kbT.description || "Description"}
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={kbT.description || "Describe the drill..."}
                    rows={4}
                    data-testid="input-drill-description"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      {kbT.category || "Category"}
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue
                          placeholder={kbT.category || "Select category"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_KEYS.map((cat) => (
                          <SelectItem
                            key={cat}
                            value={cat}
                            data-testid={`option-category-${cat.toLowerCase()}`}
                          >
                            {catLabels[cat] || cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      {kbT.drillType || "Drill Type"}
                    </label>
                    <Select value={drillType} onValueChange={setDrillType}>
                      <SelectTrigger data-testid="select-drill-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Drill" data-testid="option-type-drill">
                          {kbT.drill || "Drill"}
                        </SelectItem>
                        <SelectItem value="Game" data-testid="option-type-game">
                          {kbT.game || "Game"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    {kbT.tags || "Tags"}
                  </label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder={
                      kbT.tagsPlaceholder || "e.g. beginner, warmup, speed"
                    }
                    data-testid="input-drill-tags"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleTextSubmit}
                    disabled={
                      !title.trim() ||
                      !description.trim() ||
                      createMutation.isPending
                    }
                    className="gap-2"
                    data-testid="button-save-drill"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {createMutation.isPending
                      ? kbT.saving || "Saving..."
                      : kbT.save || "Save Drill"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div
                  className="border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer hover-elevate overflow-visible"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="dropzone-image-upload"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    data-testid="input-file-upload"
                  />
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {kbT.imageUploadHint ||
                      "Click to upload an image of a drill diagram"}
                  </p>
                </div>

                {imagePreview && (
                  <div className="space-y-3">
                    <div className="border rounded-md overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-64 mx-auto object-contain"
                        data-testid="img-upload-preview"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={handleAnalyze}
                        disabled={analyzeMutation.isPending}
                        className="gap-2"
                        data-testid="button-analyze-image"
                      >
                        {analyzeMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ImageIcon className="w-4 h-4" />
                        )}
                        {analyzeMutation.isPending
                          ? kbT.analyzing || "Analyzing..."
                          : kbT.analyze || "Analyze"}
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {kbT.bulkHint || "Paste multiple drills at once. AI will automatically split and categorize each drill. Separate drills with empty lines or numbering."}
                </p>
                <Textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={kbT.bulkPlaceholder || "1. Power skating drill - players skate full speed from goal line to blue line and back...\n\n2. 2-on-1 rush drill - two forwards attack against one defender..."}
                  rows={10}
                  data-testid="input-bulk-text"
                />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    {bulkText.trim().length > 0
                      ? `${bulkText.trim().length} ${kbT.characters || "characters"}`
                      : ""}
                  </p>
                  <Button
                    onClick={() => bulkMutation.mutate({ text: bulkText, language })}
                    disabled={bulkText.trim().length < 10 || bulkMutation.isPending}
                    className="gap-2"
                    data-testid="button-bulk-import"
                  >
                    {bulkMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ListPlus className="w-4 h-4" />
                    )}
                    {bulkMutation.isPending
                      ? kbT.importing || "Importing..."
                      : kbT.importDrills || "Import Drills"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {(!chunks || chunks.length === 0) ? (
        <div
          className="py-16 text-center bg-secondary/30 rounded-xl border border-dashed border-border"
          data-testid="empty-state"
        >
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
          <h3 className="font-semibold text-lg mb-1" data-testid="text-empty-title">
            {kbT.emptyTitle || "No drills yet"}
          </h3>
          <p className="text-muted-foreground text-sm" data-testid="text-empty-subtitle">
            {kbT.emptySubtitle ||
              "Add your first drill using text entry or by uploading an image for AI analysis."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {chunks.map((chunk) => (
            <Card
              key={chunk.id}
              className="overflow-visible"
              data-testid={`card-drill-${chunk.id}`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-sm truncate"
                      data-testid={`text-drill-title-${chunk.id}`}
                    >
                      {chunk.title}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(chunk.id)}
                    data-testid={`button-delete-drill-${chunk.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {chunk.category && (
                    <Badge
                      variant="default"
                      className="text-xs"
                      data-testid={`badge-category-${chunk.id}`}
                    >
                      {chunk.category}
                    </Badge>
                  )}
                  {chunk.sourceType && (
                    <Badge
                      variant="outline"
                      className="text-xs"
                      data-testid={`badge-source-${chunk.id}`}
                    >
                      {chunk.sourceType === "image" ? (
                        <ImageIcon className="w-3 h-3 mr-1" />
                      ) : (
                        <FileText className="w-3 h-3 mr-1" />
                      )}
                      {kbT.source || "Source"}: {chunk.sourceType}
                    </Badge>
                  )}
                </div>

                {chunk.content && (
                  <p
                    className="text-xs text-muted-foreground line-clamp-3"
                    data-testid={`text-drill-content-${chunk.id}`}
                  >
                    {chunk.content}
                  </p>
                )}

                {chunk.tags && chunk.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {chunk.tags.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-xs"
                        data-testid={`badge-tag-${chunk.id}-${i}`}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
