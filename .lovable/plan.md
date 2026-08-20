# Plan: Product Catalog Import

I will import the new products from the uploaded text file into the database. This involves creating the necessary categories and then inserting the products with their detailed information (Price, SKU, Language, Size, etc.) into the description field.

## User Review Required

> [!IMPORTANT]
> - I will be clearing existing products to replace them with the new catalog as requested.
> - Images will not be included in this step (as you specified you will add them later).
> - One product ("NKJV HOLY BIBLE SOFT TOUCH EDITION PINK") has a price of 0.00 in the file. I will import it as R0.00 unless instructed otherwise.

## Proposed Changes

### Database & Backend
- **Category Creation**: Automatically identify and create missing categories from the catalog (e.g., "NLT - New Living Translation", "KJV - King James Version").
- **Product Import**:
    - Extract Title, Price, and SKU.
    - Format all other details (Size, Page Count, Publisher, etc.) into a clean, rich-text compatible description.
    - Generate URL-friendly slugs for each product.
- **Data Cleanup**: Remove existing placeholder/old products before importing the new set.

### Content
- The following products will be imported:
    - NLT BROWN FAUX LEATHER FLEXCOVER COMPACT BIBLE WITH ZIP (R180)
    - NLT PURPLE FAUX LEATHER FLEXCOVER COMPACT BIBLE (R200)
    - NIV PINK PAPERBACK GIFT & AWARD BIBLE (R200)
    - NLT PURPLE HARDCOVER STANDARD BIBLE (R240)
    - KJV GREY CROSS FAUX LEATHER COMPACT BIBLE (R200)
    - KJV CHARCOAL FAUX LEATHER COMPACT BIBLE (R200)
    - GNT FULL COLOR HARDCOVER INTERACTIVE YOUTH EDITION BIBLE (R200)
    - NLT PINK HARDCOVER STANDARD BIBLE (R240)
    - NKJV HOLY BIBLE SOFT TOUCH EDITION PINK (R0)
    - KJV GREY LION FAUX LEATHER COMPACT BIBLE (R180)
    - KJV PURPLE HARDCOVER FAUX LEATHER COMPACT BIBLE (R0)

## Technical Details
- I will use a SQL migration to perform the cleanup and import in a single transaction for data integrity.
- Slugs will be generated using a standard kebab-case format (e.g., `nlt-brown-faux-leather...`).
- Descriptions will use `<p>` and `<br>` tags to preserve the formatting from your file.
