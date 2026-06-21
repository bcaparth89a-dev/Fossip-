import { useEffect } from "react";

const DeveloperModal = ({ isOpen, onClose }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 backdrop-blur-md bg-slate-900/60 overflow-y-auto print:p-0 print:bg-white print:static print:h-auto">
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-105 animate-in zoom-in-95 duration-200 print:max-h-none print:shadow-none print:border-none print:rounded-none print:static">
        
        {/* Top Sticky Header Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-150 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 active:scale-95 transition cursor-pointer"
            >
              ← Back to RaagAnubhuti
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-95 transition shadow-sm cursor-pointer"
            >
              🖨️ Download / Print Resume
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-650 font-bold text-xl px-2 cursor-pointer"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable Content Pane */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-slate-200 print:overflow-visible print:p-0">
          
          {/* Header Section (Developer Info Profile) */}
          <div className="flex flex-col md:flex-row gap-6 md:items-center border-b border-slate-100 pb-6 print:flex-row">
            {/* Avatar image */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <img
                src="/Developer.png"
                alt="Parth Pawar"
                className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border border-slate-200 shadow-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200"; // fallback picture if local image missing
                }}
              />
            </div>
            
            {/* Basic Info */}
            <div className="text-center md:text-left flex-grow">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Parth Pawar</h1>
              <p className="text-sm font-semibold text-indigo-650 mt-1.5 uppercase tracking-wider">
                Computer Application Student & Full Stack Web Developer
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 mt-3 text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
                <p>📍 Adajan, Surat, Gujarat – 395005</p>
                <p>📞 +91 7990101983</p>
                <p>✉️ pawarparth233@gmail.com</p>
                <p>🔗 <a href="https://linkedin.com/in/parth-pawar-143682307" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">linkedin.com/in/parth-pawar-143682307</a></p>
              </div>
            </div>
          </div>

          {/* Grid Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-3">
            
            {/* Column 1: Left Details (About, Skills, Languages) */}
            <div className="lg:col-span-1 space-y-6 print:col-span-1">
              {/* About summary */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest border-l-3 border-indigo-600 pl-2.5 mb-3">About Me</h3>
                <p className="text-sm text-slate-600 leading-relaxed text-justify">
                  I'm a passionate BCA (Hons.) student focused on web development and database management. I enjoy building user-friendly applications, exploring new technologies, collaborating with teams, and continuously improving my technical and professional skills to excel in the IT industry.
                </p>
              </div>

              {/* Spoken Languages */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest border-l-3 border-indigo-600 pl-2.5 mb-3">Spoken Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {["Gujarati", "Hindi", "English", "Marathi"].map((lang) => (
                    <span key={lang} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-200/50">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Skills List */}
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest border-l-3 border-indigo-600 pl-2.5 mb-3">Skills</h3>
                
                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase mb-2">Programming Languages</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["C", "C++", "Python", "Java", "Kotlin", "DSA", "OOP"].map((s) => (
                      <span key={s} className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-0.5 rounded-md border border-indigo-100/50">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase mb-2">Web Technologies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["HTML", "CSS", "JavaScript", "jQuery", "PHP", "React.js", "Node.js", "Express.js", "Bootstrap", "Tailwind CSS", "Git", "GitHub"].map((s) => (
                      <span key={s} className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-md border border-emerald-100/50">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase mb-2">Databases & Cloud</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["MySQL", "DBMS", "Firebase", "MongoDB", "Cloudinary"].map((s) => (
                      <span key={s} className="bg-amber-50 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-md border border-amber-100/50">{s}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-450 uppercase mb-2">Professional Competencies</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {["Leadership", "Teaching", "Self Learning", "Management", "Team Collaboration"].map((s) => (
                      <span key={s} className="bg-slate-100 text-slate-650 text-xs font-medium px-2 py-0.5 rounded-md border border-slate-200">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Column 2 & 3: Right Details (Experience, Education, Certifications) */}
            <div className="lg:col-span-2 space-y-6 print:col-span-2">
              
              {/* Professional Experience */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest border-l-3 border-indigo-600 pl-2.5 mb-4">Professional Experience</h3>
                
                <div className="space-y-4">
                  {/* Internship 1 */}
                  <div className="border-l-2 border-slate-100 pl-4 relative">
                    <div className="absolute w-3 h-3 bg-indigo-600 rounded-full -left-[7px] top-1.5"></div>
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="text-sm font-bold text-slate-800">Web Application Development Intern</h4>
                      <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">12 May 2025 – 12 Jul 2025</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Faculty of Science – Summer Internship Program</p>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Worked with React.js, Tailwind CSS, Firebase, EmailJS, Cloudinary, WhatsApp API, PDF generation, authentication modules, and collaborative Git workflows in a team structure.
                    </p>
                  </div>

                  {/* Internship 2 */}
                  <div className="border-l-2 border-slate-100 pl-4 relative">
                    <div className="absolute w-3 h-3 bg-indigo-600 rounded-full -left-[7px] top-1.5"></div>
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="text-sm font-bold text-slate-800">Web Application Development Intern</h4>
                      <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">6 Oct 2025 – 6 Dec 2025</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Prism I.T. Systems, Surat</p>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Developed a robust PG Finder web platform equipped with detailed search filters, user favorite lists, owner dashboard panels, custom booking schedules, and review/feedback modules using React.js and Firebase.
                    </p>
                  </div>

                  {/* Internship 3 */}
                  <div className="border-l-2 border-slate-100 pl-4 relative">
                    <div className="absolute w-3 h-3 bg-indigo-600 rounded-full -left-[7px] top-1.5"></div>
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="text-sm font-bold text-slate-800">Web Application Development Intern</h4>
                      <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">March 2026</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">GB Innovation, Ahmedabad</p>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Developed a complete Food Ordering System integrating customer menus, interactive cart state, orders tracking system, admin dashboards, and comprehensive feedback management panels.
                    </p>
                  </div>

                  {/* Internship 4 */}
                  <div className="border-l-2 border-slate-100 pl-4 relative">
                    <div className="absolute w-3 h-3 bg-indigo-600 rounded-full -left-[7px] top-1.5"></div>
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="text-sm font-bold text-slate-800">Java & Android Application Intern</h4>
                      <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">Full Stack Internships</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">System Tron, Vadodara</p>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Built Java-based apps including calculators, custom checklists, and portfolio assets using Java, Spring Boot, Spring Framework, JavaFX, and Jetpack Compose. Developed Android applications using modern design architectures.
                    </p>
                  </div>

                  {/* Internship 5 */}
                  <div className="border-l-2 border-slate-100 pl-4 relative">
                    <div className="absolute w-3 h-3 bg-indigo-600 rounded-full -left-[7px] top-1.5"></div>
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="text-sm font-bold text-slate-800">Web Application Development Intern</h4>
                      <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">Enterprise Web Internship</span>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Niyaans Gallery, Surat</p>
                    <p className="text-xs text-slate-600 mt-1.5">
                      Developed a professional interior designing company website using Java and Spring Boot. Included beautiful service listings, structured project showcases, customer query submission portals, and a complete admin management system.
                    </p>
                  </div>
                </div>
              </div>

              {/* Education Section */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest border-l-3 border-indigo-600 pl-2.5 mb-4">Education History</h3>
                <div className="space-y-4">
                  
                  <div className="border-l-2 border-slate-100 pl-4 relative">
                    <div className="absolute w-2 h-2 bg-indigo-600 rounded-full -left-[5px] top-1.5"></div>
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="text-sm font-bold text-slate-800">Bachelor of Computer Application (BCA Hons.)</h4>
                      <span className="text-xs text-slate-500 font-semibold">2023 – Present</span>
                    </div>
                    <p className="text-xs text-slate-650 mt-0.5">Maharaja Sayajirao University of Vadodara</p>
                    <p className="text-xs font-semibold text-indigo-650 mt-1">Current Grade: CGPA 8.09 (Till Sixth Semester)</p>
                  </div>

                  <div className="border-l-2 border-slate-100 pl-4 relative">
                    <div className="absolute w-2 h-2 bg-indigo-600 rounded-full -left-[5px] top-1.5"></div>
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="text-sm font-bold text-slate-800">HSC Board Exam (Commerce Stream - GHSEB)</h4>
                      <span className="text-xs text-slate-500 font-semibold">Sanskar Bharti Vidhyalaya, Surat</span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-650 mt-1">Performance: 99.47 Percentile</p>
                  </div>

                  <div className="border-l-2 border-slate-100 pl-4 relative">
                    <div className="absolute w-2 h-2 bg-indigo-600 rounded-full -left-[5px] top-1.5"></div>
                    <div className="flex justify-between items-start flex-wrap gap-1">
                      <h4 className="text-sm font-bold text-slate-800">SSC Board Exam (Commerce Stream - GHSEB)</h4>
                      <span className="text-xs text-slate-500 font-semibold">Sanskar Bharti Vidhyalaya, Surat</span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-650 mt-1">Performance: 93.26 Percentile</p>
                  </div>

                </div>
              </div>

              {/* Certifications list */}
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest border-l-3 border-indigo-600 pl-2.5 mb-3">Certifications</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-650 list-disc list-inside">
                  <li>Web Development Remedial Course – MSU (2023)</li>
                  <li>Front-End Development Course – Udemy (2024)</li>
                  <li>IoT Workshop – Basics of IoT – IoT Committee (2024)</li>
                  <li>Code Revolution: Mastering Modern Software Development (2025)</li>
                  <li>IBM SkillsBuild Program – Agentic AI Architecture (2025)</li>
                  <li>Unlocking Generative AI – Coursera / AI Alliance (2025)</li>
                </ul>
              </div>

              {/* Extracurricular and Declaration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs text-slate-550">
                <div>
                  <h4 className="font-bold text-slate-700 uppercase mb-1">Non-Academic & Hobbies</h4>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>NCC Cadet (Till A Certificate)</li>
                    <li>Pathshala Vadodara NGO Volunteer</li>
                    <li>Music, Movies & Coding</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 uppercase mb-1">Declaration</h4>
                  <p className="italic leading-normal text-justify">
                    I hereby declare that all the information provided above is correct and true to the best of my knowledge and belief.
                  </p>
                  <p className="font-bold text-slate-700 mt-2 text-right">Parth Pawar</p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer Banner */}
        <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 text-center text-xs text-slate-450 mt-auto flex flex-col sm:flex-row justify-between items-center print:static print:border-none print:bg-white">
          <p className="font-semibold text-slate-700">Made with ❤️ by Parth Pawar</p>
          <p className="mt-1 sm:mt-0 font-medium">© 2026 RaagAnubhuti (રાગઅનુભૂતિ). All rights reserved.</p>
        </div>

      </div>
    </div>
  );
};

export default DeveloperModal;
