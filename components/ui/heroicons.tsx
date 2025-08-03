import React from 'react';
import * as HeroIcons from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';

export interface HeroIconProps {
  name: string;
  size?: number;
  className?: string;
  variant?: 'outline' | 'solid';
}

export const HeroIcon: React.FC<HeroIconProps> = ({ 
  name, 
  size = 24, 
  className = '',
  variant = 'outline' 
}) => {
  const iconName = name as keyof typeof HeroIcons;
  const solidIconName = name as keyof typeof HeroIconsSolid;
  
  const IconComponent = variant === 'solid' 
    ? HeroIconsSolid[solidIconName as keyof typeof HeroIconsSolid]
    : HeroIcons[iconName];
  
  if (!IconComponent) {
    console.warn(`HeroIcon "${name}" not found`);
    return null;
  }
  
  return (
    <IconComponent 
      width={size} 
      height={size} 
      className={className}
    />
  );
};

// 자주 사용되는 아이콘들을 미리 정의
export const Icons = {
  // Navigation
  Home: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="HomeIcon" {...props} />,
  User: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="UserIcon" {...props} />,
  Settings: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="Cog6ToothIcon" {...props} />,
  Menu: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="Bars3Icon" {...props} />,
  Close: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="XMarkIcon" {...props} />,
  
  // Actions
  Plus: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="PlusIcon" {...props} />,
  Minus: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="MinusIcon" {...props} />,
  Edit: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="PencilIcon" {...props} />,
  Delete: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="TrashIcon" {...props} />,
  Search: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="MagnifyingGlassIcon" {...props} />,
  
  // Communication
  Mail: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="EnvelopeIcon" {...props} />,
  Phone: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="PhoneIcon" {...props} />,
  Chat: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ChatBubbleLeftRightIcon" {...props} />,
  Bell: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="BellIcon" {...props} />,
  
  // Status
  Check: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="CheckIcon" {...props} />,
  Error: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ExclamationTriangleIcon" {...props} />,
  Warning: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ExclamationCircleIcon" {...props} />,
  Info: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="InformationCircleIcon" {...props} />,
  
  // Media
  Play: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="PlayIcon" {...props} />,
  Pause: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="PauseIcon" {...props} />,
  Volume: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="SpeakerWaveIcon" {...props} />,
  Music: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="MusicalNoteIcon" {...props} />,
  BarChart: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ChartBarIcon" {...props} />,
  
  // Finance
  CreditCard: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="CreditCardIcon" {...props} />,
  Currency: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="CurrencyDollarIcon" {...props} />,
  Chart: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ChartBarIcon" {...props} />,
  
  // Time
  Calendar: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="CalendarIcon" {...props} />,
  Clock: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ClockIcon" {...props} />,
  
  // Data
  Database: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ServerIcon" {...props} />,
  Cloud: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="CloudIcon" {...props} />,
  Download: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ArrowDownTrayIcon" {...props} />,
  Upload: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ArrowUpTrayIcon" {...props} />,
  
  // Social
  Heart: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="HeartIcon" {...props} />,
  Star: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="StarIcon" {...props} />,
  Share: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ShareIcon" {...props} />,
  
  // Arrows
  ArrowUp: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ArrowUpIcon" {...props} />,
  ArrowDown: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ArrowDownIcon" {...props} />,
  ArrowLeft: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ArrowLeftIcon" {...props} />,
  ArrowRight: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="ArrowRightIcon" {...props} />,
  
  // Moonwave specific
  Wave: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="WaveformIcon" {...props} />,
  Moon: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="MoonIcon" {...props} />,
  Sun: (props: Omit<HeroIconProps, 'name'>) => <HeroIcon name="SunIcon" {...props} />,
};

export default HeroIcon; 