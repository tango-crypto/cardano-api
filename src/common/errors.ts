import { BadRequestException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";

export class APIError {
	static notFound(resource: string): HttpException {
		return new NotFoundException(`${resource} not found`)
	}

	static badRequest(message: string): HttpException {
		return new BadRequestException(message);
	}
}