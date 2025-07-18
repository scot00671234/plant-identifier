export interface PlantIdentificationResult {
  scientificName: string;
  commonName: string;
  confidence: number;
  family?: string;
  description?: string;
  origin?: string;
  type?: string;
}

export async function identifyPlant(imageBase64: string): Promise<PlantIdentificationResult> {
  const apiKey = import.meta.env.VITE_PLANT_ID_API_KEY || 'your-api-key-here';
  
  const response = await fetch('https://api.plant.id/v3/identification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': apiKey,
    },
    body: JSON.stringify({
      images: [imageBase64],
      similar_images: true,
      plant_details: ['common_names', 'url', 'description', 'taxonomy'],
    }),
  });

  if (!response.ok) {
    throw new Error(`Plant.id API error: ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.result?.classification?.suggestions?.length) {
    throw new Error('No plant identified in this image');
  }

  const suggestion = result.result.classification.suggestions[0];
  
  return {
    scientificName: suggestion.name,
    commonName: suggestion.details?.common_names?.[0] || suggestion.name,
    confidence: Math.round(suggestion.probability * 100),
    family: suggestion.details?.taxonomy?.family,
    description: suggestion.details?.description?.value,
    origin: suggestion.details?.taxonomy?.kingdom,
    type: suggestion.details?.taxonomy?.class,
  };
}
