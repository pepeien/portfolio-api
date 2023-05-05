export class StringService {
	public static isStringInsideBoundaries(value: string, minSize: number, maxSize: number) {
		if (!value) {
			return false;
		}

		const trimmedValue = value.trim();

		return trimmedValue.length > minSize && trimmedValue.length < maxSize;
	}
}