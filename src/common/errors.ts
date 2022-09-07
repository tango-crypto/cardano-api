import { BadRequestException, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";


export class APIError {
	static notFound(resource: string): HttpException {
		const notFoundError = {
			status_code: HttpStatus.NOT_FOUND,
			message: `${resource} not found`,
			error: 'Not Found'
		}
		return new NotFoundException(notFoundError);
	}

	static badRequest(message: string): HttpException {
		const badRequestError = {
			status_code: HttpStatus.BAD_REQUEST,
			message: message,
			error: 'Bad Request'
		}
		return new BadRequestException(badRequestError);
	}

	static isNotFoundError(err: HttpException) {
		return err instanceof NotFoundException;
	}

	static internalError(message = 'Internal Server Error'): HttpException {
		const internalError = {
			status_code: HttpStatus.INTERNAL_SERVER_ERROR,
			message: message,
			error: 'Internal Error'
		}
		return new HttpException(internalError, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}