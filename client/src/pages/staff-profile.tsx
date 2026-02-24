import * as React from "react";
import { useParams, Link } from "wouter";
import { PageShell, SectionHeader } from "@/components/shell";
import { useStaff } from "@/hooks/use-staff";
import { usePosts, useLikePost } from "@/hooks/use-posts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Star, ArrowLeft, Heart, Briefcase, MapPin, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function ratingNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function StaffProfilePage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useStaff(id);
  const staff = data as any;

  const { data: postsData } = usePosts({ staffId: id });
  const posts = (postsData ?? staff?.posts ?? []) as any[];

  const like = useLikePost();

  return (
    <PageShell>
      <SectionHeader
        title={staff?.name ?? "Staff profile"}
        subtitle="Professional profile and posts. Full staff workflow lands in the next phase."
        right={
          <Link
            href={staff?.parlourId ? `/parlours/${staff.parlourId}` : "/"}
            className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border px-3 py-2 bg-card/60 hover:bg-card"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="h-56 rounded-xl lg:col-span-5" />
          <Skeleton className="h-56 rounded-xl lg:col-span-7" />
        </div>
      ) : error ? (
        <div className="mt-6">
          <EmptyState
            icon={Briefcase}
            title="Couldn’t load profile"
            description={(error as Error).message}
            actionLabel="Try again"
            onAction={() => refetch()}
          />
        </div>
      ) : !staff ? (
        <div className="mt-6">
          <EmptyState icon={Briefcase} title="Not found" description="This profile doesn’t exist." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-float-in">
          <div className="lg:col-span-5 space-y-6">
            <Card className="glass noise-overlay p-6 md:p-7">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl border bg-gradient-to-br from-primary/12 to-accent/10 overflow-hidden">
                  {staff.profileImage ? (
                    <img src={staff.profileImage} alt={staff.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold">{staff.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{staff.specialization}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3.5 w-3.5" />
                      {ratingNumber(staff.rating).toFixed(1)}
                    </Badge>
                    <Badge variant="outline">{staff.experience} yrs</Badge>
                    <Badge variant={staff.isAvailableForHire ? "secondary" : "outline"}>
                      {staff.isAvailableForHire ? "Available for hire" : "Not hiring"}
                    </Badge>
                  </div>
                </div>
              </div>

              {staff.bio ? (
                <div className="mt-5 text-sm text-muted-foreground leading-relaxed">{staff.bio}</div>
              ) : (
                <div className="mt-5 text-sm text-muted-foreground leading-relaxed">
                  No bio yet. Owners can edit this profile from the dashboard.
                </div>
              )}

              <div className="mt-6 rounded-xl border bg-muted/40 p-4">
                <div className="text-sm font-semibold inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Parlour
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Linked parlour details appear fully once backend returns StaffWithDetails.
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="glass noise-overlay p-6 md:p-7">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-xl md:text-2xl inline-flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Portfolio posts
                  </h2>
                  <p className="text-sm text-muted-foreground">Professional posts and videos for clients.</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((p) => (
                  <div key={p.id} className="rounded-xl border bg-card/60 p-4 shadow-soft">
                    <div className="font-semibold line-clamp-1">{p.title}</div>
                    {p.description ? (
                      <div className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</div>
                    ) : null}

                    <div className="mt-3 rounded-lg border bg-muted/30 overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.title} className="h-32 w-full object-cover" />
                      ) : p.videoUrl ? (
                        <div className="h-32 w-full grid place-items-center text-sm text-muted-foreground">
                          Video URL provided (player in next phase)
                        </div>
                      ) : (
                        <div className="h-32 w-full bg-gradient-to-br from-primary/12 to-accent/10" />
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="tabular-nums">
                        {p.likes ?? 0} likes
                      </Badge>
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          try {
                            await like.mutateAsync(Number(p.id));
                            toast({ title: "Liked", description: "Thanks for the love." });
                          } catch (e) {
                            toast({ title: "Couldn’t like", description: (e as Error).message, variant: "destructive" });
                          }
                        }}
                        disabled={like.isPending}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Like
                      </Button>
                    </div>
                  </div>
                ))}

                {posts.length === 0 ? (
                  <div className="md:col-span-2">
                    <EmptyState
                      icon={Video}
                      title="No posts yet"
                      description="This staff member hasn’t posted any professional content yet."
                    />
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}
