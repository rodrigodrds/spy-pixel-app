import { GetServerSideProps } from 'next'
import { PrismaClient, PixelTrack } from '@prisma/client'

const prisma = new PrismaClient()

export const getServerSideProps: GetServerSideProps<{ tracks: PixelTrack[] }> = async () => {
  const tracks = await prisma.pixelTrack.findMany({
    orderBy: { timestamp: 'desc' },
    take: 100,
  })
  return { props: { tracks: JSON.parse(JSON.stringify(tracks)) } }
}

interface AnalyticsProps {
  tracks: PixelTrack[]
}

export default function Analytics({ tracks }: AnalyticsProps) {
  return (
    <div>
      <h1>Spy Pixel Analytics</h1>
      <table>
        <thead>
          <tr>
            <th>IP Address</th>
            <th>User Agent</th>
            <th>Referer</th>
            <th>Metadata</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track) => (
            <tr key={track.id}>
              <td>{track.ipAddress}</td>
              <td>{track.userAgent}</td>
              <td>{track.referer || 'N/A'}</td>
              <td>{track.metadata || 'N/A'}</td>
              <td>{new Date(track.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}