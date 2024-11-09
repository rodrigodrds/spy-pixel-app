import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const realIp = req.headers['x-real-ip']
  
  if (Array.isArray(forwarded)) {
    return forwarded[0] || 'Unknown'
  }
  
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim() || 'Unknown'
  }
  
  if (typeof realIp === 'string') {
    return realIp
  }
  
  return req.socket.remoteAddress || 'Unknown'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const clientIp = getClientIp(req)
    const userAgent = req.headers['user-agent']
    const referer = req.headers['referer']
    const metadata = JSON.stringify(req.query)
    
    try {
      // Fazer a requisição para o serviço de geolocalização
      const geoResponse = await fetch(`http://ip-api.com/json/${clientIp}`)
      // const geoData = await geoResponse.json()
      // Processar a resposta e extrair as informações relevantes
      const { city, region, country, lat, lon, isp, org } = await geoResponse.json()

      // Salvar no banco de dados
      await prisma.pixelTrack.create({
        data: {
          ipAddress: clientIp,
          userAgent: userAgent || 'Unknown',
          referer: referer || null,
          metadata: metadata,
          city,
          region,
          country,
          latitude: lat,
          longitude: lon,
          isp,
          org
        },
      }).catch(e => {
        console.error('Prisma error:', e)
        throw e // Re-throw para ser capturado pelo catch externo
      })

      // Criar um pixel transparente de 1x1
      const pixelBuffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/BrNn5IAAAAASUVORK5CYII=',
          // 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          'base64'
      );
      // Definir o cabeçalho e responder com a imagem do pixel
      res.setHeader('Content-Type', 'image/png');
      // res.setHeader('Content-Type', 'image/gif');
      // res.setHeader('Content-Length', pixelBuffer.length);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      res.setHeader('Pragma', 'no-cache')
      res.setHeader('Expires', '0')
      res.status(200).send(pixelBuffer)
    } catch (error) {
      console.error('Error tracking pixel:', error)
      res.status(500).json({ error: 'Internal Server Error' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}