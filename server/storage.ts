import { db } from "./db";
import {
  cities,
  parlours,
  services,
  staff,
  bookings,
  galleryImages,
  beautyPosts,
  users,
  reviews,
  favorites,
  type City,
  type Parlour,
  type Service,
  type Staff,
  type Booking,
  type GalleryImage,
  type BeautyPost,
  type User,
  type Review,
  type Favorite,
  type CreateParlourRequest,
  type UpdateParlourRequest,
  type CreateServiceRequest,
  type UpdateServiceRequest,
  type CreateStaffRequest,
  type UpdateStaffRequest,
  type CreateBookingRequest,
  type UpdateBookingRequest,
  type CreateGalleryImageRequest,
  type CreateBeautyPostRequest,
  type CreateReviewRequest,
  type UpdateUserRequest,
  type ParlourWithDetails,
  type BookingWithDetails,
  type StaffWithDetails,
  type ReviewWithUser,
  type FavoriteWithParlour,
  type ParloursQueryParams,
  type StaffQueryParams,
  type OwnerLoginRequest,
  type OwnerLoginResponse,
  type UserPublic,
} from "@shared/schema";
import { eq, and, gte, lte, desc, asc, sql, ne } from "drizzle-orm";

export interface IStorage {
  // Cities
  getCities(): Promise<City[]>;
  getCity(id: number): Promise<City | undefined>;

  // Parlours
  getParlours(params?: ParloursQueryParams): Promise<Parlour[]>;
  getParlour(id: number): Promise<ParlourWithDetails | undefined>;
  getParlourByOwnerCode(ownerCode: string): Promise<Parlour | undefined>;
  createParlour(parlour: CreateParlourRequest): Promise<Parlour>;
  updateParlour(id: number, updates: UpdateParlourRequest): Promise<Parlour>;

  // Services
  getServices(parlourId?: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: CreateServiceRequest): Promise<Service>;
  updateService(id: number, updates: UpdateServiceRequest): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Staff
  getStaff(params?: StaffQueryParams): Promise<Staff[]>;
  getStaffMember(id: number): Promise<StaffWithDetails | undefined>;
  createStaff(staffMember: CreateStaffRequest): Promise<Staff>;
  updateStaff(id: number, updates: UpdateStaffRequest): Promise<Staff>;
  deleteStaff(id: number): Promise<void>;

  // Bookings
  getBookings(parlourId?: number, customerEmail?: string, status?: string): Promise<BookingWithDetails[]>;
  getBooking(id: number): Promise<BookingWithDetails | undefined>;
  createBooking(booking: CreateBookingRequest): Promise<Booking>;
  updateBooking(id: number, updates: UpdateBookingRequest): Promise<Booking>;
  deleteBooking(id: number): Promise<void>;

  // Gallery
  getGalleryImages(parlourId: number): Promise<GalleryImage[]>;
  createGalleryImage(image: CreateGalleryImageRequest): Promise<GalleryImage>;
  deleteGalleryImage(id: number): Promise<void>;

  // Beauty Posts
  getBeautyPosts(staffId?: number): Promise<BeautyPost[]>;
  createBeautyPost(post: CreateBeautyPostRequest): Promise<BeautyPost>;
  deleteBeautyPost(id: number): Promise<void>;
  likeBeautyPost(id: number): Promise<BeautyPost>;

  // Users (Phase 2)
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(email: string, passwordHash: string, name: string, phone?: string, role?: string, parlourId?: number): Promise<User>;
  updateUser(id: number, updates: UpdateUserRequest): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<UserPublic[]>;

  // Reviews (Phase 2)
  getReviews(parlourId: number): Promise<ReviewWithUser[]>;
  getReviewByUserAndParlour(userId: number, parlourId: number): Promise<Review | undefined>;
  createReview(review: CreateReviewRequest): Promise<Review>;
  deleteReview(id: number): Promise<void>;

  // Favorites (Phase 2)
  getFavorites(userId: number): Promise<FavoriteWithParlour[]>;
  getFavorite(userId: number, parlourId: number): Promise<Favorite | undefined>;
  addFavorite(userId: number, parlourId: number): Promise<Favorite>;
  removeFavorite(userId: number, parlourId: number): Promise<void>;

  // Admin (Phase 2)
  getAdminStats(): Promise<{
    totalUsers: number;
    totalParlours: number;
    totalBookings: number;
    totalReviews: number;
    bookingsByStatus: Record<string, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Cities
  async getCities(): Promise<City[]> {
    return await db.select().from(cities).orderBy(asc(cities.name));
  }

  async getCity(id: number): Promise<City | undefined> {
    const result = await db.select().from(cities).where(eq(cities.id, id));
    return result[0];
  }

  // Parlours
  async getParlours(params?: ParloursQueryParams): Promise<Parlour[]> {
    let query = db.select().from(parlours).$dynamic();

    if (params?.cityId) {
      query = query.where(eq(parlours.cityId, params.cityId));
    }

    if (params?.minRating) {
      query = query.where(gte(sql`CAST(${parlours.rating} AS DECIMAL)`, params.minRating));
    }

    if (params?.sortBy === 'rating') {
      query = query.orderBy(desc(parlours.rating));
    } else if (params?.sortBy === 'reviews') {
      query = query.orderBy(desc(parlours.totalReviews));
    } else {
      query = query.orderBy(asc(parlours.name));
    }

    return await query;
  }

  async getParlour(id: number): Promise<ParlourWithDetails | undefined> {
    const parlour = await db.query.parlours.findFirst({
      where: eq(parlours.id, id),
      with: {
        city: true,
        services: true,
        staff: true,
        galleryImages: true,
      },
    });

    return parlour as ParlourWithDetails | undefined;
  }

  async getParlourByOwnerCode(ownerCode: string): Promise<Parlour | undefined> {
    const result = await db.select().from(parlours).where(eq(parlours.ownerCode, ownerCode));
    return result[0];
  }

  async createParlour(parlour: CreateParlourRequest): Promise<Parlour> {
    const [created] = await db.insert(parlours).values(parlour).returning();
    return created;
  }

  async updateParlour(id: number, updates: UpdateParlourRequest): Promise<Parlour> {
    const [updated] = await db.update(parlours)
      .set(updates)
      .where(eq(parlours.id, id))
      .returning();
    return updated;
  }

  // Services
  async getServices(parlourId?: number): Promise<Service[]> {
    if (parlourId) {
      return await db.select().from(services).where(eq(services.parlourId, parlourId));
    }
    return await db.select().from(services);
  }

  async getService(id: number): Promise<Service | undefined> {
    const result = await db.select().from(services).where(eq(services.id, id));
    return result[0];
  }

  async createService(service: CreateServiceRequest): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }

  async updateService(id: number, updates: UpdateServiceRequest): Promise<Service> {
    const [updated] = await db.update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Staff
  async getStaff(params?: StaffQueryParams): Promise<Staff[]> {
    let query = db.select().from(staff).$dynamic();

    if (params?.parlourId) {
      query = query.where(eq(staff.parlourId, params.parlourId));
    }

    if (params?.specialization) {
      query = query.where(eq(staff.specialization, params.specialization));
    }

    if (params?.availableForHire !== undefined) {
      query = query.where(eq(staff.isAvailableForHire, params.availableForHire));
    }

    return await query.orderBy(desc(staff.rating));
  }

  async getStaffMember(id: number): Promise<StaffWithDetails | undefined> {
    const staffMember = await db.query.staff.findFirst({
      where: eq(staff.id, id),
      with: {
        parlour: true,
        posts: true,
      },
    });

    return staffMember as StaffWithDetails | undefined;
  }

  async createStaff(staffMember: CreateStaffRequest): Promise<Staff> {
    const [created] = await db.insert(staff).values(staffMember).returning();
    return created;
  }

  async updateStaff(id: number, updates: UpdateStaffRequest): Promise<Staff> {
    const [updated] = await db.update(staff)
      .set(updates)
      .where(eq(staff.id, id))
      .returning();
    return updated;
  }

  async deleteStaff(id: number): Promise<void> {
    await db.delete(staff).where(eq(staff.id, id));
  }

  // Bookings
  async getBookings(parlourId?: number, customerEmail?: string, status?: string): Promise<BookingWithDetails[]> {
    const conditions = [];

    if (parlourId) {
      conditions.push(eq(bookings.parlourId, parlourId));
    }

    if (customerEmail) {
      conditions.push(eq(bookings.customerEmail, customerEmail));
    }

    if (status) {
      conditions.push(eq(bookings.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db.query.bookings.findMany({
      where: whereClause,
      with: {
        parlour: true,
        service: true,
        staff: true,
      },
      orderBy: desc(bookings.bookingDate),
    });

    return result as BookingWithDetails[];
  }

  async getBooking(id: number): Promise<BookingWithDetails | undefined> {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, id),
      with: {
        parlour: true,
        service: true,
        staff: true,
      },
    });

    return booking as BookingWithDetails | undefined;
  }

  async createBooking(booking: CreateBookingRequest): Promise<Booking> {
    const [created] = await db.insert(bookings).values(booking).returning();
    return created;
  }

  async updateBooking(id: number, updates: UpdateBookingRequest): Promise<Booking> {
    const [updated] = await db.update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async deleteBooking(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  // Gallery
  async getGalleryImages(parlourId: number): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages)
      .where(eq(galleryImages.parlourId, parlourId))
      .orderBy(desc(galleryImages.createdAt));
  }

  async createGalleryImage(image: CreateGalleryImageRequest): Promise<GalleryImage> {
    const [created] = await db.insert(galleryImages).values(image).returning();
    return created;
  }

  async deleteGalleryImage(id: number): Promise<void> {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  }

  // Beauty Posts
  async getBeautyPosts(staffId?: number): Promise<BeautyPost[]> {
    if (staffId) {
      return await db.select().from(beautyPosts)
        .where(eq(beautyPosts.staffId, staffId))
        .orderBy(desc(beautyPosts.createdAt));
    }
    return await db.select().from(beautyPosts).orderBy(desc(beautyPosts.createdAt));
  }

  async createBeautyPost(post: CreateBeautyPostRequest): Promise<BeautyPost> {
    const [created] = await db.insert(beautyPosts).values(post).returning();
    return created;
  }

  async deleteBeautyPost(id: number): Promise<void> {
    await db.delete(beautyPosts).where(eq(beautyPosts.id, id));
  }

  async likeBeautyPost(id: number): Promise<BeautyPost> {
    const [updated] = await db.update(beautyPosts)
      .set({ likes: sql`${beautyPosts.likes} + 1` })
      .where(eq(beautyPosts.id, id))
      .returning();
    return updated;
  }

  // Users (Phase 2)
  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUserById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async createUser(email: string, passwordHash: string, name: string, phone?: string, role?: string, parlourId?: number): Promise<User> {
    const [created] = await db.insert(users).values({
      email,
      passwordHash,
      name,
      phone: phone ?? null,
      role: role ?? "user",
      parlourId: parlourId ?? null,
    }).returning();
    return created;
  }

  async updateUser(id: number, updates: UpdateUserRequest): Promise<User> {
    const [updated] = await db.update(users)
      .set(updates as any)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<UserPublic[]> {
    const result = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      role: users.role,
      parlourId: users.parlourId,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));
    return result as UserPublic[];
  }

  // Reviews (Phase 2)
  async getReviews(parlourId: number): Promise<ReviewWithUser[]> {
    const result = await db.query.reviews.findMany({
      where: eq(reviews.parlourId, parlourId),
      with: {
        user: {
          columns: { id: true, name: true },
        },
      },
      orderBy: desc(reviews.createdAt),
    });
    return result as ReviewWithUser[];
  }

  async getReviewByUserAndParlour(userId: number, parlourId: number): Promise<Review | undefined> {
    const result = await db.select().from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.parlourId, parlourId)));
    return result[0];
  }

  async createReview(review: CreateReviewRequest): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();

    // Recompute parlour rating from all reviews
    const allReviews = await db.select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.parlourId, review.parlourId));

    const total = allReviews.length;
    const avg = total > 0
      ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(2)
      : "0.00";

    await db.update(parlours)
      .set({ rating: avg, totalReviews: total })
      .where(eq(parlours.id, review.parlourId));

    return created;
  }

  async deleteReview(id: number): Promise<void> {
    const [rev] = await db.select().from(reviews).where(eq(reviews.id, id));
    await db.delete(reviews).where(eq(reviews.id, id));

    if (rev) {
      const allReviews = await db.select({ rating: reviews.rating })
        .from(reviews)
        .where(eq(reviews.parlourId, rev.parlourId));
      const total = allReviews.length;
      const avg = total > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(2)
        : "0.00";
      await db.update(parlours)
        .set({ rating: avg, totalReviews: total })
        .where(eq(parlours.id, rev.parlourId));
    }
  }

  // Favorites (Phase 2)
  async getFavorites(userId: number): Promise<FavoriteWithParlour[]> {
    const result = await db.query.favorites.findMany({
      where: eq(favorites.userId, userId),
      with: { parlour: true },
      orderBy: desc(favorites.createdAt),
    });
    return result as FavoriteWithParlour[];
  }

  async getFavorite(userId: number, parlourId: number): Promise<Favorite | undefined> {
    const result = await db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.parlourId, parlourId)));
    return result[0];
  }

  async addFavorite(userId: number, parlourId: number): Promise<Favorite> {
    const [created] = await db.insert(favorites).values({ userId, parlourId }).returning();
    return created;
  }

  async removeFavorite(userId: number, parlourId: number): Promise<void> {
    await db.delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.parlourId, parlourId)));
  }

  // Admin stats (Phase 2)
  async getAdminStats() {
    const [userCount] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [parlourCount] = await db.select({ count: sql<number>`count(*)::int` }).from(parlours);
    const [bookingCount] = await db.select({ count: sql<number>`count(*)::int` }).from(bookings);
    const [reviewCount] = await db.select({ count: sql<number>`count(*)::int` }).from(reviews);

    const statusRows = await db.select({
      status: bookings.status,
      count: sql<number>`count(*)::int`,
    }).from(bookings).groupBy(bookings.status);

    const bookingsByStatus: Record<string, number> = {};
    for (const row of statusRows) {
      bookingsByStatus[row.status] = row.count;
    }

    return {
      totalUsers: userCount.count,
      totalParlours: parlourCount.count,
      totalBookings: bookingCount.count,
      totalReviews: reviewCount.count,
      bookingsByStatus,
    };
  }
}

export const storage = new DatabaseStorage();
