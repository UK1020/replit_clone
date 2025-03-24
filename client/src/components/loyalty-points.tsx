import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Gift, Star, Award, TrendingUp, Clock, CheckCircle, LucideIcon } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Tier requirements and benefits
const TIER_POINTS = {
  bronze: 0,
  silver: 500,
  gold: 1500,
  platinum: 5000
};

// Tier colors
const TIER_COLORS = {
  bronze: "text-amber-700",
  silver: "text-slate-400",
  gold: "text-amber-400",
  platinum: "text-indigo-500"
};

const TIER_BADGES = {
  bronze: "bg-amber-100 text-amber-800",
  silver: "bg-slate-200 text-slate-800",
  gold: "bg-amber-200 text-amber-900",
  platinum: "bg-indigo-100 text-indigo-800"
};

const TIER_BENEFITS = {
  bronze: ["Earn 10 points for every ₹1 spent", "Access to basic rewards"],
  silver: ["15% extra points on all orders", "Free delivery on orders above ₹300"],
  gold: ["25% extra points on all orders", "Free delivery on all orders", "Priority customer support"],
  platinum: ["50% extra points on all orders", "Free delivery on all orders", "VIP customer support", "Access to exclusive offers"]
};

interface LoyaltyPointsProps {
  userId: number;
}

export default function LoyaltyPoints({ userId }: LoyaltyPointsProps) {
  const [isRewardsPanelOpen, setIsRewardsPanelOpen] = useState(false);
  const [redeemingReward, setRedeemingReward] = useState<number | null>(null);

  // Fetch user loyalty points data
  const { data: loyaltyData, isLoading: isLoadingLoyalty } = useQuery({
    queryKey: ["/api/loyalty/points"],
    queryFn: async () => {
      const res = await fetch("/api/loyalty/points", {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch loyalty points");
      return await res.json();
    },
  });

  // Fetch loyalty activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ["/api/loyalty/activities"],
    queryFn: async () => {
      const res = await fetch("/api/loyalty/activities", {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch loyalty activities");
      return await res.json();
    },
  });

  // Fetch available rewards
  const { data: rewards, isLoading: isLoadingRewards } = useQuery({
    queryKey: ["/api/rewards"],
    queryFn: async () => {
      const res = await fetch("/api/rewards", {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch rewards");
      return await res.json();
    },
  });

  // Fetch user redeemed rewards
  const { data: userRewards, isLoading: isLoadingUserRewards } = useQuery({
    queryKey: ["/api/user-rewards"],
    queryFn: async () => {
      const res = await fetch("/api/user-rewards", {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch user rewards");
      return await res.json();
    },
  });

  const handleRedeemReward = async (rewardId: number) => {
    setRedeemingReward(rewardId);
    try {
      const res = await apiRequest("POST", `/api/rewards/${rewardId}/redeem`);
      const userReward = await res.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty/points"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-rewards"] });
      
      toast({
        title: "Reward Redeemed!",
        description: `Your reward code is: ${userReward.code}. Use it at checkout.`,
      });
    } catch (error) {
      toast({
        title: "Failed to redeem reward",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setRedeemingReward(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getNextTier = (currentTier: string) => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'];
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  };

  const getProgressToNextTier = (points: number, currentTier: string) => {
    const nextTier = getNextTier(currentTier);
    if (!nextTier) return 100;

    const nextTierPoints = TIER_POINTS[nextTier as keyof typeof TIER_POINTS];
    const currentTierPoints = TIER_POINTS[currentTier as keyof typeof TIER_POINTS];
    const progress = ((points - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const pointsToNextTier = (points: number, currentTier: string) => {
    const nextTier = getNextTier(currentTier);
    if (!nextTier) return 0;

    const nextTierPoints = TIER_POINTS[nextTier as keyof typeof TIER_POINTS];
    return Math.max(nextTierPoints - points, 0);
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getActivityIcon = (action: string): LucideIcon => {
    switch (action) {
      case 'sign_up': return CheckCircle;
      case 'place_order': return ShoppingBag;
      case 'review': return Star;
      case 'referral': return Users;
      case 'birthday': return Gift;
      case 'streak': return TrendingUp;
      case 'challenge_completed': return Award;
      default: return Clock;
    }
  };

  if (isLoadingLoyalty) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!loyaltyData) {
    return null;
  }

  return (
    <Card className="mb-4 border-0 shadow">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            SPARKUR Rewards
          </span>
          <Badge className={TIER_BADGES[loyaltyData.tier as keyof typeof TIER_BADGES]}>
            {capitalizeFirstLetter(loyaltyData.tier)} Member
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <div className="font-medium text-lg">
              <span className="text-primary">{loyaltyData.points}</span> Points
            </div>
            {getNextTier(loyaltyData.tier) && (
              <span className="text-sm text-muted-foreground">
                {pointsToNextTier(loyaltyData.points, loyaltyData.tier)} points to {capitalizeFirstLetter(getNextTier(loyaltyData.tier) || '')}
              </span>
            )}
          </div>
          {getNextTier(loyaltyData.tier) && (
            <Progress value={getProgressToNextTier(loyaltyData.points, loyaltyData.tier)} className="h-2" />
          )}
        </div>

        <div className="grid gap-2 mb-4">
          <h4 className="text-sm font-semibold">Your Benefits:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {TIER_BENEFITS[loyaltyData.tier as keyof typeof TIER_BENEFITS].map((benefit, i) => (
              <li key={i} className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <Button 
          className="w-full mb-4" 
          variant="outline"
          onClick={() => setIsRewardsPanelOpen(!isRewardsPanelOpen)}
        >
          {isRewardsPanelOpen ? "Hide Rewards" : "View Available Rewards"}
        </Button>

        {isRewardsPanelOpen && (
          <div className="space-y-3 mt-2">
            <h4 className="text-sm font-semibold">Available Rewards:</h4>
            {isLoadingRewards ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : rewards && rewards.length > 0 ? (
              rewards.map((reward: any) => (
                <div key={reward.id} className="p-3 border rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">{reward.name}</h5>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-medium">{reward.pointsCost} pts</span>
                      <Button 
                        size="sm" 
                        onClick={() => handleRedeemReward(reward.id)}
                        disabled={redeemingReward === reward.id || loyaltyData.points < reward.pointsCost}
                        className="mt-1"
                      >
                        {redeemingReward === reward.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                        ) : (
                          "Redeem"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-center py-2 text-muted-foreground">No rewards available for your tier yet.</p>
            )}

            {userRewards && userRewards.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Your Redeemed Rewards:</h4>
                {userRewards.map((userReward: any) => (
                  <div key={userReward.id} className="p-3 border rounded-md mb-2 bg-muted/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium">{userReward.rewardName}</h5>
                        <span className="block text-xs text-muted-foreground">
                          Redeemed on {formatDate(userReward.redeemedAt)}
                        </span>
                      </div>
                      <div className="bg-primary/10 p-2 rounded font-mono text-xs">
                        {userReward.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Separator className="my-4" />

        <div>
          <h4 className="text-sm font-semibold mb-2">Recent Activity:</h4>
          {isLoadingActivities ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-2">
              {activities.slice(0, 5).map((activity: any) => {
                const ActivityIcon = getActivityIcon(activity.action);
                return (
                  <div key={activity.id} className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <ActivityIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">{activity.description || capitalizeFirstLetter(activity.action.replace('_', ' '))}</p>
                        <span className="text-primary font-medium text-sm">+{activity.points}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-center py-2 text-muted-foreground">No activity yet. Start ordering to earn points!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Importing this icon separately because it wasn't included above
import { Users, ShoppingBag } from "lucide-react";