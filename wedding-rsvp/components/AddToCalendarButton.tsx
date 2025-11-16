import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateGoogleCalendarLink } from '@/lib/calendar';

interface AddToCalendarButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export default function AddToCalendarButton({ 
  variant = 'outline', 
  size = 'default',
  className = '' 
}: AddToCalendarButtonProps) {
  const handleAddToCalendar = () => {
    const calendarLink = generateGoogleCalendarLink();
    window.open(calendarLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAddToCalendar}
      className={className}
    >
      <Calendar className="mr-2 h-4 w-4" />
      Add to Google Calendar
    </Button>
  );
}
