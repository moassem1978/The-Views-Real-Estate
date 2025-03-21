import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { SearchFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceSearchProps {
  onFilterChange: (filters: SearchFilters) => void;
}

export default function VoiceSearch({ onFilterChange }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [processingCommand, setProcessingCommand] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  
  // Configure speech recognition options
  const commands = [
    {
      command: ['find properties in *', 'show properties in *', 'search for properties in *', 'properties in *'],
      callback: (location: string) => {
        setProcessingCommand(true);
        console.log(`Searching for properties in ${location}`);
        handleVoiceSearch({ location });
      },
    },
    {
      command: ['find * bedroom properties', 'show * bedroom properties', 'search for * bedroom properties', '* bedroom properties'],
      callback: (bedrooms: string) => {
        setProcessingCommand(true);
        const bedroomsNum = convertStringToNumber(bedrooms);
        if (bedroomsNum) {
          console.log(`Searching for properties with ${bedroomsNum} bedrooms`);
          handleVoiceSearch({ minBedrooms: bedroomsNum });
        }
      },
    },
    {
      command: ['find * bathroom properties', 'show * bathroom properties', 'search for * bathroom properties', '* bathroom properties'],
      callback: (bathrooms: string) => {
        setProcessingCommand(true);
        const bathroomsNum = convertStringToNumber(bathrooms);
        if (bathroomsNum) {
          console.log(`Searching for properties with ${bathroomsNum} bathrooms`);
          handleVoiceSearch({ minBathrooms: bathroomsNum });
        }
      },
    },
    {
      command: ['find properties under *', 'show properties under *', 'search for properties under *', 'properties under *'],
      callback: (priceStr: string) => {
        setProcessingCommand(true);
        const price = extractPrice(priceStr);
        if (price) {
          console.log(`Searching for properties under ${price}`);
          handleVoiceSearch({ maxPrice: price });
        }
      },
    },
    {
      command: ['find properties over *', 'show properties over *', 'search for properties over *', 'properties over *'],
      callback: (priceStr: string) => {
        setProcessingCommand(true);
        const price = extractPrice(priceStr);
        if (price) {
          console.log(`Searching for properties over ${price}`);
          handleVoiceSearch({ minPrice: price });
        }
      },
    },
    {
      command: ['find * properties', 'show * properties', 'search for * properties', '* properties'],
      callback: (propertyType: string) => {
        setProcessingCommand(true);
        const validPropertyTypes = ['house', 'apartment', 'condo', 'villa', 'penthouse', 'townhouse', 'duplex', 'estate'];
        if (validPropertyTypes.includes(propertyType.toLowerCase())) {
          console.log(`Searching for ${propertyType} properties`);
          handleVoiceSearch({ propertyType: capitalizeFirstLetter(propertyType) });
        }
      },
    },
    {
      command: ['clear filters', 'reset filters', 'clear search', 'reset search', 'show all properties'],
      callback: () => {
        setProcessingCommand(true);
        console.log('Clearing all filters');
        handleVoiceSearch({});
        toast({
          title: 'Filters Reset',
          description: 'Showing all properties',
        });
      },
    },
    {
      command: 'help',
      callback: () => {
        setProcessingCommand(true);
        toast({
          title: 'Voice Search Help',
          description: 'Try commands like: "Find properties in Miami", "Show 3 bedroom properties", "Find properties under $1 million", or "Show villa properties"',
          duration: 5000,
        });
      },
    },
  ];
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition({ commands });

  // Update the UI listening state when SpeechRecognition changes state
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);
  
  // Update the transcript in our local state
  useEffect(() => {
    if (transcript && !processingCommand) {
      setRecognizedText(transcript);
    }
  }, [transcript, processingCommand]);
  
  // Reset the processing flag after a command is handled
  useEffect(() => {
    if (processingCommand) {
      setTimeout(() => {
        setProcessingCommand(false);
        resetTranscript();
        setRecognizedText('');
      }, 1000);
    }
  }, [processingCommand, resetTranscript]);

  const handleVoiceSearch = (filters: SearchFilters) => {
    onFilterChange(filters);
    
    // Create a user-friendly message based on the filters
    let message = 'Searching for properties';
    if (filters.location) message += ` in ${filters.location}`;
    if (filters.propertyType) message += ` of type ${filters.propertyType}`;
    if (filters.minBedrooms) message += ` with at least ${filters.minBedrooms} bedrooms`;
    if (filters.minBathrooms) message += ` with at least ${filters.minBathrooms} bathrooms`;
    if (filters.minPrice) message += ` over $${formatPrice(filters.minPrice)}`;
    if (filters.maxPrice) message += ` under $${formatPrice(filters.maxPrice)}`;
    
    // If we have at least one filter, show the toast
    if (Object.keys(filters).length > 0) {
      toast({
        title: 'Voice Search',
        description: message,
      });
    }
  };

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      setRecognizedText('');
      SpeechRecognition.startListening({ continuous: true });
      
      toast({
        title: 'Voice Search Activated',
        description: 'Try saying "Find properties in Miami" or "Show 3 bedroom properties"',
      });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex items-center p-2 text-amber-600 bg-amber-50 rounded-md">
        <MicOff className="w-5 h-5 mr-2" />
        <span className="text-sm">Voice search is not supported in this browser.</span>
      </div>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <div className="flex items-center p-2 text-amber-600 bg-amber-50 rounded-md">
        <MicOff className="w-5 h-5 mr-2" />
        <span className="text-sm">Please allow microphone access to use voice search.</span>
      </div>
    );
  }

  return (
    <div className="voice-search">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isListening ? "destructive" : "default"}
          size="sm"
          className={`rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-[#B87333] hover:bg-[#955A28]'} text-white transition-colors`}
          onClick={toggleListening}
        >
          {isListening ? (
            <MicOff className="w-4 h-4 mr-2" />
          ) : (
            <Mic className="w-4 h-4 mr-2" />
          )}
          {isListening ? 'Stop Listening' : 'Voice Search'}
        </Button>
        
        {isListening && (
          <span className="text-sm text-gray-600 animate-pulse">
            Listening...
          </span>
        )}
      </div>
      
      {isListening && recognizedText && (
        <div className="mt-2 p-2 rounded-md bg-gray-50 text-sm text-gray-700">
          <p className="font-medium mb-1">I heard:</p>
          <p className="italic">{recognizedText}</p>
        </div>
      )}
    </div>
  );
}

// Helper functions
function convertStringToNumber(str: string): number | null {
  const numericWords: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
  };
  
  // Check if the string is a written number
  const lowerStr = str.toLowerCase();
  if (numericWords[lowerStr]) {
    return numericWords[lowerStr];
  }
  
  // Check if it's a digit
  const num = Number(str);
  if (!isNaN(num)) {
    return num;
  }
  
  return null;
}

function extractPrice(priceStr: string): number | null {
  // Remove non-numeric characters except for decimal points
  const numericStr = priceStr.replace(/[^0-9.]/g, '');
  const num = parseFloat(numericStr);
  
  if (!isNaN(num)) {
    // Check if the original string contains million/m/k keywords
    if (priceStr.toLowerCase().includes('million') || priceStr.toLowerCase().includes(' m')) {
      return num * 1000000;
    } else if (priceStr.toLowerCase().includes('k') || priceStr.toLowerCase().includes('thousand')) {
      return num * 1000;
    }
    return num;
  }
  
  return null;
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1) + 'M';
  } else if (price >= 1000) {
    return (price / 1000).toFixed(0) + 'K';
  }
  return price.toString();
}