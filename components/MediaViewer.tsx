'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShopifyMedia, ShopifyMediaType } from '@/types/shopify';
import Model3DViewer from './Model3DViewer';
import VideoViewer from './VideoViewer';

interface MediaViewerProps {
  media: ShopifyMedia[];
  className?: string;
}

export default function MediaViewer({
  media,
  className = '',
}: MediaViewerProps) {
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-24 h-24 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p>No media available</p>
        </div>
      </div>
    );
  }

  const selectedMedia = media[selectedMediaIndex];

  const renderMedia = (mediaItem: ShopifyMedia) => {
    // console.log('Renderizando mídia:', {
    //   id: mediaItem.id,
    //   type: mediaItem.mediaContentType,
    //   fullData: mediaItem,
    //   hasSubObject: {
    //     model3d: !!mediaItem.model3d,
    //     video: !!mediaItem.video,
    //     externalVideo: !!mediaItem.externalVideo,
    //     image: !!mediaItem.image,
    //   },
    //   hasDirectFields: {
    //     sources: !!mediaItem.sources,
    //     host: !!mediaItem.host,
    //     originUrl: !!mediaItem.originUrl,
    //   },
    // });

    switch (mediaItem.mediaContentType) {
      case 'IMAGE':
        if (mediaItem.image) {
          return (
            <Image
              src={mediaItem.image.url}
              alt={mediaItem.image.altText || 'Product image'}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority={selectedMediaIndex === 0}
            />
          );
        }
        break;

      case 'VIDEO':
        // Os dados do vídeo também podem estar diretamente no mediaItem
        if (mediaItem.video) {
          return (
            <VideoViewer
              video={mediaItem.video}
              className="w-full h-full"
              controls={true}
              autoPlay={false}
              loop={true}
              muted={true}
            />
          );
        } else if (mediaItem.sources) {
          const videoData = {
            id: mediaItem.id,
            sources: mediaItem.sources,
          };
          return (
            <VideoViewer
              video={videoData}
              className="w-full h-full"
              controls={true}
              autoPlay={false}
              loop={true}
              muted={true}
            />
          );
        }
        break;

      case 'MODEL_3D':
        // Os dados do modelo 3D estão diretamente no mediaItem, não em mediaItem.model3d
        if (mediaItem.sources) {
          const model3dData = {
            id: mediaItem.id,
            sources: mediaItem.sources,
          };
          return (
            <Model3DViewer
              model={model3dData}
              className="w-full h-full"
              autoRotate={true}
              cameraControls={true}
              ar={true}
            />
          );
        }
        break;

      case 'EXTERNAL_VIDEO':
        // Tentar pegar dados do externalVideo ou diretamente do mediaItem
        const externalVideoData = mediaItem.externalVideo || {
          host: mediaItem.host,
          originUrl: mediaItem.originUrl,
        };

        if (externalVideoData.host && externalVideoData.originUrl) {
          const embedUrl = getEmbedUrl(
            externalVideoData.host,
            externalVideoData.originUrl,
          );

          return (
            <div className="w-full h-full">
              <iframe
                src={embedUrl}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="External Video"
              />
            </div>
          );
        }
        break;

      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Unsupported media type</p>
          </div>
        );
    }

    return null;
  };

  const getMediaIcon = (mediaType: ShopifyMediaType) => {
    switch (mediaType) {
      case 'IMAGE':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        );
      case 'VIDEO':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        );
      case 'MODEL_3D':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l-1.5 6L7 9l5 3-5 3 3.5 1.5L12 22l1.5-5.5L17 15l-5-3 5-3-3.5-1.5L12 2z" />
          </svg>
        );
      case 'EXTERNAL_VIDEO':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        );
    }
  };

  const getPreviewImage = (mediaItem: ShopifyMedia) => {
    // Only images have preview images in Shopify API
    if (mediaItem.mediaContentType === 'IMAGE' && mediaItem.image) {
      return mediaItem.image.url;
    }
    // For other media types, we don't have preview images
    return null;
  };

  const renderThumbnailContent = (mediaItem: ShopifyMedia) => {
    const previewImage = getPreviewImage(mediaItem);

    if (previewImage) {
      return (
        <Image
          src={previewImage}
          alt={`Media ${mediaItem.id}`}
          fill
          className="object-cover"
          sizes="100px"
        />
      );
    }

    // Para tipos sem preview, criar um visual mais atraente
    switch (mediaItem.mediaContentType) {
      case 'MODEL_3D':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <svg
              className="w-8 h-8 mb-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l-1.5 6L7 9l5 3-5 3 3.5 1.5L12 22l1.5-5.5L17 15l-5-3 5-3-3.5-1.5L12 2z" />
            </svg>
            <span className="text-xs font-medium">3D</span>
          </div>
        );

      case 'VIDEO':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 text-white">
            <svg
              className="w-8 h-8 mb-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <span className="text-xs font-medium">VIDEO</span>
          </div>
        );

      case 'EXTERNAL_VIDEO':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 text-white">
            <svg
              className="w-8 h-8 mb-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
            </svg>
            <span className="text-xs font-medium">STREAM</span>
          </div>
        );

      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {getMediaIcon(mediaItem.mediaContentType)}
          </div>
        );
    }
  };

  // Helper function to get embed URL for external videos
  const getEmbedUrl = (host: 'YOUTUBE' | 'VIMEO', originUrl: string) => {
    if (host === 'YOUTUBE') {
      const videoId =
        originUrl.split('v=')[1]?.split('&')[0] || originUrl.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (host === 'VIMEO') {
      const videoId = originUrl.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return originUrl;
  };

  return (
    <div className={className}>
      {/* Main Media Display */}
      <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden mb-4">
        {renderMedia(selectedMedia)}

        {/* Media Type Badge */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs">
          {getMediaIcon(selectedMedia.mediaContentType)}
          <span className="capitalize">
            {selectedMedia.mediaContentType.toLowerCase().replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Media Thumbnails */}
      {media.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {media.map((mediaItem, index) => {
            const previewImage = getPreviewImage(mediaItem);

            return (
              <button
                key={mediaItem.id}
                onClick={() => setSelectedMediaIndex(index)}
                className={`aspect-square relative bg-gray-100 rounded-md overflow-hidden border-2 ${
                  selectedMediaIndex === index
                    ? 'border-black'
                    : 'border-transparent'
                } hover:border-gray-400 transition-colors`}
              >
                {renderThumbnailContent(mediaItem)}

                {/* Media Type Indicator */}
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white p-1 rounded">
                  {getMediaIcon(mediaItem.mediaContentType)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
