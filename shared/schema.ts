import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, serial, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  state: text("state").notNull(),
});

export const parlours = pgTable("parlours", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  cityId: integer("city_id").notNull().references(() => cities.id),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  description: text("description").notNull(),
  ownerCode: text("owner_code").notNull().unique(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: integer("total_reviews").default(0),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  parlourId: integer("parlour_id").notNull().references(() => parlours.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  category: text("category").notNull(),
});

export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  parlourId: integer("parlour_id").references(() => parlours.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  specialization: text("specialization").notNull(),
  experience: integer("experience").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: integer("total_reviews").default(0),
  isAvailableForHire: boolean("is_available_for_hire").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  parlourId: integer("parlour_id").notNull().references(() => parlours.id, { onDelete: "cascade" }),
  serviceId: integer("service_id").notNull().references(() => services.id),
  staffId: integer("staff_id").notNull().references(() => staff.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  bookingDate: timestamp("booking_date").notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  parlourId: integer("parlour_id").notNull().references(() => parlours.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const beautyPosts = pgTable("beauty_posts", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").references(() => staff.id, { onDelete: "cascade" }),
  customerName: text("customer_name"),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  imageUrl: text("image_url"),
  tags: text("tags").array(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// === PHASE 2 TABLES ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("user"),
  parlourId: integer("parlour_id").references(() => parlours.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  parlourId: integer("parlour_id").notNull().references(() => parlours.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  parlourId: integer("parlour_id").notNull().references(() => parlours.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const citiesRelations = relations(cities, ({ many }) => ({
  parlours: many(parlours),
}));

export const parloursRelations = relations(parlours, ({ one, many }) => ({
  city: one(cities, {
    fields: [parlours.cityId],
    references: [cities.id],
  }),
  services: many(services),
  staff: many(staff),
  bookings: many(bookings),
  galleryImages: many(galleryImages),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  parlour: one(parlours, {
    fields: [services.parlourId],
    references: [parlours.id],
  }),
  bookings: many(bookings),
}));

export const staffRelations = relations(staff, ({ one, many }) => ({
  parlour: one(parlours, {
    fields: [staff.parlourId],
    references: [parlours.id],
  }),
  bookings: many(bookings),
  posts: many(beautyPosts),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  parlour: one(parlours, {
    fields: [bookings.parlourId],
    references: [parlours.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  staff: one(staff, {
    fields: [bookings.staffId],
    references: [staff.id],
  }),
}));

export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  parlour: one(parlours, {
    fields: [galleryImages.parlourId],
    references: [parlours.id],
  }),
}));

export const beautyPostsRelations = relations(beautyPosts, ({ one }) => ({
  staff: one(staff, {
    fields: [beautyPosts.staffId],
    references: [staff.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  parlour: one(parlours, {
    fields: [users.parlourId],
    references: [parlours.id],
  }),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  parlour: one(parlours, {
    fields: [reviews.parlourId],
    references: [parlours.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  parlour: one(parlours, {
    fields: [favorites.parlourId],
    references: [parlours.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertCitySchema = createInsertSchema(cities).omit({ id: true });
export const insertParlourSchema = createInsertSchema(parlours).omit({ id: true, createdAt: true, rating: true, totalReviews: true });
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertStaffSchema = createInsertSchema(staff).omit({ id: true, createdAt: true, rating: true, totalReviews: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({ id: true, createdAt: true });
export const insertBeautyPostSchema = createInsertSchema(beautyPosts).omit({ id: true, createdAt: true, likes: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

// Base types
export type City = typeof cities.$inferSelect;
export type Parlour = typeof parlours.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type BeautyPost = typeof beautyPosts.$inferSelect;
export type User = typeof users.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;

// Insert types
export type InsertCity = z.infer<typeof insertCitySchema>;
export type InsertParlour = z.infer<typeof insertParlourSchema>;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type InsertBeautyPost = z.infer<typeof insertBeautyPostSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

// Request types
export type CreateParlourRequest = InsertParlour;
export type UpdateParlourRequest = Partial<InsertParlour>;
export type CreateServiceRequest = InsertService;
export type UpdateServiceRequest = Partial<InsertService>;
export type CreateStaffRequest = InsertStaff;
export type UpdateStaffRequest = Partial<InsertStaff>;
export type CreateBookingRequest = InsertBooking;
export type UpdateBookingRequest = Partial<InsertBooking>;
export type CreateGalleryImageRequest = InsertGalleryImage;
export type CreateBeautyPostRequest = InsertBeautyPost;
export type CreateUserRequest = { email: string; password: string; name: string; phone?: string; role?: string; parlourId?: number };
export type CreateReviewRequest = InsertReview;
export type UpdateUserRequest = Partial<{ name: string; phone: string; role: string; parlourId: number | null }>;

// Response types with related data
export interface ParlourWithDetails extends Parlour {
  city: City;
  services: Service[];
  staff: Staff[];
  galleryImages: GalleryImage[];
}

export interface BookingWithDetails extends Booking {
  parlour: Parlour;
  service: Service;
  staff: Staff;
}

export interface StaffWithDetails extends Staff {
  parlour?: Parlour | null;
  posts: BeautyPost[];
}

export interface ReviewWithUser extends Review {
  user: Pick<User, "id" | "name">;
}

export interface FavoriteWithParlour extends Favorite {
  parlour: Parlour;
}

// Response types
export type CityResponse = City;
export type ParlourResponse = Parlour;
export type ParlourDetailResponse = ParlourWithDetails;
export type ServiceResponse = Service;
export type StaffResponse = Staff;
export type StaffDetailResponse = StaffWithDetails;
export type BookingResponse = Booking;
export type BookingDetailResponse = BookingWithDetails;
export type GalleryImageResponse = GalleryImage;
export type BeautyPostResponse = BeautyPost;
export type UserPublic = Omit<User, "passwordHash">;

// Query/filter types
export interface ParloursQueryParams {
  cityId?: number;
  minRating?: number;
  maxPrice?: number;
  category?: string;
  sortBy?: "rating" | "reviews" | "name";
}

export interface StaffQueryParams {
  parlourId?: number;
  specialization?: string;
  availableForHire?: boolean;
}

// Owner login
export interface OwnerLoginRequest {
  ownerCode: string;
}

export interface OwnerLoginResponse {
  parlourId: number;
  parlourName: string;
  ownerCode: string;
}
