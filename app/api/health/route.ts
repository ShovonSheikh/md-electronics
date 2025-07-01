import { NextRequest } from 'next/server'
import { createHealthCheck, withApiHandler } from '@/lib/api-helpers'

export const GET = withApiHandler(async (request: NextRequest) => {
  return createHealthCheck()
})