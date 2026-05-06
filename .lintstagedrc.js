module.exports = {
  // TypeScript/JavaScript files
  "**/*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],

  // JSON, CSS, MD files
  "**/*.{json,css,scss,md,mdx}": ["prettier --write"],

  // Prisma schema
  "prisma/schema.prisma": ["npx prisma format"],
}
