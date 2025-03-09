import { useState, useRef } from 'react';

export default function ImageUploadForm({ addMeal, isLoading, setIsLoading, selectedDate }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const fileInputRef = useRef(null);

  // Function to resize and compress an image
  const resizeAndCompressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * maxHeight / height);
              height = maxHeight;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed JPEG format
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          console.log(`Original size: ~${Math.round(file.size / 1024)}KB, Compressed size: ~${Math.round(compressedDataUrl.length / 1024)}KB`);
          resolve(compressedDataUrl);
        };
      };
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.match('image.*')) {
      setError('Please select an image file (png, jpg, jpeg)');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    console.log('Image selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    setImage(file);
    setError('');

    try {
      // Create a preview with resized and compressed image
      const compressedImage = await resizeAndCompressImage(file);
      setImagePreview(compressedImage);
      console.log('Compressed image preview created');
    } catch (err) {
      console.error('Error creating image preview:', err);
      // Fallback to original method if compression fails
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        console.log('Original image preview created (compression failed)');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError('Please select an image');
      return;
    }

    setError('');
    setDebugInfo(null);
    setIsLoading(true);

    try {
      console.log('Starting image upload and analysis');
      
      // Create a FormData object to send the image and description
      const formData = new FormData();
      formData.append('image', image);
      formData.append('description', description);

      console.log('Sending request to analyze-food-image API');
      const response = await fetch('/api/analyze-food-image', {
        method: 'POST',
        body: formData,
      });

      console.log('Response received:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to analyze food image: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Analysis data received:', data);

      // Create a thumbnail version of the image preview for storage
      // This ensures the data sent to the API is small enough
      let thumbnailPreview = imagePreview;
      
      // If the image preview is too large, create an even smaller thumbnail
      if (imagePreview && imagePreview.length > 100 * 1024) { // If larger than 100KB
        console.log('Image preview too large, creating smaller thumbnail');
        // Create a temporary image element
        const img = new Image();
        img.src = imagePreview;
        
        await new Promise((resolve) => {
          img.onload = () => {
            // Create a smaller thumbnail (200px max dimension, higher compression)
            const canvas = document.createElement('canvas');
            const maxDimension = 200;
            const ratio = Math.min(maxDimension / img.width, maxDimension / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Use higher compression (0.5 quality)
            thumbnailPreview = canvas.toDataURL('image/jpeg', 0.5);
            console.log(`Thumbnail created: ~${Math.round(thumbnailPreview.length / 1024)}KB`);
            resolve();
          };
        });
      }

      // Create a timestamp for the selected date
      const timestamp = new Date();
      if (selectedDate) {
        const selectedDateObj = new Date(selectedDate);
        // Keep the current time but use the selected date
        timestamp.setFullYear(selectedDateObj.getFullYear());
        timestamp.setMonth(selectedDateObj.getMonth());
        timestamp.setDate(selectedDateObj.getDate());
      }

      // Add timestamp and image preview to the meal data
      const mealWithTimestamp = {
        ...data,
        description: description || 'Food from image',
        timestamp: timestamp.toISOString(),
        imagePreview: thumbnailPreview,
        date: selectedDate // Add the selected date explicitly
      };

      console.log('Prepared meal data for saving:', {
        description: mealWithTimestamp.description,
        timestamp: mealWithTimestamp.timestamp,
        date: mealWithTimestamp.date,
        hasNutrition: !!mealWithTimestamp.nutrition,
        hasImagePreview: !!mealWithTimestamp.imagePreview,
        imagePreviewSize: thumbnailPreview ? Math.round(thumbnailPreview.length / 1024) + 'KB' : 'none'
      });

      console.log('Calling addMeal function');
      await addMeal(mealWithTimestamp);
      console.log('addMeal function completed');
      
      // Reset form
      setImage(null);
      setImagePreview(null);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error analyzing food image:', err);
      setError(`Failed to analyze food image: ${err.message}`);
      setDebugInfo(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Add Food by Image</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div 
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 ${
              imagePreview ? 'border-indigo-300' : 'border-gray-300'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
              disabled={isLoading}
            />
            
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Food preview" 
                  className="mx-auto max-h-64 rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage(null);
                    setImagePreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Click to upload a photo of your food</p>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="imageDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="imageDescription"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows="2"
            placeholder="Add any additional details about the food (e.g., 'Homemade pasta with tomato sauce')"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500">
            This will help improve the accuracy of the analysis
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">
            <p>{error}</p>
            {debugInfo && (
              <details className="mt-2">
                <summary className="cursor-pointer">Technical Details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">{debugInfo}</pre>
              </details>
            )}
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isLoading || !image}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Food Image'}
        </button>
      </form>
    </div>
  );
} 