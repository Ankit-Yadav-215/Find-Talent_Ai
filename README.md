# Talent Finder AI

Talent Finder AI is a web application designed to help users quickly find and filter talent using AI-powered tools. It features a LinkedIn-style search, a job description generator, and more. The project is built with Next.js, React, and TypeScript, and is deployed on [Vercel](https://talent-finder-ai.vercel.app/).

---

## 🚀 Live Demo

[https://talent-finder-ai.vercel.app/](https://talent-finder-ai.vercel.app/)

---

## 🛠️ Features

- **Find Talent:** Search and filter candidates using AI-enhanced queries.
- **Description Generator:** Instantly generate job descriptions with AI.
- **Debounced Search:** Responsive, efficient search with debouncing.
- **Modern UI:** Responsive and accessible design using Tailwind CSS.
- **API Integration:** Backend endpoints for LinkedIn-style filtering and job description generation.

---

## 📦 Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes (Node.js)
- **Deployment:** Vercel

---

## 📁 Project Structure

```
.
├── components/         # Reusable React components
├── pages/              # Next.js pages and API routes
│   ├── api/            # Backend API endpoints
│   └── ...             # Frontend pages
├── public/             # Static assets
├── styles/             # Global and component styles
├── utils/              # Utility functions (e.g., debounce)
├── tsconfig.json       # TypeScript configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── ...
```

---

## 🚦 Getting Started

### 1. **Clone the repository**

```sh
git clone https://github.com/your-username/talent-finder-ai.git
cd talent-finder-ai
```

### 2. **Install dependencies**

```sh
npm install
# or
yarn install
```

### 3. **Run the development server**

```sh
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory and add any required environment variables.  
For example:

```
OPENAI_API_KEY=your_openai_api_key
```

---

## 📝 Scripts

- `dev` – Start the development server
- `build` – Build for production
- `start` – Start the production server
- `lint` – Run ESLint

---

## 🧪 Testing

If you have tests, run:

```sh
npm run test
```

---

## 🖼️ Screenshots

![Talent Finder AI Screenshot](public/screenshot.png)

---

## 🐞 Troubleshooting

- **ESLint errors:** Follow the error messages and update your code (e.g., avoid `any` in TypeScript).
- **API errors:** Ensure your environment variables are set correctly.
- **Deployment issues:** Check your Vercel dashboard for logs and errors.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI](https://openai.com/)

---

## 🌐 Deployed Link

[https://talent-finder-ai.vercel.app/](https://talent-finder-ai.vercel.app/)

---


