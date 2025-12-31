import {NextConfig} from 'next';

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        // This is necessary to display images from your local Vendure instance
        dangerouslyAllowLocalIP: true,
        remotePatterns: [
            {
               protocol: 'https',
               hostname: 'agxsites.southafricanorth.cloudapp.azure.com',
               port: '',
               pathname: '/assets/**',
            },
            {
                hostname: 'readonlydemo.vendure.io',
            },
            {
                hostname: 'demo.vendure.io'
	    },
            {
                hostname: 'localhost'
            }
        ],
    },
    experimental: {
        rootParams: true
    }
};

export default nextConfig;
