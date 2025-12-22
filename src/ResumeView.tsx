import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';
import Header from './Header';
import EnhancedCVUpload from './components/EnhancedCVUpload';

// Enhanced job interface for CV upload results
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
  skills_matched?: string[];
  similarity_score: number;
}

// --- Component Definition ---
const ResumeView: React.FC = () => {
  const apiUrl = import.meta.env.VITE_SEARCH_JOBS_URL;
  const [jobs, setJobs] = useState<EnhancedJob[]>([]);

  // Handle CV upload job results
  const handleCVJobsUpdate = (cvJobs: EnhancedJob[]) => {
    console.log('Received jobs from CV upload:', cvJobs);
    setJobs(cvJobs);
  };






  
  // --- Main JSX Return ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-sans text-slate-900">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="relative py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Resume Analysis & Job Matching
              </h2>
              <p className="text-xl text-indigo-100 mb-2">
                Upload your CV and let AI find the perfect job matches
              </p>
              <p className="text-indigo-200">
                Our intelligent system analyzes your resume and recommends the best opportunities
              </p>
            </div>
              
            {/* Toggle Above Upload */}
            <div className="px-6 pt-6">
              <ToggleSwitch />
            </div>
          </div>
        </div>
      </div>

      {/* Resume Upload Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <EnhancedCVUpload
          apiUrl={apiUrl}
          onJobsUpdate={handleCVJobsUpdate}
        />
      </div>
    </div>
  );
};

export default ResumeView;