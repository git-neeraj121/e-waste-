import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, AlertTriangle, Cpu, Trash2, ShieldCheck, Send, MessageSquare, Sparkles, HelpCircle } from 'lucide-react';

const educationalCards = [
  {
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20',
    title: 'The Hazard of E-Waste',
    description: 'Electronics contain heavy metals like Lead, Mercury, Cadmium, and Beryllium. When dumped in landfills, these toxic substances leak into the soil and contaminate groundwater, entering the food chain and causing severe ecological damage.'
  },
  {
    icon: ShieldCheck,
    iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20',
    title: 'Wipe Your Data First',
    description: 'Always factory reset phones, laptops, and hard drives before handing them over. Remove SIM cards, SD cards, and unlink your cloud accounts. While verified centers recycle responsibly, data hygiene is your first line of defense.'
  },
  {
    icon: Cpu,
    iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20',
    title: 'Circular Resource Recovery',
    description: 'Recycling allows us to extract valuable resources like Gold, Silver, Copper, Platinum, and rare earth minerals from old boards. Mining these resources is highly energy-intensive; recycling saves up to 80% of manufacturing energy.'
  },
  {
    icon: Trash2,
    iconColor: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20',
    title: 'Batteries: Handle with Care',
    description: 'Lithium-ion batteries present serious fire hazards if crushed or exposed to moisture. Never toss loose batteries into regular garbage bins. Tape the contact terminals and recycle them at designated facilities.'
  }
];

const botResponses = {
  default: "I'm the EcoLocate AI Assistant! I can help you with questions about e-waste disposal, data safety, points, and hazardous items. Try asking one of our quick questions below!",
  battery: "Lithium-ion batteries (found in phones, laptops) should be handled carefully. Never dispose of them in regular garbage as they can catch fire. Tape the metal terminals with electrical tape to prevent short circuits, place them in a dry bag, and schedule a pickup or drop them off at a verified center. You earn +30 Eco Points per battery recycled!",
  data: "To wipe your data safely: \n1. Back up all your important files to cloud/hard drive.\n2. Sign out of all accounts (Google, Apple ID, etc.).\n3. Perform a factory data reset.\n4. If possible, encrypt your storage before resetting for maximum security.",
  points: "You earn Eco Points for every collection you complete! \n- Laptops & Computers: +150 PTS\n- Large Appliances (printers, microwaves): +200 PTS\n- Screens & Monitors: +100 PTS\n- Mobile Phones & Cables: +40 PTS\n- Batteries: +30 PTS\nAccumulate points to level up your Profile and claim eco-rewards!",
  hazard: "E-waste is hazardous because it contains neurotoxins and carcinogens. For example, Lead damages the human central nervous system; Mercury causes chronic organ failures; Cadmium damages kidneys and bones. Recycling extracts these toxins safely inside sealed chemical processing setups rather than leaking them into soil.",
  accessories: "Yes! Cables, power bricks, mouse devices, headphones, and chargers are all recyclable. You can bunch them together and choose the 'Cables & Chargers' option (+40 points) on our Scheduler form. Do not cut or burn the wires to strip copper, as burning PVC insulation releases highly toxic fumes."
};

function Education({ token, backendStatus }) {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: botResponses.default, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const quickQuestions = [
    { text: "Can I recycle batteries?", key: 'battery' },
    { text: "How do I wipe my data?", key: 'data' },
    { text: "How are points calculated?", key: 'points' },
    { text: "Why is e-waste dangerous?", key: 'hazard' },
    { text: "Can I recycle cables?", key: 'accessories' }
  ];

  const handleSend = async (text, key = null) => {
    if (!text.trim()) return;

    const userTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setMessages(prev => [...prev, { sender: 'user', text, time: userTimestamp }]);
    setInput('');
    setIsTyping(true);

    // If backend is connected, use real Gemini chatbot endpoint
    if (backendStatus === 'connected' && token) {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: text,
            history: messages.map(m => ({
              sender: m.sender,
              text: m.text
            }))
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Chat API failed');

        setIsTyping(false);
        setMessages(prev => [...prev, {
          sender: 'bot',
          text: data.response,
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
        return;
      } catch (err) {
        console.warn("Gemini Chat API failed. Falling back to rules chatbot.", err);
      }
    }

    // STANDALONE / OFFLINE FALLBACK MOCK CHATBOT LOGIC
    setTimeout(() => {
      setIsTyping(false);
      let responseText = botResponses.default;
      const lowerText = text.toLowerCase();
      
      if (key && botResponses[key]) {
        responseText = botResponses[key];
      } else if (lowerText.includes('batter')) {
        responseText = botResponses.battery;
      } else if (lowerText.includes('data') || lowerText.includes('wipe') || lowerText.includes('reset') || lowerText.includes('privacy')) {
        responseText = botResponses.data;
      } else if (lowerText.includes('point') || lowerText.includes('reward') || lowerText.includes('earn')) {
        responseText = botResponses.points;
      } else if (lowerText.includes('hazard') || lowerText.includes('danger') || lowerText.includes('toxic') || lowerText.includes('harm')) {
        responseText = botResponses.hazard;
      } else if (lowerText.includes('cable') || lowerText.includes('charger') || lowerText.includes('wire') || lowerText.includes('mouse')) {
        responseText = botResponses.accessories;
      } else {
        responseText = "That is a great question! I'm running in local offline mode right now, but you can book a pickup at one of our verified facility locations, where recycling specialists can safely assess your items and help protect the environment.";
      }

      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: responseText, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      }]);
    }, 1200);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      
      {/* Left side: Guide Cards */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Eco-Education Hub
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Learn why proper e-waste management matters and read device preparation tips.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {educationalCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div 
                key={idx} 
                className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-150 flex flex-col gap-3"
              >
                <div className={`p-2.5 rounded-lg w-10 h-10 flex items-center justify-center shrink-0 ${card.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-850 dark:text-gray-205">{card.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-2">{card.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right side: Chatbot */}
      <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm h-[580px] flex flex-col overflow-hidden max-h-[700px]">
        {/* Chatbot Header */}
        <div className="bg-primary-600 dark:bg-primary-950 p-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/20 p-2 rounded-lg">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Eco-Waste Chatbot</h2>
              <span className="text-[10px] text-green-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span> 
                {backendStatus === 'connected' ? 'Gemini AI Assistant' : 'Offline Rule Assistant'}
              </span>
            </div>
          </div>
          <Sparkles className="h-4 w-4 text-yellow-300" />
        </div>

        {/* Chat History */}
        <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-gray-50/30 dark:bg-gray-950/20">
          {messages.map((msg, index) => {
            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={index}
                className={`flex flex-col max-w-[85%] ${isBot ? 'self-start' : 'self-end items-end'}`}
              >
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  isBot 
                    ? 'bg-white border border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-205 rounded-tl-none shadow-sm'
                    : 'bg-primary-600 text-white rounded-tr-none'
                }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1 font-semibold">{msg.time}</span>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex flex-col self-start max-w-[85%]">
              <div className="bg-white border border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Quick Questions suggestion */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-1.5 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.text, q.key)}
              className="text-[10px] font-bold bg-white hover:bg-primary-50 hover:text-primary-600 dark:bg-gray-800 dark:hover:bg-gray-700/60 dark:hover:text-primary-400 border border-gray-200 dark:border-gray-700 text-gray-650 dark:text-gray-300 px-2.5 py-1 rounded-full transition active:scale-95 flex items-center gap-1"
            >
              <HelpCircle className="h-3 w-3" /> {q.text}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex gap-2 items-center bg-white dark:bg-gray-900 shrink-0">
          <input
            type="text"
            placeholder="Ask a question about e-waste recycling..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            className="flex-grow bg-gray-50 dark:bg-gray-850 border border-gray-205 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
          />
          <button
            onClick={() => handleSend(input)}
            className="p-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold transition active:scale-90 shadow-sm shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  );
}

export default Education;
