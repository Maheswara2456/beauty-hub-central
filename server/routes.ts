import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { db } from "./db";
import { cities } from "@shared/schema";

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

  return httpServer;
}

// Seed database with demo data
export async function seedDatabase() {
  try {
    // Check if cities already exist
    const existingCities = await storage.getCities();
    if (existingCities.length > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Seeding database...");

    // Create cities
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

    // For each city, create 5-7 parlours
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

        // Add services for this parlour
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

        // Add staff for this parlour (3-5 staff members)
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

        // Add demo bookings (2-3 per parlour)
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

        // Add gallery images (3-5 per parlour)
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
