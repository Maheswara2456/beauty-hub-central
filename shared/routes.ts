import { z } from 'zod';
import {
  insertParlourSchema,
  insertServiceSchema,
  insertStaffSchema,
  insertBookingSchema,
  insertGalleryImageSchema,
  insertBeautyPostSchema,
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  cities: {
    list: {
      method: 'GET' as const,
      path: '/api/cities' as const,
      responses: {
        200: z.array(z.object({
          id: z.number(),
          name: z.string(),
          state: z.string(),
        })),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/cities/:id' as const,
      responses: {
        200: z.object({
          id: z.number(),
          name: z.string(),
          state: z.string(),
        }),
        404: errorSchemas.notFound,
      },
    },
  },

  parlours: {
    list: {
      method: 'GET' as const,
      path: '/api/parlours' as const,
      input: z.object({
        cityId: z.coerce.number().optional(),
        minRating: z.coerce.number().optional(),
        maxPrice: z.coerce.number().optional(),
        category: z.string().optional(),
        sortBy: z.enum(['rating', 'reviews', 'name']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/parlours/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/parlours' as const,
      input: insertParlourSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/parlours/:id' as const,
      input: insertParlourSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },

  services: {
    list: {
      method: 'GET' as const,
      path: '/api/services' as const,
      input: z.object({
        parlourId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/services/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/services' as const,
      input: insertServiceSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/services/:id' as const,
      input: insertServiceSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/services/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  staff: {
    list: {
      method: 'GET' as const,
      path: '/api/staff' as const,
      input: z.object({
        parlourId: z.coerce.number().optional(),
        specialization: z.string().optional(),
        availableForHire: z.coerce.boolean().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/staff/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/staff' as const,
      input: insertStaffSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/staff/:id' as const,
      input: insertStaffSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/staff/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings' as const,
      input: z.object({
        parlourId: z.coerce.number().optional(),
        customerEmail: z.string().optional(),
        status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bookings/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings' as const,
      input: insertBookingSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/bookings/:id' as const,
      input: insertBookingSchema.partial(),
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/bookings/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  gallery: {
    list: {
      method: 'GET' as const,
      path: '/api/gallery' as const,
      input: z.object({
        parlourId: z.coerce.number(),
      }),
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/gallery' as const,
      input: insertGalleryImageSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/gallery/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  posts: {
    list: {
      method: 'GET' as const,
      path: '/api/posts' as const,
      input: z.object({
        staffId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/posts' as const,
      input: insertBeautyPostSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/posts/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    like: {
      method: 'POST' as const,
      path: '/api/posts/:id/like' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
  },

  owner: {
    login: {
      method: 'POST' as const,
      path: '/api/owner/login' as const,
      input: z.object({
        ownerCode: z.string().min(1),
      }),
      responses: {
        200: z.object({
          parlourId: z.number(),
          parlourName: z.string(),
          ownerCode: z.string(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
