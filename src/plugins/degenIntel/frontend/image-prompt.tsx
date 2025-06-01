import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import Loader from './loader';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function ImagePrompt() {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/image-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      return url;
    },
    mutationKey: ['image_prompt'],
    onSuccess: (data) => {
      setImageUrl(data);
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setImageUrl(null);
    }
  });

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    mutation.mutate();
  };

  return (
    <Card className="bg-white shadow-lg border border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">🎨 LORA Image Generator</CardTitle>
        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
          AI-powered image generation using custom LORA models
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Input Section */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Generate Image</h3>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Enter your image prompt (e.g., 'a futuristic trading robot')"
              value={prompt}
              onChange={({ target }) => setPrompt(target.value)}
              className="flex-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && generateImage()}
            />
            <Button 
              disabled={mutation?.isPending || !prompt.trim()} 
              onClick={generateImage}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
            >
              {mutation?.isPending ? 'Generating...' : 'Generate'}
            </Button>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">❌ Error: {error}</p>
            </div>
          )}
        </div>

        {/* Loading State */}
        {mutation?.isPending && (
          <div className="text-center py-8 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader />
            <p className="mt-3 text-blue-800 font-medium">Generating your image...</p>
            <p className="text-sm text-blue-600 mt-1">This may take 30-60 seconds</p>
          </div>
        )}

        {/* Generated Image Display */}
        {mutation?.data && imageUrl && (
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Generated Image</h3>
            <div className="bg-white border border-gray-300 rounded-lg p-2">
              <img
                src={mutation?.data}
                width={750}
                height={750}
                className="mx-auto max-w-full rounded-lg shadow-sm"
                alt="Generated LORA image"
              />
            </div>
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">✅ Image generated successfully!</p>
              <p className="text-xs text-green-600 mt-1">Prompt: "{prompt}"</p>
            </div>
          </div>
        )}

        {/* Configuration Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">⚙️ Configuration</h3>
          <div className="text-sm space-y-2">
            <p className="text-gray-700">
              <strong>Status:</strong> To enable live LORA image generation, configure:
            </p>
            <div className="bg-gray-800 text-gray-100 p-3 rounded font-mono text-xs">
              <code>
                LORA_API_KEY=your_lora_api_key<br/>
                LORA_MODEL_ID=your_model_id<br/>
                IMAGE_GENERATION_ENABLED=true
              </code>
            </div>
            <p className="text-gray-600 text-xs mt-2">
              Currently showing mock responses for demonstration. Configure your LORA API to generate real images.
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
