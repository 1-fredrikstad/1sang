export const TEXT_PATTERN = /^[a-zA-ZæøåÆØÅ0-9\s.\-/:;,'’*!?()"…–]+$/;

export const songSuggestionSchema = {
  title: {
    required: true,
    maxLength: 40,
  },

  melody: {
    required: false,
    maxLength: 40,
  },

  author: {
    required: false,
    maxLength: 40,
  },

  lyrics: {
    required: true,
    minLength: 20,
    maxLength: 3000,
  },
};
