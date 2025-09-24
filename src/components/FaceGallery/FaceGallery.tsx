import React, { useState } from 'react';
import { Upload, Star, User, Search } from 'lucide-react';
import type { TargetFace } from '../../types/index';
import { useFaceSwapStore } from '../../contexts/store';

interface FaceGalleryProps {
  className?: string;
}

// Mock data - in a real app, this would come from an API or database
const mockCelebrityFaces: TargetFace[] = [  {
    id: 'obama',
    name: 'Barack Obama',
    imageUrl: '/faces/obama/thumb.svg',
    thumbnailUrl: '/faces/obama/thumb.svg',
    expressions: {
      neutral: '/faces/obama/thumb.svg',
      happy: '/faces/obama/thumb.svg',
      sad: '/faces/obama/thumb.svg',
    },
    metadata: {
      celebrity: true,
      category: 'Political',
      tags: ['president', 'politician'],
    },
  },
  {
    id: 'einstein',
    name: 'Albert Einstein',
    imageUrl: '/faces/einstein/thumb.svg',
    thumbnailUrl: '/faces/einstein/thumb.svg',
    expressions: {
      neutral: '/faces/einstein/thumb.svg',
      surprised: '/faces/einstein/thumb.svg',
      angry: '/faces/einstein/thumb.svg',
    },
    metadata: {
      celebrity: true,
      category: 'Science',
      tags: ['scientist', 'physicist'],
    },
  },
  {
    id: 'mona-lisa',
    name: 'Mona Lisa',
    imageUrl: '/faces/mona-lisa/thumb.svg',
    thumbnailUrl: '/faces/mona-lisa/thumb.svg',
    expressions: {
      neutral: '/faces/mona-lisa/thumb.svg',
      happy: '/faces/mona-lisa/thumb.svg',
    },
    metadata: {
      celebrity: true,
      category: 'Art',
      tags: ['painting', 'classic'],
    },
  },
];

export const FaceGallery: React.FC<FaceGalleryProps> = ({ className = '' }) => {
  const { currentTargetFace, setCurrentTargetFace } = useFaceSwapStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadedFaces, setUploadedFaces] = useState<TargetFace[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const categories = ['all', 'Political', 'Science', 'Art', 'Entertainment', 'Custom'];
  
  const filteredFaces = [...mockCelebrityFaces, ...uploadedFaces].filter(face => {
    const matchesSearch = face.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         face.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
                           face.metadata?.category === selectedCategory ||
                           (selectedCategory === 'Custom' && !face.metadata?.celebrity);
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // In a real app, you would process the image to extract faces
      // For now, we'll create a mock target face
      const newFace: TargetFace = {
        id: `custom_${Date.now()}`,
        name: `Custom Face ${uploadedFaces.length + 1}`,
        imageUrl: previewUrl,
        thumbnailUrl: previewUrl,
        expressions: {
          neutral: previewUrl,
        },
        metadata: {
          celebrity: false,
          category: 'Custom',
          tags: ['uploaded', 'custom'],
        },
      };
      
      setUploadedFaces(prev => [...prev, newFace]);
    } catch (error) {
      console.error('Failed to upload face:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFaceSelect = (face: TargetFace) => {
    setCurrentTargetFace(face);
  };

  return (
    <div className={`card p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Select Target Face
        </h2>
        
        {/* Search and Filter */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search faces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors duration-200 cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isUploading ? 'Uploading...' : 'Click to upload your own face'}
            </p>
          </div>
        </label>
      </div>

      {/* Face Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFaces.map(face => (
          <div
            key={face.id}
            onClick={() => handleFaceSelect(face)}
            className={`face-gallery-item p-2 ${
              currentTargetFace?.id === face.id ? 'selected' : ''
            }`}
          >
            <div className="aspect-square relative">
              <img
                src={face.thumbnailUrl}
                alt={face.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  // Fallback to a placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01MCA2NUM1Ny4xOCA2NSA2MyA1OS4xOCA2MyA1MkM2MyA0NC44MiA1Ny4xOCAzOSA1MCAzOUM0Mi44MiAzOSAzNyA0NC44MiAzNyA1MkMzNyA1OS4xOCA0Mi44MiA2NSA1MCA2NVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTI1IDc1QzI1IDY2LjE2IDMzLjk1IDU5IDQ1IDU5SDU1QzY2LjA1IDU5IDc1IDY2LjE2IDc1IDc1VjgwSDI1Vjc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                }}
              />
              
              {/* Celebrity badge */}
              {face.metadata?.celebrity && (
                <div className="absolute top-1 right-1 bg-yellow-500 rounded-full p-1">
                  <Star className="w-3 h-3 text-white" />
                </div>
              )}
              
              {/* Custom upload badge */}
              {!face.metadata?.celebrity && (
                <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {face.name}
              </p>
              {face.metadata?.category && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {face.metadata.category}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredFaces.length === 0 && (
        <div className="text-center py-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No faces found matching your criteria
          </p>
        </div>
      )}
      
      {/* Selected Face Info */}
      {currentTargetFace && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
            Selected: {currentTargetFace.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Available expressions: {Object.keys(currentTargetFace.expressions).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};

export default FaceGallery;
