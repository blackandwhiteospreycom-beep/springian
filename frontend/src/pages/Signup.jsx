import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { AiOutlineGoogle, AiOutlineMail, AiOutlineLock, AiOutlineUser, AiOutlineApartment, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

function Signup() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Account, 2: Services
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [services, setServices] = useState([]);

  // Load service catalog
  useEffect(() => {
    authAPI.getServices().then(res => setServices(res.data || [])).catch(() => {});
  }, []);

  const updateForm = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Call register via AuthContext to update user state properly
      const res = await authRegister(formData.name, formData.email, formData.password, formData.company);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.slug === service.slug);
      if (exists) {
        return prev.filter(s => s.slug !== service.slug);
      }
      return [...prev, { ...service, tier: 'free' }];
    });
  };

  const handleServiceSubmit = () => {
    if (selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }
    // Store services and company in sessionStorage for onboarding
    sessionStorage.setItem('selected_services', JSON.stringify(selectedServices));
    if (formData.company) sessionStorage.setItem('signup_company', formData.company);
    // Navigate to onboarding
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Master App</h1>
          <p className="text-gray-500 mt-2">
            {step === 1 ? 'Create your account' : 'Choose your services'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-300'}`} />
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-300'}`} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {step === 1 ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Account Details</h2>

              {/* Google Button */}
              <button
                onClick={() => setError('Google Sign-Up is not yet configured.')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-6"
              >
                <AiOutlineGoogle size={20} />
                Sign up with Google
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-gray-400 text-sm">or sign up with email</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              <form onSubmit={handleAccountSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <AiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <AiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company (optional)</label>
                  <div className="relative">
                    <AiOutlineApartment className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => updateForm('company', e.target.value)}
                      placeholder="Acme Corporation"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <AiOutlineLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <AiOutlineLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
                >
                  {loading ? 'Creating Account...' : 'Continue'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Select Your Services</h2>
              <p className="text-gray-500 text-sm mb-6">Choose what you need. Start free, upgrade anytime.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {services.map((service) => {
                  const isSelected = selectedServices.find(s => s.slug === service.slug);
                  return (
                    <button
                      key={service.slug}
                      onClick={() => toggleService(service)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg`}
                          style={{ backgroundColor: service.color || '#296374' }}
                        >
                          {service.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">{service.name}</p>
                          <p className="text-xs text-gray-400 truncate">{service.description}</p>
                        </div>
                        {isSelected && (
                          <span className="text-primary font-bold text-xl">✓</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleServiceSubmit}
                  disabled={selectedServices.length === 0}
                  className="px-6 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
                >
                  Continue to Onboarding
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
