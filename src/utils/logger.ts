/**
 * Logger simple et efficace pour l'application
 */
class Logger {
	private getTimestamp(): string {
		return new Date().toISOString()
	}

	private formatMessage(level: string, message: string, meta?: any): string {
		const timestamp = this.getTimestamp()
		const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : ''
		return `[${timestamp}] [${level}] ${message}${metaStr}`
	}

	info(message: string, meta?: any): void {
		console.log('\x1b[36m%s\x1b[0m', this.formatMessage('INFO', message, meta))
	}

	error(message: string, meta?: any): void {
		console.error(
			'\x1b[31m%s\x1b[0m',
			this.formatMessage('ERROR', message, meta)
		)
	}

	warn(message: string, meta?: any): void {
		console.warn('\x1b[33m%s\x1b[0m', this.formatMessage('WARN', message, meta))
	}

	debug(message: string, meta?: any): void {
		if (process.env.NODE_ENV === 'development') {
			console.log(
				'\x1b[35m%s\x1b[0m',
				this.formatMessage('DEBUG', message, meta)
			)
		}
	}

	success(message: string, meta?: any): void {
		console.log(
			'\x1b[32m%s\x1b[0m',
			this.formatMessage('SUCCESS', message, meta)
		)
	}
}

export const logger = new Logger()
