# Unit Converter

** Live Demo:** [https://sky-unit-converter.vercel.app/](https://sky-unit-converter.vercel.app/)

A fast, simple, and reliable Unit Converter app built with React and Tailwind CSS. It is designed to be easy to use, easy to maintain, and smart about handling data.

## How We Built It

### 1. Clean Code (Separation of Logic and UI)
We kept the math and the design completely separate.
- **The Math (`conversionEngine.js`)**: All the formulas and numbers live here, with no UI code mixed in. This makes it easy to test and bug-free.
- **The UI**: The React components only focus on looking good and taking user input.

### 2. Easy to Add New Things (Scalable)
Want to add a new unit like "Yards" or a whole new category like "Speed"? You just add one line to the central config list. The app automatically updates the dropdowns and menus for you.

### 3. Smart Error Handling (Edge Cases)
The app stops bad inputs before they break things:
- **No Impossible Numbers**: It won't let you enter a negative length or weight. It also stops temperatures from going below absolute zero.
- **Clean Decimals**: It rounds long, messy decimals so they are easy to read.
- **Handles Empty Inputs**: Deleting numbers won't cause annoying "NaN" (Not a Number) errors.

### 4. Great User Experience (UI Decisions)
We made sure the app feels smooth and premium:
- **Live Updates**: Type in the "From" or "To" box, and the other box updates instantly.
- **Modern Look**: It uses smooth animations, clean spacing, and a modern "glass" design.
- **Mobile Friendly & Accessible**: It works great on phones and is easy for everyone to read and use.
- **Handy Tools**: Includes one-click buttons to swap units or copy your results.

## Tech Stack
- React 19
- Vite
- Tailwind CSS (v4)
- shadcn/ui
