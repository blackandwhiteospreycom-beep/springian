import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { generateDashboard } from '../dashboard/utils/dashboardGenerator';

function Onboarding() {
  const { completeOnboarding, user } = useAuth();
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState([]);
  const [currentStep, setCurrentStep] = useState(0); // 0: Common questions, 1+: service-specific
  const [orgName, setOrgName] = useState('');
  const [orgDomain, setOrgDomain] = useState('');
  const [answers, setAnswers] = useState({});
  const [commonQuestions, setCommonQuestions] = useState([]);
  const [serviceQuestions, setServiceQuestions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const services = JSON.parse(sessionStorage.getItem('selected_services') || '[]');
    if (services.length === 0) {
      navigate('/signup');
      return;
    }
    setSelectedServices(services);

    // Load common questions (anchored to CRM service) + service-specific questions
    const loadQuestions = async () => {
      try {
        // Load common questions (stored under 'crm' service)
        const commonRes = await authAPI.getOnboardingQuestions('crm');
        // Common questions have order 1-12, service-specific have order 13+
        const commons = (commonRes.data || []).filter(q => q.order <= 12);
        setCommonQuestions(commons);

        // Load service-specific questions for each selected service
        const qMap = {};
        for (const service of services) {
          try {
            const res = await authAPI.getOnboardingQuestions(service.slug);
            // Filter out common questions (order <= 12), keep only service-specific
            const serviceSpecific = (res.data || []).filter(q => q.order > 12 || !commons.find(c => c.question_key === q.question_key));
            if (serviceSpecific.length > 0) {
              qMap[service.slug] = serviceSpecific;
            }
          } catch {
            qMap[service.slug] = [];
          }
        }
        setServiceQuestions(qMap);
      } catch (err) {
        console.error('Failed to load onboarding questions:', err);
      }
    };
    loadQuestions();

    // Pre-fill org name from signup
    const company = sessionStorage.getItem('signup_company');
    if (company) setOrgName(company);
  }, [navigate]);

  const currentService = currentStep > 0 ? selectedServices[currentStep - 1] : null;
  const currentQuestions = currentStep === 0 ? commonQuestions : (currentService ? (serviceQuestions[currentService.slug] || []) : []);

  const handleAnswer = (questionKey, value) => {
    setAnswers(prev => ({ ...prev, [questionKey]: value }));
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      // Validate required common questions
      const unansweredRequired = commonQuestions.filter(
        q => q.is_required && !answers[q.question_key]
      );
      if (unansweredRequired.length > 0) {
        setError('Please answer all required questions');
        return;
      }
      // Auto-fill org_name if not set
      if (!orgName.trim() && answers.org_name) {
        setOrgName(answers.org_name);
      }
      setCurrentStep(1);
      setError('');
    } else if (currentStep <= selectedServices.length) {
      // Validate required service questions
      const unansweredRequired = currentQuestions.filter(
        q => q.is_required && !answers[q.question_key]
      );
      if (unansweredRequired.length > 0) {
        setError('Please answer all required questions');
        return;
      }
      setCurrentStep(currentStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    // Validate common questions
    const unansweredRequired = commonQuestions.filter(
      q => q.is_required && !answers[q.question_key]
    );
    if (unansweredRequired.length > 0) {
      setError('Please answer all required questions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build onboarding answers (common + service-specific)
      const onboardingAnswers = [];

      // Common answers
      commonQuestions.forEach(q => {
        if (answers[q.question_key]) {
          onboardingAnswers.push({
            serviceSlug: 'common',
            questionKey: q.question_key,
            answer: String(answers[q.question_key]),
          });
        }
      });

      // Service-specific answers
      selectedServices.forEach(service => {
        const serviceQs = serviceQuestions[service.slug] || [];
        serviceQs.forEach(q => {
          if (answers[q.question_key]) {
            onboardingAnswers.push({
              serviceSlug: service.slug,
              questionKey: q.question_key,
              answer: String(answers[q.question_key]),
            });
          }
        });
      });

      // Use org_name from answers if available
      const finalOrgName = orgName || answers.org_name || 'My Company';

      const onboardingResult = await completeOnboarding({
        orgName: finalOrgName,
        orgDomain: orgDomain || null,
        selectedServices: selectedServices.map(s => ({ slug: s.slug, tier: s.tier || 'free' })),
        onboardingAnswers,
      });

      // Generate personalized dashboard based on onboarding answers
      const pageLayouts = generateDashboard({
        selectedServices: selectedServices.map(s => s.slug),
        onboardingAnswers,
        orgName: finalOrgName,
      });

      // Store in localStorage for DashboardContext to pick up
      localStorage.setItem('dashboard_page_layouts', JSON.stringify(pageLayouts));
      localStorage.setItem('dashboard_title', finalOrgName + ' Dashboard');

      // Clear session storage
      sessionStorage.removeItem('selected_services');
      sessionStorage.removeItem('signup_company');

      // Fetch fresh user profile to get updated role/org after onboarding
      const profileRes = await authAPI.getMe();
      const updatedUser = profileRes.data;

      // Redirect based on user role: super_admin goes to /admin, everyone else to /dashboard
      const isSuperAdmin = updatedUser?.role === 'super_admin';
      navigate(isSuperAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = selectedServices.length + 1; // common questions + each service

  const renderQuestion = (q) => {
    const value = answers[q.question_key] || '';

    return (
      <div key={q.question_key}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {q.question_text} {q.is_required && <span className="text-red-400">*</span>}
        </label>

        {q.question_type === 'select' && q.options ? (
          <select
            value={value}
            onChange={(e) => handleAnswer(q.question_key, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required={q.is_required}
          >
            <option value="">Select...</option>
            {q.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : q.question_type === 'boolean' ? (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => handleAnswer(q.question_key, 'yes')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                value === 'yes'
                  ? 'bg-primary text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleAnswer(q.question_key, 'no')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                value === 'no'
                  ? 'bg-primary text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No
            </button>
          </div>
        ) : q.question_type === 'number' ? (
          <input
            type="number"
            value={value}
            onChange={(e) => handleAnswer(q.question_key, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter a number"
          />
        ) : q.question_type === 'text' ? (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAnswer(q.question_key, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Your answer..."
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => handleAnswer(q.question_key, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
            placeholder="Your answer..."
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Master App</h1>
          <p className="text-gray-500 mt-2">
            {currentStep === 0
              ? 'Tell us about your organization'
              : currentStep <= selectedServices.length
                ? `About your ${currentService?.name} setup`
                : 'Finalize your setup'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary/50' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {currentStep === 0 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: '#296374' }}>
                  🏢
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Organization Details</h3>
                  <p className="text-sm text-gray-500">Tell us about your company</p>
                </div>
              </div>

              {/* Organization Name & Domain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Acme Corporation"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website (optional)</label>
                <input
                  type="text"
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                  placeholder="acme.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Common Questions */}
              {commonQuestions.map(q => renderQuestion(q))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: currentService?.color || '#296374' }}
                >
                  {currentService?.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{currentService?.name}</h3>
                  <p className="text-sm text-gray-500">Tier: <span className="text-primary capitalize">{currentService?.tier || 'free'}</span></p>
                </div>
              </div>

              {currentQuestions.length > 0 ? (
                currentQuestions.map(q => renderQuestion(q))
              ) : (
                <p className="text-gray-500 text-center py-8">No additional setup questions for this service. We'll configure defaults.</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-500 hover:text-gray-800 transition-colors"
              disabled={currentStep === 0}
            >
              ← Back
            </button>

            {currentStep < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-primary hover:opacity-90 text-white rounded-lg font-medium transition-all"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
              >
                {loading ? 'Setting up...' : '🚀 Launch Dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
