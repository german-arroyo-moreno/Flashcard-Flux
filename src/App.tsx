import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronLeft, 
  RotateCcw, 
  Play, 
  FileText,
  Shuffle,
  Download,
  Upload,
  Maximize,
  Minimize,
  Eye,
  EyeOff
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';

// --- Types ---

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

type AppState = 'setup' | 'study';

// --- Constants ---

const DEFAULT_MARKDOWN = `# 🚀 Welcome to Flashcard Flux: The Tutorial

---

## Flashcard 1
**Q:** How do I create a **new card**?  
**A:** Use the format:  
**Q:** Your question here  
**A:** Your answer here  
Separate cards with three dashes (\`---\`).

---

## Flashcard 2
**Q:** What are the **Keyboard Shortcuts**?  
**A:**  
- **Left/Right Arrows**: Navigate
- **Space/Enter**: Flip Card  
- **'R' Key**: Randomize Deck
- **'F' Key**: Toggle Full Screen
- **'D' Key**: Toggle Distraction-Free Mode
- **Mouse Wheel**: Scroll left/right to navigate

---

## Flashcard 3
**Q:** Can I **Export** or **Import** my cards?  
**A:** **Yes!** In the **Setup** screen, use the **Export** button to save your deck as a \`.md\` file. Use **Import** to load any Markdown file and start studying instantly.

---

## Flashcard 4
**Q:** Can I use **Markdown** inside my cards?  
**A:** **Yes!** You can use **bold**, *italics*, \`code blocks\`, and even lists. The app renders them with a beautiful handwritten ink style.

---

## Flashcard 4
**Q:** How do I **start** a new session with my own notes?  
**A:** Go back to the **Setup** screen (using the back arrow), paste your Markdown into the notebook, and click **"Start Writing"**.

---

## Flashcard 5
**Q:** What happens when I **finish** a deck?  
**A:** You can go back to the **Setup** screen at any time using the back arrow in the header to start a new deck or edit your current notes.

---

## Flashcard 6
**Q:** What is **Shuffle Mode**?  
**A:** In the Setup screen, you can toggle **Shuffle** to randomize the order before you start. You can also press **'R'** or click the shuffle icon during a session.

---

## Flashcard 7
**Q:** Is my data **private**?  
**A:** **Absolutely.** Everything happens locally in your browser. No AI or external servers are used to process your cards.

---

## Flashcard 9
**Q:** Can I add **images** to my cards?  
**A:** **Yes!** Use standard Markdown image syntax:  
\`![Alt text](https://picsum.photos/seed/desk/200/100)\`  
Images are automatically scaled to fit perfectly on your handwritten cards.

---

## Flashcard 11
**Q:** How can I study without **distractions**?  
**A:** Use **Fullscreen Mode (F)** to fill your screen, and **Distraction-Free Mode (D)** to hide the progress bar and focus entirely on the cards.  
Look for the **Maximize** and **Eye** icons in the study header!

---

## Flashcard 12
**Q:** Why does it look like **pen and paper**?  
**A:** We designed it to mimic the **tactile feel** of physical study cards, using handwritten fonts and ruled paper textures to help you focus.`;

// --- Helpers ---

function parseMarkdown(md: string): Flashcard[] {
  const cards: Flashcard[] = [];
  // Split by horizontal rules (--- on its own line) or headers (## at start of line)
  // We use a more specific regex to ensure we don't split on inline text or code
  const sections = md.split(/\n---\s*\n|\n## /);
  
  sections.forEach((section, index) => {
    const qMatch = section.match(/\*\*Q:\*\*\s*([\s\S]*?)(?=\*\*A:\*\*|$)/i);
    const aMatch = section.match(/\*\*A:\*\*\s*([\s\S]*?)(?=$)/i);
    
    if (qMatch && aMatch) {
      cards.push({
        id: `card-${index}`,
        question: qMatch[1].trim(),
        answer: aMatch[1].trim(),
      });
    }
  });
  
  return cards;
}

// --- Components ---

export default function App() {
  const [markdown, setMarkdown] = useState(DEFAULT_MARKDOWN);
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [appState, setAppState] = useState<AppState>('setup');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [distractionFree, setDistractionFree] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events (e.g. if user presses Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deck.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setMarkdown(content);
      };
      reader.readAsText(file);
    }
  };

  // Initialize deck
  useEffect(() => {
    if (appState === 'study' && deck.length === 0) {
      const parsed = parseMarkdown(markdown);
      setDeck(shuffleMode ? [...parsed].sort(() => Math.random() - 0.5) : parsed);
    }
  }, [appState, markdown, shuffleMode, deck.length]);

  const currentCard = deck[currentIndex];
  const progress = deck.length > 0 ? ((currentIndex + 1) / deck.length) * 100 : 0;

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const shuffleDeck = () => {
    setDirection(0);
    setDeck(prev => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (appState !== 'study') return;
    // Throttle wheel events to prevent rapid skipping
    if (Math.abs(e.deltaX) > 30 || Math.abs(e.deltaY) > 30) {
      if (e.deltaX > 0 || e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appState !== 'study') return;
      
      // Don't trigger if user is typing in an input (though we don't have many in study mode)
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case ' ':
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
        case 'r':
        case 'R':
          shuffleDeck();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'd':
        case 'D':
          setDistractionFree(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, currentIndex, deck.length, isFlipped]); // Added isFlipped to dependencies to ensure toggle works correctly if needed, though prev => !prev is safer

  const resetStudy = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setAppState('setup');
    setDeck([]);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
      <AnimatePresence mode="wait">
        {appState === 'setup' && (
          <motion.div 
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
              "w-full transition-all duration-500 flex flex-col gap-6",
              showPreview ? "max-w-6xl" : "max-w-4xl"
            )}
          >
            <div className="flex items-center justify-between pl-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg">
                  <BookOpen className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight font-hand text-[var(--color-ink)]">Flashcard Flux</h1>
                  <p className="text-black/40 text-sm italic">Your handwritten study companion</p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 hover:bg-black/5 transition-all font-hand text-lg text-black/60"
              >
                <FileText size={18} />
                <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
              </button>
            </div>

            <div className={cn(
              "grid gap-8 transition-all duration-500",
              showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            )}>
              {/* Editor Section */}
              <div className="paper-card rounded-xl p-8 flex flex-col gap-6 relative shadow-xl">
                <div className="relative group pl-12">
                  <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    placeholder="Write your cards here..."
                    className="relative w-full h-[400px] bg-transparent border-none p-0 font-hand text-2xl text-[var(--color-ink-blue)] focus:outline-none transition-all resize-none leading-[2rem]"
                    style={{ backgroundAttachment: 'local', backgroundImage: 'linear-gradient(transparent, transparent 31px, #e5e7eb 31px)', backgroundSize: '100% 32px' }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pl-12">
                  <div className="flex flex-wrap items-center gap-4">
                    <button 
                      onClick={() => setShuffleMode(!shuffleMode)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border transition-all font-hand text-xl",
                        shuffleMode ? "bg-accent border-accent text-white" : "border-black/10 hover:bg-black/5 text-black/60"
                      )}
                    >
                      <Shuffle size={16} />
                      <span>{shuffleMode ? 'Shuffled' : 'In Order'}</span>
                    </button>

                    <button 
                      onClick={handleExport}
                      title="Export as .md"
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 hover:bg-black/5 transition-all font-hand text-xl text-black/60"
                    >
                      <Download size={16} />
                      <span>Export</span>
                    </button>

                    <label className="flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 hover:bg-black/5 transition-all font-hand text-xl text-black/60 cursor-pointer">
                      <Upload size={16} />
                      <span>Import</span>
                      <input type="file" accept=".md" onChange={handleImport} className="hidden" />
                    </label>
                  </div>

                  <button 
                    onClick={() => setAppState('study')}
                    className="flex items-center gap-2 px-8 py-3 bg-ink text-white rounded-lg font-bold hover:rotate-1 transition-transform active:scale-95 shadow-lg"
                    style={{ backgroundColor: 'var(--color-ink)' }}
                  >
                    <Play size={18} fill="currentColor" />
                    Start Writing
                  </button>
                </div>
              </div>

              {/* Preview Section */}
              {showPreview && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar"
                >
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-black/40 pl-2">Live Preview</h3>
                  {parseMarkdown(markdown).length > 0 ? (
                    parseMarkdown(markdown).map((card, idx) => (
                      <div key={card.id} className="paper-card rounded-xl p-6 shadow-md flex flex-col gap-4 relative overflow-hidden min-h-[200px] justify-center text-center preview-card">
                        <span className="absolute top-4 left-6 text-[8px] font-mono uppercase tracking-widest text-accent font-bold opacity-50">Card {idx + 1}</span>
                        <div className="markdown-body ink-smudge">
                          <ReactMarkdown>{card.question}</ReactMarkdown>
                        </div>
                        <div className="h-px w-full bg-black/5" />
                        <div className="markdown-body ink-smudge opacity-60">
                          <ReactMarkdown>{card.answer}</ReactMarkdown>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-black/10 rounded-xl p-12 text-center">
                      <p className="font-hand text-xl text-black/30 italic">Start writing to see your cards appear here...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {appState === 'study' && deck.length > 0 && (
          <motion.div 
            key="study"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            onWheel={handleWheel}
            className="w-full max-w-2xl flex flex-col gap-8 relative"
          >
            {/* Touch/Click Navigation Overlays (Grey Space) */}
            <div 
              className="fixed inset-y-0 left-0 w-[15%] z-0 cursor-pointer hover:bg-black/5 transition-colors hidden md:block"
              onClick={handlePrev}
              title="Previous Card"
            />
            <div 
              className="fixed inset-y-0 right-0 w-[15%] z-0 cursor-pointer hover:bg-black/5 transition-colors hidden md:block"
              onClick={handleNext}
              title="Next Card"
            />
            
            {/* Mobile Touch Targets (Always active but invisible) */}
            <div className="fixed inset-y-0 left-0 w-[20%] z-0 md:hidden" onClick={handlePrev} />
            <div className="fixed inset-y-0 right-0 w-[20%] z-0 md:hidden" onClick={handleNext} />

            {/* Header / Progress */}
            <div className="flex items-center justify-between px-2 min-h-[60px]">
              <div className="flex items-center gap-2">
                {!distractionFree && (
                  <>
                    <button 
                      onClick={resetStudy}
                      className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black"
                      title="Back to Setup"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={shuffleDeck}
                      className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black"
                      title="Randomize Deck (R)"
                    >
                      <Shuffle size={20} />
                    </button>
                  </>
                )}
                <button 
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen (F)"}
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
                <button 
                  onClick={() => setDistractionFree(!distractionFree)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black"
                  title={distractionFree ? "Show UI" : "Distraction Free (D)"}
                >
                  {distractionFree ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {!distractionFree && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">Progress</span>
                  <div className="w-48 h-1 bg-black/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-black/40 mt-1">
                    {currentIndex + 1} / {deck.length}
                  </span>
                </div>
              )}
              <div className="w-10" /> {/* Spacer to keep progress centered */}
            </div>

            {/* Card Container */}
            <div className="relative h-[400px] w-full overflow-visible">
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={{
                    enter: (direction: number) => ({
                      x: direction > 0 ? 500 : -500,
                      opacity: 0,
                      rotate: direction > 0 ? 15 : -15,
                      scale: 0.8
                    }),
                    center: {
                      zIndex: 1,
                      x: 0,
                      opacity: 1,
                      rotate: 0,
                      scale: 1
                    },
                    exit: (direction: number) => ({
                      zIndex: 0,
                      x: direction < 0 ? 500 : -500,
                      opacity: 0,
                      rotate: direction < 0 ? 15 : -15,
                      scale: 0.8
                    })
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                    rotate: { duration: 0.3 }
                  }}
                  className="w-full h-full perspective-1000"
                >
                  <motion.div
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="relative w-full h-full preserve-3d cursor-pointer"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden paper-card rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-xl overflow-hidden">
                      <span className="absolute top-8 left-12 text-[10px] font-mono uppercase tracking-widest text-accent font-bold">Question</span>
                      <div className="markdown-body ink-smudge">
                        <ReactMarkdown>{currentCard.question}</ReactMarkdown>
                      </div>
                      <div className="absolute bottom-8 text-black/10 text-xs font-hand text-xl">Tap to flip</div>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden paper-card rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-xl rotate-y-180 overflow-hidden">
                      <span className="absolute top-8 left-12 text-[10px] font-mono uppercase tracking-widest text-emerald-600 font-bold">Answer</span>
                      <div className="markdown-body ink-smudge">
                        <ReactMarkdown>{currentCard.answer}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-4 rounded-full border border-black/10 text-black/20 hover:text-black hover:bg-black/5 transition-all disabled:opacity-0"
              >
                <ChevronLeft size={32} />
              </button>

              <button 
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-20 h-20 rounded-full bg-[var(--color-ink)] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95"
              >
                <RotateCcw size={28} />
              </button>

              <button 
                onClick={handleNext}
                disabled={currentIndex === deck.length - 1}
                className="p-4 rounded-full border border-black/10 text-black/20 hover:text-black hover:bg-black/5 transition-all disabled:opacity-0"
              >
                <ChevronLeft size={32} className="rotate-180" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="fixed bottom-8 left-8 hidden md:block">
        <div className="flex items-center gap-3 text-black/20">
          <FileText size={16} />
          <span className="text-[10px] font-mono uppercase tracking-widest">Handwritten Flashcards v2.0</span>
        </div>
      </div>
    </div>
  );
}
