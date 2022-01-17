import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule, 
		new FastifyAdapter({ maxParamLength: 108 })
	);
	app.useGlobalPipes(new ValidationPipe());
	const configService = app.get(ConfigService);
	const port = configService.get<number>('PORT') || 3000;
	await app.listen(port, '0.0.0.0');
}

bootstrap();
