// Face database with target faces for swapping
export interface FaceData {
  id: string;
  name: string;
  description: string;
  category: 'celebrity' | 'historical' | 'fictional' | 'custom';
  thumbnailPath: string;
  imagePath: string;
  landmarks?: number[][];
  expressions?: {
    neutral?: number[];
    happy?: number[];
    surprised?: number[];
    angry?: number[];
    sad?: number[];
  };
  metadata: {
    created: string;
    quality: 'high' | 'medium' | 'low';
    resolution: string;
    tags: string[];
  };
}

export const faceDatabase: FaceData[] = [
  {
    id: 'einstein',
    name: 'Albert Einstein',
    description: 'Renowned physicist and Nobel Prize winner',
    category: 'historical',
    thumbnailPath: '/faces/einstein/thumb.svg',
    imagePath: '/faces/einstein/thumb.svg', // Using SVG for now
    metadata: {
      created: '2024-01-01',
      quality: 'high',
      resolution: '512x512',
      tags: ['scientist', 'genius', 'physics', 'mustache']
    }
  },
  {
    id: 'mona-lisa',
    name: 'Mona Lisa',
    description: 'Leonardo da Vinci\'s masterpiece',
    category: 'historical',
    thumbnailPath: '/faces/mona-lisa/thumb.svg',
    imagePath: '/faces/mona-lisa/thumb.svg', // Using SVG for now
    metadata: {
      created: '2024-01-01',
      quality: 'high',
      resolution: '512x512',
      tags: ['art', 'renaissance', 'mysterious', 'classic']
    }
  },
  {
    id: 'obama',
    name: 'Barack Obama',
    description: '44th President of the United States',
    category: 'celebrity',
    thumbnailPath: '/faces/obama/thumb.svg',
    imagePath: '/faces/obama/thumb.svg', // Using SVG for now
    metadata: {
      created: '2024-01-01',
      quality: 'high',
      resolution: '512x512',
      tags: ['president', 'politician', 'leader', 'charismatic']
    }
  }
];

export const getFaceById = (id: string): FaceData | undefined => {
  return faceDatabase.find(face => face.id === id);
};

export const getFacesByCategory = (category: string): FaceData[] => {
  return faceDatabase.filter(face => face.category === category);
};

export const searchFaces = (query: string): FaceData[] => {
  const lowercaseQuery = query.toLowerCase();
  return faceDatabase.filter(face => 
    face.name.toLowerCase().includes(lowercaseQuery) ||
    face.description.toLowerCase().includes(lowercaseQuery) ||
    face.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};
