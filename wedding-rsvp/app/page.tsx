'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Heart, Gift, Users, Shirt, Image as ImageIcon, Copy, Check, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import PhotoSlider from "@/components/PhotoSlider";
import { useToast } from "@/hooks/use-toast";
import MessagesCarousel from "@/components/MessagesCarousel";

// Color data for dress code selector
const dressCodeColors = [
  {
    id: 'coffee',
    name: 'Coffee',
    emoji: '☕',
    hex: '#6F4E37',
    tagline: 'For the Bold Ones',
    description: 'Choose Coffee if you\'re the',
    traits: [
      'confident one in the room',
      'outspoken, energetic, always ready to dance',
      'friend who never says no to an adventure'
    ],
    closing: 'If you walk in wearing Coffee, just know: we expect moves.'
  },
  {
    id: 'honey',
    name: 'Honey',
    emoji: '🍯',
    hex: '#EB9605',
    tagline: 'For the Sweethearts',
    description: 'Wear Honey if you\'re the',
    traits: [
      'soft-spoken one',
      'lover of warm hugs',
      'person who brings peace wherever you go'
    ],
    closing: 'Honey wearers = our emotional support squad.'
  },
  {
    id: 'cinnamon',
    name: 'Cinnamon',
    emoji: '🍁',
    hex: '#D2691E',
    tagline: 'The Life of the Party',
    description: 'Pick Cinnamon if you\'re',
    traits: [
      'spicy, funny, dramatic in the best way',
      'guaranteed to laugh the loudest',
      'the one who will keep the vibes alive'
    ],
    closing: 'Cinnamon people never go unnoticed.'
  },
  {
    id: 'caramel',
    name: 'Caramel',
    emoji: '🤎',
    hex: '#FFD59A',
    tagline: 'Smooth Operators',
    description: 'Choose Caramel if you\'re',
    traits: [
      'easygoing',
      'effortlessly stylish',
      'the "I just came to chill and look good" type'
    ],
    closing: 'Caramel guests are the aesthetic ones.'
  },
  {
    id: 'chestnut',
    name: 'Chestnut',
    emoji: '🌰',
    hex: '#954535',
    tagline: 'The Wise Ones',
    description: 'Wear Chestnut if you\'re',
    traits: [
      'mature, collected, calm',
      'the advisor in your friend group',
      'the one who says "Let me tell you something…"'
    ],
    closing: 'Chestnut guests bring grounding energy.'
  },
  {
    id: 'ginger',
    name: 'Ginger',
    emoji: '🌾',
    hex: '#B06500',
    tagline: 'The Fun Rebels',
    description: 'Pick Ginger if you\'re the',
    traits: [
      'playful one',
      'unpredictable in a fun way',
      'lover of bright, quirky styles'
    ],
    closing: 'Ginger guests = certified scene-stealers.'
  },
  {
    id: 'walnut',
    name: 'Walnut',
    emoji: '🌳',
    hex: '#5D432C',
    tagline: 'For the Classics',
    description: 'Choose Walnut if you\'re',
    traits: [
      'timeless in your style',
      'low-key but elegant',
      'the one who looks expensive without trying'
    ],
    closing: 'Walnut is for our minimal-but-classy fam.'
  },
  {
    id: 'rust',
    name: 'Rust Brown',
    emoji: '🔥',
    hex: '#B7410E',
    tagline: 'For the Hot Ones',
    description: 'Wear Rust Brown if you\'re',
    traits: [
      'warm',
      'bold',
      'a little dramatic and very confident'
    ],
    closing: 'Rust Brown = the "I understood the assignment" squad.'
  },
  {
    id: 'toffee',
    name: 'Toffee',
    emoji: '🍬',
    hex: '#755139',
    tagline: 'The Sweet Sophisticates',
    description: 'Choose Toffee if you\'re the friend who is:',
    traits: [
      'effortlessly classy',
      'sweet but with a little mystery',
      'always put-together',
      'the one who somehow knows the best restaurants and the best tea'
    ],
    closing: 'Toffee wearers bring soft elegance and warm charm.'
  },
  {
    id: 'mocha',
    name: 'Mocha Brown',
    emoji: '☕',
    hex: '#3C280D',
    tagline: 'The Cozy Vibes Crew',
    description: 'Pick Mocha if you are:',
    traits: [
      'warm, friendly, and easy to talk to',
      'the "let\'s catch up over coffee" type',
      'that comforting friend everyone loves',
      'chill, calm, and emotionally steady'
    ],
    closing: 'Mocha guests = wholesome, welcoming energy all day.'
  },
  {
    id: 'tan',
    name: 'Tan',
    emoji: '🌞',
    hex: '#D2B48C',
    tagline: 'The Minimalist Sunbeams',
    description: 'Wear Tan if you\'re:',
    traits: [
      'simple, clean, and effortlessly stylish',
      'the soft-life ambassador',
      'lover of neutrals, soft glam, and light tones',
      'the one who looks good in ANYTHING without trying'
    ],
    closing: 'Tan guests bring the soft, sunlit glow to the celebration.'
  }
];

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copied, setCopied] = useState(false);
  const [selectedColor, setSelectedColor] = useState<typeof dressCodeColors[0] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const weddingDate = new Date('2026-01-23T08:00:00Z'); // 11 AM EAT = 8 AM UTC
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = weddingDate.getTime() - now;
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Gallery photos - easily replaceable
  const galleryPhotos = [
   '/images/gallery/photo-1.jpg',
  '/images/gallery/photo-2.jpg',
  '/images/gallery/photo-3.jpg',
  '/images/gallery/photo-4.jpg',
  '/images/gallery/photo-5.jpg',
  '/images/gallery/photo-6.jpg',
  '/images/gallery/photo-7.jpg',
  '/images/gallery/photo-8.jpg',
  '/images/gallery/photo-9.jpg',
  '/images/gallery/photo-10.jpg',
   '/images/gallery/photo-11.jpg',
  '/images/gallery/photo-12.jpg',
  '/images/gallery/photo-13.jpg',
  '/images/gallery/photo-14.jpg',
   '/images/gallery/photo-15.jpg',
  '/images/gallery/photo-16.jpg',
  '/images/gallery/photo-17.jpg', 
  '/images/gallery/photo-18.jpg',
  ];

  const copyTillNumber = async () => {
    try {
      await navigator.clipboard.writeText('227116');
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Till number copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually: 227116",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section with Local Background Image - More Prominent */}
      <section className="relative mb-16 -mt-12 pt-32 pb-20 -mx-4">
        {/* Background Image - More Visible */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/images/hero-background.jpg')",
            }}
          />
          {/* Lighter overlay to show image better */}
          <div className="absolute inset-0 bg-gradient-to-b from-mahogany-900/40 via-mahogany-900/30 to-white" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center px-4">
          <Heart className="h-16 w-16 text-orange-400 mx-auto mb-6 drop-shadow-lg" fill="currentColor" />
          <h1 className="font-serif text-6xl md:text-8xl text-white drop-shadow-2xl mb-6" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
            Brill & Damaris
          </h1>
          <p className="text-xl md:text-2xl text-ivory-50 mb-8 drop-shadow-lg">
            Together with our families, we invite you to celebrate our wedding
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-ivory-50 mb-10">
            <div className="flex items-center gap-2 bg-mahogany-800/60 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Friday, January 23, 2026</span>
            </div>
            <div className="flex items-center gap-2 bg-mahogany-800/60 backdrop-blur-sm px-4 py-2 rounded-lg">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">Rusinga Island Lodge</span>
            </div>
          </div>
          
          {/* Countdown */}
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-10">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Minutes', value: timeLeft.minutes },
              { label: 'Seconds', value: timeLeft.seconds }
            ].map((item) => (
              <div key={item.label} className="bg-ivory-50/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border-2 border-bronze-200">
                <div className="text-4xl font-bold text-mahogany-700">{item.value}</div>
                <div className="text-sm text-bronze-600 font-medium">{item.label}</div>
              </div>
            ))}
          </div>

          <Link href="/rsvp">
            <Button size="lg" className="text-lg px-10 py-7 bg-orange-600 hover:bg-orange-700 shadow-2xl">
              RSVP Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Gift Information - Cash Only with M-Pesa */}
      <section className="mb-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-bronze-300 shadow-xl bg-gradient-to-br from-ivory-50 to-bronze-50">
            <CardHeader className="text-center">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-mahogany-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
                <Gift className="h-7 w-7 text-mahogany-700" />
              </div>
              <CardTitle className="text-3xl text-mahogany-800">Your Presence is Our Gift</CardTitle>
              <CardDescription className="text-lg text-bronze-700">
                Cash gifts only - no physical presents please
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-bronze-50 to-ivory-50 p-3 sm:p-6 md:p-8 rounded-xl border-2 border-bronze-300 shadow-inner">
                {/* M-Pesa Logo */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <Image 
                    src="/images/mpesa-logo.png" 
                    alt="M-Pesa Logo" 
                    width={100} 
                    height={33}
                    className="object-contain sm:w-[120px] sm:h-[40px]"
                  />
                </div>
                
                {/* Till Number in Boxes - ULTRA MOBILE FRIENDLY */}
                <div className="text-center mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-bronze-700 mb-3 sm:mb-4 font-medium">
                    Till Number
                  </p>
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    {/* Boxes row */}
                    <div className="flex gap-1 sm:gap-2">
                      {['2', '2', '7', '1', '1', '6'].map((digit, index) => (
                        <div 
                          key={index}
                          className="w-8 h-12 sm:w-12 sm:h-16 md:w-14 md:h-18 bg-white border-2 border-green-600 rounded-md sm:rounded-lg flex items-center justify-center shadow-md"
                        >
                          <span className="text-xl sm:text-3xl md:text-4xl font-bold text-green-700">
                            {digit}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    {/* Copy button - separate row on mobile */}
                    <button
                      onClick={copyTillNumber}
                      className="flex items-center gap-1.5 text-xs sm:text-sm text-bronze-600 hover:text-mahogany-700 transition-colors bg-white px-3 py-1.5 rounded-full border border-bronze-200 hover:border-mahogany-300"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-green-600 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy number</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <p className="text-center text-xs sm:text-sm text-bronze-600 px-2">
                  Use this Till Number when sending via M-Pesa
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="mb-16">
        <h2 className="section-title text-center mb-8">Our Moments</h2>
        <PhotoSlider photos={galleryPhotos} />
      </section>

      {/* Words of Love - Guest Messages */}
<section className="mb-16 py-12 bg-gradient-to-b from-transparent via-rose-50/20 to-transparent">
  <div className="text-center mb-10">
    <h2 className="section-title flex items-center justify-center gap-3 text-mahogany-800">
      <Heart className="h-6 w-6 text-rose-500 fill-current animate-pulse" />
      Love Notes
      <Heart className="h-6 w-6 text-rose-500 fill-current animate-pulse" />
    </h2>
    <p className="text-bronze-700 max-w-2xl mx-auto mt-4 text-sm sm:text-base">
      Your heartfelt wishes mean the world to us. Thank you for sharing in our joy! 💕
    </p>
  </div>
  
  <MessagesCarousel />
  
  <div className="text-center mt-8">
    <p className="text-sm text-bronze-600 mb-4">
      Want to share your love and wishes?
    </p>
    <Link href="/rsvp">
      <Button 
        variant="outline" 
        className="gap-2 border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400"
      >
        <Heart className="h-4 w-4" />
        Send Your Message
      </Button>
    </Link>
  </div>
</section>

      {/* Important Information */}
      <section className="mb-16">
        <h2 className="section-title text-center mb-8">Important Information</h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <Card className="border-2 border-bronze-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-mahogany-800">
                <Users className="h-5 w-5 text-mahogany-600" />
                Couples Submit Separately
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you're attending as a couple, please note that <strong>each person should submit their own RSVP</strong> separately. This helps us with accurate headcount and meal planning.
              </p>
            </CardContent>
          </Card>

          {/* Enhanced Dress Code Section - Color Selector */}
          <Card className="border-2 border-bronze-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-mahogany-800">
                <Shirt className="h-5 w-5 text-mahogany-600" />
                Dress Code
              </CardTitle>
              <CardDescription className="text-bronze-700">
                Find Your Shade of Love
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Pick a shade of brown that matches your vibe, your love, or your personality, and come shine with us on our big day.
              </p>
              
              {/* Color Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                {dressCodeColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    className="group relative aspect-square rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-mahogany-500 focus:ring-offset-2"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
                      <span className="text-4xl sm:text-5xl">{color.emoji}</span>
                    </div>
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                Tap any color to discover your shade
              </p>
              
              <div className="mt-4 pt-4 border-t border-bronze-200">
                <p className="text-xs text-muted-foreground text-center italic">
                  Choose the shade that feels most you… and come celebrate love, laughter, and a whole lot of brown magic with us!
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-300 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Calendar className="h-5 w-5 text-orange-600" />
                Cancellation Deadline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-bronze-700">
                If you need to cancel your reservation, please do so by <strong>December 20th, 2025</strong>. This helps us finalize arrangements with the venue and caterer.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Location */}
      <section className="mb-16">
        <h2 className="section-title text-center mb-8">Location</h2>
        <Card className="max-w-3xl mx-auto border-2 border-bronze-200 overflow-hidden">
          <CardContent className="p-0">
            {/* Background Image with Overlay */}
            <div className="relative aspect-video overflow-hidden">
              <Image 
                src="/images/Rusinga-Island-Lodge.jpg"
                alt="Rusinga Island Lodge"
                fill
                className="object-cover"
                priority
              />
              {/* Overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
              
              {/* Content Overlay - Clickable */}
              <Link 
                href="https://maps.google.com/?q=Rusinga+Island+Lodge" 
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white hover:bg-black/10 transition-colors cursor-pointer group"
              >
                <MapPin className="h-12 w-12 mb-4 drop-shadow-lg group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl md:text-3xl font-serif font-bold mb-2 drop-shadow-lg text-center group-hover:underline">
                  Rusinga Island Lodge
                </h3>
                <p className="text-sm md:text-base drop-shadow-lg text-center">
                  Rusinga Island, Lake Victoria, Kenya
                </p>
                <p className="text-xs mt-2 opacity-75 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Click for directions
                </p>
              </Link>
            </div>

            {/* Details Section */}
            <div className="p-6 space-y-6">
              {/* Distance */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-mahogany-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-mahogany-800">Distance from Nakuru CBD</p>
                  <p className="text-sm text-muted-foreground">Approximately 290 kilometers</p>
                </div>
              </div>

              {/* Route Information */}
              <div className="bg-sage-50 p-4 rounded-lg border border-sage-200">
                <h4 className="font-semibold text-sage-800 mb-3 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Recommended Route
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-sage-600"></div>
                    <span className="font-medium">Nakuru</span>
                  </div>
                  <div className="ml-1 border-l-2 border-sage-300 h-6"></div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-sage-600"></div>
                    <span className="font-medium">Kericho</span>
                  </div>
                  <div className="ml-1 border-l-2 border-sage-300 h-6"></div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-sage-600"></div>
                    <span className="font-medium">Mbita</span>
                  </div>
                  <div className="ml-1 border-l-2 border-sage-300 h-6"></div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full bg-mahogany-600"></div>
                    <span className="font-medium text-mahogany-700">Rusinga Island Lodge</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  ⏱️ Estimated travel time: 4-5 hours by road
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 gap-3">
                <Link 
                  href="https://maps.google.com/?q=Rusinga+Island+Lodge" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="outline" className="w-full border-bronze-300 hover:bg-bronze-50">
                    <MapPin className="h-4 w-4 mr-2" />
                    Open in Google Maps
                  </Button>
                </Link>
                <Link 
                  href="/travel"
                  className="w-full"
                >
                  <Button className="w-full bg-mahogany-600 hover:bg-mahogany-700">
                    View Travel Info
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <div className="wedding-card max-w-2xl mx-auto p-8 border-2 border-bronze-200">
          <h3 className="text-2xl font-serif text-mahogany-800 mb-3">
            We can't wait to celebrate with you!
          </h3>
          <p className="text-muted-foreground mb-6">
            Please confirm your attendance by submitting your RSVP. We have limited space for 70 guests.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/rsvp">
              <Button size="lg" className="bg-mahogany-600 hover:bg-mahogany-700">Submit Your RSVP</Button>
            </Link>
            <Link href="/travel">
              <Button size="lg" variant="outline" className="border-bronze-300 hover:bg-bronze-50">View Travel Options</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Color Modal */}
      {selectedColor && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedColor(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Color Header */}
            <div 
              className="p-6 text-center relative"
              style={{ backgroundColor: selectedColor.hex }}
            >
              <button
                onClick={() => setSelectedColor(null)}
                className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="text-4xl mb-2 block">{selectedColor.emoji}</span>
              <h3 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                {selectedColor.name}
              </h3>
              <p className="text-white/90 text-sm font-medium">
                {selectedColor.tagline}
              </p>
            </div>

            {/* Color Details */}
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-3">
                {selectedColor.description}
              </p>
              <ul className="space-y-2 mb-4">
                {selectedColor.traits.map((trait, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 mt-0.5">✔</span>
                    <span>{trait}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium text-mahogany-700 bg-mahogany-50 p-3 rounded-lg">
                {selectedColor.closing}
              </p>
              
              {/* Color Swatch */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Color Code</span>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: selectedColor.hex }}
                    />
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {selectedColor.hex}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="px-6 pb-6">
              <Button 
                onClick={() => setSelectedColor(null)}
                className="w-full bg-mahogany-600 hover:bg-mahogany-700"
              >
                Got it!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
}
