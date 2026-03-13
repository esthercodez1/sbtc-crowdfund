import { useState, useEffect, useRef, useCallback } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import Breadcrumbs from "@/components/Breadcrumbs";
import TransactionStatusModal, { TransactionStatus } from "@/components/TransactionStatusModal";
import { useWallet } from "@/contexts/WalletContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PageTransition from "@/components/PageTransition";
import { CampaignCategory } from "@/types/campaign";
import { CAMPAIGN_CATEGORIES } from "@/lib/categoryColors";
import { Slider } from "@/components/ui/slider";
import CampaignCard from "@/components/CampaignCard";

const steps = ["Basic Info", "Funding Goal", "Milestones", "Review"];

interface MilestoneInput {
  description: string;
  percentage: number;
}

const DRAFT_KEY = "sbtcfund-draft-campaign";

interface DraftState {
  title: string;
  description: string;
  goal: string;
  duration: string;
  category: CampaignCategory | "";
  milestones: MilestoneInput[];
}

function loadDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function CreateCampaign() {
  const draft = useRef(loadDraft());
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(draft.current?.title || "");
  const [description, setDescription] = useState(draft.current?.description || "");
  const [goal, setGoal] = useState(draft.current?.goal || "");
  const [duration, setDuration] = useState(draft.current?.duration || "30");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState<CampaignCategory | "">(draft.current?.category || "");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [milestones, setMilestones] = useState<MilestoneInput[]>(
    draft.current?.milestones || [
      { description: "", percentage: 50 },
      { description: "", percentage: 50 },
    ]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<TransactionStatus>("signing");
  const [draftBanner, setDraftBanner] = useState(!!draft.current);
  const { wallet } = useWallet();

  useEffect(() => {
    document.title = "Create Campaign | sBTCFund";
  }, []);

  // Draft auto-save (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const state: DraftState = { title, description, goal, duration, category, milestones };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
    }, 500);
    return () => clearTimeout(timer);
  }, [title, description, goal, duration, category, milestones]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, [imagePreview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  }, [handleImageSelect]);

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);

  const addMilestone = () => {
    if (milestones.length < 5) {
      setMilestones([...milestones, { description: "", percentage: 0 }]);
    }
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 2) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (index: number, field: keyof MilestoneInput, value: string | number) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
    setErrors((e) => ({ ...e, [`milestone_${index}`]: "" }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 0:
        if (!title.trim()) newErrors.title = "Title is required";
        if (!description.trim()) newErrors.description = "Description is required";
        if (!category) newErrors.category = "Category is required";
        break;
      case 1:
        if (!goal || Number(goal) <= 0) newErrors.goal = "Enter a valid funding goal";
        break;
      case 2:
        milestones.forEach((m, i) => {
          if (!m.description.trim()) newErrors[`milestone_${i}`] = "Description required";
        });
        if (totalPercentage !== 100) newErrors.milestones = "Percentages must total 100%";
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canNext = () => {
    switch (step) {
      case 0: return title.length > 0 && description.length > 0 && category !== "";
      case 1: return Number(goal) > 0;
      case 2: return totalPercentage === 100 && milestones.every((m) => m.description.length > 0);
      default: return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleLaunch = () => {
    setTxStatus("signing");
    setTxModalOpen(true);
    setTimeout(() => setTxStatus("broadcasting"), 2000);
    setTimeout(() => setTxStatus("pending"), 4000);
    setTimeout(() => {
      setTxStatus("success");
      localStorage.removeItem(DRAFT_KEY);
    }, 6000);
  };

  // Build a preview campaign for the review step
  const previewCampaign = {
    id: 0,
    title: title || "Your Campaign",
    description,
    creator: wallet.address || "SP...",
    goalAmount: Number(goal) || 0,
    raisedAmount: 0,
    backerCount: 0,
    status: "active" as const,
    milestones: milestones.map((m, i) => ({ id: i + 1, description: m.description, percentage: m.percentage, completed: false })),
    createdAt: new Date(),
    endsAt: new Date(Date.now() + Number(duration) * 86400000),
    imageUrl: imagePreview || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop",
    category: (category || "infrastructure") as CampaignCategory,
  };

  return (
    <PageTransition>
    <Layout>
      <div className="container max-w-2xl py-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Create Campaign" }]} />

        <h1 className="font-display text-2xl font-bold">Create Campaign</h1>
        <p className="mt-2 text-muted-foreground">Launch your project on Bitcoin</p>

        {/* Draft restored banner */}
        {draftBanner && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm text-primary">
            <span>📝 Draft restored from your previous session</span>
            <button onClick={() => { setDraftBanner(false); localStorage.removeItem(DRAFT_KEY); setTitle(""); setDescription(""); setGoal(""); setDuration("30"); setCategory(""); setMilestones([{ description: "", percentage: 50 }, { description: "", percentage: 50 }]); }} className="text-xs underline hover:no-underline">
              Discard
            </button>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mt-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                i < step ? "bg-success text-background" : i === step ? "gradient-orange text-primary-foreground" : "border border-muted-foreground/30 text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`hidden text-sm sm:inline ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {s}
              </span>
              {i < steps.length - 1 && <div className="mx-2 h-px w-6 bg-border" />}
            </div>
          ))}
        </div>

        <Card className="mt-6 border-border bg-card">
          <CardContent className="p-5">
            {/* Step 1: Basic Info */}
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="campaign-title" className="text-sm font-medium text-foreground mb-2 block">Campaign Title</Label>
                  <Input
                    id="campaign-title"
                    placeholder="e.g. Decentralized Bitcoin Marketplace"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value.slice(0, 64)); setErrors((er) => ({ ...er, title: "" })); }}
                    className={`bg-secondary border-border ${errors.title ? "border-destructive" : ""}`}
                    maxLength={64}
                    aria-invalid={!!errors.title}
                  />
                  {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{title.length}/64 characters</p>
                </div>
                <div>
                  <Label htmlFor="campaign-desc" className="text-sm font-medium text-foreground mb-2 block">Description</Label>
                  <textarea
                    id="campaign-desc"
                    placeholder="Describe your project, goals, and how funds will be used..."
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); setErrors((er) => ({ ...er, description: "" })); }}
                    rows={4}
                    className={`flex w-full rounded-md border bg-secondary px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.description ? "border-destructive" : "border-border"}`}
                    aria-invalid={!!errors.description}
                  />
                  {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description}</p>}
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Banner Image</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file);
                    }}
                  />
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img src={imagePreview} alt="Banner preview" className="h-32 w-full object-cover" />
                      <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm hover:text-destructive transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/50 cursor-pointer hover:border-primary/30 transition-colors"
                    >
                      <div className="text-center text-muted-foreground">
                        <ImagePlus className="mx-auto h-8 w-8 mb-2" />
                        <p className="text-sm">Click or drag to upload</p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="campaign-category" className="text-sm font-medium text-foreground mb-2 block">Category</Label>
                  <Select value={category} onValueChange={(v) => { setCategory(v as CampaignCategory); setErrors((er) => ({ ...er, category: "" })); }}>
                    <SelectTrigger className={`bg-secondary ${errors.category ? "border-destructive" : "border-border"}`} id="campaign-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {CAMPAIGN_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Funding Goal */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="funding-goal" className="text-sm font-medium text-foreground mb-2 block">Funding Goal</Label>
                  <div className="relative">
                    <Input
                      id="funding-goal"
                      type="number"
                      placeholder="10000"
                      value={goal}
                      onChange={(e) => { setGoal(e.target.value); setErrors((er) => ({ ...er, goal: "" })); }}
                      className={`pr-16 bg-secondary text-lg font-mono ${errors.goal ? "border-destructive" : "border-border"}`}
                      aria-invalid={!!errors.goal}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">STX</span>
                  </div>
                  {errors.goal && <p className="mt-1 text-xs text-destructive">{errors.goal}</p>}
                  {Number(goal) > 0 && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      ≈ ${(Number(goal) * 0.45).toLocaleString()} USD
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="campaign-duration" className="text-sm font-medium text-foreground mb-2 block">Campaign Duration</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="bg-secondary border-border" id="campaign-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Milestones */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Define Milestones</p>
                    <p className="text-xs text-muted-foreground">Allocate 100% of funds across milestones</p>
                  </div>
                  <Badge className={totalPercentage === 100 ? "bg-success/20 text-success border-success/30 border" : "bg-destructive/20 text-destructive border-destructive/30 border"}>
                    {totalPercentage}%
                  </Badge>
                </div>

                {/* Stacked bar visualization */}
                <div className="h-3 w-full rounded-full bg-secondary overflow-hidden flex">
                  {milestones.map((m, i) => (
                    <div
                      key={i}
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${m.percentage}%`,
                        background: `hsl(${33 + i * 40}, 80%, ${55 - i * 5}%)`,
                      }}
                    />
                  ))}
                </div>

                {errors.milestones && <p className="text-xs text-destructive">{errors.milestones}</p>}
                {milestones.map((m, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground mt-1"
                      style={{ background: `hsl(${33 + i * 40}, 80%, ${55 - i * 5}%)` }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder={`Milestone ${i + 1} description`}
                        value={m.description}
                        onChange={(e) => updateMilestone(i, "description", e.target.value)}
                        className={`bg-secondary ${errors[`milestone_${i}`] ? "border-destructive" : "border-border"}`}
                        aria-label={`Milestone ${i + 1} description`}
                        aria-invalid={!!errors[`milestone_${i}`]}
                      />
                      {errors[`milestone_${i}`] && <p className="text-xs text-destructive">{errors[`milestone_${i}`]}</p>}
                      <div className="flex items-center gap-3">
                        <Slider
                          value={[m.percentage]}
                          onValueChange={([v]) => updateMilestone(i, "percentage", v)}
                          min={0}
                          max={100}
                          step={5}
                          className="flex-1"
                          aria-label={`Milestone ${i + 1} percentage`}
                        />
                        <span className="w-12 text-right font-mono text-sm text-muted-foreground">{m.percentage}%</span>
                      </div>
                    </div>
                    {milestones.length > 2 && (
                      <Button variant="ghost" size="icon" onClick={() => removeMilestone(i)} className="text-muted-foreground hover:text-destructive mt-1" aria-label={`Remove milestone ${i + 1}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {milestones.length < 5 && (
                  <Button variant="outline" onClick={addMilestone} className="w-full gap-2 border-border border-dashed">
                    <Plus className="h-4 w-4" /> Add Milestone
                  </Button>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                  ⚠️ Once launched, campaign details cannot be changed. Please review carefully.
                </div>

                {/* Campaign Card Preview */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Card Preview</p>
                  <div className="max-w-sm mx-auto pointer-events-none">
                    <CampaignCard campaign={previewCampaign} />
                  </div>
                </div>

                {imagePreview && (
                  <div className="rounded-xl overflow-hidden border border-border">
                    <img src={imagePreview} alt="Campaign banner" className="h-32 w-full object-cover" />
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Title</p>
                    <p className="font-semibold text-foreground mt-1">{title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Category</p>
                    <p className="font-semibold text-foreground mt-1">{CAMPAIGN_CATEGORIES.find(c => c.value === category)?.label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Goal</p>
                    <p className="font-semibold text-foreground mt-1 font-mono">{Number(goal).toLocaleString()} STX</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Duration</p>
                    <p className="font-semibold text-foreground mt-1">{duration} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Milestones</p>
                    {milestones.map((m, i) => (
                      <div key={i} className="flex justify-between py-1 text-sm">
                        <span className="text-foreground">{m.description}</span>
                        <span className="font-mono text-muted-foreground">{m.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className="gap-2 border-border"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canNext()}
                  className="gap-2 gradient-orange border-0 text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-transform"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : wallet.connected ? (
                <Button
                  onClick={handleLaunch}
                  className="gap-2 gradient-orange border-0 text-primary-foreground hover:opacity-90 animate-pulse-glow active:scale-[0.98] transition-transform"
                >
                  🚀 Launch Campaign
                </Button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button disabled className="gap-2">
                        🚀 Launch Campaign
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect your wallet to launch a campaign</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionStatusModal
        open={txModalOpen}
        onOpenChange={setTxModalOpen}
        status={txStatus}
        campaignTitle={title}
        txHash="0x7c2e...a1b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7"
        onRetry={handleLaunch}
        onClose={() => setTxModalOpen(false)}
      />
    </Layout>
    </PageTransition>
  );
}
