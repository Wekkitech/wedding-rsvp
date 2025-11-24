'use client';

import { useEffect, useState, useRef } from 'react';
import { Heart, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Message {
  id: string;
  message: string;
  guestName: string;
  date: string;
}

export default function MessagesCarousel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  // Auto-advance carousel every 10 seconds
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Only set timer if we have multiple messages
    if (messages.length <= 1) {
      return;
    }

    // Set up the interval for 10 seconds
    timerRef.current = setInterval(() => {
      console.log('Auto-advancing carousel...');
      
      // Start transition
      setIsTransitioning(true);
      
      // Wait for fade out, then change message
      setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % messages.length;
          console.log(`Auto-advance: ${prevIndex} → ${nextIndex} (of ${messages.length} messages)`);
          return nextIndex;
        });
        
        // Fade back in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 600);
    }, 10000); // Changed to 10 seconds

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [messages.length]);

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched messages:', data.messages?.length || 0);
        setMessages(data.messages || []);
      } else {
        console.error('❌ Failed to fetch messages:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Heart className="h-8 w-8 text-rose-400" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 text-rose-300 mx-auto mb-4" />
        <p className="text-muted-foreground">
          Be the first to share your wishes!
        </p>
      </div>
    );
  }

  const currentMessage = messages[currentIndex];

  return (
    <div className="relative max-w-4xl mx-auto px-4">
      {/* Decorative hearts */}
      <div className="absolute -top-4 left-8 text-rose-200 animate-float">
        <Heart className="h-6 w-6 fill-current" />
      </div>
      <div className="absolute -bottom-4 right-8 text-rose-200 animate-float" style={{ animationDelay: '1s' }}>
        <Heart className="h-6 w-6 fill-current" />
      </div>

      <Card className="border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-50 shadow-xl">
        <CardContent className="p-8 md:p-12">
          <div className="relative min-h-[200px] flex items-center justify-center">
            {/* Opening Quote */}
            <Quote className="h-12 w-12 text-rose-300 absolute -left-4 -top-4 rotate-180" />
            
            {/* Message Content with Smooth Transition */}
            <div 
              className={`
                w-full
                transition-all duration-700 ease-in-out
                ${isTransitioning 
                  ? 'opacity-0 transform scale-95' 
                  : 'opacity-100 transform scale-100'
                }
              `}
            >
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 italic font-serif text-center px-8 whitespace-pre-wrap">
                "{currentMessage.message}"
              </p>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-rose-300" />
                  <Heart className="h-4 w-4 text-rose-400 fill-current" />
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-rose-300" />
                </div>
                <p className="text-sm font-medium text-mahogany-700">
                  {currentMessage.guestName}
                </p>
              </div>
            </div>

            {/* Closing Quote */}
            <Quote className="h-12 w-12 text-rose-300 absolute -right-4 -bottom-4" />
          </div>
        </CardContent>
      </Card>

      {/* Floating animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
