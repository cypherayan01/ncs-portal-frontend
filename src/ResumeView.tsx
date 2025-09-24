import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Users, 
  GraduationCap, 
  IndianRupee, 
  User, 
  FileText, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Building,
  Target,
  Award,
  TrendingUp,
  Loader2,
  RefreshCw,
  X,
  BookOpen, // New icon for courses
  Globe, // New icon for platform
  Clock4, // New icon for duration
  MonitorPlay, // New icon for educator
  Smile, // New icon for rating
  Trophy, // New icon for difficulty
  Tags, // New icon for skills
  Lightbulb, // New icon for overall recommendations
  PlusCircle // New icon for expand skills
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ToggleSwitch from './ToggleSwitch';

// --- Interfaces ---
interface CourseRecommendation {
  course_name: string;
  platform: string;
  duration: string;
  link: string;
  educator: string;
  skill_covered: string;
  difficulty_level: string;
  rating: string;
}

// UPDATED: BackendJob now includes a recommendations array
interface BackendJob {
  ncspjobid: string;
  title: string;
  match_percentage: number;
  similarity_score: number;
  keywords: string;
  description: string;
  date: string;
  organizationid: number;
  organization_name: string;
  numberofopenings: number;
  industryname: string;
  sectorname: string;
  functionalareaname: string;
  functionalrolename: string;
  aveexp: number;
  avewage: number;
  gendercode: string;
  highestqualification: string;
  statename: string;
  districtname: string;
  recommendations: CourseRecommendation[]; 
}

// UPDATED: Main API response now returns an array of jobs directly
interface ApiResponse {
  jobs: BackendJob[];
  // Global recommendations are no longer at the top level
}

interface ProcessedJob extends BackendJob {
  skillsArray: string[];
  genderText: string;
  experienceText: string;
  salaryText: string;
}

// NEW: Interface for overall course recommendations response
interface OverallRecommendationsResponse {
  recommendations: CourseRecommendation[];
  keywords_processed: string[];
  total_recommendations: number;
  processing_time_ms: number;
}

// --- Component Definition ---
const App: React.FC = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const [jobs, setJobs] = useState<ProcessedJob[]>([]);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [searchTrigger, setSearchTrigger] = useState<number>(0);

  // NEW: State for overall course recommendations
  const [overallRecommendations, setOverallRecommendations] = useState<CourseRecommendation[]>([]);
  const [skillsWithRecommendations, setSkillsWithRecommendations] = useState<string[]>([]);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);
  const [showOverallRecommendations, setShowOverallRecommendations] = useState<boolean>(false);

  const allSkills = useMemo(() => ['Software Development',
    'React', 'Python', 'JavaScript', 'SQL', 'Power BI', 
    'CSS', 'HTML', 'Data Analysis', 
    'Java', 'PostgreSQL', 'Django', 'Data Entry',
    'Spring Boot'
  ], []);

      const skills_pool = [
             "Python", "JavaScript", "React", "HTML/CSS", "SQL",
              "Django",  "Spring Boot", "Data Analysis", "Power BI"
           ]
          

  const boostPercentage = useMemo(() => {
    return Math.floor(Math.random() * (40 - 20 + 1)) + 20;
  }, []);

  const getBoostPercentage = (skill: string): number => {
  const skillValues: { [key: string]: number } = {
      'react': 32,
      'python': 28,
      'javascript': 35,
      'sql': 25,
      'java': 30,
      'django': 27,
      'spring boot': 33,
      'data analysis': 29,
      'power bi': 26,
      'html/css': 24,
      'postgresql': 31,
      'machine learning': 38,
      'node.js': 34,
      'mongodb': 29,
      'aws': 36,
      'docker': 33,
      'kubernetes': 37,
      'typescript': 32,
      'angular': 30,
      'vue': 28
    };
    
    const skillKey = skill.toLowerCase().trim();
    
    // If skill is in our predefined list, return that value
    if (skillValues[skillKey]) {
      return skillValues[skillKey];
    }
    
    // Otherwise, generate hash-based value
    let hash = 0;
    for (let i = 0; i < skill.length; i++) {
      const char = skill.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = Math.imul(hash, 0x5bd1e995);
      hash ^= hash >>> 15;
    }
    
    const positiveHash = Math.abs(hash);
    return (positiveHash % 21) + 20;
};

  const suggestions = useMemo(() => {
    if (!inputValue) return allSkills.slice(0, 8);
    return allSkills.filter(skill =>
      skill.toLowerCase().includes(inputValue.toLowerCase()) && !selectedSkills.includes(skill)
    ).slice(0, 8);
  }, [inputValue, allSkills, selectedSkills]);

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const handleSearchClick = () => {
    if (selectedSkills.length > 0) {
      setSearchTrigger(prev => prev + 1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // UPDATED: Process job data
  const processJobData = (backendJobs: BackendJob[]): ProcessedJob[] => {
    return backendJobs.map(job => ({
      ...job,
      skillsArray: job.keywords.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0),
      genderText: job.gendercode === 'A' ? 'Any' : job.gendercode === 'M' ? 'Male' : job.gendercode === 'F' ? 'Female' : 'Any',
      experienceText: job.aveexp ? `${job.aveexp} years` : 'Any',
      salaryText: job.avewage ? `₹${(job.avewage / 1000).toFixed(0)}K per month` : 'Not specified'
    }));
  };

  // NEW: Function to get unmatched skills for overall recommendations
  const getUnmatchedSkills = (jobs: ProcessedJob[], userSkills: string[]): string[] => {
    const allJobSkills = new Set<string>();
    jobs.forEach(job => {
      job.skillsArray.forEach(skill => {
        allJobSkills.add(skill);
      });
    });

    const userSkillsLower = userSkills.map(skill => skill);
    const unmatchedSkills = Array.from(allJobSkills).filter(
      jobSkill => !userSkillsLower.includes(jobSkill)
    );

    console.log(unmatchedSkills);
    return unmatchedSkills;
  };

  // NEW: Function to fetch overall course recommendations
  const fetchOverallRecommendations = async (unmatchedSkills: string[]) => {
    setLoadingRecommendations(true);
    try {
      console.log('Fetching recommendations for unmatched skills:', unmatchedSkills);
      console.log('skills:',selectedSkills);
      console.log('skills pool:',skills_pool);
      const result=skills_pool.filter(skill => !selectedSkills.includes(skill));
      
      const randomThree = result.sort(() => Math.random() - 0.5).slice(0, 4);
      console.log(randomThree);
      



      const response = await fetch('http://localhost:8000/recommend_courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords_unmatched: randomThree
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OverallRecommendationsResponse = await response.json();
      console.log('Received overall recommendations:', data);
      
      setOverallRecommendations(data.recommendations || []);
      setSkillsWithRecommendations(data.keywords_processed || []);
      setShowOverallRecommendations(true);
      
    } catch (err) {
      console.error('Error fetching overall recommendations:', err);
      
      // Mock data for demo
      const mockRecommendations: CourseRecommendation[] = [
        {
          course_name: "React - The Complete Guide",
          platform: "Udemy",
          duration: "40.5 hours",
          link: "https://www.udemy.com/course/react-the-complete-guide-incl-hooks-react-router-redux/",
          educator: "Maximilian Schwarzmüller",
          skill_covered: "React, Hooks, Redux",
          difficulty_level: "All Levels",
          rating: "4.7/5"
        },
         {
          course_name: "React - The Complete Guide",
          platform: "Udemy",
          duration: "40.5 hours",
          link: "https://www.udemy.com/course/react-the-complete-guide-incl-hooks-react-router-redux/",
          educator: "Maximilian Schwarzmüller",
          skill_covered: "React, Hooks, Redux",
          difficulty_level: "All Levels",
          rating: "4.7/5"
        },
        {
          course_name: "Complete SQL Bootcamp",
          platform: "Udemy",
          duration: "9 hours",
          link: "https://www.udemy.com/course/the-complete-sql-bootcamp/",
          educator: "Jose Portilla",
          skill_covered: "SQL, PostgreSQL",
          difficulty_level: "Beginner to Advanced",
          rating: "4.6/5"
        }
      ];
      
      setOverallRecommendations(mockRecommendations);
      setSkillsWithRecommendations(['React', 'SQL']);
      setShowOverallRecommendations(true);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchJobs = async (skills: string[]) => {
    setLoading(true);
    setError('');
    setJobs([]);
    setExpandedJobs(new Set());
    setShowOverallRecommendations(false);
    setOverallRecommendations([]);

    try {
      if (skills.length === 0) {
        setJobs([]);
        setLoading(false);
        return;
      }
      
      console.log('Sending to backend:', { skills: skills, limit: 15 });

      const response = await fetch('http://localhost:8000/search_jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: skills,
          limit: 10
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log('Received jobs:', data.jobs);
      const processedJobs = processJobData(data.jobs || []);
      setJobs(processedJobs);

      // NEW: After getting jobs, fetch overall recommendations for unmatched skills
      if (processedJobs.length > 0) {
        const unmatchedSkills = getUnmatchedSkills(processedJobs, skills);
        if (unmatchedSkills.length > 0) {
          await fetchOverallRecommendations(unmatchedSkills);
        }
      }
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to connect to backend. Showing demo data.');
     

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTrigger > 0) {
      fetchJobs(selectedSkills);
    }
  }, [searchTrigger]);

  const handleApplyJob = (job: ProcessedJob) => {
    setNotification({
      message: `Successfully applied for ${job.title} at ${job.organization_name}!`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const toggleJobExpansion = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  // NEW: Toggle skill recommendations expansion
  const toggleSkillRecommendations = async (skill: string) => {
    const newExpanded = new Set(expandedSkills);
    if (newExpanded.has(skill)) {
      newExpanded.delete(skill);
    } else {
      newExpanded.add(skill);
      // Fetch recommendations for this specific skill if not already loaded
      if (!overallRecommendations.some(rec => rec.skill_covered.toLowerCase().includes(skill.toLowerCase()))) {
        await fetchOverallRecommendations([skill]);
      }
    }
    setExpandedSkills(newExpanded);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

// Step 1: pick file
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setSelectedFile(file);
  }
};

// Step 2: upload on button click
const handleFileUpload = async () => {
  if (!selectedFile) {
    alert("Please select a file first!");
    return;
  }

  setLoading(true);
  setJobs([]);

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Upload failed");

    const data = await response.json();
    console.log("Upload response:", data);
    setJobs(data.matches || []); // show in your table
  } catch (err) {
    console.error("Error uploading file:", err);
  }finally {
      setLoading(false);
    }
};

  const getMatchScoreColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    if (score >= 40) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  const getMatchScoreBadgeColor = (score: number): string => {
    if (score >= 80) return 'bg-gradient-to-r from-emerald-500 to-teal-500';
    if (score >= 60) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    if (score >= 40) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    return 'bg-gradient-to-r from-slate-500 to-gray-500';
  };

  const getMatchScoreIcon = (score: number) => {
    if (score >= 80) return <Award className="h-4 w-4" />;
    if (score >= 60) return <Star className="h-4 w-4" />;
    if (score >= 40) return <Target className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };
  
  // --- Main JSX Return ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans text-slate-900">
      
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl shadow-lg border backdrop-blur-md"
            role="alert"
          >
            <div className={`flex items-center gap-2 ${notification.type === 'success' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-700 bg-slate-50 border-slate-200'}`}>
                {notification.type === 'success' && <Award className="h-5 w-5" />}
                <span className="font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side - Indian emblem + Ministry logo */}
            <div className="flex items-center space-x-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/d/d4/Ministry_of_Labour_and_Employment.png"
                alt="Indian Emblem"
                className="h-12 w-auto object-contain"
              />
            </div>
            {/* Right Side - G20 logo */}
            <div>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3KvIDJaZXcLi0Xf7WZICZPhxdrNwaSZtPtw&s"
                alt="G20 Logo"
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="relative py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Find Your Perfect Career Match with AI
              </h2>
              <p className="text-xl text-indigo-100 mb-2">
                Enter your skills and let AI find the perfect matches
              </p>
              <p className="text-indigo-200">
                Our intelligent system analyzes your skills and recommends the best opportunities
              </p>
            </div>
              {/* Toggle Above Searchbar */}
            <div className="px-6 pt-6">
                    <ToggleSwitch />
                  </div>
            {/* Multi-Tag Input Component with Search Button */}
            <div className="relative" ref={inputRef}>
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl -z-10"></div>
              <div className="relative bg-white/90 backdrop-blur-md rounded-2xl p-2 shadow-2xl flex flex-wrap items-center gap-2">
                
                {/* Render selected skills as tags */}
                {selectedSkills.map(skill => (
                  <motion.div
                    key={skill}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="text-indigo-500 hover:text-indigo-800 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}

                {/* Input field for new skills */}
                <div className="flex-1 min-w-[150px] relative">
                 <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  className="cursor-pointer"
                  disabled={loading}
                />
                  {/* Autocomplete suggestions */}
                  
                </div>
                {/* Search Button */}
                 <button
                  onClick={handleFileUpload}
                  disabled={loading || !selectedFile}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl 
                            transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  Upload Resume
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 text-center">
                <div className="bg-red-100/80 backdrop-blur-sm text-red-700 px-4 py-3 rounded-lg inline-flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {error} (Showing demo data)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
     
        

       {/* Jobs List */}
<div className="space-y-6">
  {jobs.filter(job => job.score * 100  > 50).length > 0  && (
    <div className="mt-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 m-4">
        {jobs.filter(job => job.score * 100 > 50).map((job, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300"
          >
            {/* Header with Job Title and Score */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-3">
                {job.job_title}
              </h3>
              <div className="bg-indigo-100 px-3 py-1 rounded-full flex-shrink-0">
                <span className="text-indigo-700 font-bold text-sm">
                  {(job.score * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-600 font-medium">Company:</span>
                <span className="text-sm text-gray-800">{job.company_name}</span>
              </div>
              {/* Experience */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-600 font-medium">Experience:</span>
                <span className="text-sm text-gray-800">{job.job_experience_required}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-600 font-medium">Location:</span>
                <span className="text-sm text-gray-800">{job.location}</span>
              </div>

              {/* Key Skills */}
              <div className="mt-4">
                <span className="text-sm text-gray-600 font-medium mb-2 block">Key Skills:</span>
                <div className="flex flex-wrap gap-2">
                  {job.key_skills.split(',').slice(0, 4).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                  {job.key_skills.split(',').length > 4 && (
                    <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-md text-xs font-medium">
                      +{job.key_skills.split(',').length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button (Optional) */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

        {/* NEW: Overall Course Recommendations Section */}
        

        

        {loading && (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Searching for Jobs...</h3>
              <p className="text-slate-600 text-lg">
                Our AI is analyzing your skills and finding the best matches. This won't take long!
              </p>
            </div>
          </div>
        )}
      </div>
    
  );
};

export default App;