import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * Hash un mot de passe
 */
export const hashPassword = async (password: string): Promise<string> => {
	return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare un mot de passe avec son hash
 */
export const comparePassword = async (
	password: string,
	hashedPassword: string
): Promise<boolean> => {
	return bcrypt.compare(password, hashedPassword)
}
