import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: 'ok' | 'error'; latency?: number; error?: string };
    memory: { status: 'ok' | 'warning'; used: number; total: number };
  };
}

const startTime = Date.now();

export async function GET() {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {
      database: { status: 'ok' },
      memory: { status: 'ok', used: 0, total: 0 },
    },
  };

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database.latency = Date.now() - dbStart;
  } catch (error) {
    health.checks.database.status = 'error';
    health.checks.database.error = error instanceof Error ? error.message : 'Unknown error';
    health.status = 'unhealthy';
  }

  // Memory check
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memory = process.memoryUsage();
    health.checks.memory.used = Math.round(memory.heapUsed / 1024 / 1024);
    health.checks.memory.total = Math.round(memory.heapTotal / 1024 / 1024);
    
    // Warn if using more than 80% of heap
    if (health.checks.memory.used / health.checks.memory.total > 0.8) {
      health.checks.memory.status = 'warning';
      if (health.status === 'healthy') {
        health.status = 'degraded';
      }
    }
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
