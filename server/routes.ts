import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { cities } from "@shared/schema";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.session?.userId || req.session?.userRole !== "admin") {
    return res.status(403).json({ message: "Forbidden. Admin access required." });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Cities
  app.get(api.cities.list.path, async (req, res) => {
    try {
      const cities = await storage.getCities();
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  app.get(api.cities.get.path, async (req, res) => {
    try {
      const city = await storage.getCity(Number(req.params.id));
      if (!city) {
        return res.status(404).json({ message: "City not found" });
      }
      res.json(city);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch city" });
    }
  });

  // Parlours
  app.get(api.parlours.list.path, async (req, res) => {
    try {
      const params = {
        cityId: req.query.cityId ? Number(req.query.cityId) : undefined,
        minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        category: req.query.category as string | undefined,
        sortBy: req.query.sortBy as "rating" | "reviews" | "name" | undefined,
      };
      const parlours = await storage.getParlours(params);
      res.json(parlours);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parlours" });
    }
  });

  app.get(api.parlours.get.path, async (req, res) => {
    try {
      const parlour = await storage.getParlour(Number(req.params.id));
      if (!parlour) {
        return res.status(404).json({ message: "Parlour not found" });
      }
      res.json(parlour);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch parlour" });
    }
  });

  app.post(api.parlours.create.path, async (req, res) => {
    try {
      const input = api.parlours.create.input.parse(req.body);
      const parlour = await storage.createParlour(input);
      res.status(201).json(parlour);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create parlour" });
    }
  });

  app.put(api.parlours.update.path, async (req, res) => {
    try {
      const input = api.parlours.update.input.parse(req.body);
      const parlour = await storage.updateParlour(Number(req.params.id), input);
      res.json(parlour);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update parlour" });
    }
  });

  // Services
  app.get(api.services.list.path, async (req, res) => {
    try {
      const parlourId = req.query.parlourId ? Number(req.query.parlourId) : undefined;
      const services = await storage.getServices(parlourId);
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get(api.services.get.path, async (req, res) => {
    try {
      const service = await storage.getService(Number(req.params.id));
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post(api.services.create.path, async (req, res) => {
    try {
      const bodySchema = api.services.create.input.extend({
        parlourId: z.coerce.number(),
        price: z.coerce.number(),
        duration: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const service = await storage.createService(input);
      res.status(201).json(service);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put(api.services.update.path, async (req, res) => {
    try {
      const bodySchema = api.services.update.input.extend({
        parlourId: z.coerce.number().optional(),
        price: z.coerce.number().optional(),
        duration: z.coerce.number().optional(),
      });
      const input = bodySchema.parse(req.body);
      const service = await storage.updateService(Number(req.params.id), input);
      res.json(service);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete(api.services.delete.path, async (req, res) => {
    try {
      await storage.deleteService(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Staff
  app.get(api.staff.list.path, async (req, res) => {
    try {
      const params = {
        parlourId: req.query.parlourId ? Number(req.query.parlourId) : undefined,
        specialization: req.query.specialization as string | undefined,
        availableForHire: req.query.availableForHire === 'true' ? true : req.query.availableForHire === 'false' ? false : undefined,
      };
      const staff = await storage.getStaff(params);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.get(api.staff.get.path, async (req, res) => {
    try {
      const staffMember = await storage.getStaffMember(Number(req.params.id));
      if (!staffMember) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staffMember);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff member" });
    }
  });

  app.post(api.staff.create.path, async (req, res) => {
    try {
      const bodySchema = api.staff.create.input.extend({
        parlourId: z.coerce.number().optional(),
        experience: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const staffMember = await storage.createStaff(input);
      res.status(201).json(staffMember);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });

  app.put(api.staff.update.path, async (req, res) => {
    try {
      const bodySchema = api.staff.update.input.extend({
        parlourId: z.coerce.number().optional(),
        experience: z.coerce.number().optional(),
      });
      const input = bodySchema.parse(req.body);
      const staffMember = await storage.updateStaff(Number(req.params.id), input);
      res.json(staffMember);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update staff member" });
    }
  });

  app.delete(api.staff.delete.path, async (req, res) => {
    try {
      await storage.deleteStaff(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Bookings
  app.get(api.bookings.list.path, async (req, res) => {
    try {
      const parlourId = req.query.parlourId ? Number(req.query.parlourId) : undefined;
      const customerEmail = req.query.customerEmail as string | undefined;
      const status = req.query.status as string | undefined;
      const bookings = await storage.getBookings(parlourId, customerEmail, status);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get(api.bookings.get.path, async (req, res) => {
    try {
      const booking = await storage.getBooking(Number(req.params.id));
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const bodySchema = api.bookings.create.input.extend({
        parlourId: z.coerce.number(),
        serviceId: z.coerce.number(),
        staffId: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const booking = await storage.createBooking(input);
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put(api.bookings.update.path, async (req, res) => {
    try {
      const bodySchema = api.bookings.update.input.extend({
        parlourId: z.coerce.number().optional(),
        serviceId: z.coerce.number().optional(),
        staffId: z.coerce.number().optional(),
      });
      const input = bodySchema.parse(req.body);
      const booking = await storage.updateBooking(Number(req.params.id), input);
      res.json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.delete(api.bookings.delete.path, async (req, res) => {
    try {
      await storage.deleteBooking(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Cancel booking
  app.patch(api.bookings.cancel.path, async (req, res) => {
    try {
      const booking = await storage.getBooking(Number(req.params.id));
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.status === "cancelled") return res.status(400).json({ message: "Already cancelled" });
      if (booking.status === "completed") return res.status(400).json({ message: "Cannot cancel a completed booking" });
      const updated = await storage.updateBooking(Number(req.params.id), { status: "cancelled" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Reschedule booking
  app.patch(api.bookings.reschedule.path, async (req, res) => {
    try {
      const { bookingDate } = api.bookings.reschedule.input.parse(req.body);
      const booking = await storage.getBooking(Number(req.params.id));
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.status === "cancelled" || booking.status === "completed") {
        return res.status(400).json({ message: `Cannot reschedule a ${booking.status} booking` });
      }
      const newDate = new Date(bookingDate);
      if (isNaN(newDate.getTime())) return res.status(400).json({ message: "Invalid date" });
      const updated = await storage.updateBooking(Number(req.params.id), { bookingDate: newDate });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to reschedule booking" });
    }
  });

  // Gallery
  app.get(api.gallery.list.path, async (req, res) => {
    try {
      const parlourId = Number(req.query.parlourId);
      if (!parlourId) {
        return res.status(400).json({ message: "parlourId is required" });
      }
      const images = await storage.getGalleryImages(parlourId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.post(api.gallery.create.path, async (req, res) => {
    try {
      const bodySchema = api.gallery.create.input.extend({
        parlourId: z.coerce.number(),
      });
      const input = bodySchema.parse(req.body);
      const image = await storage.createGalleryImage(input);
      res.status(201).json(image);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create gallery image" });
    }
  });

  app.delete(api.gallery.delete.path, async (req, res) => {
    try {
      await storage.deleteGalleryImage(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Beauty Posts
  app.get(api.posts.list.path, async (req, res) => {
    try {
      const staffId = req.query.staffId ? Number(req.query.staffId) : undefined;
      const posts = await storage.getBeautyPosts(staffId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post(api.posts.create.path, async (req, res) => {
    try {
      const bodySchema = api.posts.create.input.extend({
        staffId: z.coerce.number().optional(),
      });
      const input = bodySchema.parse(req.body);
      const post = await storage.createBeautyPost(input);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.delete(api.posts.delete.path, async (req, res) => {
    try {
      await storage.deleteBeautyPost(Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.post(api.posts.like.path, async (req, res) => {
    try {
      const post = await storage.likeBeautyPost(Number(req.params.id));
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  // Owner Login
  app.post(api.owner.login.path, async (req, res) => {
    try {
      const input = api.owner.login.input.parse(req.body);
      const parlour = await storage.getParlourByOwnerCode(input.ownerCode);
      if (!parlour) {
        return res.status(401).json({ message: "Invalid owner code" });
      }
      res.json({
        parlourId: parlour.id,
        parlourName: parlour.name,
        ownerCode: parlour.ownerCode,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // ============================================================
  // AUTH ROUTES (Phase 2)
  // ============================================================

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
      const user = await storage.createUser(input.email, passwordHash, input.name, input.phone);
      req.session.userId = user.id;
      req.session.userRole = user.role;
      const { passwordHash: _ph, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to register" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const match = await bcrypt.compare(input.password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.session.userId = user.id;
      req.session.userRole = user.role;
      const { passwordHash: _ph, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Not authenticated" });
      }
      const { passwordHash: _ph, ...safeUser } = user;
      res.json(safeUser);
    } catch {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // ============================================================
  // REVIEWS ROUTES (Phase 2)
  // ============================================================

  app.get(api.reviews.list.path, async (req, res) => {
    try {
      const parlourId = Number(req.query.parlourId);
      if (!parlourId) return res.status(400).json({ message: "parlourId is required" });
      const reviewList = await storage.getReviews(parlourId);
      res.json(reviewList);
    } catch {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post(api.reviews.create.path, requireAuth, async (req, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const userId = req.session.userId!;
      const existing = await storage.getReviewByUserAndParlour(userId, input.parlourId);
      if (existing) {
        return res.status(400).json({ message: "You have already reviewed this parlour" });
      }
      const review = await storage.createReview({
        parlourId: input.parlourId,
        userId,
        rating: input.rating,
        comment: input.comment ?? null,
      });
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.delete(api.reviews.delete.path, requireAuth, async (req, res) => {
    try {
      await storage.deleteReview(Number(req.params.id));
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // ============================================================
  // FAVORITES ROUTES (Phase 2)
  // ============================================================

  app.get(api.favorites.list.path, requireAuth, async (req, res) => {
    try {
      const favs = await storage.getFavorites(req.session.userId!);
      res.json(favs);
    } catch {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post(api.favorites.toggle.path, requireAuth, async (req, res) => {
    try {
      const { parlourId } = api.favorites.toggle.input.parse(req.body);
      const userId = req.session.userId!;
      const existing = await storage.getFavorite(userId, parlourId);
      if (existing) {
        await storage.removeFavorite(userId, parlourId);
        res.json({ favorited: false });
      } else {
        await storage.addFavorite(userId, parlourId);
        res.json({ favorited: true });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  // ============================================================
  // ADMIN ROUTES (Phase 2)
  // ============================================================

  app.get(api.admin.stats.path, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get(api.admin.users.path, requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put(api.admin.updateUser.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.updateUser.input.parse(req.body);
      const updated = await storage.updateUser(Number(req.params.id), input as any);
      const { passwordHash: _ph, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete(api.admin.deleteUser.path, requireAdmin, async (req, res) => {
    try {
      await storage.deleteUser(Number(req.params.id));
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get(api.admin.parlours.path, requireAdmin, async (req, res) => {
    try {
      const parlours = await storage.getParlours();
      res.json(parlours);
    } catch {
      res.status(500).json({ message: "Failed to fetch parlours" });
    }
  });

  app.get(api.admin.bookings.path, requireAdmin, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  return httpServer;
}

// Seed database with demo data
export async function seedDatabase() {
  try {
    const existingCities = await storage.getCities();
    if (existingCities.length > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Seeding database...");

    const cityData = [
      { name: "Nellore", state: "Andhra Pradesh" },
      { name: "Hyderabad", state: "Telangana" },
      { name: "Tirupati", state: "Andhra Pradesh" },
      { name: "Vijayawada", state: "Andhra Pradesh" },
      { name: "Bengaluru", state: "Karnataka" },
      { name: "Chennai", state: "Tamil Nadu" },
    ];

    const createdCities = await db.insert(cities).values(cityData).returning();
    console.log(`Created ${createdCities.length} cities`);

    const parlourNames = [
      "Glamour Studio", "Beauty Haven", "Style Lounge", "Radiance Spa",
      "Elite Beauty", "Crown Beauty Palace", "Divine Touch"
    ];

    const serviceCategories = {
      "Hair": [
        { name: "Haircut & Styling", price: "500", duration: 45 },
        { name: "Hair Coloring", price: "2000", duration: 120 },
        { name: "Hair Spa Treatment", price: "1500", duration: 90 },
      ],
      "Skin": [
        { name: "Facial Treatment", price: "1200", duration: 60 },
        { name: "Deep Cleansing", price: "800", duration: 45 },
        { name: "Anti-Aging Treatment", price: "2500", duration: 90 },
      ],
      "Makeup": [
        { name: "Bridal Makeup", price: "5000", duration: 120 },
        { name: "Party Makeup", price: "2500", duration: 60 },
        { name: "Natural Makeup", price: "1500", duration: 45 },
      ],
      "Nails": [
        { name: "Manicure", price: "600", duration: 45 },
        { name: "Pedicure", price: "800", duration: 60 },
        { name: "Nail Art", price: "1200", duration: 75 },
      ],
    };

    const staffSpecializations = [
      "Hair Styling", "Makeup Artist", "Skincare Specialist",
      "Nail Technician", "Bridal Specialist", "Color Expert"
    ];

    const staffNames = [
      "Priya Sharma", "Anjali Reddy", "Kavya Patel", "Divya Kumar",
      "Sneha Rao", "Meera Singh", "Ritu Desai", "Pooja Nair"
    ];

    for (let i = 0; i < createdCities.length; i++) {
      const city = createdCities[i];
      const cityId = city.id;
      const numParlours = 5 + Math.floor(Math.random() * 3);

      for (let j = 0; j < numParlours; j++) {
        const parlourName = parlourNames[j % parlourNames.length];
        const rating = (3.5 + Math.random() * 1.5).toFixed(2);
        const totalReviews = Math.floor(Math.random() * 200) + 50;

        const parlour = await storage.createParlour({
          name: `${parlourName} - ${city.name}`,
          cityId,
          address: `${j + 1}, Main Street, ${city.name}`,
          phone: `+91 ${9000000000 + Math.floor(Math.random() * 99999999)}`,
          email: `${parlourName.toLowerCase().replace(/ /g, '')}${j}@example.com`,
          description: `Premium beauty services with experienced professionals. Specializing in hair, skin, makeup, and nail care.`,
          ownerCode: `OWNER${cityId}${j + 1}${Math.floor(Math.random() * 1000)}`,
          rating,
          totalReviews,
          imageUrl: `https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800`,
        });

        const categories = Object.keys(serviceCategories);
        for (const category of categories) {
          const categoryServices = serviceCategories[category as keyof typeof serviceCategories];
          for (const service of categoryServices) {
            await storage.createService({
              parlourId: parlour.id,
              name: service.name,
              description: `Professional ${service.name.toLowerCase()} service`,
              price: service.price,
              duration: service.duration,
              category,
            });
          }
        }

        const numStaff = 3 + Math.floor(Math.random() * 3);
        for (let k = 0; k < numStaff; k++) {
          const staffName = staffNames[k % staffNames.length];
          const specialization = staffSpecializations[k % staffSpecializations.length];
          const experience = 2 + Math.floor(Math.random() * 8);
          const staffRating = (3.5 + Math.random() * 1.5).toFixed(2);
          const uniqueId = `${cityId}${j}${k}`;

          await storage.createStaff({
            parlourId: parlour.id,
            name: `${staffName} ${k + 1}`,
            email: `${staffName.toLowerCase().replace(/ /g, '')}${uniqueId}@${parlourName.toLowerCase().replace(/ /g, '')}.com`,
            phone: `+91 ${9000000000 + Math.floor(Math.random() * 99999999)}`,
            specialization,
            experience,
            bio: `${experience} years of experience in ${specialization.toLowerCase()}`,
            profileImage: `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400`,
            rating: staffRating,
            totalReviews: Math.floor(Math.random() * 100) + 20,
            isAvailableForHire: Math.random() > 0.3,
          });
        }

        const services = await storage.getServices(parlour.id);
        const staff = await storage.getStaff({ parlourId: parlour.id });

        for (let b = 0; b < 3; b++) {
          const randomService = services[Math.floor(Math.random() * services.length)];
          const randomStaff = staff[Math.floor(Math.random() * staff.length)];
          const bookingDate = new Date();
          bookingDate.setDate(bookingDate.getDate() + b + 1);

          await storage.createBooking({
            parlourId: parlour.id,
            serviceId: randomService.id,
            staffId: randomStaff.id,
            customerName: `Customer ${b + 1}`,
            customerEmail: `customer${b + 1}@example.com`,
            customerPhone: `+91 ${9000000000 + Math.floor(Math.random() * 99999999)}`,
            bookingDate,
            status: b === 0 ? "confirmed" : "pending",
            notes: `Booking for ${randomService.name}`,
          });
        }

        const numGalleryImages = 3 + Math.floor(Math.random() * 3);
        for (let g = 0; g < numGalleryImages; g++) {
          await storage.createGalleryImage({
            parlourId: parlour.id,
            imageUrl: `https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800`,
            caption: `Gallery image ${g + 1}`,
          });
        }
      }
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
