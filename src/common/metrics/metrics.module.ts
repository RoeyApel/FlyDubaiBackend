import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

/** Exposes Prometheus metrics at `/metrics`. */
@Module({
  imports: [
    PrometheusModule.register({ defaultLabels: { app: 'fly-dubai-backend' } }),
  ],
})
export class MetricsModule {}
