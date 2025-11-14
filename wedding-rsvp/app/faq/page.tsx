import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

const faqs = [
  {
  question: "What about gifts?",
  answer: "Your presence is the greatest gift! If you wish to contribute, we're accepting cash gifts only via M-Pesa (Till 227116). Please do not bring physical presents to the venue. This helps us manage logistics and ensures your contributions go directly towards our future together."
},
  {
    question: "What time should I arrive?",
    answer: "The ceremony begins promptly at 11:00 AM. We recommend arriving at least 15-20 minutes early to find parking and get settled."
  },
  {
    question: "Can I bring children?",
    answer: "We love your little ones! However, for this intimate ceremony, we're keeping it adults-only, except for breastfeeding infants. We hope you understand and can arrange care for the day."
  },
  {
    question: "What is the dress code?",
    answer: "Semi-formal garden attire. Think elegant but comfortable - flowy dresses, light suits, and garden party vibes. The venue is outdoors, so consider comfortable footwear!"
  },
  {
    question: "Will there be food and drinks?",
    answer: "Yes! We'll have a full reception with food and drinks from 1:30 PM to 4:30 PM. Please let us know about any dietary restrictions in your RSVP."
  },
  {
    question: "Is there parking available?",
    answer: "Yes, Rusinga Island Lodge has ample parking space for guests."
  },
  {
    question: "Can I take photos?",
    answer: "We'd love for you to capture memories! However, we kindly ask that you keep your phones away during the ceremony itself. Our photographer will capture all the special moments, and we'll share them with you after the wedding."
  },
  {
    question: "What if I need to update my RSVP?",
    answer: "No problem! Simply log in again using the same email address, and you can update your response anytime before the wedding."
  },

  {
    question: "What happens if I'm on the waitlist?",
    answer: "We have a capacity of 70 guests. If we reach this limit, additional RSVPs will be placed on a waitlist. We'll notify you immediately via email if a spot opens up!"
  },
  {
    question: "Is there WiFi at the venue?",
    answer: "Yes, Rusinga Island Lodge provides complimentary WiFi for guests."
  },
  {
    question: "What about accommodation?",
    answer: "We've listed several accommodation options on our Travel page. Rusinga Island Lodge (the venue) has rooms available, along with other hotels in the area. Book early!"
  },
  {
    question: "Will there be transport from the hotels?",
    answer: "Rusinga Island Lodge guests can walk to the venue. For other hotels, you'll need your own transport. The causeway to the island is accessible by car."
  }
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-sage-800 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about our big day
          </p>
        </div>

        {/* FAQs */}
        <section className="mb-12 space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="section-title text-center mb-6">Still Have Questions?</h2>
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <p className="text-muted-foreground mb-6">
                  We're here to help! Feel free to reach out if you have any other questions or concerns.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="wedding-card p-4 text-center">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-sage-100 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-sage-600" />
                  </div>
                  <p className="font-medium text-sage-800 mb-1">Email Us</p>
                  <a 
                    href="mailto:wedding@brilldamaris.com" 
                    className="text-sm text-sage-600 hover:underline"
                  >
                    owinobrill@gmail.com
                  </a>
                </div>

                <div className="wedding-card p-4 text-center">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blush-100 flex items-center justify-center">
                    <Phone className="h-6 w-6 text-blush-600" />
                  </div>
                  <p className="font-medium text-sage-800 mb-1">Call or Text</p>
                  <a 
                    href="tel:+254XXXXXXXXX" 
                    className="text-sm text-sage-600 hover:underline"
                  >
                    +254 704 098 447
                  </a>
                </div>

                <div className="wedding-card p-4 text-center">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-cream-200 flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-sage-600" />
                  </div>
                  <p className="font-medium text-sage-800 mb-1">WhatsApp</p>
                  <a 
                    href="https://wa.me/254704098447" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sage-600 hover:underline"
                  >
                    Message us
                  </a>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  We typically respond within 24 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Links */}
        <section className="mt-12">
          <div className="wedding-card p-6">
            <h3 className="font-semibold text-sage-800 mb-4 text-center">Quick Links</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <Link href="/rsvp">
                <Button variant="outline" className="w-full">
                  Submit RSVP
                </Button>
              </Link>
              <Link href="/travel">
                <Button variant="outline" className="w-full">
                  Travel Info
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
