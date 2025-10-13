/** @type {import('next').NextConfig} */
const nextConfig = {
  // Excluir scripts e arquivos de desenvolvimento do build
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Excluir scripts de processamento do bundle do cliente
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/scripts': false,
      }
    }
    return config
  },
  
  // Excluir diretórios específicos do build
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'scripts/**/*',
        'data/**/*',
        '**/*.md',
      ],
    },
  },
};

module.exports = nextConfig;