'use client';

import { useEffect, useRef, useState } from 'react';
import { ShopifyModel3d } from '@/types/shopify';

interface Model3DViewerProps {
  model: ShopifyModel3d;
  className?: string;
  autoRotate?: boolean;
  cameraControls?: boolean;
  ar?: boolean;
}

export default function Model3DViewer({
  model,
  className = '',
  autoRotate = true,
  cameraControls = true,
  ar = true,
}: Model3DViewerProps) {
  const modelViewerRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the best source (prefer GLB/GLTF formats based on MIME type)
  const getBestSource = () => {
    const sources = model.sources;

    // Prefer GLB format
    const glbSource = sources.find(
      (source) => source.mimeType === 'model/gltf-binary'
    );

    if (glbSource) return glbSource;

    // Then GLTF
    const gltfSource = sources.find(
      (source) => source.mimeType === 'model/gltf+json'
    );

    if (gltfSource) return gltfSource;

    // Otherwise use the first available
    return sources[0];
  };

  const source = getBestSource();
  // Note: Shopify API doesn't provide preview images for 3D models

  useEffect(() => {
    let modelViewer: any = null;

    const loadModelViewer = async () => {
      try {
        if (typeof window !== 'undefined' && modelViewerRef.current && source) {
          // console.log('Loading 3D model:', source.url);

          // Dynamically import model-viewer
          await import('@google/model-viewer');
          // console.log('Model-viewer library loaded successfully');

          // Clear any existing content
          if (modelViewerRef.current) {
            modelViewerRef.current.innerHTML = '';
          }

          // Create model-viewer element
          modelViewer = document.createElement('model-viewer');

          // Set attributes
          modelViewer.setAttribute('src', source.url);
          modelViewer.setAttribute('alt', '3D Model');

          if (autoRotate) {
            modelViewer.setAttribute('auto-rotate', '');
          }
          if (cameraControls) {
            modelViewer.setAttribute('camera-controls', '');
          }
          if (ar) {
            modelViewer.setAttribute('ar', '');
            modelViewer.setAttribute(
              'ar-modes',
              'webxr scene-viewer quick-look'
            );
          }

          // Essential attributes for proper loading
          modelViewer.setAttribute('shadow-intensity', '1');
          modelViewer.setAttribute('shadow-softness', '0.75');
          modelViewer.setAttribute('environment-image', 'neutral');
          modelViewer.setAttribute('tone-mapping', 'aces');
          modelViewer.setAttribute('exposure', '1');
          modelViewer.setAttribute('loading', 'eager');
          modelViewer.setAttribute('reveal', 'auto');

          // Set styles
          Object.assign(modelViewer.style, {
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6', // Light gray fallback
            display: 'block',
          });

          // Add event listeners for loading states
          modelViewer.addEventListener('load', () => {
            console.log('3D model loaded successfully');
            setIsLoading(false);
            setError(null);
          });

          modelViewer.addEventListener('error', (event: any) => {
            console.error('Model viewer error:', event);
            console.error('Failed to load model from URL:', source.url);
            setIsLoading(false);
            setError('Erro ao carregar modelo 3D');
          });

          modelViewer.addEventListener('progress', (event: any) => {
            console.log('Model loading progress:', event.detail);
          });

          // Append to container
          if (modelViewerRef.current) {
            modelViewerRef.current.appendChild(modelViewer);
            console.log('Model-viewer element added to DOM');
          }
        }
      } catch (error) {
        console.error('Error setting up model viewer:', error);
        setIsLoading(false);
        setError('Erro ao inicializar visualizador 3D');
      }
    };

    if (source) {
      setIsLoading(true);
      setError(null);
      loadModelViewer();
    }

    return () => {
      const currentRef = modelViewerRef.current;
      if (modelViewer && currentRef?.contains(modelViewer)) {
        currentRef.removeChild(modelViewer);
      }
    };
  }, [source, autoRotate, cameraControls, ar]);

  if (!source) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-2"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <p>3D Model Unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={modelViewerRef as any}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      {/* AR Button */}
      {ar && (
        <div className="absolute bottom-4 right-4">
          <button
            className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-gray-800 transition-colors"
            onClick={() => {
              const modelViewer = modelViewerRef.current as any;
              if (modelViewer && modelViewer.activateAR) {
                modelViewer.activateAR();
              }
            }}
          >
            View in AR
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg transition-opacity duration-300">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Carregando modelo 3D...</p>
            <p className="text-xs text-gray-500 mt-1">
              Isso pode levar alguns segundos
            </p>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center text-red-500">
            <svg
              className="w-16 h-16 mx-auto mb-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <p>{error}</p>
            <p className="text-xs mt-1">
              Verifique se o arquivo está acessível
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
