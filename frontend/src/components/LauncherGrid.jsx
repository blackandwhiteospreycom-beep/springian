import { Link } from 'react-router-dom'
import { apps } from '../data/apps';
import { iconMap } from './iconMap';
import {
  AiOutlineDown,
  AiOutlineArrowRight,
  AiOutlineSmile,
  AiOutlineArrowUp,
  AiOutlineStar,
  AiOutlineFacebook,
  AiOutlineTwitter,
  AiOutlineLinkedin,
  AiOutlineYoutube,
  AiOutlineInstagram,
  AiOutlineTikTok,
  AiOutlinePhone
} from 'react-icons/ai';

function LauncherGrid() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header Section */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Left: Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary font-primary">
                Master App
              </span>
            </div>

            {/* Center: Navigation Menu */}
            <div className="hidden md:flex items-center gap-8">
              <div className="group relative">
                <button className="flex items-center gap-1 text-text hover:text-primary transition-colors font-primary">
                  Apps
                  <AiOutlineDown className="text-sm" />
                </button>
              </div>
              <a href="#" className="text-text hover:text-primary transition-colors font-primary">Industries</a>
              <a href="#" className="text-text hover:text-primary transition-colors font-primary">Community</a>
              <a href="#" className="text-text hover:text-primary transition-colors font-primary">Pricing</a>
              <a href="#" className="text-text hover:text-primary transition-colors font-primary">Help</a>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-text hover:text-primary font-medium transition-colors font-primary">
                Sign in
              </Link>
              <Link to="/signup" className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity font-primary">
                Try it free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-100 to-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight font-primary">
            <span className="text-text">All your business on</span>
            <span className="mx-2 sm:mx-3 text-primary">one platform</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-2xl text-gray-700 mb-4 sm:mb-8 font-primary">
            Simple, efficient, yet
            <span className="mx-1 sm:mx-2 font-bold text-yellow-500">affordable</span>!
          </p>

          {/* Pricing Text */}
          <p className="text-xl sm:text-3xl font-bold mb-6 sm:mb-8 font-primary text-primary">
            US$ 7.25 / month for ALL apps
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button className="bg-primary text-white px-4 sm:px-8 py-3 sm:py-4 rounded-lg font-medium text-base sm:text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg font-primary">
              Start now - It's free
              <AiOutlineArrowRight className="text-lg sm:text-xl" />
            </button>
            <button className="bg-gray-200 text-text px-4 sm:px-8 py-3 sm:py-4 rounded-lg font-medium text-base sm:text-lg hover:bg-gray-300 transition-colors font-primary">
              Meet an advisor
            </button>
          </div>
        </div>
      </section>

      {/* Apps Grid Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Section Title */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 font-primary text-gray-800">Our Applications</h2>
          <p className="text-base sm:text-lg text-gray-600 font-primary">Choose from our wide range of powerful apps</p>
        </div>

        {/* Promotional Banner */}
        <div className="bg-gray-100 rounded-2xl p-6 sm:p-12 text-center relative overflow-hidden">
          {/* App Grid - 24 icons in 4 rows x 6 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            {apps.map((app) => {
              const Icon = iconMap[app.icon];
              return (
                <div
                  key={app.id}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 hover:border-primary transform hover:-translate-y-1"
                >
                  {/* App Icon Section */}
                  <div className="p-4">
                    <div className="flex flex-col items-center text-center">
                      <div 
                        className="w-14 h-14 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: app.color }}
                      >
                        <Icon className="text-2xl text-white" />
                      </div>
                      <h3 className="font-medium text-sm text-gray-800 group-hover:text-primary transition-colors font-primary">
                        {app.name}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-black rounded-full"></div>
              </div>
              <span className="text-gray-700 font-medium font-primary">Imagine without Master App</span>
            </div>
            <a href="#" className="text-primary font-medium hover:underline flex items-center gap-1 font-primary">
              View all Apps
              <AiOutlineArrowRight className="text-sm" />
            </a>
          </div>

          {/* Main Content */}
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 font-primary">
              Imagine a vast collection of business apps at your disposal.
            </h2>
            <p className="text-gray-600 font-primary">
              Got something to improve? There is an app for that.
            </p>
            <p className="text-gray-600 mb-8 font-primary">
              No complexity, no cost, just a one-click install.
            </p>

            <p className="text-gray-600 font-primary">
              Each app simplifies a process and empowers more people.
            </p>
            <p className="text-gray-600 font-primary">
              Imagine the impact when everyone gets the right tool for the job, tailored with native AI.
            </p>
          </div>

          {/* Bottom Smiley */}
          <div className="mt-12">
            <AiOutlineSmile className="text-4xl text-gray-800 mx-auto" />
          </div>
        </div>
      </main>

      {/* Level Up Section */}
      <section className="bg-white py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
          {/* Headline */}
          <h2 className="text-2xl sm:text-5xl font-bold mb-6 sm:mb-12 font-primary">
            <span className="relative inline-block">
              <span className="text-gray-800">Level up</span>
              {/* Pink/Red brush stroke highlight */}
              <span className="absolute -bottom-3 left-0 right-0 h-4 bg-red-400 opacity-60 rounded-full blur-sm"></span>
            </span>
            <span className="text-gray-800 mx-4">your quality of work</span>
          </h2>

          {/* Video Container */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <video
              className="w-full h-auto min-h-[250px] sm:min-h-[500px]"
              controls
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/src/assets/videos/video1.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Optimized for Productivity Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* Headline */}
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-5xl font-bold font-primary">
              <span className="text-gray-800">Optimized for</span>
              <span className="relative inline-block mx-4">
                <span className="text-gray-800">productivity</span>
                {/* Orange/Yellow underline */}
                <span className="absolute -bottom-3 left-0 right-0 h-4 bg-orange-400 opacity-60 rounded-full blur-sm"></span>
              </span>
            </h2>
          </div>

          {/* Image Collage - Overlapping Stylish Layout */}
          <div className="relative h-[400px] sm:h-[550px] lg:h-[650px] overflow-hidden">

            {/* Background Decorative Elements */}
            <div className="absolute top-10 left-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-1/4 w-48 h-48 sm:w-96 sm:h-96 bg-orange-400/10 rounded-full blur-3xl"></div>

            {/* Center Big Image (Main) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] sm:w-[75%] h-[80%] sm:h-[85%] z-10 group">
              <div className="bg-white shadow-2xl overflow-hidden border border-gray-200 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=700&fit=crop" 
                  alt="Main Dashboard" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-2xl font-bold font-primary mb-1">Complete Business Suite</h3>
                  <p className="text-sm opacity-80 font-primary">All your tools in one place</p>
                </div>
              </div>
            </div>

            {/* Top Left - Small Portrait Image */}
            <div className="absolute top-0 left-0 w-[25%] h-[45%] z-20 group">
              <div className="bg-white shadow-2xl overflow-hidden border border-gray-200 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=500&fit=crop" 
                  alt="Team" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-4 py-3 border border-gray-200 z-30 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 font-primary">Team</span>
                </div>
              </div>
            </div>

            {/* Bottom Left - Horizontal Long Image */}
            <div className="absolute bottom-0 left-0 w-[55%] h-[25%] z-20 group">
              <div className="bg-white shadow-2xl overflow-hidden border border-gray-200 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=300&fit=crop" 
                  alt="Workspace" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm font-bold font-primary">Modern Workspace</p>
                </div>
              </div>
            </div>

            {/* Top Right - Small Portrait Image */}
            <div className="absolute top-0 right-0 w-[25%] h-[45%] z-20 group">
              <div className="bg-white shadow-2xl overflow-hidden border border-gray-200 h-full">
                <img 
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=500&fit=crop" 
                  alt="Analytics" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-br from-primary to-teal-600 text-white rounded-2xl shadow-xl px-4 py-3 z-30 whitespace-nowrap">
                <div className="text-center">
                  <p className="text-lg font-bold font-primary">+42%</p>
                  <p className="text-xs font-primary">Growth</p>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="hidden sm:block absolute bottom-20 left-10 z-30">
              <div className="bg-white rounded-2xl shadow-xl px-5 py-3 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-teal-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-primary">Powered by</p>
                    <p className="text-sm font-bold text-gray-800 font-primary">Artificial Intelligence</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden sm:block absolute bottom-20 right-10 z-30">
              <div className="bg-white rounded-2xl shadow-xl px-5 py-3 border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-teal-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-orange-400 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm font-bold text-gray-800 font-primary">+2.5k users</span>
                </div>
              </div>
            </div>

            {/* Decorative Dots */}
            <div className="hidden sm:block absolute top-1/3 left-1/4 z-10 flex gap-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div className="w-3 h-3 bg-primary/50 rounded-full"></div>
              <div className="w-3 h-3 bg-primary/30 rounded-full"></div>
            </div>

            {/* Decorative Line */}
            <div className="hidden sm:block absolute top-1/3 right-1/4 z-10 w-24 h-1 bg-gradient-to-r from-orange-400 to-transparent rounded-full"></div>

          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-gray-50 py-12 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center relative z-10">
          
          {/* Central Content */}
          <div className="relative inline-block max-w-full">
            <div className="bg-white rounded-2xl sm:rounded-[3rem] shadow-2xl px-6 sm:px-16 py-8 sm:py-12 relative">
              
              {/* Happy Arrow & Text - Hidden on mobile */}
              <div className="hidden sm:flex absolute -top-12 left-1/2 -translate-x-1/2 items-center gap-2">
                <div className="text-yellow-500 font-bold text-xl font-script transform -rotate-12">happy</div>
                <svg className="w-12 h-12 text-yellow-500 transform rotate-90" viewBox="0 0 100 100" fill="none">
                  <path d="M10 50 Q40 30, 70 45" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none"/>
                  <path d="M65 40 L70 45 L66 52" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Main Headline */}
              <h2 className="text-2xl sm:text-5xl md:text-6xl font-bold text-gray-800 font-primary mb-3 sm:mb-4">
                Join 15 million users
              </h2>

              {/* Subtext */}
              <p className="text-base sm:text-xl md:text-2xl text-gray-600 font-primary">
                who grow their business with Master App
              </p>

              {/* Stats Row */}
              <div className="flex flex-wrap justify-center gap-6 sm:gap-16 mt-6 sm:mt-10">
                <div className="text-center">
                  <p className="text-2xl sm:text-4xl font-bold text-primary font-primary">15M+</p>
                  <p className="text-sm text-gray-500 font-primary mt-1">Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-4xl font-bold text-primary font-primary">120+</p>
                  <p className="text-sm text-gray-500 font-primary mt-1">Countries</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-4xl font-bold text-primary font-primary">98%</p>
                  <p className="text-sm text-gray-500 font-primary mt-1">Satisfaction</p>
                </div>
              </div>
            </div>

            {/* Floating Avatars Around Center - Hidden on mobile */}
            <div className="hidden sm:block absolute -top-10 -left-10 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl animate-pulse">
              <img src="https://i.pravatar.cc/100?img=35" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block absolute -top-10 -right-10 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img src="https://i.pravatar.cc/100?img=40" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block absolute -bottom-8 -left-6 w-14 h-14 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img src="https://i.pravatar.cc/100?img=45" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block absolute -bottom-6 -right-10 w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img src="https://i.pravatar.cc/100?img=50" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block absolute top-1/2 -left-16 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img src="https://i.pravatar.cc/100?img=33" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block absolute top-1/2 -right-16 w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img src="https://i.pravatar.cc/100?img=28" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Background Avatar Grid - Hidden on mobile */}
          <div className="hidden sm:block absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute left-10 top-20 grid grid-cols-3 gap-4 opacity-30">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-12 h-12 rounded-full overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 1}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="absolute right-10 bottom-20 grid grid-cols-3 gap-4 opacity-30">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-12 h-12 rounded-full overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 15}`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="bg-white py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8">

            {/* Large Yellow Quotation Mark */}
            <div className="flex-shrink-0">
              <div className="text-6xl sm:text-9xl text-yellow-400 font-serif leading-none select-none">"</div>
            </div>

            {/* Testimonial Card */}
            <div className="flex-1 bg-gray-50 rounded-3xl p-4 sm:p-8 md:p-10 shadow-lg">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-primary mb-8">
                The processing time for accounting documents has been noticeably reduced, in certain cases even from 2 days to only 5 hours. As a result we can now focus on what matters: reporting and advising the client.
              </p>

              {/* Profile Section */}
              <div className="flex items-center gap-4">
                <img 
                  src="https://i.pravatar.cc/150?img=11" 
                  alt="Michael Thompson" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <h4 className="text-lg font-bold text-gray-800 font-primary">Michael Thompson</h4>
                  <p className="text-sm text-gray-500 font-primary">CEO, Global Finance Solutions</p>
                  <div className="flex gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <AiOutlineStar key={i} className="text-yellow-400 fill-yellow-400 text-sm" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Unleash Growth */}
      <section className="bg-white py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          
          {/* Starburst */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative w-24 h-24 sm:w-48 sm:h-48">
              {/* Radiating lines */}
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-1.5 h-16 bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translateX(-50%) translateY(-100%) rotate(${i * 30}deg)`,
                    transformOrigin: 'center bottom'
                  }}
                ></div>
              ))}
              {/* Center circle with star */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-300 rounded-full flex items-center justify-center shadow-xl z-10">
                <AiOutlineStar className="text-white text-4xl" />
              </div>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-gray-800">
            <span className="block mb-1 sm:mb-2">Unleash</span>
            <span className="block text-primary">your growth potential</span>
          </h2>

          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-10 font-primary max-w-2xl mx-auto">
            Join thousands of businesses growing faster with Master App
          </p>

          {/* CTA Button */}
          <button className="bg-primary text-white hover:opacity-90 font-medium py-3 sm:py-4 px-6 sm:px-12 rounded-xl text-base sm:text-lg transition-colors shadow-xl">
            Start now - It's free
          </button>

          {/* Supporting Text */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <AiOutlineArrowUp className="text-primary text-2xl" />
            <p className="text-sm text-gray-500 font-primary">No credit card required</p>
            <p className="text-sm text-gray-500 font-primary">Instant access</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
          
          {/* Logo */}
          <div className="text-center mb-12">
            <span className="text-2xl sm:text-4xl font-bold" style={{ fontFamily: 'var(--font-script)', fontWeight: 700 }}>Master App</span>
          </div>

          {/* Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            
            {/* Community Column */}
            <div>
              <h4 className="text-lg font-bold mb-4 font-primary">Community</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Forum</a></li>
              </ul>
            </div>

            {/* Services Column */}
            <div>
              <h4 className="text-lg font-bold mb-4 font-primary">Services</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Hosting</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Upgrade</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Custom Developments</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Education</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Find an Accountant</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Find a Partner</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Become a Partner</a></li>
              </ul>
            </div>

            {/* About Us Column */}
            <div>
              <h4 className="text-lg font-bold mb-4 font-primary">About us</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Our company</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Brand Assets</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Contact us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Jobs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Events</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Podcast</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Customers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Legal • Privacy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors font-primary">Security</a></li>
              </ul>
            </div>

            {/* Description Column */}
            <div>
              {/* Language Selector */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🇺🇸</span>
                <div className="relative">
                  <select className="bg-gray-800 text-white px-4 py-2 pr-10 rounded-lg border border-gray-700 font-primary appearance-none cursor-pointer hover:bg-gray-700 transition-colors">
                    <option>English</option>
                    <option>Español</option>
                    <option>Français</option>
                    <option>Deutsch</option>
                  </select>
                  <AiOutlineDown className="absolute right-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none" />
                </div>
              </div>

              {/* Description Text */}
              <p className="text-gray-400 text-sm mb-4 font-primary leading-relaxed">
                Master App is a suite of business apps that cover all your company needs: CRM, eCommerce, accounting, inventory, point of sale, project management, etc.
              </p>
              <p className="text-gray-400 text-sm font-primary leading-relaxed">
                Master App's unique value proposition is to be at the same time very easy to use and fully integrated.
              </p>

              {/* Social Media Icons */}
              <div className="flex gap-4 mt-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-xl"><AiOutlineFacebook /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-xl"><AiOutlineTwitter /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-xl"><AiOutlineLinkedin /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-xl"><AiOutlineYoutube /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-xl"><AiOutlineInstagram /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-xl"><AiOutlineTikTok /></a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-xl"><AiOutlinePhone /></a>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 text-center">
            <p className="text-gray-500 font-primary">
              Website made with <span className="text-white font-bold" style={{ fontFamily: 'var(--font-script)', fontWeight: 700 }}>Master App</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LauncherGrid;
