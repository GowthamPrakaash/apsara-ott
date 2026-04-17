import type { subtitleLanguageEnum } from '$lib/server/db/schema';

export type SubtitleLanguage = typeof subtitleLanguageEnum.enumValues[number];

export const SUBTITLE_LANGUAGES: { value: SubtitleLanguage; label: string }[] = [
	{ value: 'english', label: 'English' },
	{ value: 'hindi', label: 'Hindi' },
	{ value: 'tamil', label: 'Tamil' },
	{ value: 'telugu', label: 'Telugu' },
	{ value: 'malayalam', label: 'Malayalam' },
	{ value: 'kannada', label: 'Kannada' },
	{ value: 'bengali', label: 'Bengali' },
	{ value: 'marathi', label: 'Marathi' },
	{ value: 'gujarati', label: 'Gujarati' },
	{ value: 'punjabi', label: 'Punjabi' }
];

export const SUBTITLE_LANGUAGE_LABELS = Object.fromEntries(
	SUBTITLE_LANGUAGES.map((language) => [language.value, language.label])
) as Record<SubtitleLanguage, string>;
