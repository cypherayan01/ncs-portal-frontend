import React, { useState } from 'react';
import { 
  Upload,
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  X,
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Building,
  Award,
  Star,
  Target,
  TrendingUp,
  ExternalLink,
  User,
  Mail,
  Phone,
  GraduationCap,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Enhanced interfaces for the upload response
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
  skills_matched: string[];
  similarity_score: number;
}

interface CVProfile {
  skills: string[];
  confidence_score: number;
  experience: string[];
  education: string[];
  email: string;
  phone: string;
  summary: string;
}

interface UploadResponse {
  filename: string;
  size: number;
  skills_extracted: string[];
  total_matches: number;
  matches: EnhancedJob[];
  processing_time_ms: number;
  search_method: string;
  cv_profile?: CVProfile;
  search_steps?: {
    [key: string]: string;
  };
}

interface EnhancedCVUploadProps {
  apiUrl: string;
  onJobsUpdate: (jobs: EnhancedJob[]) => void;
}

const EnhancedCVUpload: React.FC<EnhancedCVUploadProps> = ({ apiUrl, onJobsUpdate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [showSteps, setShowSteps] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
      const fileExtension = '.' + file.name.toLowerCase().split('.').pop();
      
      if (!validTypes.includes(fileExtension)) {
        setError('Please upload a valid CV file (PDF, DOC, DOCX, PNG, JPG)');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      setUploadResult(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a CV file first!');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status: ${response.status}`);
      }

      const data: UploadResponse = await response.json();
      console.log('Enhanced upload response:', data);

      
      
      setUploadResult(data);
      onJobsUpdate(data.matches || []);
      
    } catch (err) {
      console.error('Error uploading CV:', err);
      setError('Failed to upload CV. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError('');
    setExpandedJobs(new Set());
    onJobsUpdate([]);
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

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload Your CV</h3>
          <p className="text-slate-600">
            Let our AI analyze your CV and find the best job matches for you
          </p>
        </div>

        {/* File Input */}
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-md">
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer cursor-pointer"
                disabled={uploading}
              />
            </div>
            
            {selectedFile && (
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                <FileText className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{selectedFile.name}</span>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <button
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing CV...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload & Analyze CV
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Upload Results */}
      <AnimatePresence>
        {uploadResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900">CV Analysis Complete!</h3>
                    <p className="text-emerald-700">
                      Found {uploadResult.total_matches} job matches in {uploadResult.processing_time_ms}ms
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearUpload}
                  className="text-emerald-600 hover:text-emerald-800"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Skills Extracted */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-emerald-800 mb-2">
                  Skills Extracted ({uploadResult.skills_extracted.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {uploadResult.skills_extracted.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* CV Profile Info */}
              {uploadResult.cv_profile && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white/60 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">Profile</span>
                    </div>
                    <p className="text-xs text-emerald-700">
                      Confidence: {(uploadResult.cv_profile.confidence_score * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">Contact</span>
                    </div>
                    <p className="text-xs text-emerald-700">{uploadResult.cv_profile.email}</p>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">Education</span>
                    </div>
                    <p className="text-xs text-emerald-700">
                      {uploadResult.cv_profile.education.length} entries
                    </p>
                  </div>
                </div>
              )}

              {/* Processing Steps */}
              {uploadResult.search_steps && (
                <div>
                  <button
                    onClick={() => setShowSteps(!showSteps)}
                    className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 text-sm font-medium mb-2"
                  >
                    Processing Steps
                    {showSteps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  
                  <AnimatePresence>
                    {showSteps && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1"
                      >
                        {Object.entries(uploadResult.search_steps).map(([step, description]) => (
                          <div key={step} className="text-xs text-emerald-600">
                            <span className="font-medium">{step.replace('_', ' ').replace(/\d+/, '')}</span>: {description}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Job Matches */}
            {uploadResult.matches.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900">
                  Job Matches ({uploadResult.matches.length})
                </h3>
                
                {uploadResult.matches.map((job) => (
                  <div
                    key={job.ncspjobid}
                    className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/20"
                  >
                    {/* Job Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-bold text-slate-900">{job.title}</h4>
                            
                          </div>
                          <p className="text-lg font-medium text-slate-700 mb-1">{job.organization_name}</p>
                          <p className="text-slate-600">{job.functionalrolename}</p>
                        </div>
                        <div className={`w-20 h-20 rounded-2xl ${getMatchScoreBadgeColor(job.match_percentage)} flex items-center justify-center text-white shadow-lg`}>
                          <div className="text-center">
                            <div className="text-xl font-bold">{Math.round(job.match_percentage)}%</div>
                            <div className="text-xs opacity-90">MATCH</div>
                          </div>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 p-3 bg-slate-50/80 rounded-xl">
                          <MapPin className="h-4 w-4 text-indigo-500" />
                          <div>
                            <div className="text-xs text-slate-500">Location</div>
                            <div className="font-medium text-slate-700">{job.districtname}, {job.statename}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50/80 rounded-xl">
                          <Clock className="h-4 w-4 text-emerald-500" />
                          <div>
                            <div className="text-xs text-slate-500">Experience</div>
                            <div className="font-medium text-slate-700">{job.aveexp} years</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50/80 rounded-xl">
                          <IndianRupee className="h-4 w-4 text-amber-500" />
                          <div>
                            <div className="text-xs text-slate-500">Salary</div>
                            <div className="font-medium text-slate-700">₹{(job.avewage / 1000).toFixed(0)}K/month</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50/80 rounded-xl">
                          <Building className="h-4 w-4 text-purple-500" />
                          <div>
                            <div className="text-xs text-slate-500">Industry</div>
                            <div className="font-medium text-slate-700">{job.industryname}</div>
                          </div>
                        </div>
                      </div>

                      {/* Matched Skills */}
                      {job.skills_matched && job.skills_matched.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-slate-600 mb-2">Matched Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {job.skills_matched.map((skill, index) => (
                              <span
                                key={index}
                                className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                              >
                                {skill}
                                <Star className="h-3 w-3" />
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

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
                          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-medium transition-all duration-200">
                            Save Job
                          </button>
                          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedJobs.has(job.ncspjobid) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm p-6"
                        >
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-purple-500" />
                                Job Description
                              </h4>
                              <p className="text-slate-700 leading-relaxed">{job.description}</p>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-bold text-slate-900 mb-2">Required Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                  {job.keywords.split(',').map((skill, index) => (
                                    <span
                                      key={index}
                                      className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"
                                    >
                                      {skill.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-bold text-slate-900 mb-2">Match Analysis</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Match Score</span>
                                    <span className="font-bold text-slate-900">{job.match_percentage}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedCVUpload;