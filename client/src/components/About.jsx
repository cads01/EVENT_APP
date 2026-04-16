export default function About() {
  const features = [
    {
      icon: "🎟",
      title: "Discover Events",
      description: "Find amazing events happening around you with our comprehensive event discovery system."
    },
    {
      icon: "📅",
      title: "Easy Booking",
      description: "Book tickets and RSVP to events with just a few clicks. Manage all your events in one place."
    },
    {
      icon: "👥",
      title: "Community",
      description: "Connect with like-minded people and build lasting relationships through shared experiences."
    },
    {
      icon: "📊",
      title: "Analytics",
      description: "Get insights into event performance and attendee engagement with detailed analytics."
    },
    {
      icon: "💳",
      title: "Secure Payments",
      description: "Safe and secure payment processing for all your event transactions."
    },
    {
      icon: "📱",
      title: "Mobile Friendly",
      description: "Access your events anywhere, anytime with our responsive mobile-first design."
    }
  ];

  const stats = [
    { number: "10K+", label: "Events Created" },
    { number: "50K+", label: "Happy Attendees" },
    { number: "500+", label: "Organizers" },
    { number: "99%", label: "Uptime" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <p className="text-[10px] tracking-[0.4em] uppercase text-amber-400 font-bold mb-4">About</p>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
          Bringing People<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Together</span>
        </h2>
        <p className="text-zinc-500 text-lg max-w-2xl mx-auto leading-relaxed">
          We're passionate about creating memorable experiences and connecting communities through amazing events.
          Our platform makes it easy for organizers to create events and for attendees to discover and join them.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-3xl md:text-4xl font-black text-amber-400 mb-2">{stat.number}</div>
            <div className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-12 mb-16 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-black text-white mb-4">Our Mission</h3>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl mx-auto">
            To revolutionize the way people discover, create, and attend events by providing a seamless,
            user-friendly platform that fosters community engagement and creates unforgettable experiences.
          </p>
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Why Choose Us</h3>
          <p className="text-zinc-500 text-base">Discover what makes our platform special</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm hover:border-amber-400/30 transition-all duration-300">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-black text-white mb-3">{feature.title}</h4>
              <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-amber-400/20 to-orange-400/20 border border-amber-400/30 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Ready to Get Started?</h3>
          <p className="text-zinc-400 text-lg mb-6">Join thousands of event organizers and attendees</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-amber-400 text-zinc-950 rounded-xl font-black hover:bg-amber-300 transition-all">
              Create Event
            </button>
            <button className="px-8 py-3 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl font-bold hover:border-amber-400/50 hover:text-amber-400 transition-all">
              Browse Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}