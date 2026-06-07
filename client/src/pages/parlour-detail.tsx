import * as React from "react";
import { useParams, Link, useLocation } from "wouter";
import { PageShell, SectionHeader } from "@/components/shell";
import { useParlour } from "@/hooks/use-parlours";
import { useGallery } from "@/hooks/use-gallery";
import { useReviews, useCreateReview, useDeleteReview } from "@/hooks/use-reviews";
import { useCurrentUser } from "@/hooks/use-auth";
import { useToggleFavorite, useFavorites } from "@/hooks/use-favorites";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Star, CalendarDays, Users, Images, ArrowLeft, Phone, Mail, Heart, Trash2, Send } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";

function ratingNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatDate(d: any) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(d));
  } catch {
    return String(d ?? "");
  }
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = React.useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
          data-testid={`star-${n}`}
        >
          <Star
            className={`h-6 w-6 ${(hovered || value) >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ParlourDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useParlour(id);
  const parlour = data as any;

  const { data: gallery } = useGallery(Number(parlour?.id ?? id));
  const { data: reviews, isLoading: reviewsLoading } = useReviews(id);
  const createReview = useCreateReview();
  const deleteReview = useDeleteReview();
  const { data: me } = useCurrentUser();
  const toggleFav = useToggleFavorite();
  const { data: favs } = useFavorites();

  const isFavorited = React.useMemo(() => {
    if (!favs || !Array.isArray(favs)) return false;
    return (favs as any[]).some((f) => f.parlourId === id);
  }, [favs, id]);

  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const alreadyReviewed = React.useMemo(() => {
    if (!me || !reviews) return false;
    return (reviews as any[]).some((r: any) => r.userId === me.id);
  }, [me, reviews]);

  const cover = (parlour?.imageUrl as string | null | undefined) || "";

  const handleToggleFavorite = async () => {
    if (!me) {
      toast({ title: "Sign in required", description: "Please sign in to save favourites.", variant: "destructive" });
      return;
    }
    try {
      const result = await toggleFav.mutateAsync(id);
      toast({ title: result.favorited ? "Added to favourites" : "Removed from favourites" });
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  const handleSubmitReview = async () => {
    if (!me) {
      toast({ title: "Sign in required", description: "Please sign in to leave a review.", variant: "destructive" });
      return;
    }
    if (rating < 1) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await createReview.mutateAsync({ parlourId: id, rating, comment: comment || undefined });
      toast({ title: "Review posted!", description: "Thank you for your feedback." });
      setComment("");
      setRating(5);
    } catch (e) {
      toast({ title: "Failed to post review", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    try {
      await deleteReview.mutateAsync({ id: reviewId, parlourId: id });
      toast({ title: "Review deleted" });
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <PageShell>
      <SectionHeader
        title={parlour?.name ?? "Parlour"}
        subtitle={parlour?.description ?? "Discover services, choose an artist, and book your slot."}
        right={
          <>
            <Link
              href={parlour?.city?.id ? `/cities/${parlour.city.id}/parlours` : "/"}
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border px-3 py-2 bg-card/60 hover:bg-card"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={toggleFav.isPending}
              data-testid="button-favorite"
              className={isFavorited ? "text-rose-500 hover:text-rose-600" : "text-muted-foreground hover:text-rose-400"}
            >
              <Heart className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`} />
            </Button>
            <Button onClick={() => setLocation(`/book/parlour/${id}`)}>
              <CalendarDays className="h-4 w-4 mr-2" />
              Book now
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Skeleton className="h-56 rounded-xl" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-60 rounded-xl" />
          </div>
        </div>
      ) : error ? (
        <div className="mt-6">
          <EmptyState
            icon={MapPin}
            title="Couldn't load parlour"
            description={(error as Error).message}
            actionLabel="Try again"
            onAction={() => refetch()}
          />
        </div>
      ) : !parlour ? (
        <div className="mt-6">
          <EmptyState icon={MapPin} title="Not found" description="This parlour doesn't exist." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-float-in">
          <div className="lg:col-span-8 space-y-6">
            <Card className="glass noise-overlay overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  {cover ? (
                    <>
                      <img
                        src={cover}
                        alt={`${parlour.name} cover`}
                        className="h-56 md:h-72 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                    </>
                  ) : (
                    <div className="h-56 md:h-72 w-full bg-gradient-to-br from-primary/18 via-card to-accent/14" />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3.5 w-3.5" />
                        {ratingNumber(parlour.rating).toFixed(1)}
                        <span className="text-muted-foreground ml-1">({parlour.totalReviews ?? 0})</span>
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {parlour.city?.name ?? "City"}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {(parlour.staff?.length ?? 0)} artists
                      </Badge>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {parlour.address}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass noise-overlay p-5 md:p-6">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-xl md:text-2xl">Services</h2>
                  <p className="text-sm text-muted-foreground">Pick a service to start booking.</p>
                </div>
                <Button variant="secondary" onClick={() => setLocation(`/book/parlour/${id}`)}>
                  Start booking
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(parlour.services ?? []).map((s: any) => (
                  <div key={s.id} className="rounded-xl border bg-card/60 p-4 shadow-soft">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {s.category} • {s.duration} mins
                        </div>
                      </div>
                      <div className="text-sm font-bold tabular-nums">₹{Number(s.price ?? 0).toFixed(0)}</div>
                    </div>
                    {s.description ? (
                      <div className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{s.description}</div>
                    ) : null}
                  </div>
                ))}
                {(parlour.services?.length ?? 0) === 0 ? (
                  <div className="sm:col-span-2">
                    <EmptyState
                      icon={CalendarDays}
                      title="No services published yet"
                      description="Owners can add services from the Owner Dashboard."
                      actionLabel="Owner dashboard"
                      onAction={() => setLocation("/owner")}
                    />
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="glass noise-overlay p-5 md:p-6">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-xl md:text-2xl">Artists</h2>
                  <p className="text-sm text-muted-foreground">Choose who you want for your appointment.</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(parlour.staff ?? []).map((m: any) => (
                  <Link
                    key={m.id}
                    href={`/staff/${m.id}`}
                    className="rounded-xl border bg-card/60 p-4 shadow-soft hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl border bg-gradient-to-br from-primary/12 to-accent/10 overflow-hidden">
                        {m.profileImage ? (
                          <img src={m.profileImage} alt={m.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{m.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {m.specialization} • {m.experience} yrs
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3.5 w-3.5" />
                        {ratingNumber(m.rating).toFixed(1)}
                      </Badge>
                    </div>
                  </Link>
                ))}
                {(parlour.staff?.length ?? 0) === 0 ? (
                  <div className="sm:col-span-2">
                    <EmptyState
                      icon={Users}
                      title="No staff profiles yet"
                      description="Owners can add staff from the Owner Dashboard."
                      actionLabel="Owner dashboard"
                      onAction={() => setLocation("/owner")}
                    />
                  </div>
                ) : null}
              </div>
            </Card>

            {/* Reviews Section */}
            <Card className="glass noise-overlay p-5 md:p-6">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl inline-flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Reviews
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {(reviews as any[])?.length ?? 0} review{(reviews as any[])?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Write a review */}
              {me && !alreadyReviewed ? (
                <div className="mb-5 rounded-xl border bg-card/60 p-4">
                  <div className="text-sm font-semibold mb-3">Write a review</div>
                  <div className="mb-3">
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <Textarea
                    placeholder="Share your experience (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="resize-none mb-3"
                    rows={3}
                    data-testid="input-review-comment"
                  />
                  <Button onClick={handleSubmitReview} disabled={submitting || createReview.isPending} data-testid="button-submit-review">
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? "Posting..." : "Post review"}
                  </Button>
                </div>
              ) : me && alreadyReviewed ? (
                <div className="mb-5 rounded-xl border bg-card/60 p-3 text-sm text-muted-foreground">
                  You've already reviewed this parlour.
                </div>
              ) : (
                <div className="mb-5 rounded-xl border bg-card/60 p-3 text-sm text-muted-foreground">
                  <Link href="/login" className="font-semibold text-foreground hover:underline">Sign in</Link> to leave a review.
                </div>
              )}

              {reviewsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
              ) : !reviews || (reviews as any[]).length === 0 ? (
                <div className="text-sm text-muted-foreground">No reviews yet. Be the first!</div>
              ) : (
                <div className="space-y-3">
                  {(reviews as any[]).map((r: any) => (
                    <div key={r.id} className="rounded-xl border bg-card/60 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm">{r.user?.name ?? "User"}</span>
                            <span className="flex items-center gap-0.5 text-yellow-500">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-current" />
                              ))}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                          </div>
                          {r.comment ? (
                            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                          ) : null}
                        </div>
                        {me && (me.id === r.userId || me.role === "admin") ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0"
                            onClick={() => handleDeleteReview(r.id)}
                            disabled={deleteReview.isPending}
                            data-testid={`button-delete-review-${r.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="glass noise-overlay p-5 md:p-6">
              <h3 className="text-lg">Contact</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{parlour.address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{parlour.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{parlour.email}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2">
                <Button onClick={() => setLocation(`/book/parlour/${id}`)}>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Book appointment
                </Button>
                <Button
                  variant={isFavorited ? "secondary" : "outline"}
                  onClick={handleToggleFavorite}
                  disabled={toggleFav.isPending}
                  data-testid="button-favorite-sidebar"
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-rose-500 text-rose-500" : ""}`} />
                  {isFavorited ? "Saved to favourites" : "Save to favourites"}
                </Button>
                <Link
                  href="/bookings"
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 bg-card/60 hover:bg-card font-semibold"
                >
                  View booking history
                </Link>
              </div>
            </Card>

            <Card className="glass noise-overlay p-5 md:p-6">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-lg inline-flex items-center gap-2">
                    <Images className="h-4 w-4" />
                    Gallery
                  </h3>
                  <div className="text-xs text-muted-foreground mt-1">Looks, finishes, transformations.</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(gallery ?? parlour.galleryImages ?? []).slice(0, 6).map((g: any) => (
                  <div key={g.id ?? g.imageUrl} className="relative rounded-lg border overflow-hidden bg-muted/30">
                    {g.imageUrl ? (
                      <img src={g.imageUrl} alt={g.caption ?? "Gallery"} className="h-24 w-full object-cover" />
                    ) : (
                      <div className="h-24 w-full bg-gradient-to-br from-primary/14 to-accent/10" />
                    )}
                  </div>
                ))}
                {(gallery ?? parlour.galleryImages ?? []).length === 0 ? (
                  <div className="col-span-2 text-sm text-muted-foreground">
                    Gallery is empty. Owners can add images from the dashboard.
                  </div>
                ) : null}
              </div>

              <div className="mt-4">
                <Link
                  href="/owner"
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 bg-card/60 hover:bg-card font-semibold w-full"
                >
                  Owner: Manage gallery
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}
