# Cherry Capital Portfolio ✨

Welcome to the source code for the Cherry Capital portfolio website. This project demonstrates modern web development skills and business expertise using cutting-edge tech that outperforms WordPress solutions. The site is designed to be fast, responsive, and professional.

[![Next.js](https://img.shields.io/badge/Next.js-v15-blue?style=flat-square)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-purple?style=flat-square)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel&logoColor=white&style=flat-square)](https://vercel.com/)

**[Live Demo](https://cherrycapitalweb.com/)** <!-- TODO: Update with actual domain -->

## Features 🚀

- **Responsive Design:**  The portfolio adapts seamlessly to various screen sizes, ensuring a consistent user experience across desktops, tablets, and mobile devices.
- **Dark Mode:**  Users can easily switch between light and dark themes to match their preferences.
- **Interactive Profile:** A visually appealing profile section includes an image and animated text showcasing Cherry Capital's expertise and services.
- **Experience & Projects:**  Collapsible accordions provide detailed information about Cherry Capital's experience building websites in the Beulah area and showcase projects that demonstrate superiority over WordPress solutions.
- **Contact Form:** A user-friendly contact form allows potential clients to easily reach out for modern web development services.
- **Social Links:**  Quick access to Cherry Capital's professional social media profiles and business pages.

## Tech Stack 🛠️

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI, Radix UI
- **Animations:** Framer Motion
- **Form Handling:** React Hook Form, Zod
- **Email:** Nodemailer
- **Deployment:** Vercel

## Installation & Setup 💻

1. **Clone the repository:**
```bash
git clone https://github.com/taqui-786/Taqui.git
```
cd Taqui

```bash
2. **Install dependencies:**
   ```bash
npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the project root and add your SMTP credentials for the contact form:
```env
SMPT_HOST="your-smtp-host"
SMPT_USER="your-smtp-user"
SMPT_PASS="your-smtp-password"
```

4. **Run the development server:**
```bash
npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Examples 💡

The code utilizes several key libraries:

- **React Hook Form:**  Manages form state and validation in the Contact Me section (`src/components/sections/ContactMeSection.tsx`).
- **Zod:** Provides schema validation for the contact form data.
- **Next-Themes:** Enables the dark/light theme switching functionality (`src/components/ThemeProvider.tsx`).
- **Nodemailer:** Handles sending emails from the contact form (`src/components/sections/ContactMeSection.tsx` and `src/lib/mailConfiguration.ts`).
- **Shadcn UI:** Provides pre-built UI components for a consistent design.
- **Framer Motion:**  Used for animations (e.g., the profile section's text flipper).

## Contributing 🤝

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear messages.
4. Push your branch to your forked repository.
5. Submit a pull request to the main repository.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
