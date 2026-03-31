/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth', 'xlsx']
  },
  api: {
    bodyParser: false,  // Para uploads de arquivo
    responseLimit: '10mb'
  }
}

module.exports = nextConfig
