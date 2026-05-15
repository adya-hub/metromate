import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { useState } from "react";

interface Message {
  text: string;
  isUser: boolean;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! I'm your MetroMate AI assistant. Ask me anything about Delhi Metro!", isUser: false }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { text: input, isUser: true }]);

    setTimeout(() => {
      const responses = [
        "The fastest route from Rajiv Chowk to Noida City Centre takes about 42 minutes with 2 interchanges.",
        "First metro trains start at 6:00 AM and last trains run until 11:00 PM.",
        "You can save ₹10-15 by taking routes with fewer interchanges, though they might take 5-10 minutes longer.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { text: randomResponse, isUser: false }]);
    }, 1000);

    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white flex items-center justify-center shadow-2xl shadow-violet-500/50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        <motion.div
          className="absolute inset-0 rounded-full bg-violet-600"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[500px] rounded-3xl glass-card-strong shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-blue-600/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">MetroMate AI</h3>
                  <p className="text-xs text-muted-foreground">Always here to help</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.isUser
                        ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-br-sm"
                        : "bg-accent/50 text-foreground rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 rounded-xl bg-accent/50 border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className="p-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
