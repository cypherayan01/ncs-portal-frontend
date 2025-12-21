import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  IndianRupee, 
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
  MessageCircle,
  Bot,
  BookOpen,
  Clock4,
  Smile,
  Trophy,
  Lightbulb,
  PlusCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ToggleSwitch from './ToggleSwitch';
import ChatPage from './ChatPage';
import Header from './Header';
import JobFilters from './components/JobFilters';
import { useSearchSuggestions } from './hooks/useSearchSuggestions';

// Course recommendation interface
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

// Enhanced job interface that works with both search and upload
interface EnhancedJob {
  ncspjobid: string;
  title: string;
  organization_name: string;
  match_percentage: number;
  score: number;
  statename: string;
  districtname: string;
  avewage: number;
  aveexp: number;
  keywords: string;
  description: string;
  functionalrolename: string;
  industryname: string;
  sectorname?: string;
  highestqualification?: string;
  skills_matched?: string[];
  similarity_score: number;
  numberofopenings?: number;
  gendercode?: string;
  date?: string;
}

// Interface for overall course recommendations response
interface OverallRecommendationsResponse {
  recommendations: CourseRecommendation[];
  keywords_processed: string[];
  total_recommendations: number;
  processing_time_ms: number;
}

interface ProcessedJob extends EnhancedJob {
  skillsArray: string[];
  genderText: string;
  experienceText: string;
  salaryText: string;
}

interface ActiveFilters {
  sector: string[];
  location: string[];
  industry: string[];
  experience: string[];
  qualification: string[];
  salary: string[];
}

interface ApiResponse {
  jobs: EnhancedJob[];
}

// Main App Component
const EnhancedApp: React.FC = () => {
  const apiUrl = import.meta.env.VITE_SEARCH_JOBS_URL;
  const searchEndpoint = import.meta.env.VITE_SEARCH_ENDPOINT || 'search_jobs';
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');

  // Skills search state
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const inputRef = useRef<HTMLDivElement>(null);

  // Jobs state
  const [jobs, setJobs] = useState<ProcessedJob[]>([]);
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Search trigger
  const [searchTrigger, setSearchTrigger] = useState<number>(0);

  // Course recommendations state
  const [overallRecommendations, setOverallRecommendations] = useState<CourseRecommendation[]>([]);
  const [skillsWithRecommendations, setSkillsWithRecommendations] = useState<string[]>([]);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);
  const [showOverallRecommendations, setShowOverallRecommendations] = useState<boolean>(false);

  // Filter state
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    sector: [],
    location: [],
    industry: [],
    experience: [],
    qualification: [],
    salary: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Use the search suggestions hook
  const { suggestions, loading: suggestionsLoading, fetchSuggestions } = useSearchSuggestions({
    apiUrl
  });

  // Debounced input effect for API suggestions - only when user types (2+ chars)
  useEffect(() => {
    if (inputValue.trim().length < 2) {
      // Don't show suggestions for empty or very short input
      return;
    }
    
    const timeoutId = setTimeout(() => {
      fetchSuggestions(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, fetchSuggestions]);

  // Skills management
  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setInputValue('');
      setShowSuggestions(false);
      // Clear suggestions immediately when skill is added
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

  // Process job data to ensure consistency
  const processJobData = (backendJobs: EnhancedJob[]): ProcessedJob[] => {
    return backendJobs.map(job => ({
      ...job,
      skillsArray: job.keywords.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0),
      genderText: job.gendercode === 'A' ? 'Any' : job.gendercode === 'M' ? 'Male' : job.gendercode === 'F' ? 'Female' : 'Any',
      experienceText: job.aveexp ? `${job.aveexp} years` : 'Any',
      salaryText: job.avewage ? `₹${(job.avewage / 1000).toFixed(0)}K per month` : 'Not specified'
    }));
  };

  // Function to get unmatched skills for overall recommendations
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

  // Function to fetch skill-specific course recommendations
  const fetchSkillSpecificRecommendations = async (skills: string[]) => {
    setLoadingRecommendations(true);
    try {
      console.log('Fetching skill-specific recommendations for:', skills);

      const response = await fetch(`${apiUrl}/recommend_course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keywords_unmatched: skills
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OverallRecommendationsResponse = await response.json();
      console.log('Received skill-specific recommendations:', data);
      
      // Append to existing recommendations instead of replacing
      setOverallRecommendations(prev => {
        const existingCourses = prev.map(course => course.course_name);
        const newCourses = (data.recommendations || []).filter(course => 
          !existingCourses.includes(course.course_name)
        );
        return [...prev, ...newCourses];
      });
      
    } catch (err) {
      console.error('Error fetching skill-specific recommendations:', err);
      
      // Mock data for demo - also append instead of replace
      const mockRecommendations: CourseRecommendation[] = [
        {
          course_name: `${skills[0]} Masterclass`,
          platform: "Udemy",
          duration: "25 hours",
          link: "https://www.udemy.com/course/example/",
          educator: "Expert Instructor",
          skill_covered: skills[0],
          difficulty_level: "Intermediate",
          rating: "4.5/5"
        }
      ];
      
      setOverallRecommendations(prev => {
        const existingCourses = prev.map(course => course.course_name);
        const newCourses = mockRecommendations.filter(course => 
          !existingCourses.includes(course.course_name)
        );
        return [...prev, ...newCourses];
      });
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Function to fetch overall course recommendations
  const fetchOverallRecommendations = async (unmatchedSkills: string[]) => {
    setLoadingRecommendations(true);
    try {
      console.log('Fetching recommendations for unmatched skills:', unmatchedSkills);
      console.log('skills:', selectedSkills);
      
      // Use dynamic unmatched skills instead of hardcoded pool
      const randomThree = unmatchedSkills.sort(() => Math.random() - 0.5).slice(0, 4);
      console.log('Selected skills for recommendations:', randomThree);

      const response = await fetch(`${apiUrl}/recommend_course`, {
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
      setSkillsWithRecommendations((data.keywords_processed || []).filter(skill => skill !== "NA"));
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

  // Toggle skill recommendations expansion
  const toggleSkillRecommendations = async (skill: string) => {
    const newExpanded = new Set(expandedSkills);
    if (newExpanded.has(skill)) {
      newExpanded.delete(skill);
    } else {
      newExpanded.add(skill);
      // Fetch recommendations for this specific skill if not already loaded
      if (!overallRecommendations.some(rec => rec.skill_covered.toLowerCase().includes(skill.toLowerCase()))) {
        await fetchSkillSpecificRecommendations([skill]);
      }
    }
    setExpandedSkills(newExpanded);
  };

  // Fetch jobs by skills
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
      
      console.log('Sending to backend:', { skills: skills, limit: 10 });

      const response = await fetch(`${apiUrl}/${searchEndpoint}`, {
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

      // After getting jobs, fetch overall recommendations for unmatched skills
      if (processedJobs.length > 0) {
        const unmatchedSkills = getUnmatchedSkills(processedJobs, skills);
        if (unmatchedSkills.length > 0) {
          await fetchOverallRecommendations(unmatchedSkills);
        }
      }
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };


  // Filter jobs based on active filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Check industry filter
      if (activeFilters.industry.length > 0 && !activeFilters.industry.includes(job.industryname || 'Not specified')) {
        return false;
      }
      
      // Check location filter
      if (activeFilters.location.length > 0) {
        const jobLocation = `${job.districtname}, ${job.statename}`;
        if (!activeFilters.location.includes(jobLocation)) {
          return false;
        }
      }
      
      // Check experience filter
      if (activeFilters.experience.length > 0) {
        const exp = job.aveexp;
        let experienceLevel = 'Entry Level (0 years)';
        if (exp === 0) experienceLevel = 'Entry Level (0 years)';
        else if (exp <= 2) experienceLevel = 'Junior (1-2 years)';
        else if (exp <= 5) experienceLevel = 'Mid-level (3-5 years)';
        else if (exp <= 8) experienceLevel = 'Senior (6-8 years)';
        else experienceLevel = 'Lead (8+ years)';
        
        if (!activeFilters.experience.includes(experienceLevel)) {
          return false;
        }
      }
      
      // Check salary filter
      if (activeFilters.salary.length > 0) {
        const salary = job.avewage;
        let salaryRange = 'Under ₹30K';
        if (salary <= 30000) salaryRange = 'Under ₹30K';
        else if (salary <= 50000) salaryRange = '₹30K - ₹50K';
        else if (salary <= 75000) salaryRange = '₹50K - ₹75K';
        else if (salary <= 100000) salaryRange = '₹75K - ₹100K';
        else salaryRange = 'Above ₹100K';
        
        if (!activeFilters.salary.includes(salaryRange)) {
          return false;
        }
      }
      
      // Check qualification filter
      if (activeFilters.qualification.length > 0 && job.highestqualification) {
        if (!activeFilters.qualification.includes(job.highestqualification)) {
          return false;
        }
      }
      
      return true;
    });
  }, [jobs, activeFilters]);

  useEffect(() => {
    if (searchTrigger > 0) {
      fetchJobs(selectedSkills);
    }
  }, [searchTrigger]);

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

  if (currentView === 'chat') {
    return <ChatPage onBack={() => setCurrentView('home')} />;
  }

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
      <Header />

      {/* Search Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="relative py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Find Your Perfect Job Match with AI
              </h2>
              <p className="text-xl text-indigo-100 mb-2">
                Search by skills to find your perfect job match
              </p>
              <p className="text-indigo-200">
                Our intelligent system analyzes your profile and recommends the best opportunities
              </p>
            </div>

            {/* Toggle Above Searchbar */}
            <div className="px-6 pt-6">
              <ToggleSwitch />
            </div>

            {/* Skills Search */}
              <div className="relative z-40" ref={inputRef}>
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
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder={selectedSkills.length === 0 ? "Enter your skills (e.g., React, Python, SQL...)" : ""}
                      className="w-full px-2 py-1 text-lg bg-transparent border-0 focus:ring-0 focus:outline-none placeholder-slate-500"
                      disabled={loading}
                    />
                    {/* Autocomplete suggestions - only show when user has typed 2+ chars */}
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && inputValue.trim().length >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50"
                        >
                          {suggestions.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => addSkill(skill)}
                              className="w-full text-left px-4 py-3 text-slate-700 hover:bg-indigo-50 transition-colors flex items-center gap-2"
                            >
                              <Target className="h-4 w-4 text-indigo-500" />
                              {skill}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {/* Search Button */}
                  <button
                    onClick={handleSearchClick}
                    disabled={loading || selectedSkills.length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className="h-6 w-6" />
                  </button>
                </div>
              </div>

            {error && (
              <div className="mt-4 text-center">
                <div className="bg-red-100/80 backdrop-blur-sm text-red-700 px-4 py-3 rounded-lg inline-flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {error}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Filters and Results */}
        {(jobs.length > 0 || loading) && (
          <JobFilters
            jobs={jobs}
            filteredJobs={filteredJobs}
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
        )}

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <div key={job.ncspjobid} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20">
              {/* Job Header */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-4 rounded-xl">
                        <Building className="h-8 w-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-2xl font-bold text-slate-900">{job.title}</h4>
                          {/* <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getMatchScoreColor(job.match_percentage)}`}>
                            <div className="flex items-center gap-2">
                              {getMatchScoreIcon(job.match_percentage)}
                              {job.match_percentage}% Match
                            </div>
                          </span> */}
                        </div>
                        <p className="text-lg font-medium text-slate-700 mb-1">{job.organization_name}</p>
                        <p className="text-slate-600">{job.functionalrolename} • {job.numberofopenings || 'Multiple'} openings</p>
                      </div>
                    </div>
                  </div>
                  <div className={`w-20 h-20 rounded-2xl ${getMatchScoreBadgeColor(job.match_percentage)} flex items-center justify-center text-white shadow-lg`}>
                    <div className="text-center">
                      <div className="text-xl font-bold">{Math.round(job.match_percentage)}%</div>
                      <div className="text-xs opacity-90">MATCH</div>
                    </div>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl">
                    <MapPin className="h-5 w-5 text-indigo-500" />
                    <div>
                      <div className="text-sm text-slate-500">Location</div>
                      <div className="font-semibold text-slate-700">{job.districtname}, {job.statename}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl">
                    <Clock className="h-5 w-5 text-emerald-500" />
                    <div>
                      <div className="text-sm text-slate-500">Experience</div>
                      <div className="font-semibold text-slate-700">{job.experienceText}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl">
                    <IndianRupee className="h-5 w-5 text-amber-500" />
                    <div>
                      <div className="text-sm text-slate-500">Salary</div>
                      <div className="font-semibold text-slate-700">{job.salaryText}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-xl">
                    <Briefcase className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="text-sm text-slate-500">Industry</div>
                      <div className="font-semibold text-slate-700">{job.industryname}</div>
                    </div>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-slate-600 mb-3">Required Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsArray.map((skill, index) => {
                      const isMatched = selectedSkills.some(
                        (term) => term.toLowerCase().replace(/\s+/g, '') === skill.toLowerCase().replace(/\s+/g, '')
                      ) || (job.skills_matched && job.skills_matched.some(
                        (matched) => matched.toLowerCase().replace(/\s+/g, '') === skill.toLowerCase().replace(/\s+/g, '')
                      ));
                      
                      return (
                        <span 
                          key={index} 
                          className={`px-4 py-2 rounded-full text-sm font-medium border ${
                            isMatched 
                              ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200' 
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {skill}
                          {isMatched && <Star className="inline h-3 w-3 ml-1" />}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleJobExpansion(job.ncspjobid)}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                  >
                    <FileText className="h-4 w-4" />
                    {expandedJobs.has(job.ncspjobid) ? 'Hide Details' : 'View Details'}
                    {expandedJobs.has(job.ncspjobid) ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </button>
                  <div className="flex gap-3">
                    <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105">
                      Save Job
                    </button>
                    <button
                      onClick={() => handleApplyJob(job)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2 shadow-lg"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Details */}
              {expandedJobs.has(job.ncspjobid) && (
                <div className="border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm">
                  <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-6">
                        <div className="bg-white/60 p-6 rounded-xl">
                          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-indigo-500" />
                            Job Details
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Industry:</span>
                              <span className="font-medium text-slate-900">{job.industryname}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Functional Role:</span>
                              <span className="font-medium text-slate-900">{job.functionalrolename}</span>
                            </div>
                            {job.date && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">Posted Date:</span>
                                <span className="font-medium text-slate-900">{formatDate(job.date)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-slate-600">Gender:</span>
                              <span className="font-medium text-slate-900">{job.genderText}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-white/60 p-6 rounded-xl">
                          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5 text-emerald-500" />
                            Match Analysis
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600 text-sm">Overall Match</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-slate-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${job.match_percentage >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : job.match_percentage >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                    style={{ width: `${job.match_percentage}%` }}
                                  ></div>
                                </div>
                                <span className="font-bold text-slate-900">{Math.round(job.match_percentage)}%</span>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500">
                              Based on skills, experience, and role relevance
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 p-6 rounded-xl mb-6">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-purple-500" />
                        Job Description
                      </h4>
                      <p className="text-slate-700 leading-relaxed">{job.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                      <div className={`px-6 py-3 rounded-xl border ${getMatchScoreColor(job.match_percentage)}`}>
                        <div className="flex items-center gap-2">
                          {getMatchScoreIcon(job.match_percentage)}
                          <span className="font-bold">Match Score: {Math.round(job.match_percentage)}%</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => toggleJobExpansion(job.ncspjobid)}
                          className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                        >
                          Collapse Details
                        </button>
                        <button
                          onClick={() => handleApplyJob(job)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 hover:scale-105 shadow-lg"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Apply for This Job
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Course Recommendations Section */}
        {showOverallRecommendations && skillsWithRecommendations.length > 0 && (
          <div className="mt-16 mb-8">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-8 border border-purple-200">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  Boost Your Job Opportunities
                </h3>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Complete courses in these skills to unlock more job opportunities and increase your match scores with top employers.
                </p>
              </div>

              {/* Skills with expandable course recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {skillsWithRecommendations.map((skill) => (
                  <div key={skill} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/40">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-3 rounded-xl">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{skill}</h4>
                          <p className="text-sm text-slate-600">High demand skill</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleSkillRecommendations(skill)}
                        disabled={loadingRecommendations}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
                      >
                        {loadingRecommendations ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : expandedSkills.has(skill) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <PlusCircle className="h-4 w-4" />
                        )}
                        {expandedSkills.has(skill) ? 'Hide' : 'View'} Courses
                      </button>
                    </div>
                    
                    {/* Expandable course recommendations for this skill */}
                    <AnimatePresence>
                      {expandedSkills.has(skill) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-3"
                        >
                          {overallRecommendations
                            .filter(course => course.skill_covered.toLowerCase().includes(skill.toLowerCase()))
                            .map((course, index) => (
                              <a
                                key={index}
                                href={course.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block bg-slate-50/80 rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 bg-indigo-100 p-2 rounded-lg text-indigo-600">
                                    <BookOpen className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1">
                                    <h5 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                      {course.course_name}
                                    </h5>
                                    <p className="text-xs text-slate-600 mt-1">{course.platform}</p>
                                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                      <span className="flex items-center gap-1">
                                        <Clock4 className="h-3 w-3" />
                                        {course.duration}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Trophy className="h-3 w-3" />
                                        {course.difficulty_level}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Smile className="h-3 w-3" />
                                        {course.rating}
                                      </span>
                                    </div>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                </div>
                              </a>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-slate-600 mb-4">
                  🚀 Complete these courses to stand out from other candidates and land your dream job!
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <Award className="h-4 w-4" />
                  <span>Recommended by AI based on current job market trends</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No jobs found */}
        {jobs.length === 0 && searchTrigger > 0 && !loading && (
          <div className="text-center py-16">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-slate-400 to-slate-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No Jobs Found</h3>
              <p className="text-slate-600 text-lg mb-6">
                We couldn't find any jobs matching "${selectedSkills.join(', ')}". Try adjusting your search terms or explore different skills.
              </p>
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 mb-4">Try searching for:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.slice(0, 6).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => addSkill(suggestion)}
                        className="bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-700 px-4 py-2 rounded-full text-sm transition-all duration-200 hover:scale-105"
                      >
                        {suggestion}
                      </button>
                    ))}
                    {suggestionsLoading && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading suggestions...</span>
                      </div>
                    )}
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* Loading state */}
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

        {/* Chat Access Button */}
        {/* <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setCurrentView('chat')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center gap-2"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="hidden sm:inline font-medium">Chat with AI</span>
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default EnhancedApp;