import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Search, Trash2, ChevronLeft, Book, PenLine, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Entry {
  id: number;
  title: string;
  body: string;
  created_at: string;
}

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, [search]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newBody) return;

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, body: newBody }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewBody("");
        setIsCreating(false);
        fetchEntries();
      }
    } catch (error) {
      console.error("Failed to save entry:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedEntry?.id === id) setSelectedEntry(null);
        fetchEntries();
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-5xl md:text-6xl mb-2 text-accent"
        >
          Aura Journal
        </motion.h1>
        <p className="text-gray-500 italic font-serif">Capture the essence of your day.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar / List */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-2 bg-white/50 border border-accent/20 rounded-full focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              setIsCreating(true);
              setSelectedEntry(null);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 font-medium"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>

          <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-center py-8 text-gray-400 italic">Loading...</div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 text-gray-400 italic">No entries found.</div>
            ) : (
              entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layoutId={`entry-${entry.id}`}
                  onClick={() => {
                    setSelectedEntry(entry);
                    setIsCreating(false);
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                    selectedEntry?.id === entry.id
                      ? "bg-white border-accent shadow-md"
                      : "bg-white/40 border-transparent hover:bg-white/80 hover:border-accent/40 hover:shadow-sm"
                  }`}
                >
                  <h3 className="font-serif font-semibold text-lg truncate">{entry.title}</h3>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(entry.created_at), "MMM d, yyyy")}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-[60vh]">
          <AnimatePresence mode="wait">
            {isCreating ? (
              <motion.form
                key="create-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSave}
                className="bg-white p-8 rounded-3xl shadow-xl border border-accent/10 h-full flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-2xl flex items-center gap-2">
                    <PenLine className="w-5 h-5 text-accent" />
                    New Page
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  autoFocus
                  type="text"
                  placeholder="Title of your entry..."
                  className="w-full text-2xl font-serif font-bold mb-4 focus:outline-none placeholder:text-gray-200"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <div className="flex-1 relative">
                  <textarea
                    placeholder="Start writing..."
                    className="w-full h-full resize-none focus:outline-none text-lg leading-relaxed notebook-page pt-2 placeholder:text-gray-200"
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 font-medium"
                  >
                    Save Entry
                  </button>
                </div>
              </motion.form>
            ) : selectedEntry ? (
              <motion.div
                key={`view-${selectedEntry.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-accent/10 h-full flex flex-col relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-accent/5 margin-line hidden md:block" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedEntry(null)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-all md:hidden"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="font-serif text-3xl md:text-4xl font-bold">{selectedEntry.title}</h2>
                      <p className="text-sm text-gray-400 mt-1 italic font-serif">
                        {format(new Date(selectedEntry.created_at), "EEEE, MMMM do, yyyy")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedEntry.id)}
                    className="p-2 text-gray-300 hover:text-red-400 transition-all"
                    title="Delete entry"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 relative z-10">
                  <div className="prose prose-stone max-w-none">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap font-serif text-gray-700">
                      {selectedEntry.body}
                    </p>
                  </div>
                </div>

                <div className="mt-12 flex justify-center opacity-20 relative z-10">
                  <Book className="w-8 h-8" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4"
              >
                <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center">
                  <Book className="w-10 h-10" />
                </div>
                <p className="italic font-serif text-lg">Select an entry or start a new one.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
