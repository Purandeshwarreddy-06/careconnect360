import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  User, 
  Stethoscope, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAppointmentById, getAppointments } from '@/services/api';
import { Appointment } from '@/types';
import { HEALTHCARE_IMAGES, FALLBACK_IMAGE } from '@/assets/images';

export const ConsultationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Video & audio state toggles
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);

  // Chat conversation
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string; isDoctor: boolean }>>([
    {
      sender: 'Dr. Ananya Rao',
      text: 'Good day! I have reviewed your latest blood pressure telemetry (120/80 mmHg). How are you feeling today?',
      time: '04:01 PM',
      isDoctor: true,
    },
    {
      sender: user?.full_name || 'Rahul Kumar',
      text: 'Good afternoon Doctor Rao. Feeling active and following my scheduled medication doses on time.',
      time: '04:02 PM',
      isDoctor: false,
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  useEffect(() => {
    const fetchApt = async () => {
      try {
        if (id) {
          const found = await getAppointmentById(id);
          if (found) setAppointment(found);
          else {
            const list = await getAppointments(user?.id || 'usr-rahul-kumar-demo');
            setAppointment(list[0] || null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApt();
  }, [id, user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      sender: user?.full_name || 'Rahul Kumar',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDoctor: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Simulated doctor automated supportive response in demo
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: appointment?.doctor_name || 'Dr. Ananya Rao',
          text: 'Understood. Please keep monitoring your pulse and remember your scheduled 01:30 PM Metformin dose.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDoctor: true,
        },
      ]);
    }, 1500);
  };

  const handleEndConsultation = () => {
    navigate('/appointments');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Telemedicine Banner */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/20 text-cyan-300 rounded-xl">
            <Video className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Tele-Consultation: {appointment?.doctor_name || 'Dr. Ananya Rao'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                ENCRYPTED WEBRTC DEMO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {appointment?.specialty || 'Senior Cardiologist'} • {appointment?.hospital_clinic || 'Apollo Heart Institute'}
            </p>
          </div>
        </div>

        {/* Prototype Disclaimer */}
        <div className="flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Hackathon prototype demo. Simulated clinical video consultation.</span>
        </div>
      </div>

      {/* MAIN CONSULTATION WORKSPACE (VIDEO FEED & CHAT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-270px)] min-h-[500px]">
        {/* VIDEO DISPLAY AREA */}
        <div className={`relative bg-slate-950 border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl transition-all ${
          isChatOpen ? 'lg:col-span-8' : 'lg:col-span-12'
        }`}>
          {/* Main Doctor Video Area */}
          <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 to-[#08111F]">
            <img
              src={appointment?.doctor_image || HEALTHCARE_IMAGES.doctorConsultation}
              alt={appointment?.doctor_name || 'Doctor'}
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
              className="w-full h-full object-cover object-center filter brightness-95"
            />
            {/* Subtle overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 pointer-events-none" />

            {/* Doctor Info Pill on Top Left */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2.5 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">{appointment?.doctor_name || 'Dr. Ananya Rao'}</span>
              <span className="text-cyan-300">• 1080p 60fps</span>
            </div>

            {/* Patient Self Video PiP on Top Right */}
            <div className="absolute top-4 right-4 z-10 w-28 sm:w-36 aspect-video bg-slate-900 border-2 border-cyan-500/50 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
              {isCameraOn ? (
                <div className="relative w-full h-full">
                  <img
                    src={HEALTHCARE_IMAGES.hero}
                    alt="Patient PiP"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1.5 text-[9px] bg-black/70 px-1 rounded text-white font-medium">
                    You ({user?.full_name?.split(' ')[0] || 'Rahul'})
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 text-[10px]">
                  <VideoOff className="w-5 h-5 mb-1 text-slate-400" />
                  <span>Camera Off</span>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM CONTROLS DOCK (All controls are functional) */}
          <div className="relative z-20 bg-slate-950/90 backdrop-blur-xl border-t border-white/[0.08] px-6 py-4 flex items-center justify-center gap-3 sm:gap-5">
            {/* Camera Toggle */}
            <button
              type="button"
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`p-3.5 rounded-2xl transition-all flex items-center justify-center ${
                isCameraOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-rose-600/30 text-rose-300 border border-rose-500/50'
              }`}
              title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Mic Toggle */}
            <button
              type="button"
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3.5 rounded-2xl transition-all flex items-center justify-center ${
                isMicOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-rose-600/30 text-rose-300 border border-rose-500/50'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Speaker Toggle */}
            <button
              type="button"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-3.5 rounded-2xl transition-all flex items-center justify-center ${
                isSpeakerOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white'
                  : 'bg-rose-600/30 text-rose-300 border border-rose-500/50'
              }`}
              title={isSpeakerOn ? 'Mute Speaker' : 'Unmute Speaker'}
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Chat Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-3.5 rounded-2xl transition-all flex items-center justify-center ${
                isChatOpen
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title="Toggle Clinical Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={handleEndConsultation}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition-transform active:scale-95"
              title="End Virtual Consultation"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Consultation</span>
            </button>
          </div>
        </div>

        {/* CHAT DRAWER */}
        {isChatOpen && (
          <div className="lg:col-span-4 bg-[#0B1220]/95 border border-white/[0.08] rounded-3xl overflow-hidden flex flex-col shadow-2xl glass-panel">
            {/* Chat Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Live Consultation Chat</h4>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                ONLINE
              </span>
            </div>

            {/* Chat History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.isDoctor ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold">{m.sender}</span>
                    <span>•</span>
                    <span className="font-mono">{m.time}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                      m.isDoctor
                        ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                        : 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/[0.08] flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a clinical message..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
