## Packages
(none needed)

## Notes
Fonts are loaded via existing client/index.html Google Fonts link (using Playfair Display + Plus Jakarta Sans).
Owner session stored in localStorage key: beauty.ownerSession (parlourId, parlourName, ownerCode).
Backend endpoints are expected to follow @shared/routes; some routes may not exist yet—UI is fully wired and will surface missing APIs at runtime.
Image fields are URL strings; gallery uses URL + caption (no file upload in Phase 1).
