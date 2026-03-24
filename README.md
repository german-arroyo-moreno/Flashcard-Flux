# 🚀 Flashcard Flux

**Flashcard Flux** is a spectacular Markdown-based flashcard reader designed for immersive learning. Turn your simple Markdown notes into a beautiful, interactive study session with a handwritten ink aesthetic.

## ✨ Features

- **Markdown Support**: Use standard Markdown syntax for questions and answers, including bold, italics, code blocks, and lists.
- **Immersive Study Mode**: A distraction-free interface with smooth animations powered by Framer Motion.
- **Shuffle Mode**: Randomize your deck to challenge your memory.
- **Export/Import**: Save your decks as `.md` files and load them back instantly.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Navigation**: Support for keyboard, mouse wheel, and touch gestures.
- **Privacy First**: Everything runs locally in your browser. No external servers or AI processing.

## ⌨️ Keyboard Shortcuts

- **Left/Right Arrows**: Navigate through cards.
- **Space / Enter**: Flip the current card.
- **'R' Key**: Randomize the current deck.
- **'F' Key**: Toggle Full-Screen mode.
- **'D' Key**: Toggle Distraction-Free mode (hides progress bar).

## 🖱️ Mouse & Touch Controls

- **Mouse Wheel**: Scroll up/down or left/right to navigate cards.
- **Click/Tap Edges**: Click the left or right side of the screen to go to the previous or next card.

## 📝 Markdown Format

Creating a deck is simple. Just use the following format in the setup screen:

```markdown
# My Awesome Deck

---

## Flashcard 1
**Q:** What is the capital of France?
**A:** Paris

---

## Flashcard 2
**Q:** How do you define a function in JavaScript?
**A:** `function myFunc() { ... }` or `const myFunc = () => { ... }`
```

Separate each card with three dashes (`---`).

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown Rendering**: [React Markdown](https://github.com/remarkjs/react-markdown)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## 📄 License

This project is open-source and available under the MIT License.
