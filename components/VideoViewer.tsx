'use client';

import { ShopifyVideo } from '@/types/shopify';

interface VideoViewerProps {
  video: ShopifyVideo;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export default function VideoViewer({
  video,
  className = '',
  controls = true,
  autoPlay = false,
  loop = false,
  muted = true,
}: VideoViewerProps) {
  // Find the best source (prefer MP4)
  const getBestSource = () => {
    const sources = video.sources;

    // Prefer MP4 format
    const mp4Source = sources.find((source) => source.mimeType === 'video/mp4');

    if (mp4Source) return mp4Source;

    // Then WebM
    const webmSource = sources.find(
      (source) => source.mimeType === 'video/webm'
    );

    if (webmSource) return webmSource;

    // Otherwise use the first available
    return sources[0];
  };

  const source = getBestSource();
  // Note: Shopify API doesn't provide preview images for videos
  // You may need to generate thumbnails or use a placeholder

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
            <path d="M8 5v14l11-7z" />
          </svg>
          <p>Video Unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <video
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        className="w-full h-full object-cover rounded-lg"
        preload="metadata"
      >
        <source src={source.url} type={source.mimeType} />
        {/* Fallback for multiple sources */}
        {video.sources.map((videoSource, index) => (
          <source
            key={index}
            src={videoSource.url}
            type={videoSource.mimeType}
          />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Play button overlay for non-autoplay videos */}
      {!autoPlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-50 rounded-full p-4">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
