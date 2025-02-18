import { useState, useRef, useEffect } from "react";
import "./App.css";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { FaPaperPlane } from "react-icons/fa";

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, generatingAnswer]);

  async function generateAnswer(e) {
    e.preventDefault();
    if (!question.trim()) return;
    
    setGeneratingAnswer(true);
    const currentQuestion = question;
    setQuestion("");
    
    setChatHistory(prev => [...prev, { type: "question", content: currentQuestion }]);
    
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT}`,
        {
          contents: [{ parts: [{ text: currentQuestion }] }],
        }
      );

      const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no response received.";
      setChatHistory(prev => [...prev, { type: "answer", content: aiResponse }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setChatHistory(prev => [...prev, { type: "answer", content: "Sorry - Something went wrong. Please try again!" }]);
    }
    setGeneratingAnswer(false);
  }

  return (
    <>
      {/* <div className="bg-animation"></div> */}
      <div className="fixed inset-0 flex flex-col items-center p-4">
        <header className="bg-white shadow-lg w-full max-w-4xl rounded-lg py-4 px-6 flex justify-center font-bold text-xl text-orange-600">
          Chat AI
        </header>
        
        <div ref={chatContainerRef} className="flex-1 w-full max-w-4xl bg-white rounded-lg shadow-md p-4 overflow-y-auto hide-scrollbar mt-4">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <h2 className="text-2xl font-bold text-orange-600">Welcome to Chat AI! 👋</h2>
              <p className="text-600">Ask me anything and I'll try my best to help.</p>
            </div>
          ) : (
            chatHistory.map((chat, index) => (
              <div key={index} className={`mb-4 flex ${chat.type === "question" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs p-3 rounded-lg shadow-md ${chat.type === "question" ? "bg-yellow-500 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}>
                  <ReactMarkdown>{chat.content}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
          {generatingAnswer && (
            <div className="flex justify-start mt-2">
              <div className="bg-orange-300 p-3 rounded-lg animate-pulse">...</div>

            </div>
          )}
        </div>
        
        <form onSubmit={generateAnswer} className="w-full max-w-4xl mt-4 bg-white rounded-lg shadow-md p-4 flex items-center">
          <textarea
            className="flex-1 border rounded p-3 focus:ring-2 focus:ring-blue-400 resize-none"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything..."
            rows="2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                generateAnswer(e);
              }
            }}
          ></textarea>
          <button
            type="submit"
            className="ml-3 px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={generatingAnswer}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </>
  );
}

export default App;
