import slugify from 'slugify'

export const toSlug = (str: string) => {
	return slugify(str, { lower: true, strict: true, trim: true })
}
