import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Bot, 
  User, 
  FileText,
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  ExternalLink,
  Loader2,
  X,
  Check,
  AlertCircle,
  Zap,
  TrendingUp,
  BookOpen,
  Users,
  GraduationCap,
  MessageCircle,
  ArrowLeft,
  Copy,
  Share2
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from "react-router-dom";
import Header from './Header';
import VoiceInputButton from './components/VoiceInputButton';

// Enhanced Types
interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  metadata?: {
    messageType?: 'text' | 'cv_upload' | 'job_results' | 'profile_summary' | 'cv_results' | 'recommendations' | 'course_recommendations';
    jobs?: Job[];
    profileData?: UserProfile;
    uploadStatus?: 'uploading' | 'processing' | 'complete' | 'error';
    fileName?: string;
    suggestions?: string[];
    recommendations?: string[];
    courses?: Course[];
    processingTime?: number;
    confidenceScore?: number;
  };
}

interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience?: any[];
  education?: any[];
  certifications?: string[];
  keywords?: string[];
  confidence_score?: number;
  experience_count?: number;
}

interface Job {
  ncspjobid: string;
  title: string;
  organization_name: string;
  match_percentage: number;
  keywords?: string;
  description?: string;
  statename: string;
  districtname: string;
  avewage: number;
  aveexp: number;
  functionalrolename?: string;
  industryname?: string;
  sectorname?: string;
  functionalareaname?: string;
  numberofopenings?: number;
  gendercode?: string;
  highestqualification?: string;
  skills_matched?: string[];
  similarity_score?: number;
  date?: string;
}

interface Course {
  course_name: string;
  platform: string;
  duration: string;
  link: string;
  educator: string;
  skill_covered: string;
  difficulty_level?: string;
  rating?: string;
}

interface ChatPageProps {
  onBackToHome?: () => void;
}

// Job Details Modal Component
interface JobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, isOpen, onClose }) => {
  
  if (!job) return null;
  console.log(job);
  const formatSalary = (amount: number): string => {
    if (amount > 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount > 1000) {
      return `₹${Math.round(amount / 1000)}K`;
    }
    return `₹${amount}`;
  };

  const handleCopyJobId = () => {
    navigator.clipboard.writeText(job.ncspjobid);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.organization_name}`,
        url: window.location.href
      });
    }
  };

  const keywordsList = job.keywords ? job.keywords.split(',').map(k => k.trim()).filter(k => k) : [];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{job.title}</h2>
                    <span className="px-3 py-1 rounded-full text-sm font-bold border bg-white/20 text-white border-white/30">
                      {job.match_percentage}% Match
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xl font-semibold text-white/90">{job.organization_name}</p>
                    
                    <div className="flex items-center gap-4 text-white/80">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.districtname}, {job.statename}
                      </span>
                      
                      {/* {job.industryname && (
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {job.industryname}
                        </span>
                      )} */}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                    title="Share Job"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="p-6 space-y-6">
                
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center border border-emerald-200">
                    <IndianRupee className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-sm text-emerald-600 font-medium">Salary</p>
                    <p className="text-lg font-bold text-emerald-700">{formatSalary(job.avewage)}</p>
                    <p className="text-xs text-emerald-600">per month</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                    <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-blue-600 font-medium">Experience</p>
                    <p className="text-lg font-bold text-blue-700">{job.aveexp} years</p>
                    <p className="text-xs text-blue-600">required</p>
                  </div>
                  
                   {job.industryname && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                      <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-purple-600 font-medium">Sector</p>
                      <p className="text-lg font-bold text-purple-700">{job.industryname}</p>
                      
                    </div>
                  )} 
                  {job.sectorname && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                      <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-purple-600 font-medium">Sector</p>
                      <p className="text-lg font-bold text-purple-700">{job.sectorname}</p>
                      
                    </div>
                  )} 
                  
                 
                </div>

                {/* Job Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Role Information */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-indigo-600" />
                        Job Description
                      </h3>
                      
                      <div className="space-y-3 text-sm">
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {job.description || "No detailed job description available."}
                        </p>
                      </div>
                    </div>

                    {/* Requirements */}
                    {job.highestqualification && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-indigo-600" />
                          Requirements
                        </h3>
                        
                        <div className="text-sm">
                          <span className="text-slate-600 font-medium">Minimum Qualification:</span>
                          <p className="text-slate-800 font-semibold">{job.highestqualification}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Skills & Keywords */}
                    {(job.skills_matched || keywordsList.length > 0) && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-3">Skills & Keywords</h3>
                        
                        {job.skills_matched && job.skills_matched.length > 0 && (
                          <div className="mb-4">
                            <span className="text-sm text-emerald-600 font-medium mb-2 block">✓ Matched Skills:</span>
                            <div className="flex flex-wrap gap-2">
                              {job.skills_matched.map((skill, idx) => (
                                <span key={idx} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {keywordsList.length > 0 && (
                          <div>
                            <span className="text-sm text-slate-600 font-medium mb-2 block">All Keywords:</span>
                            <div className="flex flex-wrap gap-2">
                              {keywordsList.slice(0, 15).map((keyword, idx) => (
                                <span key={idx} className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs">
                                  {keyword}
                                </span>
                              ))}
                              {keywordsList.length > 15 && (
                                <span className="text-slate-500 text-xs self-center">+{keywordsList.length - 15} more</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Job Meta */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <h3 className="font-bold text-slate-800 mb-3">Job Information</h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Job ID:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-800">{job.ncspjobid}</span>
                            <button
                              onClick={handleCopyJobId}
                              className="p-1 text-slate-500 hover:text-indigo-600 transition-colors"
                              title="Copy Job ID"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        
                        {job.date && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Posted:</span>
                            <span className="text-slate-800 font-medium">
                              {new Date(job.date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                {/* {job.description && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-3">Job Description</h3>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {job.description}
                    </div>
                  </div>
                )} */}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Match Score: <span className="font-semibold text-slate-800">{job.match_percentage}%</span>
                  {job.similarity_score && (
                    <> • AI Similarity: <span className="font-semibold text-slate-800">{(job.similarity_score * 100).toFixed(0)}%</span></>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                  >
                    Close
                  </button>
                  
                  <button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg">
                    <ExternalLink className="h-4 w-4" />
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ChatPage: React.FC<ChatPageProps> = ({ onBackToHome }) => {
  const apiUrl = import.meta.env.VITE_SEARCH_JOBS_URL;
  const bhasiniApiKey = import.meta.env.VITE_BHASINI_API_KEY;
  const bhasiniUserId = import.meta.env.VITE_BHASINI_USER_ID;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chatPhase, setChatPhase] = useState<'intro' | 'profile_building' | 'job_searching' | 'results' | 'cv_analysis'>('intro');
  const [cvProcessed, setCvProcessed] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Handle voice input from the new VoiceInputButton component
  const handleVoiceTranscript = (text: string, metadata?: {
    originalText?: string;
    translatedText?: string;
    detectedLanguage?: string;
    isTranslated?: boolean;
  }) => {
    setInputValue(text);
    
    // If we have translation metadata, we could show it to the user
    if (metadata && metadata.isTranslated) {
      console.log('Voice input processed:', {
        original: metadata.originalText,
        translated: metadata.translatedText,
        language: metadata.detectedLanguage
      });
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      type: 'bot',
      content: "👋 Hi! I'm your AI career assistant. I'll help you find the perfect job match. You can either upload your CV for instant profile analysis or chat with me to build your profile step by step. What would you prefer?",
      timestamp: new Date(),
      metadata: { 
        messageType: 'text',
        suggestions: ['Upload my CV', 'Build profile through chat']
      }
    };
    setMessages([welcomeMessage]);
  }, []);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCourseRecommendation = async (jobs: Job[], userSkills: string[]) => {
    try {
      // Add loading message for course recommendations
      addMessage({
        type: 'bot',
        content: "🔍 Analyzing job requirements to find skill gaps and recommend relevant courses...",
        metadata: { messageType: 'text' }
      });

      setIsLoading(true);

      const response = await fetch(`${apiUrl}/recommend_courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_skills: userSkills,
          job_results: jobs.map(job => ({
            ncspjobid: job.ncspjobid,
            title: job.title,
            keywords: job.keywords,
            description: job.description,
            match_percentage: job.match_percentage
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Course recommendation API error:', response.status, errorData);
        throw new Error(`API Error ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();

      if (data.recommendations && data.recommendations.length > 0) {
        addMessage({
          type: 'bot',
          content: `📚 Based on the job requirements, I found ${data.recommendations.length} relevant courses to enhance your skills:`,
          metadata: {
            messageType: 'course_recommendations',
            courses: data.recommendations,
            suggestions: []
          }
        });
      } else {
        addMessage({
          type: 'bot',
          content: "👍 Great! Your current skills match well with the available jobs. No additional courses needed at this time.",
          metadata: { messageType: 'text' }
        });
      }
    } catch (error) {
      console.error('Course recommendation error:', error);
      addMessage({
        type: 'bot',
        content: "I encountered an issue while finding course recommendations. You can ask me manually for specific skill courses.",
        metadata: { messageType: 'text' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    addMessage({
      type: 'user',
      content: userMessage,
      metadata: { messageType: 'text' }
    });

    setIsLoading(true);

    try {
      // Choose endpoint based on whether we have CV data
      const endpoint = cvProcessed && userProfile ? '/chat_with_cv' : '/chat';
      
      const requestBody: any = {
        message: userMessage,
        chat_phase: chatPhase,
        user_profile: userProfile,
        conversation_history: messages.slice(-10)
      };

      // Add CV profile data if available
      if (cvProcessed && userProfile) {
        requestBody.cv_profile_data = userProfile;
      }

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log("Chat response data:", data);
      // Add bot response
      addMessage({
        type: 'bot',
        content: data.response,
        metadata: {
          messageType: data.message_type || 'text',
          jobs: data.jobs,
          profileData: data.profile_data,
          suggestions: data.suggestions
        }
      });

      // Update state based on response
      if (data.profile_data) {
        setUserProfile(prev => ({ ...prev, ...data.profile_data }));
      }
      if (data.chat_phase) {
        setChatPhase(data.chat_phase);
      }

    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        type: 'bot',
        content: "Sorry, I encountered an error. Please try again or check if the backend server is running.",
        metadata: { messageType: 'text' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file || file.size > 10 * 1024 * 1024) {
      addMessage({
        type: 'bot',
        content: "Please upload a valid CV file under 10MB (PDF, DOC, DOCX, PNG, JPG supported).",
        metadata: { messageType: 'text' }
      });
      return;
    }

    // Add upload message
    addMessage({
      type: 'user',
      content: `📄 Uploaded: ${file.name}`,
      metadata: { 
        messageType: 'cv_upload',
        uploadStatus: 'uploading',
        fileName: file.name
      }
    });

    // Add processing message
    addMessage({
      type: 'bot',
      content: "📄 Processing your CV... I'm extracting text, analyzing structure, identifying skills, and matching jobs using advanced AI.",
      metadata: { 
        messageType: 'cv_upload',
        uploadStatus: 'processing'
      }
    });

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('cv_file', file);

      // Use the enhanced CV upload endpoint
      const response = await fetch(`${apiUrl}/upload_cv`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success && data.profile) {
        const profile = data.profile;
        setUserProfile(profile);
        setChatPhase('cv_analysis');
        setCvProcessed(true);

        // Add comprehensive analysis message
        addMessage({
          type: 'bot',
          content: data.message,
          metadata: {
            messageType: 'cv_results',
            profileData: profile,
            jobs: data.jobs || [],
            uploadStatus: 'complete',
            processingTime: data.processing_time_ms,
            confidenceScore: data.confidence_score,
            recommendations: data.recommendations || []
          }
        });

        // If we have job matches, add them
        if (data.jobs && data.jobs.length > 0) {
          addMessage({
            type: 'bot',
            content: `🎯 Great news! I found ${data.jobs.length} job matches based on your CV analysis. Here are the top opportunities:`,
            metadata: {
              messageType: 'job_results',
              jobs: data.jobs,
              suggestions: []
            }
          });

          // Automatically get course recommendations based on job results
          setTimeout(() => {
            handleCourseRecommendation(data.jobs, profile.skills || []);
          }, 2000);
        }

        // Add recommendations if available
        if (data.recommendations && data.recommendations.length > 0) {
          addMessage({
            type: 'bot',
            content: "Here are some recommendations to improve your profile:",
            metadata: {
              messageType: 'recommendations',
              recommendations: data.recommendations,
              suggestions: []
            }
          });
        }

      } else {
        addMessage({
          type: 'bot',
          content: data.message || "I couldn't extract enough information from your CV. Let's chat to build your profile instead!",
          metadata: { 
            messageType: 'text',
            uploadStatus: 'error',
            suggestions: []
          }
        });
        setChatPhase('profile_building');
      }
    } catch (error) {
      console.error('CV upload error:', error);
      addMessage({
        type: 'bot',
        content: "Error processing your CV. Let's continue with a conversation instead!",
        metadata: { 
          messageType: 'text',
          uploadStatus: 'error',
          suggestions: []
        }
      });
      setChatPhase('profile_building');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Handle special suggestions differently
    if (suggestion === 'Upload my CV') {
      triggerFileUpload();
      return;
    }
    
    if (suggestion === 'Build profile through chat') {
      // Set up for conversational profile building
      setChatPhase('profile_building');
      setInputValue('');
      
      addMessage({
        type: 'user',
        content: 'Build profile through chat',
        metadata: { messageType: 'text' }
      });

      addMessage({
        type: 'bot',
        content: "Great! I'll help you build your profile step by step. Let's start with your skills. What technologies, programming languages, or job skills do you have? For example: 'I know Python, JavaScript, and SQL' or 'I have experience in data entry and customer service'.",
        metadata: { 
          messageType: 'text',
          suggestions: ['I know Python and JavaScript', 'I have data entry skills', 'I am a graphic designer', 'I work in customer service']
        }
      });
      return;
    }
    
    // For other suggestions, use the default behavior
    setInputValue(suggestion);
    // Auto-send the suggestion
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const formatSalary = (amount: number): string => {
    if (amount > 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount > 1000) {
      return `₹${Math.round(amount / 1000)}K`;
    }
    return `₹${amount}`;
  };

  const getMatchColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (percentage >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const renderMessage = (message: Message) => {
    const isBot = message.type === 'bot';
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'} mb-6`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
          isBot 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
        }`}>
          {isBot ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-2xl ${isBot ? '' : 'text-right'}`}>
          <div className={`inline-block p-4 rounded-2xl shadow-sm ${
            isBot 
              ? 'bg-white border border-slate-200 text-slate-800' 
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
          }`}>
            
            {/* Regular text message */}
            {message.metadata?.messageType === 'text' && (
              <div className="space-y-3">
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                
                {/* Suggestions */}
                {message.metadata.suggestions && message.metadata.suggestions.length > 0 && 
                 !message.content.includes('No jobs are available') && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {message.metadata.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                          suggestion === 'Upload my CV' 
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200'
                            : suggestion === 'Build profile through chat'
                            ? 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border-indigo-200'
                        }`}
                      >
                        {suggestion === 'Upload my CV' && '📄 '}
                        {suggestion === 'Build profile through chat' && '💬 '}
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CV Upload message */}
            {message.metadata?.messageType === 'cv_upload' && (
              <div className="flex items-center gap-3">
                {message.metadata.uploadStatus === 'uploading' && <Loader2 className="h-5 w-5 animate-spin" />}
                {message.metadata.uploadStatus === 'processing' && <Zap className="h-5 w-5 animate-pulse" />}
                {message.metadata.uploadStatus === 'complete' && <Check className="h-5 w-5 text-green-600" />}
                {message.metadata.uploadStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                <FileText className="h-5 w-5" />
                <span className="font-medium">{message.content}</span>
              </div>
            )}

            {/* Enhanced CV Results */}
            {message.metadata?.messageType === 'cv_results' && message.metadata.profileData && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                {/* Processing Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 rounded-lg p-3">
                  {message.metadata.processingTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {message.metadata.processingTime}ms
                    </span>
                  )}
                  {message.metadata.confidenceScore && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {(message.metadata.confidenceScore * 100).toFixed(0)}% confidence
                    </span>
                  )}
                </div>

                {/* Enhanced Profile Summary */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 space-y-4 border border-slate-200">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <User className="h-4 w-4 text-indigo-600" />
                    Extracted Profile Data
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {/* Personal Info */}
                    <div className="space-y-2">
                      {message.metadata.profileData.name && (
                        <div>
                          <span className="text-slate-600 font-medium">Name:</span>
                          <p className="font-semibold text-slate-800">{message.metadata.profileData.name}</p>
                        </div>
                      )}
                      
                      {message.metadata.profileData.email && (
                        <div>
                          <span className="text-slate-600 font-medium">Email:</span>
                          <p className="font-semibold text-slate-800">{message.metadata.profileData.email}</p>
                        </div>
                      )}
                      
                      {message.metadata.profileData.location && (
                        <div>
                          <span className="text-slate-600 font-medium">Location:</span>
                          <p className="font-semibold text-slate-800">{message.metadata.profileData.location}</p>
                        </div>
                      )}
                    </div>

                    {/* Professional Info */}
                    <div className="space-y-2">
                      {message.metadata.profileData.experience && message.metadata.profileData.experience.length > 0 && (
                        <div>
                          <span className="text-slate-600 font-medium">Experience:</span>
                          <p className="font-semibold text-slate-800">{message.metadata.profileData.experience.length} positions</p>
                        </div>
                      )}
                      
                      {message.metadata.profileData.education && message.metadata.profileData.education.length > 0 && (
                        <div>
                          <span className="text-slate-600 font-medium">Education:</span>
                          <p className="font-semibold text-slate-800">{message.metadata.profileData.education.length} entries</p>
                        </div>
                      )}
                      
                      {message.metadata.profileData.certifications && message.metadata.profileData.certifications.length > 0 && (
                        <div>
                          <span className="text-slate-600 font-medium">Certifications:</span>
                          <p className="font-semibold text-slate-800">{message.metadata.profileData.certifications.length} found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <span className="text-slate-600 font-medium">Extracted Skills ({message.metadata.profileData.skills?.length || 0}):</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {message.metadata.profileData.skills?.slice(0, 15).map((skill, idx) => (
                        <span key={idx} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {message.metadata.profileData.skills?.length > 15 && (
                        <span className="text-slate-500 text-xs">+{message.metadata.profileData.skills.length - 15} more</span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {message.metadata.profileData.summary && (
                    <div>
                      <span className="text-slate-600 font-medium">Professional Summary:</span>
                      <p className="text-sm text-slate-700 mt-1 italic">"{message.metadata.profileData.summary.slice(0, 150)}..."</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Job Results */}
            {message.metadata?.messageType === 'job_results' && message.metadata.jobs && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="space-y-3">
                  {message.metadata.jobs.slice(0, 5).map((job) => (
                    <div key={job.ncspjobid} className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 space-y-3 border border-slate-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-lg">{job.title}</h4>
                          <p className="text-slate-600 font-medium">{job.organization_name}</p>
                          {job.functionalrolename && (
                            <p className="text-slate-500 text-sm">{job.functionalrolename}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getMatchColor(job.match_percentage)}`}>
                          {job.match_percentage}% Match
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.districtname}, {job.statename}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.aveexp} years exp
                        </span>
                        <span className="flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {formatSalary(job.avewage)}/month
                        </span>
                      </div>

                      {/* Skills Matched */}
                      {job.skills_matched && job.skills_matched.length > 0 && (
                        <div>
                          <span className="text-xs text-slate-600 font-medium">Skills Matched:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.skills_matched.slice(0, 5).map((skill, idx) => (
                              <span key={idx} className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <button 
                        onClick={() => handleJobClick(job)}
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Job Details
                      </button>
                    </div>
                  ))}
                  
                  {message.metadata.jobs.length > 5 && (
                    <div className="text-center">
                      <p className="text-xs text-slate-600">
                        Showing 5 of {message.metadata.jobs.length} matches. Ask me to show more!
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Suggestions */}
                {message.metadata.suggestions && message.metadata.suggestions.length > 0 && 
                 !message.content.includes('No jobs are available') && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {message.metadata.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium transition-colors border border-indigo-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {message.metadata?.messageType === 'recommendations' && message.metadata.recommendations && (
              <div className="space-y-3">
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <div className="space-y-2">
                    {message.metadata.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-600 mt-1">•</span>
                        <span className="text-slate-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Suggestions */}
                {message.metadata.suggestions && message.metadata.suggestions.length > 0 && 
                 !message.content.includes('No jobs are available') && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {message.metadata.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-sm font-medium transition-colors border border-amber-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Course Recommendations */}
            {message.metadata?.messageType === 'course_recommendations' && message.metadata.courses && (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="space-y-3">
                  {message.metadata.courses.map((course: Course, idx: number) => (
                    <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 space-y-3 border border-green-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-lg">{course.course_name}</h4>
                          <p className="text-green-600 font-medium">{course.platform}</p>
                          <p className="text-slate-600 text-sm">by {course.educator}</p>
                        </div>
                        <div className="text-right">
                          <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium mb-1">
                            {course.skill_covered}
                          </div>
                          {course.rating && (
                            <div className="text-yellow-600 text-sm">★ {course.rating}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </span>
                        {course.difficulty_level && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {course.difficulty_level}
                          </span>
                        )}
                      </div>

                      <button 
                        onClick={() => window.open(course.link, '_blank')}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Course
                      </button>
                    </div>
                  ))}
                </div>

                {/* Action Suggestions */}
                {message.metadata.suggestions && message.metadata.suggestions.length > 0 && 
                 !message.content.includes('No jobs are available') && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {message.metadata.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium transition-colors border border-green-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <p className="text-xs text-slate-500 mt-2 px-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Job Details Modal */}
      <JobModal 
        job={selectedJob} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
      {/* Header */}
      {/* <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Back to Home"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">AI Career Assistant</h1>
                <p className="text-sm text-slate-600">
                  {cvProcessed ? 'CV analyzed - finding perfect matches' : 'Find your perfect job match through conversation'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {userProfile && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-full text-sm font-medium">
                  <Check className="h-4 w-4" />
                  {cvProcessed ? 'CV Processed' : 'Profile Ready'}
                </div>
              )}
              
              {userProfile?.confidence_score && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  {(userProfile.confidence_score * 100).toFixed(0)}% Quality
                </div>
              )}
              
              <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-full text-sm font-medium">
                <MessageCircle className="h-4 w-4" />
                {messages.length - 1} messages
              </div>
            </div>
          </div>
        </div>
      </header> */}
      <Header />
      <div className="max-w-4xl mx-auto px-2">
        <nav className="text-sm text-slate-600 mb-2" aria-label="Breadcrumb">
          <ol className="list-reset flex">
            <li><Link to="/" className="text-indigo-600 hover:underline">
                Home
                </Link></li>
              <li><span className="mx-2">/</span></li>
              <li>AI Career Assistant</li>
          </ol>
        </nav>
      </div>
      <div>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBackToHome && (
                <button
                  onClick={onBackToHome}
                  className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Back to Home"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">AI Career Assistant</h1>
                <p className="text-sm text-slate-600">
                  {cvProcessed ? 'CV analyzed - finding perfect matches' : 'Find your perfect job match through conversation'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {userProfile && (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-full text-sm font-medium">
                  <Check className="h-4 w-4" />
                  {cvProcessed ? 'CV Processed' : 'Profile Ready'}
                </div>
              )}
              
              {userProfile?.confidence_score && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  {(userProfile.confidence_score * 100).toFixed(0)}% Quality
                </div>
              )}
              
              <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-2 rounded-full text-sm font-medium">
                <MessageCircle className="h-4 w-4" />
                {messages.length - 1} messages
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 overflow-hidden">
          
          {/* Messages */}
          <div className="h-[70vh] overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
            <AnimatePresence>
              {messages.map(renderMessage)}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 mb-6"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-md">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                    <span className="text-slate-600">
                      {cvProcessed ? 'Finding job matches...' : 'AI is thinking...'}
                    </span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white/90 backdrop-blur-sm p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={triggerFileUpload}
                className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm border border-slate-200 hover:border-indigo-200"
                title="Upload CV (PDF, DOC, DOCX, PNG, JPG)"
                disabled={isLoading}
              >
                <Paperclip className="h-5 w-5" />
              </button>
              
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder={
                    cvProcessed 
                      ? "Ask about jobs, skills, or career advice..." 
                      : "Type your message or upload your CV..."
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-500"
                  disabled={isLoading}
                />
                
                {/* CV Status Indicator */}
                {cvProcessed && userProfile && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center gap-1 text-xs text-emerald-600">
                      <FileText className="h-3 w-3" />
                      <span>CV Active</span>
                    </div>
                  </div>
                )}
              </div>
              {/* Enhanced Voice Input Button with Bhasini API */}
              <VoiceInputButton
                onTranscript={handleVoiceTranscript}
                disabled={isLoading}
                bhasiniApiKey={bhasiniApiKey}
                bhasiniUserId={bhasiniUserId}
                showLanguageSelector={true}
                defaultLanguage="hi"
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
            />
            
            {/* Enhanced Status Bar */}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>Supported: PDF, DOC, DOCX, PNG, JPG • Max 10MB</span>
                
                
              </div>
              
              <div className="flex items-center gap-3">
                {cvProcessed && (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Check className="h-3 w-3" />
                    Enhanced mode active
                  </span>
                )}
                
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Quick Actions for CV Mode */}
            {cvProcessed && userProfile && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSuggestionClick('Show more jobs')}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-indigo-200 flex items-center gap-1"
                  >
                    <Briefcase className="h-3 w-3" />
                    More Jobs
                  </button>
                  
                  <button
                    onClick={() => handleSuggestionClick('Analyze skill gaps')}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-amber-200 flex items-center gap-1"
                  >
                    <TrendingUp className="h-3 w-3" />
                    Skill Gaps
                  </button>
                  
                  <button
                    onClick={() => {
                      if (userProfile?.skills) {
                        // Get last job results from messages
                        const lastJobMessage = messages.find(m => m.metadata?.messageType === 'job_results');
                        if (lastJobMessage?.metadata?.jobs) {
                          handleCourseRecommendation(lastJobMessage.metadata.jobs, userProfile.skills);
                        } else {
                          handleSuggestionClick('Recommend courses for my skills');
                        }
                      }
                    }}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-emerald-200 flex items-center gap-1"
                  >
                    <BookOpen className="h-3 w-3" />
                    Get Courses
                  </button>
                  
                  <button
                    onClick={() => handleSuggestionClick('Search by location')}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-purple-200 flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    Location
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes wave {
            0%, 100% { height: 20px; }
            50% { height: 40px; }
          }
        `}
      </style>
    </div>
  );
};

export default ChatPage;