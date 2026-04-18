import { useEffect, useRef, useState } from 'react';

export function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollBlur, setScrollBlur] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = 500;

      // Calculate blur for smooth transition
      const blurValue = Math.min((scrollY / maxScroll) * 20, 20);

      setScrollBlur(blurValue);

      // Map scroll to video time (scrub through video based on scroll)
      const maxScrollForVideo = window.innerHeight * 2; // 2x viewport height for full video
      const scrollFraction = Math.min(scrollY / maxScrollForVideo, 1);

      if (video.duration) {
        const targetTime = scrollFraction * video.duration;
        video.currentTime = targetTime;
      }
    };

    // Initial setup
    video.pause();

    // Load video metadata
    const handleLoadedMetadata = () => {
      handleScroll();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Hero Section with Scroll-Driven Video */}
      <div className="relative h-screen overflow-hidden">
        {/* Background Video */}
        <div
          className="absolute inset-0 transition-all duration-300 ease-out"
          style={{
            filter: `blur(${scrollBlur}px)`,
          }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source
              src="https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black dark:to-black z-10"></div>

        {/* Hero Content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-6 text-center pt-20">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight">
            Discover the Future
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl">
            Stay ahead with the latest stories shaping tomorrow
          </p>
          <button className="px-10 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-white/20">
            Explore Now
          </button>
        </div>
      </div>
    </div>
  );
}
