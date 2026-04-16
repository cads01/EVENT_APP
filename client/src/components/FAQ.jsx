import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I create an event?",
      answer: "To create an event, log in to your account, navigate to the 'Create Event' page, fill in the details including title, date, location, and description, then submit the form."
    },
    {
      question: "Is there a fee to attend events?",
      answer: "Event fees vary. Some events are free, while others have ticket prices set by the organizer. Check the event details for pricing information."
    },
    {
      question: "How can I contact event organizers?",
      answer: "You can find contact information in the event details page. Use the contact form or email provided to reach out to organizers."
    },
    {
      question: "Can I cancel my event registration?",
      answer: "Yes, you can cancel your registration from your dashboard or the event page, subject to the organizer's cancellation policy."
    },
    {
      question: "How do I become an event organizer?",
      answer: "Register for an account and start creating events. For premium features, contact our support team."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <div className="text-center mb-12">
        <p className="text-[10px] tracking-[0.4em] uppercase text-amber-400 font-bold mb-4">FAQ</p>
        <h2 className="text-4xl md:text-5xl font-black mb-4">
          Frequently Asked<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 drop-shadow-lg">Questions</span>
        </h2>
        <p className="text-zinc-500 text-base">Find answers to common questions about our platform</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-zinc-800/50 transition-all duration-200"
            >
              <span className="font-bold text-white text-lg">{faq.question}</span>
              <span className={`text-amber-400 text-xl transition-transform duration-200 ${openIndex === index ? 'rotate-45' : ''}`}>
                +
              </span>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4">
                <p className="text-zinc-400 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}