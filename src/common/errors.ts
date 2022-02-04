import { BadRequestException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";


export class APIError {
	static notFound(resource: string): HttpException {
		const notFoundError = {
			status_code: 404,
			message: 'Not Found',
			error: `${resource} not found`
		}
		return new NotFoundException(notFoundError);
	}

	static badRequest(message: string): HttpException {
		const badRequestError = {
			status_code: 400,
			message: 'Bad Request',
			error: message
		}
		return new BadRequestException(badRequestError);
	}
}