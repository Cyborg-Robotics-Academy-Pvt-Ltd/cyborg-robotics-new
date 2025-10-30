const withBundleAnalyzer = require("@next/bundle-analyzer")({ enabled: process.env.ANALYZE === "true" });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add output configuration to control serverless function size
  output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com", // replace with your domain
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
         protocol: "https",
         hostname: "placehold.co",
         pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Add qualities configuration to support quality={100} in Image components
    qualities: [10, 25, 50, 75, 100],
  },
  experimental: {
    optimizePackageImports: [
      "lodash-es", 
      "date-fns",
      "framer-motion",
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-navigation-menu",
      "react-icons",
      "@tabler/icons-react",
      "@xyflow/react"
    ],
  },
  // Enhanced performance optimizations
  webpack: (config) => {
    // Optimize chunk splitting for better caching
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\/]node_modules[\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all',
          maxSize: 244000,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: -20,
          maxSize: 244000,
        },
        framerMotion: {
          test: /[\/]node_modules[\/]framer-motion[\/]/,
          name: 'framer-motion',
          chunks: 'all',
          priority: 10,
        },
        radixUI: {
          test: /[\/]node_modules[\/]@radix-ui[\/]/,
          name: 'radix-ui',
          chunks: 'all',
          priority: 10,
        },
        xyflow: {
          test: /[\/]node_modules[\/]@xyflow[\/]/,
          name: 'xyflow',
          chunks: 'all',
          priority: 15,
        },
      },
    };
    return config;
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
};

module.exports = withBundleAnalyzer(nextConfig);