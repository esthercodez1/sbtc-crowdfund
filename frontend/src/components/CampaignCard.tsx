import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Campaign } from "@/types/campaign";
import { truncateAddress, formatSTX, getDaysLeft, getProgressPercentage } from "@/data/mockData";
import { getProgressColor } from "@/lib/utils";
import { categoryColors, CAMPAIGN_CATEGORIES } from "@/lib/categoryColors";
import { Badge } from "@/components/ui/badge";
import { Clock, Share2, Users } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  active: "bg-success/20 text-success border-success/30",
  funded: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-cyan/20 text-cyan border-cyan/30",
  failed: "bg-destructive/20 text-destructive border-destructive/30",
};

const MotionLink = motion.create(Link);

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cardVariants = {
  hidden: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const CampaignCard = memo(function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = getProgressPercentage(campaign.raisedAmount, campaign.goalAmount);
  const daysLeft = getDaysLeft(campaign.endsAt);
  const { toast } = useToast();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/campaign/${campaign.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Campaign link copied to clipboard" });
  };

  return (
    <MotionLink
      to={`/campaign/${campaign.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:border-primary/20"
      aria-label={`Campaign: ${campaign.title}, ${progress}% funded`}
      variants={cardVariants}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -3,
              boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.1)",
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <ImageWithFallback
          src={campaign.imageUrl}
          alt={campaign.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          fallbackClassName="h-full w-full"
          loading="lazy"
        />
        {/* Gradient overlay that intensifies on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge className={`${statusColors[campaign.status]} border text-xs capitalize transition-shadow duration-300 group-hover:shadow-[0_0_8px_-2px_currentColor]`}>
            {campaign.status}
          </Badge>
          <Badge className={`${categoryColors[campaign.category]} border text-xs transition-shadow duration-300 group-hover:shadow-[0_0_8px_-2px_currentColor]`}>
            {CAMPAIGN_CATEGORIES.find(c => c.value === campaign.category)?.label}
          </Badge>
        </div>
        {/* Share button with spring animation */}
        <motion.button
          onClick={handleShare}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-all duration-200 hover:text-primary group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Share campaign"
          whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Share2 className="h-3.5 w-3.5" />
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <h3 className="font-display text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {campaign.title}
        </h3>

        <p className="text-sm text-muted-foreground font-mono">
          by {truncateAddress(campaign.creator)}
        </p>

        {/* Progress */}
        <div className="mt-auto space-y-2">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-secondary transition-all duration-300 group-hover:h-2"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${progress}% funded`}
          >
            <div
              className={`h-full rounded-full ${getProgressColor(progress)} transition-all duration-1000 ease-out group-hover:progress-shimmer`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">
              {formatSTX(campaign.raisedAmount)} <span className="text-muted-foreground font-normal">STX</span>
            </span>
            <span className="text-muted-foreground">
              of {formatSTX(campaign.goalAmount)} STX
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 transition-colors duration-200 group-hover:text-primary">
            <Users className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" /> {campaign.backerCount} backers
          </span>
          <span className="flex items-center gap-1 transition-colors duration-200 group-hover:text-primary">
            <Clock className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" /> {daysLeft > 0 ? `${daysLeft} days left` : "Ended"}
          </span>
        </div>
      </div>
    </MotionLink>
  );
});

export default CampaignCard;
