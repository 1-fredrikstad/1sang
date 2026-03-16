export const TEXT_PATTERN = /^[a-zA-ZæøåÆØÅ0-9\s.\-/:;,'’*!?()"…–]+$/;

export const playlistSchema = {
  title: {
    required: true,
    maxLength: 40,
    messages: {
      required: 'Du må skrive inn tittel',
      maxLength: 'Tittel kan maks være 40 tegn',
      pattern: 'Tittelen inneholder ugyldige tegn',
    },
  },
  password: {
    required: true,
    minLength: 4,
    maxLength: 20,
    messages: {
      required: 'Du må skrive inn passord',
      minLength: 'Passord må være minst 4 tegn',
      maxLength: 'Passord kan maks være 20 tegn',
      pattern: 'Passord inneholder ugyldige tegn',
    },
  },
} as const;

type PlaylistFieldKey = keyof typeof playlistSchema;

export function getPlaylistFieldValidation(field: PlaylistFieldKey) {
  const config = playlistSchema[field];

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
    pattern: {
      value: TEXT_PATTERN,
      message: config.messages.pattern,
    },
  };
}
