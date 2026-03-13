import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import CampaignCard from "@/components/CampaignCard";
import CampaignCardSkeleton from "@/components/skeletons/CampaignCardSkeleton";
import PageHeader from "@/components/PageHeader";
import SEOHead from "@/components/SEOHead";
import ErrorState from "@/components/ErrorState";
import EmptyState from "@/components/EmptyState";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Grid3X3, List, Plus } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { CampaignCategory } from "@/types/campaign";
import { CAMPAIGN_CATEGORIES } from "@/lib/categoryColors";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const ITEMS_PER_PAGE = 6;

export default function Campaigns() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categoryFilter, setCategoryFilter] = useState<CampaignCategory[]>([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: campaigns, isLoading, isError, refetch } = useCampaigns();

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const filtered = useMemo(() => {
    if (!campaigns) return [];
    let result = [...campaigns];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (categoryFilter.length > 0) {
      result = result.filter((c) => categoryFilter.includes(c.category));
    }

    switch (sortBy) {
      case "most-funded":
        result.sort((a, b) => b.raisedAmount - a.raisedAmount);
        break;
      case "ending-soon":
        result.sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime());
        break;
      case "most-backed":
        result.sort((a, b) => b.backerCount - a.backerCount);
        break;
      default:
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return result;
  }, [campaigns, debouncedSearch, statusFilter, sortBy, categoryFilter]);

  const handleLoadMore = useCallback(() => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((c) => c + ITEMS_PER_PAGE);
      setLoadingMore(false);
    }, 500);
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [debouncedSearch, statusFilter, sortBy, categoryFilter]);

  return (
    <PageTransition>
    <Layout>
      <SEOHead
        title="Campaigns | sBTCFund"
        description="Explore and fund projects building on Bitcoin. Browse active campaigns on sBTCFund."
      />
      <div className="container py-10">
        <PageHeader
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Campaigns" }]}
          title="Campaigns"
          description="Explore and fund projects building on Bitcoin"
        >
          <Button asChild className="gap-2 gradient-orange border-0 text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-transform">
            <Link to="/create"><Plus className="h-4 w-4" /> Create Campaign</Link>
          </Button>
        </PageHeader>

        {/* Filters */}
        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-secondary border-border"
              aria-label="Search campaigns"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40 bg-secondary border-border" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="funded">Funded</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-44 bg-secondary border-border" aria-label="Sort campaigns">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="most-funded">Most Funded</SelectItem>
              <SelectItem value="ending-soon">Ending Soon</SelectItem>
              <SelectItem value="most-backed">Most Backed</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden md:flex gap-1">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")} aria-label="Grid view">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")} aria-label="List view">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mt-3 flex flex-wrap gap-2">
          {CAMPAIGN_CATEGORIES.map((cat) => {
            const active = categoryFilter.includes(cat.value);
            return (
              <Button
                key={cat.value}
                variant={active ? "secondary" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() =>
                  setCategoryFilter((prev) =>
                    active ? prev.filter((c) => c !== cat.value) : [...prev, cat.value]
                  )
                }
              >
                {cat.label}
              </Button>
            );
          })}
          {categoryFilter.length > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => setCategoryFilter([])}>
              Clear
            </Button>
          )}
        </div>
        {/* Results */}
        {isLoading ? (
          <div className={`mt-6 grid gap-4 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to load campaigns"
            description="We couldn't load the campaigns. Please try again."
            onRetry={() => refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No campaigns found"
            description="Try adjusting your filters or create a new campaign"
            actionLabel="Create Campaign"
            actionHref="/create"
          />
        ) : (
          <>
            <motion.div
              key={`${debouncedSearch}-${statusFilter}-${sortBy}-${categoryFilter.join()}`}
              className={`mt-6 grid gap-4 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filtered.slice(0, visibleCount).map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
              {loadingMore && Array.from({ length: 3 }).map((_, i) => (
                <CampaignCardSkeleton key={`loading-${i}`} />
              ))}
            </motion.div>
            {visibleCount < filtered.length && !loadingMore && (
              <div className="mt-8 text-center">
                <Button variant="outline" onClick={handleLoadMore} className="gap-2 border-border">
                  Load More Campaigns
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
    </PageTransition>
  );
}
