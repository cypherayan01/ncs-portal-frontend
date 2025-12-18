import React, { useState, useMemo } from 'react';
import { 
  Filter,
  Search,
  MapPin,
  Briefcase,
  Building,
  Clock,
  GraduationCap,
  ChevronDown,
  X,
  ArrowUpDown
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Enhanced job interface for filtering
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
}

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  extractValue: (job: EnhancedJob) => string | string[];
}

interface ActiveFilters {
  sector: string[];
  location: string[];
  industry: string[];
  experience: string[];
  qualification: string[];
  salary: string[];
}

interface JobFiltersProps {
  jobs: EnhancedJob[];
  filteredJobs: EnhancedJob[];
  activeFilters: ActiveFilters;
  onFiltersChange: (filters: ActiveFilters) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({ 
  jobs, 
  filteredJobs,
  activeFilters, 
  onFiltersChange, 
  showFilters, 
  onToggleFilters 
}) => {
  const [openFilterKey, setOpenFilterKey] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'experience'>('match');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const FILTER_CONFIGS: FilterConfig[] = [
    {
      key: 'industry',
      label: 'Industry',
      icon: <Briefcase className="h-4 w-4" />,
      extractValue: (job) => job.industryname || 'Not specified'
    },
    {
      key: 'location',
      label: 'Location',
      icon: <MapPin className="h-4 w-4" />,
      extractValue: (job) => `${job.districtname}, ${job.statename}`
    },
    {
      key: 'experience',
      label: 'Experience Level',
      icon: <Clock className="h-4 w-4" />,
      extractValue: (job) => {
        const exp = job.aveexp;
        if (exp === 0) return 'Entry Level (0 years)';
        if (exp <= 2) return 'Junior (1-2 years)';
        if (exp <= 5) return 'Mid-level (3-5 years)';
        if (exp <= 8) return 'Senior (6-8 years)';
        return 'Lead (8+ years)';
      }
    },
    {
      key: 'salary',
      label: 'Salary Range',
      icon: <Building className="h-4 w-4" />,
      extractValue: (job) => {
        const salary = job.avewage;
        if (salary <= 30000) return 'Under ₹30K';
        if (salary <= 50000) return '₹30K - ₹50K';
        if (salary <= 75000) return '₹50K - ₹75K';
        if (salary <= 100000) return '₹75K - ₹100K';
        return 'Above ₹100K';
      }
    },
    {
      key: 'qualification',
      label: 'Qualification',
      icon: <GraduationCap className="h-4 w-4" />,
      extractValue: (job) => job.highestqualification || 'Not specified'
    }
  ];

  const handleFilterChange = (filterKey: keyof ActiveFilters, values: string[]) => {
    onFiltersChange({
      ...activeFilters,
      [filterKey]: values
    });
  };

  const handleRemoveFilter = (filterKey: keyof ActiveFilters, value: string) => {
    onFiltersChange({
      ...activeFilters,
      [filterKey]: activeFilters[filterKey].filter(v => v !== value)
    });
  };

  const handleClearAllFilters = () => {
    onFiltersChange({
      sector: [],
      location: [],
      industry: [],
      experience: [],
      qualification: [],
      salary: []
    });
  };

  const MultiSelectFilter: React.FC<{
    config: FilterConfig;
    jobs: EnhancedJob[];
    activeValues: string[];
    onSelectionChange: (values: string[]) => void;
    isOpen: boolean;
    onToggle: () => void;
  }> = ({ config, jobs, activeValues, onSelectionChange, isOpen, onToggle }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filterOptions = useMemo(() => {
      const valueCount = new Map<string, number>();
      
      jobs.forEach(job => {
        const values = config.extractValue(job);
        const valuesArray = Array.isArray(values) ? values : [values];
        
        valuesArray.forEach(value => {
          if (value && value.trim()) {
            valueCount.set(value, (valueCount.get(value) || 0) + 1);
          }
        });
      });
      
      return Array.from(valueCount.entries())
        .map(([value, count]) => ({ value, label: value, count }))
        .sort((a, b) => b.count - a.count);
    }, [jobs, config]);
    
    const filteredOptions = useMemo(() => {
      return filterOptions.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [filterOptions, searchTerm]);
    
    const handleToggleOption = (value: string) => {
      const newValues = activeValues.includes(value)
        ? activeValues.filter(v => v !== value)
        : [...activeValues, value];
      onSelectionChange(newValues);
    };
    
    return (
      <div className="relative">
        <button
          onClick={onToggle}
          className={`flex items-center justify-between w-full px-4 py-3 text-left border rounded-xl transition-all duration-200 ${
            activeValues.length > 0
              ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {config.icon}
            <span className="font-medium">{config.label}</span>
            {activeValues.length > 0 && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold">
                {activeValues.length}
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-[9999] max-h-80 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Search ${config.label.toLowerCase()}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              {activeValues.length > 0 && (
                <div className="p-3 border-b border-slate-100">
                  <button
                    onClick={() => onSelectionChange([])}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear all ({activeValues.length})
                  </button>
                </div>
              )}
              
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={activeValues.includes(option.value)}
                        onChange={() => handleToggleOption(option.value)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          {option.label}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                          {option.count}
                        </span>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-sm">
                    No options found for "{searchTerm}"
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const FilterChips: React.FC = () => {
    const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);
    
    if (!hasActiveFilters) return null;
    
    const allActiveFilters = Object.entries(activeFilters)
      .flatMap(([key, values]) => 
        values.map(value => ({ key: key as keyof ActiveFilters, value }))
      );
    
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">Active Filters:</span>
          <button
            onClick={handleClearAllFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear All
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {allActiveFilters.map(({ key, value }) => (
            <span
              key={`${key}-${value}`}
              className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              {value}
              <button
                onClick={() => handleRemoveFilter(key, value)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  const SortControls: React.FC = () => (
    <div className="flex items-center gap-2 ">
      {/* <span className="text-sm font-medium text-slate-700">Sort by:</span>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as 'match' | 'salary' | 'experience')}
        className="border border-slate-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
      >
        <option value="match">Match %</option>
        <option value="salary">Salary</option>
        <option value="experience">Experience</option>
      </select> */}
      {/* <button
        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
        className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800"
      >
        <ArrowUpDown className="h-4 w-4" />
        {sortDirection === 'asc' ? 'Low to High' : 'High to Low'}
      </button> */}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filter Toggle and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Job Results ({filteredJobs.length})
          </h3>
          <p className="text-slate-600">
            {filteredJobs.length !== jobs.length && (
              <span className="text-indigo-600 font-medium">(filtered from {jobs.length} total)</span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-3 mb-3">
          <SortControls />
          <button
            onClick={onToggleFilters}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Filter className="h-4 w-4" />
            Filters
            {Object.values(activeFilters).some(arr => arr.length > 0) && (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-semibold">
                {Object.values(activeFilters).reduce((acc, arr) => acc + arr.length, 0)}
              </span>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg relative z-[100]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {FILTER_CONFIGS.map((config) => (
                  <MultiSelectFilter
                    key={config.key}
                    config={config}
                    jobs={jobs}
                    activeValues={activeFilters[config.key as keyof ActiveFilters] || []}
                    onSelectionChange={(values) => handleFilterChange(config.key as keyof ActiveFilters, values)}
                    isOpen={openFilterKey === config.key}
                    onToggle={() => setOpenFilterKey(openFilterKey === config.key ? null : config.key)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Chips */}
      <FilterChips />
    </div>
  );
};

export default JobFilters;