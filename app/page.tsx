import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4">
        <div className="text-2xl font-bold">Voizz</div>
        <nav className="hidden md:flex space-x-6">
          <Link href="#features" className="hover:text-blue-400">Features</Link>
          <Link href="#how-it-works" className="hover:text-blue-400">How it Works</Link>
          <Link href="#pricing" className="hover:text-blue-400">Pricing</Link>
          <Link href="#blog" className="hover:text-blue-400">Blog</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-white hover:text-blue-400">
            Sign in
          </Link>
          <Link href="/signup" className="bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            AI-Powered
            <br />
            <span className="text-[#00D1FF]">Recruitment</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            For Maximum Returns
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Use our voice-enabled AI to automate your screening and assessment process.
            Get data-driven insights to make better hiring decisions.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="bg-blue-600 px-6 py-3 rounded-full hover:bg-blue-700">
              Get Started
            </Link>
            <Link href="#features" className="border border-gray-600 px-6 py-3 rounded-full hover:border-blue-400">
              Learn More
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-[#00D1FF]">94%</div>
            <p className="text-gray-400">Accuracy Rate</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#00D1FF]">2500+</div>
            <p className="text-gray-400">Interviews Conducted</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-[#00D1FF]">72%</div>
            <p className="text-gray-400">Time Saved</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Advanced Features for Sophisticated Recruiters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#1A1A1A] p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full mb-4 flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Matching</h3>
              <p className="text-gray-400">Advanced algorithms to match candidates with your job requirements.</p>
            </div>
            <div className="bg-[#1A1A1A] p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full mb-4 flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Voice Interview Analysis</h3>
              <p className="text-gray-400">Real-time analysis of candidate responses and communication skills.</p>
            </div>
            <div className="bg-[#1A1A1A] p-6 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full mb-4 flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Skill Assessment</h3>
              <p className="text-gray-400">Comprehensive evaluation of technical and soft skills.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">How Voizz Works</h2>
          <div className="relative">
            <div className="absolute left-1/2 -ml-0.5 w-0.5 h-full bg-gray-800"></div>
            <div className="space-y-16">
              <div className="relative">
                <div className="ml-6 md:ml-0 md:flex md:items-center">
                  <div className="md:w-1/2 md:pr-8">
                    <div className="bg-[#1A1A1A] p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-2">Create Job Listings</h3>
                      <p className="text-gray-400">Define your requirements and let our AI understand your needs.</p>
                    </div>
                  </div>
                  <div className="absolute left-0 md:left-1/2 mt-3 md:mt-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="ml-6 md:ml-0 md:flex md:items-center">
                  <div className="md:w-1/2 md:pl-8 md:ml-auto">
                    <div className="bg-[#1A1A1A] p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-2">AI Candidate Matching</h3>
                      <p className="text-gray-400">Our AI analyzes resumes and matches the best candidates.</p>
                    </div>
                  </div>
                  <div className="absolute left-0 md:left-1/2 mt-3 md:mt-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="ml-6 md:ml-0 md:flex md:items-center">
                  <div className="md:w-1/2 md:pr-8">
                    <div className="bg-[#1A1A1A] p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-2">Automated Screening</h3>
                      <p className="text-gray-400">Voice-enabled AI conducts initial screening interviews.</p>
                    </div>
                  </div>
                  <div className="absolute left-0 md:left-1/2 mt-3 md:mt-0">
                    <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-[#111111]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Transform Your Career Journey with AI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1A1A1A] p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">For Job Seekers</h3>
              <p className="text-gray-400 mb-6">Practice with our AI interviewer and improve your chances.</p>
              <Link href="/signup" className="w-full inline-block bg-blue-600 px-6 py-3 rounded-full hover:bg-blue-700 text-center">
                Start Practicing
              </Link>
            </div>
            <div className="bg-[#1A1A1A] p-8 rounded-lg">
              <h3 className="text-xl font-bold mb-4">For Companies</h3>
              <p className="text-gray-400 mb-6">Streamline your recruitment process with AI-powered interviews.</p>
              <Link href="/signup" className="w-full inline-block bg-blue-600 px-6 py-3 rounded-full hover:bg-blue-700 text-center">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-[#0A0A0A] border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4">Voizz</div>
            <p className="text-gray-400">AI-Powered Interview Assistant</p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/guides" className="hover:text-white">Guides</Link></li>
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/privacy" className="hover:text-white">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Voizz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
