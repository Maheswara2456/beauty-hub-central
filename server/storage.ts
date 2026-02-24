import { db } from "./db";
import {
  cities,
  parlours,
  services,
  staff,
  bookings,
  galleryImages,
  beautyPosts,
  type City,
  type Parlour,
  type Service,
  type Staff,
  type Booking,
  type GalleryImage,
  type BeautyPost,
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
  type ParlourWithDetails,
  type BookingWithDetails,
  type StaffWithDetails,
  type ParloursQueryParams,
  type StaffQueryParams,
  type OwnerLoginRequest,
  type OwnerLoginResponse,
} from "@shared/schema";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();
