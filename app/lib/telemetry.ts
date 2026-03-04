// lib/telemetry.ts - OpenTelemetry instrumentation
// Provides distributed tracing, metrics, and performance monitoring

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import * as resourcesPkg from '@opentelemetry/resources'
import * as semanticConventionsPkg from '@opentelemetry/semantic-conventions'
import logger from './logger'

// Extract named exports from CommonJS modules
const { Resource } = resourcesPkg as any
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } =
  semanticConventionsPkg as any

const isDev = import.meta.env.DEV
const otlpEndpoint = import.meta.env.VITE_OTEL_ENDPOINT
const enableOTel = import.meta.env.VITE_ENABLE_OTEL === 'true'

/**
 * Initialize OpenTelemetry for browser instrumentation
 */
export function initTelemetry() {
  // Skip if disabled or no endpoint configured
  if (!enableOTel || !otlpEndpoint) {
    logger.debug('[OpenTelemetry] Skipped initialization', {
      enabled: enableOTel,
      hasEndpoint: !!otlpEndpoint,
    })
    return
  }

  try {
    // Create resource with service metadata
    const resource = new Resource({
      [ATTR_SERVICE_NAME]: 'hv-battery-p1-frontend',
      [ATTR_SERVICE_VERSION]: import.meta.env.VITE_APP_VERSION || '1.0.0',
      environment: import.meta.env.MODE || 'production',
    })

    // Create tracer provider
    const provider = new WebTracerProvider({
      resource,
    })

    // Configure OTLP exporter
    const exporter = new OTLPTraceExporter({
      url: `${otlpEndpoint}/v1/traces`,
      headers: {},
    })

    // Add batch span processor for performance
    ;(provider as any).addSpanProcessor(new BatchSpanProcessor(exporter))

    // Register the provider
    provider.register()

    // Register automatic instrumentations
    registerInstrumentations({
      instrumentations: [
        // Instrument fetch API
        new FetchInstrumentation({
          propagateTraceHeaderCorsUrls: [
            /localhost/,
            /^https?:\/\/.*\.example\.com/, // Add your API domains
          ],
          clearTimingResources: true,
          applyCustomAttributesOnSpan: (span, request, response) => {
            // Add custom attributes to spans
            if (response instanceof Response) {
              span.setAttribute(
                'http.response.size',
                response.headers.get('content-length') || 0,
              )
            }
          },
        }),

        // Instrument XMLHttpRequest
        new XMLHttpRequestInstrumentation({
          propagateTraceHeaderCorsUrls: [
            /localhost/,
            /^https?:\/\/.*\.example\.com/,
          ],
        }),
      ],
    })

    logger.info('[OpenTelemetry] Initialized successfully', {
      endpoint: otlpEndpoint,
      service: 'hv-battery-p1-frontend',
    })
  } catch (error) {
    logger.error('[OpenTelemetry] Initialization failed', error)
  }
}

/**
 * Create custom span for manual instrumentation
 */
export function createSpan(name: string, callback: () => void) {
  if (!enableOTel) {
    callback()
    return
  }

  // Get tracer
  const { trace } = require('@opentelemetry/api')
  const tracer = trace.getTracer('hv-battery-p1-frontend')

  // Create and execute span
  const span = tracer.startSpan(name)

  try {
    callback()
  } catch (error) {
    span.recordException(error as Error)
    throw error
  } finally {
    span.end()
  }
}

/**
 * Add custom attributes to current span
 */
export function addSpanAttributes(
  attributes: Record<string, string | number | boolean>,
) {
  if (!enableOTel) return

  const { trace } = require('@opentelemetry/api')
  const currentSpan = trace.getActiveSpan()

  if (currentSpan) {
    Object.entries(attributes).forEach(([key, value]) => {
      currentSpan.setAttribute(key, value)
    })
  }
}
