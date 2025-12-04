import { countries as countryList } from 'countries-list'
import { City, Country, State } from 'country-state-city'
import countriesI18n from 'i18n-iso-countries'
import fr from 'i18n-iso-countries/langs/fr.json'

// Enregistrer la locale française
countriesI18n.registerLocale(fr)

const continentNamesFr: Record<string, string> = {
	AF: 'Afrique',
	AN: 'Antarctique',
	AS: 'Asie',
	EU: 'Europe',
	NA: 'Amérique du Nord',
	OC: 'Océanie',
	SA: 'Amérique du Sud',
}

// Correction manuelle des noms FR incorrects
const countryNameOverrides: Record<string, string> = {
	"Côte-d'Ivoire": "Côte d'Ivoire",
}

// Fonction pour obtenir la liste des continents
export const getContinents = () => Object.values(continentNamesFr)

// Fonction qui fusionne countries-list + country-state-city
export const getAllCountries = () => {
	const countriesWithCoords = Country.getAllCountries()

	return countriesWithCoords.map((c) => {
		const isoCode = c.isoCode.toUpperCase()

		// Données i18n FR
		const nameFr = countriesI18n.getName(isoCode, 'fr') ?? c.name

		const correctedName = countryNameOverrides[nameFr] ?? nameFr

		// Données venant de countries-list (continent + native)
		const listInfo = countryList[isoCode as keyof typeof countryList]

		return {
			code: isoCode,
			name: correctedName,
			native: listInfo?.native ?? c.name,
			continent: continentNamesFr[listInfo?.continent ?? ''] ?? null,
			latitude: c.latitude ? parseFloat(c.latitude) : 0,
			longitude: c.longitude ? parseFloat(c.longitude) : 0,
		}
	})
}

// États d’un pays
export const getStatesOfCountry = (countryCode: string) => {
	return State.getStatesOfCountry(countryCode)
}

// Villes d’un pays
export const getCitiesOfCountry = (countryCode: string) => {
	return (City.getCitiesOfCountry(countryCode) ?? []).map((city) => ({
		...city,
		latitude: city.latitude ? parseFloat(city.latitude) : 0,
		longitude: city.longitude ? parseFloat(city.longitude) : 0,
	}))
}

// Villes d’un état
export const getCitiesOfState = (countryCode: string, stateCode: string) => {
	return (City.getCitiesOfState(countryCode, stateCode) ?? []).map((city) => ({
		...city,
		latitude: city.latitude ? parseFloat(city.latitude) : 0,
		longitude: city.longitude ? parseFloat(city.longitude) : 0,
	}))
}
