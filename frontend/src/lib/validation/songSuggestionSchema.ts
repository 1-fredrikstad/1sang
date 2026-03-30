export const TEXT_PATTERN = /^[a-zA-ZæøåÆØÅ0-9\s.\-/:;,'’*!?()"…–]+$/;

export const songSuggestionSchema = {
  title: {
    required: true,
    maxLength: 40,
    messages: {
      required: 'Du må skrive inn tittel',
      maxLength: 'Tittel kan maks være 40 tegn',
      pattern: 'Tittelen inneholder ugyldige tegn',
    },
  },
  melody: {
    required: false,
    maxLength: 40,
    messages: {
      maxLength: 'Melodi kan maks være 40 tegn',
      pattern: 'Melodi inneholder ugyldige tegn',
    },
  },
  author: {
    required: false,
    maxLength: 40,
    messages: {
      maxLength: 'Låtskriver kan maks være 40 tegn',
      pattern: 'Låtskriver inneholder ugyldige tegn',
    },
  },
  lyrics: {
    required: true,
    minLength: 20,
    maxLength: 3000,
    messages: {
      required: 'Du må skrive inn sangtekst',
      minLength: 'Sangteksten må være minst 20 tegn',
      maxLength: 'Sangteksten kan maks være 3000 tegn',
      pattern: 'Sangteksten inneholder ugyldige tegn',
    },
  },
  spotify_youtube: {
    required: false,
    maxLength: 200,
    messages: {
      maxLength: 'Lenken kan maks være 200 tegn',
      validate: 'Lenken må være en gyldig Spotify- eller YouTube-lenke',
    },
  },
} as const;

type SongFieldKey = keyof typeof songSuggestionSchema;

export function getFieldValidation(field: SongFieldKey) {
  const config = songSuggestionSchema[field];

  return {
    ...('required' in config && config.required ? { required: config.messages.required } : {}),
    ...('minLength' in config && typeof config.minLength === 'number'
      ? {
          minLength: {
            value: config.minLength,
            message: config.messages.minLength,
          },
        }
      : {}),
    ...('maxLength' in config && typeof config.maxLength === 'number'
      ? {
          maxLength: {
            value: config.maxLength,
            message: config.messages.maxLength,
          },
        }
      : {}),

    ...(field !== 'spotify_youtube' && 'pattern' in config.messages
      ? {
          pattern: {
            value: TEXT_PATTERN,
            message: config.messages.pattern,
          },
        }
      : {}),

    validate:
      field === 'spotify_youtube' && 'validate' in config.messages
        ? (value: string) => {
            if (!value) return true;

            const isValid =
              /^(https?:\/\/)?(www\.)?([a-z]+\.)?spotify\.com\/.+$|^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(
                value
              );

            return (
              isValid ||
              (config.messages as typeof songSuggestionSchema.spotify_youtube.messages).validate
            );
          }
        : undefined,
  };
}

export type SongInput = {
  title: string;
  melody: string;
  author: string;
  lyrics: string;
};

export type SongValidationErrors = Partial<Record<keyof SongInput, string>>;

export function normalizeSongInput(input: Partial<SongInput>): SongInput {
  return {
    title: typeof input.title === 'string' ? input.title.trim() : '',
    melody: typeof input.melody === 'string' ? input.melody.trim() : '',
    author: typeof input.author === 'string' ? input.author.trim() : '',
    lyrics: typeof input.lyrics === 'string' ? input.lyrics.trim() : '',
  };
}

export function validateSongInput(input: Partial<SongInput>): SongValidationErrors {
  const data = normalizeSongInput(input);
  const errors: SongValidationErrors = {};

  if (songSuggestionSchema.title.required && !data.title) {
    errors.title = songSuggestionSchema.title.messages.required;
  } else if (data.title.length > songSuggestionSchema.title.maxLength) {
    errors.title = songSuggestionSchema.title.messages.maxLength;
  } else if (!TEXT_PATTERN.test(data.title)) {
    errors.title = songSuggestionSchema.title.messages.pattern;
  }

  if (data.author.length > songSuggestionSchema.author.maxLength) {
    errors.author = songSuggestionSchema.author.messages.maxLength;
  } else if (data.author && !TEXT_PATTERN.test(data.author)) {
    errors.author = songSuggestionSchema.author.messages.pattern;
  }

  if (data.melody.length > songSuggestionSchema.melody.maxLength) {
    errors.melody = songSuggestionSchema.melody.messages.maxLength;
  } else if (data.melody && !TEXT_PATTERN.test(data.melody)) {
    errors.melody = songSuggestionSchema.melody.messages.pattern;
  }

  if (songSuggestionSchema.lyrics.required && !data.lyrics) {
    errors.lyrics = songSuggestionSchema.lyrics.messages.required;
  } else if (data.lyrics.length < songSuggestionSchema.lyrics.minLength) {
    errors.lyrics = songSuggestionSchema.lyrics.messages.minLength;
  } else if (data.lyrics.length > songSuggestionSchema.lyrics.maxLength) {
    errors.lyrics = songSuggestionSchema.lyrics.messages.maxLength;
  } else if (!TEXT_PATTERN.test(data.lyrics)) {
    errors.lyrics = songSuggestionSchema.lyrics.messages.pattern;
  }

  return errors;
}
