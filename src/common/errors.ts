import { BadRequestException, HttpException, NotFoundException } from "@nestjs/common";


export class APIError {
	static notFound(resource: string): HttpException {
		const notFoundError = {
			status_code: 404,
			message: `${resource} not found`,
			error: 'Not Found'
		}
		return new NotFoundException(notFoundError);
	}

	static badRequest(message: string): HttpException {
		const badRequestError = {
			status_code: 400,
			message: message,
			error: 'Bad Request'
		}
		return new BadRequestException(badRequestError);
	}

	static isNotFoundError(err: HttpException) {
		return err instanceof NotFoundException;
	}
}